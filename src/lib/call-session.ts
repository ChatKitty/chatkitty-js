import { Subject, Subscription } from 'rxjs';

import { Call } from './call';
import {
  AddCandidateCallSignal,
  AnswerOfferCallSignal,
  CallSignal,
  ConnectPeerCallSignal,
  CreateCallSignalRequest,
  CreateOfferCallSignal,
  DisconnectPeerCallSignal,
  isAddCandidateCallSignal,
  isAnswerOfferCallSignal,
  isConnectPeerCallSignal,
  isCreateOfferCallSignal,
  isDisconnectPeerCallSignal,
} from './call-signal';
import { CurrentUser } from './current-user';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import StompX from './stompx';
import { User } from './user';

export class CallSession {
  static async createInstance(
    user: CurrentUser,
    stompX: StompX,
    request: StartCallSessionRequest
  ): Promise<CallSession> {
    return new Promise((resolve) => {
      const signalSubject: Subject<CallSignal> = new Subject<CallSignal>();

      const receivedCallSignalUnsubscribe = stompX.listenForEvent<CallSignal>({
        topic: request.call._topics.signals,
        event: 'call.signal.created',
        onSuccess: (signal) => {
          signalSubject.next(signal);
        },
      });

      const callUnsubscribe = stompX.listenToTopic({
        topic: request.call._topics.self,
        onSuccess: () => {
          const signalsUnsubscribe = stompX.listenToTopic({
            topic: request.call._topics.signals,
            onSuccess: () => {
              resolve(
                new CallSession(
                  user,
                  request.call,
                  request.stream,
                  stompX,
                  signalSubject,
                  new CallSignalDispatcher(stompX, request.call),
                  receivedCallSignalUnsubscribe,
                  signalsUnsubscribe,
                  callUnsubscribe,
                  request.onParticipantEnteredCall,
                  request.onParticipantAddedStream,
                  request.onParticipantLeftCall
                )
              );
            },
          });
        },
      });
    });
  }

  private participants: Map<string, Participant> = new Map();

  private readonly signalsSubscription: Subscription;

  constructor(
    public readonly user: CurrentUser,
    public readonly call: Call,
    public readonly stream: MediaStream,
    private readonly stompX: StompX,
    private readonly signalSubject: Subject<CallSignal>,
    private readonly signalDispatcher: CallSignalDispatcher,
    private readonly receivedCallSignalUnsubscribe: () => void,
    private readonly signalsUnsubscribe: () => void,
    private readonly callUnsubscribe: () => void,
    private readonly onParticipantEnteredCall?: (user: User) => void,
    private readonly onParticipantAddedStream?: (
      user: User,
      stream: MediaStream
    ) => void,
    private readonly onParticipantLeftCall?: (user: User) => void
  ) {
    this.signalsSubscription = signalSubject.subscribe({
      next: (signal) => {
        if (signal.user.name == this.user.name) return;

        if (isConnectPeerCallSignal(signal)) {
          this.onConnect(signal);
        }

        if (isCreateOfferCallSignal(signal)) {
          this.onOffer(signal);
        }

        if (isDisconnectPeerCallSignal(signal)) {
          this.onDisconnect(signal);
        }
      },
    });

    this.stompX.sendAction<never>({
      destination: this.call._actions.ready,
      body: {},
    });
  }

  private onConnect = (signal: ConnectPeerCallSignal): void => {
    const user = signal.user;

    if (!this.participants.has(user.name)) {
      const participant = new Participant(
        user,
        this,
        this.signalSubject,
        this.signalDispatcher,
        this.onParticipantAddedStream
      );

      this.participants.set(user.name, participant);

      this.onParticipantEnteredCall?.(user);
    }
  };

  private onOffer = async (signal: CreateOfferCallSignal): Promise<void> => {
    const user = signal.user;

    const description = new RTCSessionDescription(signal.payload);

    if (this.participants.has(user.name)) {
      const participant = this.participants.get(user.name) as Participant;

      try {
        await participant.renegotiate(description);
      } catch (err) {
        this.signalDispatcher.dispatch({
          type: 'SEND_ERROR',
          payload: err,
        });
      }
    } else {
      const participant = new Participant(
        user,
        this,
        this.signalSubject,
        this.signalDispatcher,
        this.onParticipantAddedStream
      );

      this.participants.set(user.name, participant);

      this.onParticipantEnteredCall?.(user);

      try {
        await participant.renegotiate(description);
      } catch (err) {
        this.signalDispatcher.dispatch({
          type: 'SEND_ERROR',
          payload: err,
        });
      }
    }
  };

  private onDisconnect = (signal: DisconnectPeerCallSignal): void => {
    const user = signal.user;

    if (this.participants.has(user.name)) {
      const participant = this.participants.get(user.name) as Participant;

      participant.close();

      this.participants.delete(user.name);
    }
  };

  end() {
    this.receivedCallSignalUnsubscribe();

    this.signalsUnsubscribe();

    this.callUnsubscribe();

    this.signalsSubscription.unsubscribe();
  }
}

export declare class StartCallSessionRequest {
  call: Call;
  stream: MediaStream;
  onParticipantEnteredCall?: (user: User) => void;
  onParticipantAddedStream?: (user: User, stream: MediaStream) => void;
  onParticipantLeftCall?: (user: User) => void;
}

export type StartCallSessionResult =
  | StartedCallSessionResult
  | ChatKittyFailedResult;

export class StartedCallSessionResult extends ChatKittySucceededResult {
  constructor(public session: CallSession) {
    super();
  }
}

export function startedCallSession(
  result: StartCallSessionResult
): result is StartedCallSessionResult {
  return (result as StartedCallSessionResult).session !== undefined;
}

class CallSignalDispatcher {
  constructor(private stompX: StompX, private call: Call) {}

  dispatch = (request: CreateCallSignalRequest): void => {
    this.stompX.sendAction<never>({
      destination: this.call._actions.signal,
      body: request,
    });
  };
}

class Participant {
  private readonly rtcConfiguration: RTCConfiguration = {
    iceServers: [
      {
        urls: 'stun:stun2.1.google.com:19302',
      },
    ],
  };

  private readonly dataConstraints?: RTCDataChannelInit;
  private readonly offerAnswerOptions: RTCOfferOptions;

  private readonly signalsSubscription: Subscription;

  private peer: RTCPeerConnection;
  private channel?: RTCDataChannel;

  private isNegotiating: boolean; // Workaround for Chrome: skip nested negotiations

  constructor(
    private readonly user: User,
    private readonly session: CallSession,
    private readonly signalSubject: Subject<CallSignal>,
    private readonly signalDispatcher: CallSignalDispatcher,
    private readonly onParticipantAddedStream?: (
      user: User,
      stream: MediaStream
    ) => void
  ) {
    this.offerAnswerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };
    this.isNegotiating = false;

    this.peer = new RTCPeerConnection(this.rtcConfiguration);

    const stream = this.session.stream;
    if (stream instanceof MediaStream) {
      this.addStream(stream);
    }

    this.peer.onicecandidate = this.onIceCandidate;
    this.peer.onconnectionstatechange = this.onConnectionStateChange;
    this.peer.oniceconnectionstatechange = this.onIceConnectionStateChange;
    this.peer.onsignalingstatechange = this.onSignalingStateChange;
    this.peer.onnegotiationneeded = this.onNegotiationNeeded;
    this.peer.ondatachannel = this.onDataChannel;
    this.peer.ontrack = this.dispatchRemoteStream;

    this.signalsSubscription = signalSubject.subscribe({
      next: (signal) => {
        if (isAddCandidateCallSignal(signal)) {
          this.onCandidate(signal);
        }

        if (isAnswerOfferCallSignal(signal)) {
          this.onAnswer(signal);
        }
      },
    });
  }

  close = (): Participant => {
    if (this.channel) {
      this.channel.close();
    }

    this.peer.close();
    this.signalsSubscription.unsubscribe();

    return this;
  };

  addStream = (stream: MediaStream): Participant => {
    stream.getTracks().map((track) => this.peer.addTrack(track, stream));

    return this;
  };

  renegotiate = async (
    remoteDesc?: RTCSessionDescription
  ): Promise<Participant> => {
    if (remoteDesc) {
      if (
        remoteDesc.type === 'offer' &&
        this.peer.signalingState !== 'stable'
      ) {
        await this.peer.setLocalDescription({ type: 'rollback' });
      }

      await this.peer.setRemoteDescription(remoteDesc);

      if (remoteDesc.type === 'offer') {
        const desc = await this.peer.createAnswer(this.offerAnswerOptions);
        await this.peer.setLocalDescription(desc);

        this.signalDispatcher.dispatch({
          type: 'ANSWER_OFFER',
          payload: this.peer.localDescription,
        });
      }
    } else {
      this.channel = this.newDataChannel(this.dataConstraints);

      const desc = await this.peer.createOffer(this.offerAnswerOptions);

      // prevent race condition if another side send us offer at the time
      // when we were in process of createOffer
      if (this.peer.signalingState === 'stable') {
        await this.peer.setLocalDescription(desc);

        this.signalDispatcher.dispatch({
          type: 'CREATE_OFFER',
          payload: this.peer.localDescription,
        });
      }
    }

    return this;
  };

  private newDataChannel = (
    dataConstraints?: RTCDataChannelInit
  ): RTCDataChannel => {
    const label = Math.floor((1 + Math.random()) * 1e16)
      .toString(16)
      .substring(1);

    return this.peer.createDataChannel(label, dataConstraints);
  };

  private onAnswer = async (signal: AnswerOfferCallSignal): Promise<void> => {
    try {
      await this.renegotiate(new RTCSessionDescription(signal.payload));
    } catch (err) {
      this.signalDispatcher.dispatch({
        type: 'SEND_ERROR',
        payload: err,
      });
    }
  };

  private onCandidate = async (
    event: AddCandidateCallSignal
  ): Promise<void> => {
    try {
      await this.peer.addIceCandidate(new RTCIceCandidate(event.payload));
    } catch (err) {
      this.signalDispatcher.dispatch({
        type: 'SEND_ERROR',
        payload: err,
      });
    }
  };

  private onIceCandidate = (iceEvent: RTCPeerConnectionIceEvent): void => {
    if (iceEvent.candidate) {
      this.signalDispatcher.dispatch({
        type: 'ADD_CANDIDATE',
        payload: iceEvent.candidate,
      });
    } else {
      // All ICE candidates have been sent
    }
  };

  private onConnectionStateChange = (): void => {
    switch (this.peer.connectionState) {
      case 'connected':
        // The connection has become fully connected
        break;
      case 'disconnected':
      case 'failed':
      // One or more transports has terminated unexpectedly or in an error
      // eslint-disable-next-line no-fallthrough
      case 'closed':
        this.session.end();
        // The connection has been closed
        break;
    }
  };

  private onIceConnectionStateChange = (): void => {
    switch (this.peer.iceConnectionState) {
      case 'disconnected':
      case 'failed':
      case 'closed':
        this.session.end();
        break;
    }
  };

  private onNegotiationNeeded = async (): Promise<void> => {
    if (!this.isNegotiating) {
      try {
        await this.renegotiate();
      } catch (err) {
        this.signalDispatcher.dispatch({
          type: 'SEND_ERROR',
          payload: err,
        });
      }

      this.isNegotiating = true;
    }
  };

  private onSignalingStateChange = (): void => {
    this.isNegotiating = this.peer.signalingState !== 'stable';
  };

  private onDataChannel = (event: RTCDataChannelEvent): void => {
    this.channel = event.channel;
  };

  private dispatchRemoteStream = (event: RTCTrackEvent): void => {
    this.onParticipantAddedStream?.(this.user, event.streams[0]);
  };
}
