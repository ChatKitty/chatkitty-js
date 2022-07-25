import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { environment } from '../environment/environment';
import StompX from './stompx';

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
  ListChannelMembersRequest,
  RetrieveChannelResult,
  ListChannelsRequest,
  ListChannelsResult,
  ListChannelsSucceededResult,
  RetrieveChannelSucceededResult,
  RetrieveChannelUnreadRequest,
  CheckChannelUnreadResult,
  ListUnreadChannelsRequest,
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
  UpdatedChannelResult, CountUnreadChannelsRequest, CheckChannelUnreadSucceededResult,
} from './channel';
import {
  ChatSession,
  StartChatSessionRequest,
  StartChatSessionResult,
  StartedChatSessionResult,
} from './chat-session';
import {
  CurrentUser,
  RetrieveCurrentUserResult,
  RetrieveCurrentUserSuccessfulResult,
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
  TriggerEventResult,
} from './event';
import {
  ChatKittyUploadResult,
  CreateChatKittyExternalFileProperties,
  CreateChatKittyFileProperties,
} from './file';
import {
  Keystrokes,
  SendChannelKeystrokesRequest,
  SendKeystrokesRequest,
  SendThreadKeystrokesRequest,
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
  ListChannelMessagesRequest,
  RetrieveLastReadMessageRequest,
  RetrieveLastReadMessageResult,
  RetrieveLastReadMessageSucceededResult,
  RetrieveMessageChannelRequest,
  RetrieveMessageChannelResult,
  RetrieveMessageChannelSucceededResult,
  RetrieveMessageParentRequest,
  RetrieveMessageParentResult,
  RetrieveMessageParentSucceededResult,
  CountMessageRepliesRequest,
  ListMessageRepliesRequest,
  ListMessagesRequest,
  ListMessagesResult,
  ListMessagesSucceededResult,
  CountUnreadMessagesRequest,
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
  TextUserMessage,
} from './message';
import { Notification } from './notification';
import { ChatKittyObserver, ChatKittyUnsubscribe } from './observer';
import { ChatKittyPaginator } from './pagination';
import {
  ListReactionsRequest,
  ListReactionsResult,
  ListReactionsSucceededResult,
  ReactedToMessageResult,
  Reaction,
  ReactToMessageRequest,
  ReactToMessageResult,
  RemovedReactionResult,
  RemoveReactionRequest,
  RemoveReactionResult,
} from './reaction';
import {
  ListReadReceiptsRequest,
  ListReadReceiptsResult,
  ListReadReceiptsSucceededResult,
  ReadReceipt,
} from './read-receipt';
import {
  ChatKittyFailedResult,
  CountResult,
  CountSucceededResult,
} from './result';
import {
  CreatedThreadResult,
  CreateThreadRequest,
  CreateThreadResult,
  RetrieveThreadChannelRequest,
  RetrieveThreadChannelResult,
  RetrieveThreadChannelSucceededResult,
  RetrieveThreadMessageRequest,
  RetrieveThreadMessageResult,
  RetrieveThreadMessageSucceededResult,
  ListThreadsRequest,
  ListThreadsResult,
  ListThreadsSucceededResult,
  ReadThreadRequest,
  ReadThreadResult,
  ReadThreadSucceededResult,
  Thread,
} from './thread';
import {
  BlockUserRequest,
  BlockUserResult,
  BlockUserSucceededResult,
  CheckUserIsChannelMemberRequest,
  CheckUserIsChannelMemberResult,
  RetrieveUserResult,
  ListUsersRequest,
  ListUsersResult,
  ListUsersSucceededResult,
  ListUserSucceededResult,
  User, CheckUserIsChannelMemberSucceededResult,
} from './user';
import {
  DeleteUserBlockedRecordRequest,
  DeleteUserBlockedRecordResult,
  DeleteUserBlockedRecordSucceededResult,
  ListUserBlockedRecordsResult,
  ListUserBlockedRecordsSucceededResult,
  UserBlockedRecord,
} from './user-blocked-record';
import {
  NoActiveSessionError,
  SessionActiveError,
  StartedSessionResult,
  StartSessionRequest,
  StartSessionResult,
} from './user-session';

export class ChatKitty {
  private static readonly _instances = new Map<string, ChatKitty>();

  public static getInstance(apiKey: string): ChatKitty {
    let instance = ChatKitty._instances.get(apiKey);

    if (instance !== undefined) {
      return instance;
    }

    instance = new ChatKitty({ apiKey: apiKey });

    ChatKitty._instances.set(apiKey, instance);

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
        let destination = '';

        const channel = (request as SendChannelKeystrokesRequest).channel;
        const thread = (request as SendThreadKeystrokesRequest).thread;

        if (channel) {
          destination = channel._actions.keystrokes;
        }

        if (thread) {
          destination = thread._actions.keystrokes;
        }

        this.stompX.sendAction<never>({
          destination,
          body: {
            keys: request.keys,
          },
        });
      });
  }

  startSession(request: StartSessionRequest): Promise<StartSessionResult> {
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

  retrieveCurrentUser(): Promise<RetrieveCurrentUserResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<CurrentUser>({
        destination: currentUser._relays.self,
        onSuccess: (user) => {
          resolve(new RetrieveCurrentUserSuccessfulResult(user));
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

      if ((file as { uri: string }).uri) {
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

  updateChannel(request: UpdateChannelRequest): Promise<UpdateChannelResult> {
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

  deleteChannel(request: DeleteChannelRequest): Promise<DeleteChannelResult> {
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

  createChannel(request: CreateChannelRequest): Promise<CreateChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: currentUser._actions.createChannel,
        events: [
          'user.channel.created',
          'user.channel.upserted',
          'member.channel.upserted',
        ],
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

  listChannels(request?: ListChannelsRequest): Promise<ListChannelsResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      const parameters: { subscribable?: boolean; name?: string } = {};

      let relay = currentUser._relays.channels;

      if (isListChannelsRequest(request)) {
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
        .then((paginator) => resolve(new ListChannelsSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  retrieveChannel(id: number): Promise<RetrieveChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: ChatKitty.channelRelay(id),
        onSuccess: (channel) => {
          resolve(new RetrieveChannelSucceededResult(channel));
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

  leaveChannel(request: LeaveChannelRequest): Promise<LeaveChannelResult> {
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

  countUnreadChannels(
    request?: CountUnreadChannelsRequest
  ): Promise<CountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const parameters: { unread: true; type?: string } = {
      unread: true,
    };

    if (isListChannelsUnreadRequest(request)) {
      parameters.type = request.filter?.type;
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: currentUser._relays.channelsCount,
        parameters: parameters,
        onSuccess: (resource) => {
          resolve(new CountSucceededResult(resource.count));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  checkChannelUnread(
    request: RetrieveChannelUnreadRequest
  ): Promise<CheckChannelUnreadResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ exists: boolean }>({
        destination: request.channel._relays.unread,
        onSuccess: (resource) => {
          resolve(new CheckChannelUnreadSucceededResult(resource.exists));
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

  unmuteChannel(request: UnmuteChannelRequest): Promise<UnmuteChannelResult> {
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

  startChatSession(request: StartChatSessionRequest): StartChatSessionResult {
    const onMessageReceived = request.onMessageReceived;
    const onKeystrokesReceived = request.onKeystrokesReceived;
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
    const onThreadMessageReceived = request.onThreadMessageReceived;
    const onThreadKeystrokesReceived = request.onThreadKeystrokesReceived;
    const onThreadTypingStarted = request.onThreadTypingStarted;
    const onThreadTypingStopped = request.onThreadTypingStopped;

    let messageReceivedUnsubscribe: () => void;
    let keystrokesReceivedUnsubscribe: () => void;
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
    let threadMessageReceivedUnsubscribe: () => void;
    let threadKeystrokesReceivedUnsubscribe: () => void;
    let threadTypingStartedUnsubscribe: () => void;
    let threadTypingStoppedUnsubscribe: () => void;

    if (onMessageReceived) {
      messageReceivedUnsubscribe = this.stompX.listenForEvent<Message>({
        topic: request.channel._topics.messages,
        event: 'channel.message.created',
        onSuccess: (message) => {
          const destination = message._relays.parent;

          if (destination) {
            this.stompX.relayResource<Message>({
              destination,
              onSuccess: (parent) => {
                onMessageReceived(
                  this.messageMapper.map(message),
                  this.messageMapper.map(parent)
                );
              },
            });
          } else {
            onMessageReceived(this.messageMapper.map(message));
          }
        },
      });
    }

    if (onKeystrokesReceived) {
      keystrokesReceivedUnsubscribe = this.stompX.listenForEvent<Keystrokes>({
        topic: request.channel._topics.keystrokes,
        event: 'thread.keystrokes.created',
        onSuccess: (keystrokes) => {
          onKeystrokesReceived(keystrokes);
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
      keystrokesReceivedUnsubscribe?.();
      messageReceivedUnsubscribe?.();
      threadMessageReceivedUnsubscribe?.();
      threadKeystrokesReceivedUnsubscribe?.();
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

    let activeThread: Thread | null = null;

    const session = {
      channel: request.channel,
      thread: activeThread,
      end: () => end(),
      setThread: (thread: Thread) => {
        threadMessageReceivedUnsubscribe?.();
        threadKeystrokesReceivedUnsubscribe?.();
        threadTypingStartedUnsubscribe?.();
        threadTypingStoppedUnsubscribe?.();

        if (onThreadMessageReceived) {
          threadMessageReceivedUnsubscribe =
            this.stompX.listenForEvent<Message>({
              topic: thread._topics.messages,
              event: 'thread.message.created',
              onSuccess: (message) => {
                onThreadMessageReceived(
                  thread,
                  this.messageMapper.map(message)
                );
              },
            });
        }

        if (onThreadKeystrokesReceived) {
          threadKeystrokesReceivedUnsubscribe =
            this.stompX.listenForEvent<Keystrokes>({
              topic: thread._topics.keystrokes,
              event: 'thread.keystrokes.created',
              onSuccess: (keystrokes) => {
                onThreadKeystrokesReceived(thread, keystrokes);
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

  listMessages(request: ListMessagesRequest): Promise<ListMessagesResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    let relay = '';

    let parameters: Record<string, unknown> | undefined = undefined;

    if (isListChannelMessagesRequest(request)) {
      relay = request.channel._relays.messages;

      parameters = {
        ...request.filter,
      };
    }

    if (isListMessageRepliesRequest(request)) {
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
        .then((paginator) => resolve(new ListMessagesSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  countUnreadMessages(
    request?: CountUnreadMessagesRequest
  ): Promise<CountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    let relay = currentUser._relays.unreadMessagesCount;

    if (isCountUnreadMessagesRequest(request)) {
      relay = request.channel._relays.messagesCount;
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: relay,
        parameters: {
          unread: true,
        },
        onSuccess: (resource) => {
          resolve(new CountSucceededResult(resource.count));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  triggerEvent(request: TriggerEventRequest): Promise<TriggerEventResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.channel._actions.triggerEvent,
        body: {
          type: request.type,
          properties: request.properties,
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

  retrieveLastReadMessage(
    request: RetrieveLastReadMessageRequest
  ): Promise<RetrieveLastReadMessageResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Message>({
        destination: request.channel._relays.lastReadMessage,
        parameters: {
          username: request.username,
        },
        onSuccess: (resource) => {
          resolve(new RetrieveLastReadMessageSucceededResult(resource));
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

  countMessageReplies(
    request: CountMessageRepliesRequest
  ): Promise<CountResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: request.message._relays.repliesCount,
        onSuccess: (resource) => {
          resolve(new CountSucceededResult(resource.count));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  retrieveMessageChannel(
    request: RetrieveMessageChannelRequest
  ): Promise<RetrieveMessageChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: request.message._relays.channel,
        onSuccess: (resource) => {
          resolve(new RetrieveMessageChannelSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  retrieveMessageParent(
    request: RetrieveMessageParentRequest
  ): Promise<RetrieveMessageParentResult> {
    return new Promise((resolve) => {
      const destination = request.message._relays.parent;

      if (!destination) {
        throw new MessageNotAReplyError(request.message);
      }

      this.stompX.relayResource<Message>({
        destination,
        onSuccess: (resource) => {
          resolve(new RetrieveMessageParentSucceededResult(resource));
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

  listThreads(request: ListThreadsRequest): Promise<ListThreadsResult> {
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
        .then((paginator) => resolve(new ListThreadsSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  listThreadChannel(
    request: RetrieveThreadChannelRequest
  ): Promise<RetrieveThreadChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: request.thread._relays.channel,
        onSuccess: (resource) => {
          resolve(new RetrieveThreadChannelSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  listThreadMessage(
    request: RetrieveThreadMessageRequest
  ): Promise<RetrieveThreadMessageResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Message>({
        destination: request.thread._relays.message,
        onSuccess: (resource) => {
          resolve(new RetrieveThreadMessageSucceededResult(resource));
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

  listReactions(request: ListReactionsRequest): Promise<ListReactionsResult> {
    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<Reaction>({
        stompX: this.stompX,
        relay: request.message._relays.reactions,
        contentName: 'reactions',
      })
        .then((paginator) =>
          resolve(new ListReactionsSucceededResult(paginator))
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

  deleteMessage(request: DeleteMessageRequest): Promise<DeleteMessageResult> {
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

  listChannelMembers(
    request: ListChannelMembersRequest
  ): Promise<ListUsersResult> {
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
        .then((paginator) => resolve(new ListUsersSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  listReadReceipts(
    request: ListReadReceiptsRequest
  ): Promise<ListReadReceiptsResult> {
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
          resolve(new ListReadReceiptsSucceededResult(paginator))
        )
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  listUsers(request?: ListUsersRequest): Promise<ListUsersResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let parameters: Record<string, unknown> | undefined = undefined;

      if (isListUsersRequest(request)) {
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
        .then((paginator) => resolve(new ListUsersSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  listUsersCount(request?: ListUsersRequest): Promise<CountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let parameters: Record<string, unknown> | undefined = undefined;

      if (isListUsersRequest(request)) {
        parameters = {
          ...request.filter,
        };
      }

      this.stompX.relayResource<{ count: number }>({
        destination: currentUser._relays.contactsCount,
        parameters: parameters,
        onSuccess: (resource) => {
          resolve(new CountSucceededResult(resource.count));
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

  retrieveUser(param: number): Promise<RetrieveUserResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<User>({
        destination: ChatKitty.userRelay(param),
        onSuccess: (user) => {
          resolve(new ListUserSucceededResult(user));
        },
      });
    });
  }

  checkUserIsChannelMember(
    request: CheckUserIsChannelMemberRequest
  ): Promise<CheckUserIsChannelMemberResult> {
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
          resolve(new CheckUserIsChannelMemberSucceededResult(resource.exists));
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

  listUserBlockedRecords(): Promise<ListUserBlockedRecordsResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<UserBlockedRecord>({
        stompX: this.stompX,
        relay: currentUser._relays.userBlockedRecords,
        contentName: 'items',
      })
        .then((paginator) =>
          resolve(new ListUserBlockedRecordsSucceededResult(paginator))
        )
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  deleteUserBlockedRecord(
    request: DeleteUserBlockedRecordRequest
  ): Promise<DeleteUserBlockedRecordResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<User>({
        destination: request.item._actions.delete,
        body: {},
        onSuccess: (resource) =>
          resolve(new DeleteUserBlockedRecordSucceededResult(resource)),
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

function isListChannelsRequest(
  param: ListChannelsRequest | undefined
): param is ListChannelsRequest {
  const request = param as ListChannelsRequest;

  return request?.filter !== undefined;
}

function isListUsersRequest(
  param: ListUsersRequest | undefined
): param is ListUsersRequest {
  const request = param as ListUsersRequest;

  return request?.filter !== undefined;
}

function isListChannelsUnreadRequest(
  param: ListUnreadChannelsRequest | undefined
): param is ListUnreadChannelsRequest {
  const request = param as ListUnreadChannelsRequest;

  return request?.filter !== undefined;
}

function isCountUnreadMessagesRequest(
  param: CountUnreadMessagesRequest | undefined
): param is CountUnreadMessagesRequest {
  const request = param as CountUnreadMessagesRequest;

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

function isListChannelMessagesRequest(
  request: ListMessagesRequest
): request is ListChannelMessagesRequest {
  return (request as ListChannelMessagesRequest).channel !== undefined;
}

function isListMessageRepliesRequest(
  request: ListMessagesRequest
): request is ListMessageRepliesRequest {
  return (request as ListMessageRepliesRequest).message !== undefined;
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

export default ChatKitty;
