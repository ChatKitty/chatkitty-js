import { Subject, Subscription } from 'rxjs';

import { Call } from './call';
import {
  AnswerOfferCallSignal,
  CallSignal,
  CreateCallSignalRequest,
  CreateOfferCallSignal,
  DisconnectPeerCallSignal,
  isAddCandidateCallSignal,
  isAnswerOfferCallSignal,
  isCreateOfferCallSignal,
  isDisconnectPeerCallSignal,
  isSendDescriptionCallSignal,
} from './call-signal';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import StompX from './stompx';
import { User } from './user';

export class CallSession {
  static async createInstance(
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

  private connections: Map<number, Connection> = new Map();

  private readonly signalsSubscription: Subscription;

  constructor(
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
        if (isCreateOfferCallSignal(signal)) {
          this.onCreateOffer(signal).then();
        }

        if (isAnswerOfferCallSignal(signal)) {
          this.onAnswerOffer(signal);
        }

        if (isAddCandidateCallSignal(signal)) {
          const connection = this.connections.get(signal.peer.id);

          if (connection) {
            connection.addCandidate(signal.payload).then();
          }
        }

        if (isSendDescriptionCallSignal(signal)) {
          const connection = this.connections.get(signal.peer.id);

          if (connection) {
            connection.answerOffer(signal.payload).then();
          }
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

  private onCreateOffer = async (
    signal: CreateOfferCallSignal
  ): Promise<void> => {
    const peer = signal.peer;

    if (this.connections.has(peer.id)) {
      return;
    }

    const connection = new Connection(
      peer,
      this.stream,
      this.signalDispatcher,
      this.onParticipantAddedStream
    );

    await connection.createOffer();

    this.connections.set(peer.id, connection);
  };

  private onAnswerOffer = (signal: AnswerOfferCallSignal): void => {
    const peer = signal.peer;

    if (this.connections.has(peer.id)) {
      return;
    }

    const connection = new Connection(
      peer,
      this.stream,
      this.signalDispatcher,
      this.onParticipantAddedStream
    );

    this.connections.set(peer.id, connection);
  };

  private onDisconnect = (signal: DisconnectPeerCallSignal): void => {
    // .
  };

  end() {
    this.receivedCallSignalUnsubscribe();

    this.signalsUnsubscribe();

    this.callUnsubscribe();

    this.signalsSubscription.unsubscribe();
  }
}

class Connection {
  private static readonly rtcConfiguration: RTCConfiguration = {
    iceServers: [
      {
        urls: 'turn:100.27.37.88:3478',
        username: 'chatkitty',
        credential: '5WEDIcZHUxhlUlsdQcqj',
      },
      {
        urls: 'stun:stun2.1.google.com:19302',
      },
    ],
  };

  private readonly offerAnswerOptions: RTCOfferOptions;

  private rtcPeerConnection: RTCPeerConnection;

  constructor(
    private readonly peer: User,
    private readonly stream: MediaStream,
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

    this.rtcPeerConnection = new RTCPeerConnection(Connection.rtcConfiguration);

    this.rtcPeerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        signalDispatcher.dispatch({
          type: 'ADD_CANDIDATE',
          peer: { id: peer.id },
          payload: event.candidate,
        });
      }
    };

    this.rtcPeerConnection.ontrack = (event) => {
      onParticipantAddedStream?.(peer, event.streams[0]);
    };

    this.rtcPeerConnection.onconnectionstatechange = () => {
      switch (this.rtcPeerConnection.connectionState) {
        case 'connected':
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          // TODO end call session
          break;
      }
    };

    this.rtcPeerConnection.oniceconnectionstatechange = () => {
      switch (this.rtcPeerConnection.iceConnectionState) {
        case 'disconnected':
        case 'failed':
        case 'closed':
          // TODO end call session
          break;
      }
    };

    stream
      .getTracks()
      .map((track) => this.rtcPeerConnection.addTrack(track, stream));
  }

  createOffer = async () => {
    const description = await this.rtcPeerConnection.createOffer(
      this.offerAnswerOptions
    );

    await this.rtcPeerConnection.setLocalDescription(description);

    this.signalDispatcher.dispatch({
      type: 'SEND_DESCRIPTION',
      peer: this.peer,
      payload: description,
    });
  };

  answerOffer = async (description: RTCSessionDescriptionInit) => {
    await this.rtcPeerConnection.setRemoteDescription(description);

    if (description.type === 'offer') {
      const answer = await this.rtcPeerConnection.createAnswer(
        this.offerAnswerOptions
      );

      await this.rtcPeerConnection.setLocalDescription(answer);

      this.signalDispatcher.dispatch({
        type: 'SEND_DESCRIPTION',
        peer: this.peer,
        payload: answer,
      });
    }
  };

  addCandidate = async (candidate: RTCIceCandidateInit): Promise<void> => {
    await this.rtcPeerConnection.addIceCandidate(candidate);
  };

  close = (): void => {
    this.rtcPeerConnection.close();
  };
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
