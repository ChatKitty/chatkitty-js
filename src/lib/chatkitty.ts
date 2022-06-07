import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {environment} from '../environment/environment';
import StompX from '../stompx';

import {
  AddChannelModeratorRequest,
  AddChannelModeratorResult,
  AddedChannelModeratorResult,
  CannotAddModeratorToChannelError,
  Channel,
  ChannelNotInvitableError,
  ChannelNotPubliclyJoinableError,
  ClearChannelHistoryRequest,
  ClearChannelHistoryResult,
  ClearChannelHistorySucceededResult,
  CreateChannelRequest,
  CreateChannelResult,
  CreatedChannelResult,
  DeleteChannelRequest,
  DeleteChannelResult,
  DeletedChannelResult,
  DirectChannel,
  GetChannelMembersRequest,
  GetChannelResult,
  GetChannelsRequest,
  GetChannelsResult,
  GetChannelsSucceededResult,
  GetChannelSucceededResult,
  GetChannelUnreadRequest,
  GetChannelUnreadResult,
  GetChannelUnreadSucceededResult,
  GetUnreadChannelsRequest,
  HideChannelRequest,
  HideChannelResult,
  HideChannelSucceededResult,
  InvitedUserResult,
  InviteUserRequest,
  InviteUserResult,
  JoinChannelRequest,
  JoinChannelResult,
  JoinedChannelResult,
  LeaveChannelRequest,
  LeaveChannelResult,
  LeftChannelResult,
  MuteChannelRequest,
  MuteChannelResult,
  MutedChannelResult,
  NotAChannelMemberError,
  ReadChannelRequest,
  ReadChannelResult,
  ReadChannelSucceededResult,
  UnmuteChannelRequest,
  UnmuteChannelResult,
  UnmutedChannelResult,
  UpdateChannelRequest,
  UpdateChannelResult,
  UpdatedChannelResult,
} from './channel';
import {
  ChatSession,
  StartChatSessionRequest,
  StartChatSessionResult,
  StartedChatSessionResult,
} from './chat-session';
import {
  CurrentUser,
  GetCurrentUserResult,
  GetCurrentUserSuccessfulResult,
  UpdateCurrentUserDisplayPictureRequest,
  UpdateCurrentUserDisplayPictureResult,
  UpdateCurrentUserResult,
  UpdatedCurrentUserDisplayPictureResult,
  UpdatedCurrentUserResult,
} from './current-user';
import {
  Event,
  TriggeredEventResult,
  TriggerEventRequest,
  TriggerEventResult
} from "./event";
import {
  ChatKittyUploadResult,
  CreateChatKittyExternalFileProperties,
  CreateChatKittyFileProperties,
} from './file';
import {
  Keystrokes,
  SendChannelKeystrokesRequest,
  SendKeystrokesRequest,
  SendThreadKeystrokesRequest
} from './keystrokes';
import {
  DeleteMessageForMeRequest,
  DeleteMessageForMeResult,
  DeleteMessageForMeSucceededResult,
  DeleteMessageRequest,
  DeleteMessageResult,
  DeleteMessageSucceededResult,
  EditedMessageSucceededResult,
  EditMessageRequest,
  EditMessageResult,
  FileUserMessage,
  GetChannelMessagesRequest,
  GetLastReadMessageRequest,
  GetLastReadMessageResult,
  GetMessageChannelRequest,
  GetMessageChannelResult,
  GetMessageChannelSucceededResult,
  GetMessageParentRequest,
  GetMessageParentResult,
  GetMessageParentSucceededResult,
  GetMessageRepliesCountRequest,
  GetMessageRepliesRequest,
  GetMessagesRequest,
  GetMessagesResult,
  GetMessagesSucceededResult,
  GetUnreadMessagesCountRequest,
  isFileMessage,
  Message,
  MessageNotAReplyError,
  ReadMessageRequest,
  ReadMessageResult,
  ReadMessageSucceededResult,
  SendChannelMessageRequest,
  SendFileMessageRequest,
  SendMessageReplyRequest,
  SendMessageRequest,
  SendMessageResult,
  SendTextMessageRequest,
  SendThreadMessageRequest,
  SentFileMessageResult,
  SentTextMessageResult,
  TextUserMessage
} from './message';
import {Notification} from "./notification";
import {ChatKittyObserver, ChatKittyUnsubscribe} from './observer';
import {ChatKittyPaginator} from './pagination';
import {
  GetReactionsRequest,
  GetReactionsResult,
  GetReactionsSucceededResult,
  ReactedToMessageResult,
  Reaction,
  ReactToMessageRequest,
  ReactToMessageResult,
  RemovedReactionResult,
  RemoveReactionRequest,
  RemoveReactionResult,
} from './reaction';
import {
  GetReadReceiptsRequest,
  GetReadReceiptsResult,
  GetReadReceiptsSucceededResult,
  ReadReceipt,
} from './read-receipt';
import {
  ChatKittyFailedResult,
  GetCountResult,
  GetCountSucceedResult,
} from './result';
import {
  CreatedThreadResult,
  CreateThreadRequest,
  CreateThreadResult,
  GetThreadChannelRequest,
  GetThreadChannelResult,
  GetThreadChannelSucceededResult,
  GetThreadMessageRequest,
  GetThreadMessageResult,
  GetThreadMessageSucceededResult,
  GetThreadsRequest,
  GetThreadsResult,
  GetThreadsSucceededResult,
  ReadThreadRequest,
  ReadThreadResult,
  ReadThreadSucceededResult,
  Thread
} from './thread';
import {
  BlockUserRequest,
  BlockUserResult,
  BlockUserSucceededResult,
  GetUserIsChannelMemberRequest,
  GetUserIsChannelMemberResult,
  GetUserIsChannelMemberSucceededResult,
  GetUserResult,
  GetUsersRequest,
  GetUsersResult,
  GetUsersSucceededResult,
  GetUserSucceededResult,
  User,
} from './user';
import {
  DeleteUserBlockListItemRequest,
  DeleteUserBlockListItemResult,
  DeleteUserBlockListItemSucceededResult,
  GetUserBlockListResult,
  GetUserBlockListSucceededResult,
  UserBlockListItem,
} from './user-block-list-item';
import {
  NoActiveSessionError,
  SessionActiveError,
  StartedSessionResult,
  StartSessionRequest,
  StartSessionResult,
} from './user-session';

export class ChatKittyImpl implements ChatKitty {
  private static readonly _instances = new Map<string, ChatKittyImpl>();

  public static getInstance(apiKey: string): ChatKitty {
    let instance = ChatKittyImpl._instances.get(apiKey);

    if (instance !== undefined) {
      return instance;
    }

    instance = new ChatKittyImpl({ apiKey: apiKey });

    ChatKittyImpl._instances.set(apiKey, instance);

    return instance;
  }

  private static channelRelay(id: number): string {
    return '/application/v1/channels/' + id + '.relay';
  }

  private static userRelay(id: number): string {
    return '/application/v1/users/' + id + '.relay';
  }

  private readonly stompX: StompX;

  private readonly currentUserSubject = new BehaviorSubject<CurrentUser | null>(
    null
  );

  private readonly lostConnectionSubject = new Subject<void>();
  private readonly resumedConnectionSubject = new Subject<void>();

  private writeFileGrant?: string;
  private chatSessions: Map<number, ChatSession> = new Map();

  private messageMapper: MessageMapper = new MessageMapper('');

  private keyStrokesSubject = new Subject<SendKeystrokesRequest>();

  currentUser?: CurrentUser;

  Calls: Calls = new (class ChatKittyCalls {
    localStream: MediaStream | null = null;

    isMuted = false;

    constructor(private readonly kitty: ChatKitty) {
    }

    initialize(configuration: {
      media: { audio: boolean; video: boolean };
    }) {
      // TODO
    }

    leaveCall() {
      // TODO
    }

    switchCamera() {
      // TODO
    }

    toggleMute() {
      // TODO
    }

    onParticipantAcceptedCall(
      onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
    ): ChatKittyUnsubscribe {
      // TODO

      return () => {
        // TODO
      };
    }

    onParticipantRejectedCall(
      onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
    ): ChatKittyUnsubscribe {
      // TODO

      return () => {
        // TODO
      };
    }

    onParticipantActive(
      onNextOrObserver:
        | ChatKittyObserver<{ user: User; stream: MediaStream }>
        | ((user: User, stream: MediaStream) => void)
    ): ChatKittyUnsubscribe {
      // TODO

      return () => {
        // TODO
      };
    }

    onParticipantLeftCall(
      onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
    ): ChatKittyUnsubscribe {
      // TODO

      return () => {
        // TODO
      };
    }

    close() {
      // TODO
    }
  })(this)

  public constructor(private readonly configuration: ChatKittyConfiguration) {
    this.stompX = new StompX({
      isSecure: configuration.isSecure === undefined || configuration.isSecure,
      host: configuration.host || 'api.chatkitty.com',
      isDebug: !environment.production,
    });

    this.keyStrokesSubject
      .asObservable()
      .pipe(debounceTime(150))
      .subscribe((request) => {
        let destination = ''

        const channel = (request as SendChannelKeystrokesRequest).channel;
        const thread = (request as SendThreadKeystrokesRequest).thread;

        if (channel) {
          destination = channel._actions.keystrokes
        }

        if (thread) {
          destination = thread._actions.keystrokes
        }

        this.stompX.sendAction<never>({
          destination,
          body: {
            keys: request.keys,
          },
        });
      });
  }

  startSession(
    request: StartSessionRequest
  ): Promise<StartSessionResult> {
    if (this.stompX.initialized) {
      throw new SessionActiveError();
    }

    return new Promise((resolve) => {
      this.stompX.connect<CurrentUser>({
        apiKey: this.configuration.apiKey,
        username: request.username,
        authParams: request.authParams,
        onSuccess: (user, writeFileGrant, readFileGrant) => {
          this.stompX.listenToTopic({ topic: user._topics.self });
          this.stompX.listenToTopic({ topic: user._topics.channels });
          this.stompX.listenToTopic({ topic: user._topics.messages });
          this.stompX.listenToTopic({ topic: user._topics.notifications });
          this.stompX.listenToTopic({ topic: user._topics.contacts });
          this.stompX.listenToTopic({ topic: user._topics.participants });
          this.stompX.listenToTopic({ topic: user._topics.users });
          this.stompX.listenToTopic({ topic: user._topics.reactions });
          this.stompX.listenToTopic({ topic: user._topics.threads });
          this.stompX.listenToTopic({ topic: user._topics.calls });

          this.writeFileGrant = writeFileGrant;

          this.messageMapper = new MessageMapper(readFileGrant);

          resolve(new StartedSessionResult({ user: user }));
        },
        onConnected: (user) => {
          this.currentUser = user;

          this.currentUserSubject.next(user);
        },
        onConnectionLost: () => this.lostConnectionSubject.next(),
        onConnectionResumed: () => this.resumedConnectionSubject.next(),
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  endSession(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stompX.disconnect({
        onSuccess: () => {
          this.currentUser = undefined;
          this.currentUserSubject.next(null);

          resolve();
        },
        onError: (e) => {
          reject(e);
        },
      });
    });
  }

  getCurrentUser(): Promise<GetCurrentUserResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<CurrentUser>({
        destination: currentUser._relays.self,
        onSuccess: (user) => {
          resolve(new GetCurrentUserSuccessfulResult(user));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  onCurrentUserChanged(
    onNextOrObserver:
      | ChatKittyObserver<CurrentUser | null>
      | ((user: CurrentUser | null) => void)
  ): ChatKittyUnsubscribe {
    const subscription = this.currentUserSubject.subscribe((user) => {
      if (typeof onNextOrObserver === 'function') {
        onNextOrObserver(user);
      } else {
        onNextOrObserver.onNext(user);
      }
    });

    return () => subscription.unsubscribe();
  }

  onCurrentUserOnline(
    onNextOrObserver: ChatKittyObserver<CurrentUser> | (() => void)
  ): ChatKittyUnsubscribe {
    const subscription = this.resumedConnectionSubject.subscribe(() => {
      if (typeof onNextOrObserver === 'function') {
        onNextOrObserver();
      } else {
        if (this.currentUser) {
          onNextOrObserver.onNext(this.currentUser);
        }
      }
    });

    return () => subscription.unsubscribe();
  }

  onCurrentUserOffline(
    onNextOrObserver: ChatKittyObserver<CurrentUser> | (() => void)
  ): ChatKittyUnsubscribe {
    const subscription = this.lostConnectionSubject.subscribe(() => {
      if (typeof onNextOrObserver === 'function') {
        onNextOrObserver();
      } else {
        if (this.currentUser) {
          onNextOrObserver.onNext(this.currentUser);
        }
      }
    });

    return () => subscription.unsubscribe();
  }

  updateCurrentUser(
    update: (user: CurrentUser) => CurrentUser
  ): Promise<UpdateCurrentUserResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<CurrentUser>({
        destination: currentUser._actions.update,
        body: update(currentUser),
        onSuccess: (user) => {
          this.currentUserSubject.next(user);

          resolve(new UpdatedCurrentUserResult(user));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  updateCurrentUserDisplayPicture(
    request: UpdateCurrentUserDisplayPictureRequest
  ): Promise<UpdateCurrentUserDisplayPictureResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      const file = request.file;

      if ((file as {uri: string}).uri) {
        this.stompX.sendToStream<CurrentUser>({
          stream: currentUser._streams.displayPicture,
          grant: <string>this.writeFileGrant,
          file: file as File,
          onSuccess: (user) => {
            resolve(new UpdatedCurrentUserDisplayPictureResult(user));
          },
          onError: (error) => {
            resolve(new ChatKittyFailedResult(error));
          },
          progressListener: {
            onStarted: () => request.progressListener?.onStarted?.(),
            onProgress: (progress) =>
              request.progressListener?.onProgress(progress),
            onCompleted: () =>
              request.progressListener?.onCompleted(
                ChatKittyUploadResult.COMPLETED
              ),
            onFailed: () =>
              request.progressListener?.onCompleted(
                ChatKittyUploadResult.FAILED
              ),
            onCancelled: () =>
              request.progressListener?.onCompleted(
                ChatKittyUploadResult.CANCELLED
              ),
          },
        });
      } else {
        this.stompX.sendAction<CurrentUser>({
          destination: currentUser._actions.updateDisplayPicture,
          body: file,
          onSuccess: (user) => {
            resolve(new UpdatedCurrentUserResult(user));
          },
          onError: (error) => {
            resolve(new ChatKittyFailedResult(error));
          },
        });
      }
    });
  }

  updateChannel(
    request: UpdateChannelRequest
  ): Promise<UpdateChannelResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: request.channel._actions.update,
        body: request.channel,
        onSuccess: (channel) => {
          resolve(new UpdatedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  deleteChannel(
    request: DeleteChannelRequest
  ): Promise<DeleteChannelResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<void>({
        destination: request.channel._actions.delete,
        body: {},
        onSuccess: () => {
          resolve(new DeletedChannelResult());
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  createChannel(
    request: CreateChannelRequest
  ): Promise<CreateChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: currentUser._actions.createChannel,
        events: ['user.channel.created', 'user.channel.upserted', 'member.channel.upserted'],
        body: request,
        onSuccess: (channel) => {
          resolve(new CreatedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  getChannels(request?: GetChannelsRequest): Promise<GetChannelsResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      const parameters: { subscribable?: boolean; name?: string } = {};

      let relay = currentUser._relays.channels;

      if (isGetChannelsRequest(request)) {
        if (request.filter?.joined === false) {
          relay = currentUser._relays.joinableChannels;
        }

        if (request.filter?.joined === true) {
          parameters.subscribable = true;
        }

        if (request.filter?.unread) {
          relay = currentUser._relays.unreadChannels;
        }
      }

      const name = request?.filter?.name;

      if (name) {
        parameters.name = name;
      }

      ChatKittyPaginator.createInstance<Channel>({
        stompX: this.stompX,
        relay: relay,
        contentName: 'channels',
        parameters: parameters,
      })
        .then((paginator) => resolve(new GetChannelsSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getChannel(id: number): Promise<GetChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: ChatKittyImpl.channelRelay(id),
        onSuccess: (channel) => {
          resolve(new GetChannelSucceededResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  joinChannel(request: JoinChannelRequest): Promise<JoinChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const destination = request.channel._actions.join;

    if (!destination) {
      throw new ChannelNotPubliclyJoinableError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: destination,
        body: request,
        onSuccess: (channel) => {
          resolve(new JoinedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  leaveChannel(
    request: LeaveChannelRequest
  ): Promise<LeaveChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const destination = request.channel._actions.leave;

    if (!destination) {
      throw new NotAChannelMemberError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: destination,
        body: {},
        onSuccess: (channel) => {
          resolve(new LeftChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  addChannelModerator(
    request: AddChannelModeratorRequest
  ): Promise<AddChannelModeratorResult> {
    const destination = request.channel._actions.addModerator;

    if (!destination) {
      throw new CannotAddModeratorToChannelError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: destination,
        body: request.user,
        onSuccess: (channel) => {
          resolve(new AddedChannelModeratorResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  getUnreadChannelsCount(
    request?: GetUnreadChannelsRequest
  ): Promise<GetCountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const parameters: { unread: true; type?: string } = {
      unread: true,
    };

    if (isGetChannelsUnreadRequest(request)) {
      parameters.type = request.filter?.type;
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: currentUser._relays.channelsCount,
        parameters: parameters,
        onSuccess: (resource) => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  getChannelUnread(
    request: GetChannelUnreadRequest
  ): Promise<GetChannelUnreadResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ exists: boolean }>({
        destination: request.channel._relays.unread,
        onSuccess: (resource) => {
          resolve(new GetChannelUnreadSucceededResult(resource.exists));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  readChannel(request: ReadChannelRequest): Promise<ReadChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.channel._actions.read,
        body: {},
        onSent: () => resolve(new ReadChannelSucceededResult(request.channel)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  muteChannel(request: MuteChannelRequest): Promise<MuteChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: request.channel._actions.mute,
        body: {
          state: 'ON',
        },
        onSuccess: (channel) => {
          resolve(new MutedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  unmuteChannel(
    request: UnmuteChannelRequest
  ): Promise<UnmuteChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: request.channel._actions.mute,
        body: {
          state: 'OFF',
        },
        onSuccess: (channel) => {
          resolve(new UnmutedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  clearChannelHistory(
    request: ClearChannelHistoryRequest
  ): Promise<ClearChannelHistoryResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.channel._actions.clearHistory,
        body: {},
        onSuccess: (channel) =>
          resolve(new ClearChannelHistorySucceededResult(channel)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  hideChannel(request: HideChannelRequest): Promise<HideChannelResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<DirectChannel>({
        destination: request.channel._actions.hide,
        body: {},
        onSuccess: (resource) =>
          resolve(new HideChannelSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  startChatSession(
    request: StartChatSessionRequest
  ): StartChatSessionResult {
    const onReceivedMessage = request.onReceivedMessage;
    const onReceivedKeystrokes = request.onReceivedKeystrokes;
    const onParticipantEnteredChat = request.onParticipantEnteredChat;
    const onParticipantLeftChat = request.onParticipantLeftChat;
    const onTypingStarted = request.onTypingStarted;
    const onTypingStopped = request.onTypingStopped;
    const onParticipantPresenceChanged = request.onParticipantPresenceChanged;
    const onEventTriggered = request.onEventTriggered;
    const onMessageUpdated = request.onMessageUpdated;
    const onChannelUpdated = request.onChannelUpdated;
    const onMessageRead = request.onMessageRead;
    const onMessageReactionAdded = request.onMessageReactionAdded;
    const onMessageReactionRemoved = request.onMessageReactionRemoved;
    const onThreadReceivedMessage = request.onThreadReceivedMessage;
    const onThreadReceivedKeystrokes = request.onThreadReceivedKeystrokes;
    const onThreadTypingStarted = request.onThreadTypingStarted;
    const onThreadTypingStopped = request.onThreadTypingStopped;

    let receivedMessageUnsubscribe: () => void;
    let receivedKeystrokesUnsubscribe: () => void;
    let participantEnteredChatUnsubscribe: () => void;
    let participantLeftChatUnsubscribe: () => void;
    let typingStartedUnsubscribe: () => void;
    let typingStoppedUnsubscribe: () => void;
    let participantPresenceChangedUnsubscribe: () => void;
    let eventTriggeredUnsubscribe: () => void;
    let messageUpdatedUnsubscribe: () => void;
    let channelUpdatedUnsubscribe: () => void;
    let messageReadUnsubscribe: () => void;
    let messageReactionAddedUnsubscribe: () => void;
    let messageReactionRemovedUnsubscribe: () => void;
    let threadReceivedMessageUnsubscribe: () => void;
    let threadReceivedKeystrokesUnsubscribe: () => void;
    let threadTypingStartedUnsubscribe: () => void;
    let threadTypingStoppedUnsubscribe: () => void;

    if (onReceivedMessage) {
      receivedMessageUnsubscribe = this.stompX.listenForEvent<Message>({
        topic: request.channel._topics.messages,
        event: 'channel.message.created',
        onSuccess: (message) => {
          const destination = message._relays.parent;

          if (destination) {
            this.stompX.relayResource<Message>({
              destination,
              onSuccess: (parent) => {
                onReceivedMessage(
                  this.messageMapper.map(message),
                  this.messageMapper.map(parent)
                );
              },
            });
          } else {
            onReceivedMessage(this.messageMapper.map(message));
          }
        },
      });
    }

    if (onReceivedKeystrokes) {
      receivedKeystrokesUnsubscribe = this.stompX.listenForEvent<Keystrokes>({
        topic: request.channel._topics.keystrokes,
        event: 'thread.keystrokes.created',
        onSuccess: (keystrokes) => {
          onReceivedKeystrokes(keystrokes);
        },
      });
    }

    if (onTypingStarted) {
      typingStartedUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.typing,
        event: 'thread.typing.started',
        onSuccess: (user) => {
          onTypingStarted(user);
        },
      });
    }

    if (onTypingStopped) {
      typingStoppedUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.typing,
        event: 'thread.typing.stopped',
        onSuccess: (user) => {
          onTypingStopped(user);
        },
      });
    }

    if (onParticipantEnteredChat) {
      participantEnteredChatUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.participants,
        event: 'channel.participant.active',
        onSuccess: (user) => {
          onParticipantEnteredChat(user);
        },
      });
    }

    if (onParticipantLeftChat) {
      participantLeftChatUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.participants,
        event: 'channel.participant.inactive',
        onSuccess: (user) => {
          onParticipantLeftChat(user);
        },
      });
    }

    if (onParticipantPresenceChanged) {
      participantPresenceChangedUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.participants,
        event: 'participant.presence.changed',
        onSuccess: (user) => {
          onParticipantPresenceChanged(user);
        },
      });
    }

    if (onMessageUpdated) {
      messageUpdatedUnsubscribe = this.stompX.listenForEvent<Message>({
        topic: request.channel._topics.messages,
        event: 'channel.message.updated',
        onSuccess: (message) => {
          onMessageUpdated(message);
        },
      });
    }

    if (onEventTriggered) {
      eventTriggeredUnsubscribe = this.stompX.listenForEvent<Event>({
        topic: request.channel._topics.events,
        event: 'channel.event.triggered',
        onSuccess: (event) => {
          onEventTriggered(event);
        },
      });
    }

    if (onChannelUpdated) {
      channelUpdatedUnsubscribe = this.stompX.listenForEvent<Channel>({
        topic: request.channel._topics.self,
        event: 'channel.self.updated',
        onSuccess: (channel) => {
          onChannelUpdated(channel);
        },
      });
    }

    if (onMessageRead) {
      messageReadUnsubscribe = this.stompX.listenForEvent<ReadReceipt>({
        topic: request.channel._topics.readReceipts,
        event: 'message.read_receipt.created',
        onSuccess: (receipt) => {
          this.stompX.relayResource<Message>({
            destination: receipt._relays.message,
            onSuccess: (message) => {
              onMessageRead(message, receipt);
            },
          });
        },
      });
    }

    if (onMessageReactionAdded) {
      messageReactionAddedUnsubscribe = this.stompX.listenForEvent<Reaction>({
        topic: request.channel._topics.reactions,
        event: 'message.reaction.created',
        onSuccess: (reaction) => {
          this.stompX.relayResource<Message>({
            destination: reaction._relays.message,
            onSuccess: (message) => {
              onMessageReactionAdded(message, reaction);
            },
          });
        },
      });
    }

    if (onMessageReactionRemoved) {
      messageReactionRemovedUnsubscribe = this.stompX.listenForEvent<Reaction>({
        topic: request.channel._topics.reactions,
        event: 'message.reaction.removed',
        onSuccess: (reaction) => {
          this.stompX.relayResource<Message>({
            destination: reaction._relays.message,
            onSuccess: (message) => {
              onMessageReactionRemoved(message, reaction);
            },
          });
        },
      });
    }

    let end = () => {
      messageReactionRemovedUnsubscribe?.();
      messageReactionAddedUnsubscribe?.();
      messageReadUnsubscribe?.();
      channelUpdatedUnsubscribe?.();
      messageUpdatedUnsubscribe?.();
      eventTriggeredUnsubscribe?.();
      participantPresenceChangedUnsubscribe?.();
      participantLeftChatUnsubscribe?.();
      participantEnteredChatUnsubscribe?.();
      typingStoppedUnsubscribe?.();
      typingStartedUnsubscribe?.();
      receivedKeystrokesUnsubscribe?.();
      receivedMessageUnsubscribe?.();
      threadReceivedMessageUnsubscribe?.();
      threadReceivedKeystrokesUnsubscribe?.();
      threadTypingStartedUnsubscribe?.();
      threadTypingStoppedUnsubscribe?.();
    };

    const channelUnsubscribe = this.stompX.listenToTopic({
      topic: request.channel._topics.self,
      onSuccess: () => {
        const messagesUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.messages,
        });

        const keystrokesUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.keystrokes,
        });

        const typingUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.typing,
        });

        const participantsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.participants,
        });

        const readReceiptsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.readReceipts,
        });

        const reactionsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.reactions,
        });

        const eventsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.events,
        });

        const superEnd = end;

        end = () => {
          superEnd();

          eventsUnsubscribe?.();
          reactionsUnsubscribe?.();
          readReceiptsUnsubscribe?.();
          participantsUnsubscribe?.();
          typingUnsubscribe?.();
          keystrokesUnsubscribe?.();
          messagesUnsubscribe?.();

          channelUnsubscribe();

          this.chatSessions.delete(request.channel.id);
        };
      },
    });

    let activeThread: Thread | null = null

    const session = {
      channel: request.channel,
      thread: activeThread,
      end: () => end(),
      setThread: (thread: Thread) => {
        threadReceivedMessageUnsubscribe?.();
        threadReceivedKeystrokesUnsubscribe?.();
        threadTypingStartedUnsubscribe?.();
        threadTypingStoppedUnsubscribe?.();

        if (onThreadReceivedMessage) {
          threadReceivedMessageUnsubscribe = this.stompX.listenForEvent<Message>({
            topic: thread._topics.messages,
            event: 'thread.message.created',
            onSuccess: (message) => {
              onThreadReceivedMessage(thread, this.messageMapper.map(message));
            },
          });
        }

        if (onThreadReceivedKeystrokes) {
          threadReceivedKeystrokesUnsubscribe = this.stompX.listenForEvent<Keystrokes>({
            topic: thread._topics.keystrokes,
            event: 'thread.keystrokes.created',
            onSuccess: (keystrokes) => {
              onThreadReceivedKeystrokes(thread, keystrokes);
            },
          });
        }

        if (onThreadTypingStarted) {
          threadTypingStartedUnsubscribe = this.stompX.listenForEvent<User>({
            topic: thread._topics.typing,
            event: 'thread.typing.started',
            onSuccess: (user) => {
              onThreadTypingStarted(thread, user);
            },
          });
        }

        if (onThreadTypingStopped) {
          threadTypingStoppedUnsubscribe = this.stompX.listenForEvent<User>({
            topic: thread._topics.typing,
            event: 'thread.typing.stopped',
            onSuccess: (user) => {
              onThreadTypingStopped(thread, user);
            },
          });
        }

        activeThread = thread;
      },
    };

    this.chatSessions.set(request.channel.id, session);

    return new StartedChatSessionResult(session);
  }

  sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let destination = '';
      let stream = '';

      const sendChannelMessageRequest = request as SendChannelMessageRequest;

      if (sendChannelMessageRequest.channel !== undefined) {
        destination = sendChannelMessageRequest.channel._actions.message;
        stream = sendChannelMessageRequest.channel._streams.messages;
      }

      const sendMessageReplyRequest = request as SendMessageReplyRequest;

      if (sendMessageReplyRequest.message !== undefined) {
        destination = sendMessageReplyRequest.message._actions.reply;
        stream = sendMessageReplyRequest.message._streams.replies;
      }

      const sendThreadMessageRequest = request as SendThreadMessageRequest;

      if (sendThreadMessageRequest.thread !== undefined) {
        destination = sendThreadMessageRequest.thread._actions.message;
        stream = sendThreadMessageRequest.thread._streams.messages;
      }

      if (isSendChannelTextMessageRequest(request)) {
        this.stompX.sendAction<TextUserMessage>({
          destination: destination,
          body: {
            type: 'TEXT',
            body: request.body,
            groupTag: request.groupTag,
            properties: request.properties,
          },
          onSuccess: (message) => {
            resolve(new SentTextMessageResult(this.messageMapper.map(message)));
          },
          onError: (error) => {
            resolve(new ChatKittyFailedResult(error));
          },
        });
      }

      if (isSendChannelFileMessageRequest(request)) {
        const file = request.file;

        if (isCreateChatKittyExternalFileProperties(file)) {
          this.stompX.sendAction<FileUserMessage>({
            destination: destination,
            body: {
              type: 'FILE',
              file: file,
              groupTag: request.groupTag,
              properties: request.properties,
            },
            onSuccess: (message) => {
              resolve(
                new SentFileMessageResult(this.messageMapper.map(message))
              );
            },
            onError: (error) => {
              resolve(new ChatKittyFailedResult(error));
            },
          });
        } else {
          const properties: Map<string, unknown> = new Map();

          if (request.groupTag) {
            properties.set('groupTag', request.groupTag);
          }

          if (request.properties) {
            properties.set('properties', request.properties);
          }

          this.stompX.sendToStream<FileUserMessage>({
            stream: stream,
            grant: <string>this.writeFileGrant,
            file: file as File,
            properties: properties,
            onSuccess: (message) => {
              resolve(
                new SentFileMessageResult(this.messageMapper.map(message))
              );
            },
            onError: (error) => {
              resolve(new ChatKittyFailedResult(error));
            },
            progressListener: {
              onStarted: () => request.progressListener?.onStarted?.(),
              onProgress: (progress) =>
                request.progressListener?.onProgress(progress),
              onCompleted: () =>
                request.progressListener?.onCompleted(
                  ChatKittyUploadResult.COMPLETED
                ),
              onFailed: () =>
                request.progressListener?.onCompleted(
                  ChatKittyUploadResult.FAILED
                ),
              onCancelled: () =>
                request.progressListener?.onCompleted(
                  ChatKittyUploadResult.CANCELLED
                ),
            },
          });
        }
      }
    });
  }

  getMessages(request: GetMessagesRequest): Promise<GetMessagesResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    let relay = '';

    let parameters: Record<string, unknown> | undefined = undefined;

    if (isGetChannelMessagesRequest(request)) {
      relay = request.channel._relays.messages;

      parameters = {
        ...request.filter,
      };
    }

    if (isGetMessageRepliesRequest(request)) {
      relay = request.message._relays.replies;
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<Message>({
        stompX: this.stompX,
        relay: relay,
        parameters: parameters,
        contentName: 'messages',
        mapper: (message) => this.messageMapper.map(message),
      })
        .then((paginator) => resolve(new GetMessagesSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getUnreadMessagesCount(
    request?: GetUnreadMessagesCountRequest
  ): Promise<GetCountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    let relay = currentUser._relays.unreadMessagesCount;

    if (isGetUnreadMessagesCountRequest(request)) {
      relay = request.channel._relays.messagesCount;
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: relay,
        parameters: {
          unread: true,
        },
        onSuccess: (resource) => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  triggerEvent(
    request: TriggerEventRequest
  ): Promise<TriggerEventResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.channel._actions.triggerEvent,
        body: {
          type: request.type,
          properties: request.properties
        },
        onSent: () => {
          resolve(new TriggeredEventResult(request.channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  readMessage(request: ReadMessageRequest): Promise<ReadMessageResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.message._actions.read,
        body: {},
        onSent: () => resolve(new ReadMessageSucceededResult(request.message)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  getLastReadMessage(
    request: GetLastReadMessageRequest
  ): Promise<GetLastReadMessageResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Message>({
        destination: request.channel._relays.lastReadMessage,
        parameters: {
          username: request.username,
        },
        onSuccess: (resource) => {
          resolve(new GetLastReadMessageResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  editMessage(request: EditMessageRequest): Promise<EditMessageResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Message>({
        destination: request.message._actions.edit,
        body: {
          body: request.body,
        },
        onSuccess: (message) =>
          resolve(new EditedMessageSucceededResult(message)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  getMessageRepliesCount(
    request: GetMessageRepliesCountRequest
  ): Promise<GetCountResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: request.message._relays.repliesCount,
        onSuccess: (resource) => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  getMessageChannel(
    request: GetMessageChannelRequest
  ): Promise<GetMessageChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: request.message._relays.channel,
        onSuccess: (resource) => {
          resolve(new GetMessageChannelSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  getMessageParent(
    request: GetMessageParentRequest
  ): Promise<GetMessageParentResult> {
    return new Promise((resolve) => {
      const destination = request.message._relays.parent;

      if (!destination) {
        throw new MessageNotAReplyError(request.message);
      }

      this.stompX.relayResource<Message>({
        destination,
        onSuccess: (resource) => {
          resolve(new GetMessageParentSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  createThread(request: CreateThreadRequest): Promise<CreateThreadResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Thread>({
        destination: request.channel._actions.createThread,
        body: { name: request.name, properties: request.properties },
        onSuccess: (thread) => resolve(new CreatedThreadResult(thread)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  getThreads(request: GetThreadsRequest): Promise<GetThreadsResult> {
    const parameters: { includeMainThread?: false; standalone?: true } = {};

    if (request.filter?.includeMainThread === false) {
      parameters.includeMainThread = false;
    }

    if (request.filter?.standalone === true) {
      parameters.standalone = true;
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<Thread>({
        stompX: this.stompX,
        relay: request.channel._relays.threads,
        contentName: 'threads',
        parameters,
      })
        .then((paginator) =>
          resolve(new GetThreadsSucceededResult(paginator))
        )
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getThreadChannel(request: GetThreadChannelRequest): Promise<GetThreadChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: request.thread._relays.channel,
        onSuccess: (resource) => {
          resolve(new GetThreadChannelSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  getThreadMessage(request: GetThreadMessageRequest): Promise<GetThreadMessageResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Message>({
        destination: request.thread._relays.message,
        onSuccess: (resource) => {
          resolve(new GetThreadMessageSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  readThread(request: ReadThreadRequest): Promise<ReadThreadResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.thread._actions.read,
        body: {},
        onSent: () => resolve(new ReadThreadSucceededResult(request.thread)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  reactToMessage(
    request: ReactToMessageRequest
  ): Promise<ReactToMessageResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Reaction>({
        destination: request.message._actions.react,
        body: { emoji: request.emoji },
        onSuccess: (reaction) => resolve(new ReactedToMessageResult(reaction)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  getReactions(
    request: GetReactionsRequest
  ): Promise<GetReactionsResult> {
    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<Reaction>({
        stompX: this.stompX,
        relay: request.message._relays.reactions,
        contentName: 'reactions',
      })
        .then((paginator) =>
          resolve(new GetReactionsSucceededResult(paginator))
        )
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  removeReaction(
    request: RemoveReactionRequest
  ): Promise<RemoveReactionResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Reaction>({
        destination: request.message._actions.removeReaction,
        body: {
          emoji: request.emoji,
        },
        onSuccess: (reaction) => resolve(new RemovedReactionResult(reaction)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  deleteMessageForMe(
    request: DeleteMessageForMeRequest
  ): Promise<DeleteMessageForMeResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Message>({
        destination: request.message._actions.deleteForMe,
        body: {},
        onSuccess: (resource) =>
          resolve(new DeleteMessageForMeSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  deleteMessage(
    request: DeleteMessageRequest
  ): Promise<DeleteMessageResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Message>({
        destination: request.message._actions.delete,
        body: {},
        onSuccess: (resource) =>
          resolve(new DeleteMessageSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  sendKeystrokes(request: SendKeystrokesRequest) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    this.keyStrokesSubject.next(request);
  }

  onNotificationReceived(
    onNextOrObserver:
      | ChatKittyObserver<Notification>
      | ((notification: Notification) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Notification>({
      topic: currentUser._topics.notifications,
      event: 'user.notification.created',
      onSuccess: (notification) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(notification);
        } else {
          onNextOrObserver.onNext(notification);
        }
      },
    });

    return () => unsubscribe;
  }

  onChannelJoined(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'user.channel.joined',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  onChannelHidden(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'user.channel.hidden',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  onChannelUnhidden(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'user.channel.unhidden',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  onChannelLeft(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'user.channel.left',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  onChannelUpdated(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'user.channel.updated',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  getChannelMembers(
    request: GetChannelMembersRequest
  ): Promise<GetUsersResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<User>({
        stompX: this.stompX,
        relay: request.channel._relays.members,
        contentName: 'users',
        parameters: {
          ...request.filter,
        },
      })
        .then((paginator) => resolve(new GetUsersSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getReadReceipts(
    request: GetReadReceiptsRequest
  ): Promise<GetReadReceiptsResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<ReadReceipt>({
        stompX: this.stompX,
        relay: request.message._relays.readReceipts,
        contentName: 'receipts',
      })
        .then((paginator) =>
          resolve(new GetReadReceiptsSucceededResult(paginator))
        )
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getUsers(request?: GetUsersRequest): Promise<GetUsersResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let parameters: Record<string, unknown> | undefined = undefined;

      if (isGetUsersRequest(request)) {
        parameters = {
          ...request.filter,
        };
      }

      ChatKittyPaginator.createInstance<User>({
        stompX: this.stompX,
        relay: currentUser._relays.contacts,
        contentName: 'users',
        parameters: parameters,
      })
        .then((paginator) => resolve(new GetUsersSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getUsersCount(request?: GetUsersRequest): Promise<GetCountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let parameters: Record<string, unknown> | undefined = undefined;

      if (isGetUsersRequest(request)) {
        parameters = {
          ...request.filter,
        };
      }

      this.stompX.relayResource<{ count: number }>({
        destination: currentUser._relays.contactsCount,
        parameters: parameters,
        onSuccess: (resource) => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  onUserPresenceChanged(
    onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<User>({
      topic: currentUser._topics.contacts,
      event: 'contact.presence.changed',
      onSuccess: (user) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(user);
        } else {
          onNextOrObserver.onNext(user);
        }
      },
    });

    return () => unsubscribe;
  }

  inviteUser(request: InviteUserRequest): Promise<InviteUserResult> {
    const destination = request.channel._actions.invite;

    if (!destination) {
      throw new ChannelNotInvitableError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<User>({
        destination: destination,
        body: {
          user: request.user,
        },
        onSuccess: (resource) => {
          resolve(new InvitedUserResult(resource));
        },
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  onParticipantStartedTyping(
    onNextOrObserver: ChatKittyObserver<User> | ((participant: User) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<User>({
      topic: currentUser._topics.participants,
      event: 'participant.typing.started',
      onSuccess: (participant) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(participant);
        } else {
          onNextOrObserver.onNext(participant);
        }
      },
    });

    return () => unsubscribe;
  }

  onParticipantStoppedTyping(
    onNextOrObserver: ChatKittyObserver<User> | ((participant: User) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<User>({
      topic: currentUser._topics.participants,
      event: 'participant.typing.stopped',
      onSuccess: (participant) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(participant);
        } else {
          onNextOrObserver.onNext(participant);
        }
      },
    });

    return () => unsubscribe;
  }

  getUser(param: number): Promise<GetUserResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<User>({
        destination: ChatKittyImpl.userRelay(param),
        onSuccess: (user) => {
          resolve(new GetUserSucceededResult(user));
        },
      });
    });
  }

  getUserIsChannelMember(
    request: GetUserIsChannelMemberRequest
  ): Promise<GetUserIsChannelMemberResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ exists: boolean }>({
        destination: request.user._relays.channelMember,
        parameters: {
          channelId: request.channel.id,
        },
        onSuccess: (resource) => {
          resolve(new GetUserIsChannelMemberSucceededResult(resource.exists));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  blockUser(request: BlockUserRequest): Promise<BlockUserResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<User>({
        destination: `/application/v1/users/${request.user.id}.block`,
        body: {},
        onSuccess: (resource) => {
          resolve(new BlockUserSucceededResult(resource));
        },
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  getUserBlockList(): Promise<GetUserBlockListResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<UserBlockListItem>({
        stompX: this.stompX,
        relay: currentUser._relays.userBlockListItems,
        contentName: 'items',
      })
        .then((paginator) =>
          resolve(new GetUserBlockListSucceededResult(paginator))
        )
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  deleteUserBlockListItem(
    request: DeleteUserBlockListItemRequest
  ): Promise<DeleteUserBlockListItemResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<User>({
        destination: request.item._actions.delete,
        body: {},
        onSuccess: (resource) =>
          resolve(new DeleteUserBlockListItemSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }
}

export declare class ChatKittyConfiguration {
  apiKey: string;
  isSecure?: boolean;
  host?: string;
}

class MessageMapper {
  readonly readFileGrant: string;

  constructor(grant: string) {
    this.readFileGrant = grant;
  }

  public map<M extends Message>(message: M): M {
    if (isFileMessage(message)) {
      return {
        ...message,
        file: {
          ...message.file,
          url: message.file.url + `?grant=${this.readFileGrant}`,
        },
      };
    } else {
      return {
        ...message,
      };
    }
  }
}

function isGetChannelsRequest(
  param: GetChannelsRequest | undefined
): param is GetChannelsRequest {
  const request = param as GetChannelsRequest;

  return request?.filter !== undefined;
}

function isGetUsersRequest(
  param: GetUsersRequest | undefined
): param is GetUsersRequest {
  const request = param as GetUsersRequest;

  return request?.filter !== undefined;
}

function isGetChannelsUnreadRequest(
  param: GetUnreadChannelsRequest | undefined
): param is GetUnreadChannelsRequest {
  const request = param as GetUnreadChannelsRequest;

  return request?.filter !== undefined;
}

function isGetUnreadMessagesCountRequest(
  param: GetUnreadMessagesCountRequest | undefined
): param is GetUnreadMessagesCountRequest {
  const request = param as GetUnreadMessagesCountRequest;

  return request?.channel !== undefined;
}

function isSendChannelTextMessageRequest(
  request: SendMessageRequest
): request is SendTextMessageRequest {
  return (request as SendTextMessageRequest).body !== undefined;
}

function isSendChannelFileMessageRequest(
  request: SendMessageRequest
): request is SendFileMessageRequest {
  return (request as SendFileMessageRequest).file !== undefined;
}

function isGetChannelMessagesRequest(
  request: GetMessagesRequest
): request is GetChannelMessagesRequest {
  return (request as GetChannelMessagesRequest).channel !== undefined;
}

function isGetMessageRepliesRequest(
  request: GetMessagesRequest
): request is GetMessageRepliesRequest {
  return (request as GetMessageRepliesRequest).message !== undefined;
}

function isCreateChatKittyExternalFileProperties(
  result: CreateChatKittyFileProperties
): result is CreateChatKittyExternalFileProperties {
  return (
    (result as CreateChatKittyExternalFileProperties).url !== undefined &&
    result.name !== undefined &&
    result.size !== undefined
  );
}

export interface ChatKitty {
  currentUser?: CurrentUser;
  Calls: Calls;

  startSession(
    request: StartSessionRequest
  ): Promise<StartSessionResult>;

  endSession(): Promise<void>;

  getCurrentUser(): Promise<GetCurrentUserResult>;

  onCurrentUserChanged(
    onNextOrObserver:
      | ChatKittyObserver<CurrentUser | null>
      | ((user: CurrentUser | null) => void)
  ): ChatKittyUnsubscribe;

  onCurrentUserOnline(
    onNextOrObserver: ChatKittyObserver<CurrentUser> | (() => void)
  ): ChatKittyUnsubscribe;

  onCurrentUserOffline(
    onNextOrObserver: ChatKittyObserver<CurrentUser> | (() => void)
  ): ChatKittyUnsubscribe;

  updateCurrentUser(
    update: (user: CurrentUser) => CurrentUser
  ): Promise<UpdateCurrentUserResult>;

  updateCurrentUserDisplayPicture(
    request: UpdateCurrentUserDisplayPictureRequest
  ): Promise<UpdateCurrentUserDisplayPictureResult>;

  updateChannel(
    request: UpdateChannelRequest
  ): Promise<UpdateChannelResult>;

  deleteChannel(
    request: DeleteChannelRequest
  ): Promise<DeleteChannelResult>;

  createChannel(
    request: CreateChannelRequest
  ): Promise<CreateChannelResult>;

  getChannels(request?: GetChannelsRequest): Promise<GetChannelsResult>;

  getChannel(id: number): Promise<GetChannelResult>;

  joinChannel(request: JoinChannelRequest): Promise<JoinChannelResult>;

  leaveChannel(
    request: LeaveChannelRequest
  ): Promise<LeaveChannelResult>;

  addChannelModerator(
    request: AddChannelModeratorRequest
  ): Promise<AddChannelModeratorResult>;

  getUnreadChannelsCount(
    request?: GetUnreadChannelsRequest
  ): Promise<GetCountResult>;

  getChannelUnread(
    request: GetChannelUnreadRequest
  ): Promise<GetChannelUnreadResult>;

  readChannel(request: ReadChannelRequest): Promise<ReadChannelResult>;

  muteChannel(request: MuteChannelRequest): Promise<MuteChannelResult>;

  unmuteChannel(
    request: UnmuteChannelRequest
  ): Promise<UnmuteChannelResult>;

  clearChannelHistory(
    request: ClearChannelHistoryRequest
  ): Promise<ClearChannelHistoryResult>;

  hideChannel(request: HideChannelRequest): Promise<HideChannelResult>;

  startChatSession(
    request: StartChatSessionRequest
  ): StartChatSessionResult;

  sendMessage(request: SendMessageRequest): Promise<SendMessageResult>;

  getMessages(request: GetMessagesRequest): Promise<GetMessagesResult>;

  getUnreadMessagesCount(
    request?: GetUnreadMessagesCountRequest
  ): Promise<GetCountResult>;

  triggerEvent(
    request: TriggerEventRequest
  ): Promise<TriggerEventResult>;

  readMessage(request: ReadMessageRequest): Promise<ReadMessageResult>;

  getLastReadMessage(
    request: GetLastReadMessageRequest
  ): Promise<GetLastReadMessageResult>;

  editMessage(request: EditMessageRequest): Promise<EditMessageResult>;

  getMessageRepliesCount(
    request: GetMessageRepliesCountRequest
  ): Promise<GetCountResult>;

  getMessageChannel(
    request: GetMessageChannelRequest
  ): Promise<GetMessageChannelResult>;

  getMessageParent(
    request: GetMessageParentRequest
  ): Promise<GetMessageParentResult>;

  createThread(request: CreateThreadRequest): Promise<CreateThreadResult>;

  getThreads(request: GetThreadsRequest): Promise<GetThreadsResult>;

  getThreadChannel(request: GetThreadChannelRequest): Promise<GetThreadChannelResult>;

  getThreadMessage(request: GetThreadMessageRequest): Promise<GetThreadMessageResult>;

  readThread(request: ReadThreadRequest): Promise<ReadThreadResult>;

  reactToMessage(
    request: ReactToMessageRequest
  ): Promise<ReactToMessageResult>;

  getReactions(
    request: GetReactionsRequest
  ): Promise<GetReactionsResult>;

  removeReaction(
    request: RemoveReactionRequest
  ): Promise<RemoveReactionResult>;

  deleteMessageForMe(
    request: DeleteMessageForMeRequest
  ): Promise<DeleteMessageForMeResult>;

  deleteMessage(
    request: DeleteMessageRequest
  ): Promise<DeleteMessageResult>;

  sendKeystrokes(request: SendKeystrokesRequest): void;

  onNotificationReceived(
    onNextOrObserver:
      | ChatKittyObserver<Notification>
      | ((notification: Notification) => void)
  ): ChatKittyUnsubscribe;

  onChannelJoined(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe;

  onChannelHidden(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe;

  onChannelUnhidden(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe;

  onChannelLeft(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe;

  onChannelUpdated(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe;

  getChannelMembers(
    request: GetChannelMembersRequest
  ): Promise<GetUsersResult>;

  getReadReceipts(
    request: GetReadReceiptsRequest
  ): Promise<GetReadReceiptsResult>;

  getUsers(request?: GetUsersRequest): Promise<GetUsersResult>;

  getUsersCount(request?: GetUsersRequest): Promise<GetCountResult>;

  onUserPresenceChanged(
    onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
  ): ChatKittyUnsubscribe;

  inviteUser(request: InviteUserRequest): Promise<InviteUserResult>;

  onParticipantStartedTyping(
    onNextOrObserver: ChatKittyObserver<User> | ((participant: User) => void)
  ): ChatKittyUnsubscribe;

  onParticipantStoppedTyping(
    onNextOrObserver: ChatKittyObserver<User> | ((participant: User) => void)
  ): ChatKittyUnsubscribe;

  getUser(param: number): Promise<GetUserResult>;

  getUserIsChannelMember(
    request: GetUserIsChannelMemberRequest
  ): Promise<GetUserIsChannelMemberResult>;

  blockUser(request: BlockUserRequest): Promise<BlockUserResult>;

  getUserBlockList(): Promise<GetUserBlockListResult>;

  deleteUserBlockListItem(
    request: DeleteUserBlockListItemRequest
  ): Promise<DeleteUserBlockListItemResult>;
}

export interface Calls {
  localStream: MediaStream | null;

  isMuted: boolean;

  initialize(configuration: {
    media: { audio: boolean; video: boolean };
  }): void;

  leaveCall(): void;

  switchCamera(): void;
  toggleMute(): void;

  onParticipantAcceptedCall(
    onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
  ): ChatKittyUnsubscribe;

  onParticipantRejectedCall(
    onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
  ): ChatKittyUnsubscribe;

  onParticipantActive(
    onNextOrObserver:
      | ChatKittyObserver<{ user: User; stream: MediaStream }>
      | ((user: User, stream: MediaStream) => void)
  ): ChatKittyUnsubscribe;

  onParticipantLeftCall(
    onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
  ): ChatKittyUnsubscribe;

  close(): void;
}

export default ChatKittyImpl;
