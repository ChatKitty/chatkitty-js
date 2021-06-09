import { BehaviorSubject } from 'rxjs';

import { environment } from '../environment/environment';

import {
  Channel,
  ChannelNotInvitableError,
  ChannelNotPubliclyJoinableError,
  ClearChannelHistoryRequest,
  ClearChannelHistoryResult,
  ClearChannelHistorySucceededResult,
  CreateChannelRequest,
  CreateChannelResult,
  CreatedChannelResult,
  DirectChannel,
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
} from './channel';
import {
  ChatSession,
  NoActiveChatSessionError,
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
import { ChatKittyUploadResult } from './file';
import {
  Keystrokes,
  SendKeystrokeResult,
  SendKeystrokesRequest,
  SentKeystrokeResult,
} from './keystrokes';
import {
  DeleteMessageForMeRequest,
  DeleteMessageForMeResult,
  DeleteMessageForMeSucceededResult,
  FileUserMessage,
  GetLastReadMessageRequest,
  GetLastReadMessageResult,
  GetMessagesRequest,
  GetMessagesResult,
  GetMessagesSucceededResult,
  GetUnreadMessagesCountRequest,
  isFileMessage,
  Message,
  ReadMessageRequest,
  ReadMessageResult,
  ReadMessageSucceededResult,
  SendChannelFileMessageRequest,
  SendChannelTextMessageRequest,
  SendMessageRequest,
  SendMessageResult,
  SentFileMessageResult,
  SentTextMessageResult,
  TextUserMessage,
} from './message';
import { ChatkittyObserver, ChatKittyUnsubscribe } from './observer';
import { ChatKittyPaginator } from './pagination';
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
import StompX from './stompx';
import {
  BlockUserRequest,
  BlockUserResult,
  BlockUserSucceededResult,
  CannotHaveMembersError,
  GetChannelMembersRequest,
  GetUserResult,
  GetUsersRequest,
  GetUsersResult,
  GetUsersSucceededResult,
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
  StartedSessionResult,
  StartSessionInProgressError,
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

  private readonly currentUserNextSubject = new BehaviorSubject<CurrentUser | null>(
    null
  );

  private currentUser?: CurrentUser;
  private writeFileGrant?: string;
  private chatSessions: Map<number, ChatSession> = new Map();

  private messageMapper: MessageMapper = new MessageMapper('');

  private isStartingSession = false;

  public constructor(private readonly configuration: ChatKittyConfiguration) {
    this.stompX = new StompX({
      isSecure: configuration.isSecure === undefined || configuration.isSecure,
      host: configuration.host || 'api.chatkitty.com',
      isDebug: !environment.production,
    });
  }

  public startSession(
    request: StartSessionRequest
  ): Promise<StartSessionResult> {
    if (this.isStartingSession) {
      throw new StartSessionInProgressError();
    }

    this.isStartingSession = true;

    return new Promise((resolve) => {
      this.stompX.connect<CurrentUser>({
        apiKey: this.configuration.apiKey,
        username: request.username,
        authParams: request.authParams,
        onSuccess: (user) => {
          this.stompX.listenToTopic({ topic: user._topics.self });
          this.stompX.listenToTopic({ topic: user._topics.channels });
          this.stompX.listenToTopic({ topic: user._topics.messages });
          this.stompX.listenToTopic({ topic: user._topics.notifications });
          this.stompX.listenToTopic({ topic: user._topics.contacts });
          this.stompX.listenToTopic({ topic: user._topics.participants });
          this.stompX.listenToTopic({ topic: user._topics.users });

          this.stompX.relayResource<{ grant: string }>({
            destination: user._relays.writeFileAccessGrant,
            onSuccess: (grant) => {
              this.writeFileGrant = grant.grant;
            },
          });

          this.stompX.relayResource<{ grant: string }>({
            destination: user._relays.readFileAccessGrant,
            onSuccess: (grant) => {
              this.messageMapper = new MessageMapper(grant.grant);
            },
          });

          this.isStartingSession = false;

          resolve(new StartedSessionResult({ user: user }));
        },
        onConnected: (user) => {
          this.currentUser = user;

          this.currentUserNextSubject.next(user);

          resolve(new StartedSessionResult({ user: user }));
        },
        onError: (error) => {
          this.isStartingSession = false;

          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public endSession(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stompX.disconnect({
        onSuccess: () => {
          this.currentUser = undefined;
          this.currentUserNextSubject.next(null);

          resolve();
        },
        onError: (e) => {
          reject(e);
        },
      });
    });
  }

  public getCurrentUser(): Promise<GetCurrentUserResult> {
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

  public onCurrentUserChanged(
    onNextOrObserver:
      | ChatkittyObserver<CurrentUser | null>
      | ((user: CurrentUser | null) => void)
  ): ChatKittyUnsubscribe {
    const subscription = this.currentUserNextSubject.subscribe((user) => {
      if (typeof onNextOrObserver === 'function') {
        onNextOrObserver(user);
      } else {
        onNextOrObserver.onNext(user);
      }
    });

    return () => subscription.unsubscribe();
  }

  public updateCurrentUser(
    update: (user: CurrentUser) => CurrentUser
  ): Promise<UpdateCurrentUserResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.performAction<CurrentUser>({
        destination: currentUser._actions.update,
        body: update(currentUser),
        onSuccess: (user) => {
          this.currentUserNextSubject.next(user);

          resolve(new UpdatedCurrentUserResult(user));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public updateCurrentUserDisplayPicture(
    request: UpdateCurrentUserDisplayPictureRequest
  ): Promise<UpdateCurrentUserDisplayPictureResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      const file = request.file;

      if (file instanceof File) {
        this.stompX.sendToStream<CurrentUser>({
          stream: currentUser._streams.displayPicture,
          grant: <string>this.writeFileGrant,
          blob: file,
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
        this.stompX.performAction<CurrentUser>({
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

  public createChannel(
    request: CreateChannelRequest
  ): Promise<CreateChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.performAction<Channel>({
        destination: currentUser._actions.createChannel,
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

  public getChannels(request?: GetChannelsRequest): Promise<GetChannelsResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      const parameters: { subscribable?: boolean; name?: string } = {};

      let relay = currentUser._relays.channels;

      if (isGetChannelsRequest(request)) {
        if (request.joinable) {
          relay = currentUser._relays.joinableChannels;
        }

        if (request.subscribable) {
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

  public getChannel(id: number): Promise<GetChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: ChatKitty.channelRelay(id),
        onSuccess: (channel) => {
          resolve(new GetChannelSucceededResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public joinChannel(request: JoinChannelRequest): Promise<JoinChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const destination = request.channel._actions.join;

    if (!destination) {
      throw new ChannelNotPubliclyJoinableError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.performAction<Channel>({
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

  public leaveChannel(
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
      this.stompX.performAction<Channel>({
        destination: destination,
        body: request,
        onSuccess: (channel) => {
          resolve(new LeftChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public getUnreadChannelsCount(
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

  public getChannelUnread(
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

  public readChannel(request: ReadChannelRequest): Promise<ReadChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.performAction<never>({
        destination: request.channel._actions.read,
        body: {},
        onSent: () => resolve(new ReadChannelSucceededResult(request.channel)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public muteChannel(request: MuteChannelRequest): Promise<MuteChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.performAction<Channel>({
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

  public unmuteChannel(
    request: UnmuteChannelRequest
  ): Promise<UnmuteChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.performAction<Channel>({
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

  public clearChannelHistory(
    request: ClearChannelHistoryRequest
  ): Promise<ClearChannelHistoryResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.performAction<never>({
        destination: request.channel._actions.clearHistory,
        body: {},
        onSuccess: (channel) =>
          resolve(new ClearChannelHistorySucceededResult(channel)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public hideChannel(request: HideChannelRequest): Promise<HideChannelResult> {
    return new Promise((resolve) => {
      this.stompX.performAction<DirectChannel>({
        destination: request.channel._actions.hide,
        body: {},
        onSuccess: (resource) =>
          resolve(new HideChannelSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public startChatSession(
    request: StartChatSessionRequest
  ): StartChatSessionResult {
    const onReceivedMessage = request.onReceivedMessage;
    const onReceivedKeystrokes = request.onReceivedKeystrokes;
    const onParticipantEnteredChat = request.onParticipantEnteredChat;
    const onParticipantLeftChat = request.onParticipantLeftChat;
    const onTypingStarted = request.onTypingStarted;
    const onTypingStopped = request.onTypingStopped;
    const onParticipantPresenceChanged = request.onParticipantPresenceChanged;
    const onMessageUpdated = request.onMessageUpdated;
    const onChannelUpdated = request.onChannelUpdated;
    const onMessageRead = request.onMessageRead;

    let receivedMessageUnsubscribe: () => void;
    let receivedKeystrokesUnsubscribe: () => void;
    let participantEnteredChatUnsubscribe: () => void;
    let participantLeftChatUnsubscribe: () => void;
    let typingStartedUnsubscribe: () => void;
    let typingStoppedUnsubscribe: () => void;
    let participantPresenceChangedUnsubscribe: () => void;
    let messageUpdatedUnsubscribe: () => void;
    let channelUpdatedUnsubscribe: () => void;
    let messageReadUnsubscribe: () => void;

    if (onReceivedMessage) {
      receivedMessageUnsubscribe = this.stompX.listenForEvent<Message>({
        topic: request.channel._topics.messages,
        event: 'thread.message.created',
        onSuccess: (message) => {
          onReceivedMessage(this.messageMapper.map(message));
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
        event: 'thread.message.updated',
        onSuccess: (message) => {
          onMessageUpdated(message);
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

    let end = () => {
      messageReadUnsubscribe?.();
      channelUpdatedUnsubscribe?.();
      messageUpdatedUnsubscribe?.();
      participantPresenceChangedUnsubscribe?.();
      participantLeftChatUnsubscribe?.();
      participantEnteredChatUnsubscribe?.();
      typingStoppedUnsubscribe?.();
      typingStartedUnsubscribe?.();
      receivedKeystrokesUnsubscribe?.();
      receivedMessageUnsubscribe?.();
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

        end = () => {
          messageReadUnsubscribe?.();
          channelUpdatedUnsubscribe?.();
          messageUpdatedUnsubscribe?.();
          participantPresenceChangedUnsubscribe?.();
          participantLeftChatUnsubscribe?.();
          participantEnteredChatUnsubscribe?.();
          typingStoppedUnsubscribe?.();
          typingStartedUnsubscribe?.();
          receivedKeystrokesUnsubscribe?.();
          receivedMessageUnsubscribe?.();

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

    const session = {
      channel: request.channel,
      end: () => end(),
    };

    this.chatSessions.set(request.channel.id, session);

    return new StartedChatSessionResult(session);
  }

  public sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    if (!this.chatSessions.has(request.channel.id)) {
      throw new NoActiveChatSessionError(request.channel);
    }

    return new Promise((resolve) => {
      if (isSendChannelTextMessageRequest(request)) {
        this.stompX.performAction<TextUserMessage>({
          destination: request.channel._actions.message,
          body: {
            type: 'TEXT',
            body: request.body,
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

        if (file instanceof File) {
          const properties: Map<string, unknown> = new Map();

          if (request.properties) {
            properties.set('properties', request.properties);
          }

          this.stompX.sendToStream<FileUserMessage>({
            stream: request.channel._streams.messages,
            grant: <string>this.writeFileGrant,
            blob: file,
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
        } else {
          this.stompX.performAction<FileUserMessage>({
            destination: request.channel._actions.message,
            body: {
              type: 'FILE',
              file: file,
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
        }
      }
    });
  }

  public getMessages(request: GetMessagesRequest): Promise<GetMessagesResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<Message>({
        stompX: this.stompX,
        relay: request.channel._relays.messages,
        contentName: 'messages',
        mapper: (message) => this.messageMapper.map(message),
      })
        .then((paginator) => resolve(new GetMessagesSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public getUnreadMessagesCount(
    request: GetUnreadMessagesCountRequest
  ): Promise<GetCountResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: request.channel._relays.messagesCount,
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

  public readMessage(request: ReadMessageRequest): Promise<ReadMessageResult> {
    return new Promise((resolve) => {
      this.stompX.performAction<never>({
        destination: request.message._actions.read,
        body: {},
        onSent: () => resolve(new ReadMessageSucceededResult(request.message)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public getLastReadMessage(
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

  public deleteMessageForMe(
    request: DeleteMessageForMeRequest
  ): Promise<DeleteMessageForMeResult> {
    return new Promise((resolve) => {
      this.stompX.performAction<Message>({
        destination: request.message._actions.deleteForMe,
        body: {},
        onSuccess: (resource) =>
          resolve(new DeleteMessageForMeSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public sendKeystrokes(
    request: SendKeystrokesRequest
  ): Promise<SendKeystrokeResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    if (!this.chatSessions.has(request.channel.id)) {
      throw new NoActiveChatSessionError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.performAction<never>({
        destination: request.channel._actions.keystrokes,
        body: {
          keys: request.keys,
        },
        onSent: () =>
          resolve(new SentKeystrokeResult(request.channel, request.keys)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public onNotificationReceived(
    onNextOrObserver:
      | ChatkittyObserver<Notification>
      | ((notification: Notification) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Notification>({
      topic: currentUser._topics.notifications,
      event: 'me.notification.created',
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

  public onChannelJoined(
    onNextOrObserver: ChatkittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'me.channel.joined',
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

  public onChannelUpdated(
    onNextOrObserver: ChatkittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'me.channel.updated',
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

  public getChannelMembers(
    request: GetChannelMembersRequest
  ): Promise<GetUsersResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const relay = request.channel._relays.members;

    if (!relay) {
      throw new CannotHaveMembersError(request.channel);
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<User>({
        stompX: this.stompX,
        relay: relay,
        contentName: 'users',
      })
        .then((paginator) => resolve(new GetUsersSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public getReadReceipts(
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

  public getUsers(request?: GetUsersRequest): Promise<GetUsersResult> {
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

  public getUsersCount(request?: GetUsersRequest): Promise<GetCountResult> {
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

  public onUserPresenceChanged(
    onNextOrObserver: ChatkittyObserver<User> | ((user: User) => void)
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

  public inviteUser(request: InviteUserRequest): Promise<InviteUserResult> {
    const destination = request.channel._actions.invite;

    if (!destination) {
      throw new ChannelNotInvitableError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.performAction<User>({
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

  public onParticipantStartedTyping(
    onNextOrObserver: ChatkittyObserver<User> | ((participant: User) => void)
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

  public onParticipantStoppedTyping(
    onNextOrObserver: ChatkittyObserver<User> | ((participant: User) => void)
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

  public getUser(param: number): Promise<GetUserResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<User>({
        destination: ChatKitty.userRelay(param),
        onSuccess: (user) => {
          resolve(new GetUserResult(user));
        },
      });
    });
  }

  public blockUser(request: BlockUserRequest): Promise<BlockUserResult> {
    return new Promise((resolve) => {
      this.stompX.performAction<User>({
        destination: `/application/v1/users/${request.user.id}.block`,
        body: {},
        onSuccess: (resource) => {
          resolve(new BlockUserSucceededResult(resource));
        },
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public getUserBlockList(): Promise<GetUserBlockListResult> {
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

  public deleteUserBlockListItem(
    request: DeleteUserBlockListItemRequest
  ): Promise<DeleteUserBlockListItemResult> {
    return new Promise((resolve) => {
      this.stompX.performAction<User>({
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

  return request?.joinable !== undefined || request?.filter !== undefined;
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

function isSendChannelTextMessageRequest(
  request: SendMessageRequest
): request is SendChannelTextMessageRequest {
  return (request as SendChannelTextMessageRequest).body !== undefined;
}

function isSendChannelFileMessageRequest(
  request: SendMessageRequest
): request is SendChannelFileMessageRequest {
  return (request as SendChannelFileMessageRequest).file !== undefined;
}

export default ChatKitty;
