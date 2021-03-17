import { BehaviorSubject } from 'rxjs';

import { environment } from '../environments/environment';

import { ChatKittyUploadResult } from './file';
import { Channel } from './model/channel';
import {
  CreateChannelRequest,
  CreateChannelResult,
  CreatedChannelResult,
} from './model/channel/create';
import {
  GetChannelResult,
  GetChannelsRequest,
  GetChannelsResult,
  GetChannelsSucceededResult,
  GetChannelSucceededResult,
  GetChannelUnreadRequest,
  GetChannelUnreadResult,
  GetChannelUnreadSucceededResult,
} from './model/channel/get';
import {
  ChannelNotPubliclyJoinableError,
  JoinChannelRequest,
  JoinChannelResult,
  JoinedChannelResult,
} from './model/channel/join';
import {
  LeaveChannelRequest,
  LeaveChannelResult,
  LeftChannelResult,
  NotAChannelMemberError,
} from './model/channel/leave';
import {
  ReadChannelRequest,
  ReadChannelResult,
} from './model/channel/read';
import { ChatSession } from './model/chat-session';
import {
  NoActiveChatSessionError,
  StartChatSessionRequest,
  StartChatSessionResult,
  StartedChatSessionResult,
} from './model/chat-session/start';
import { CurrentUser } from './model/current-user';
import {
  GetCurrentUserResult,
  GetCurrentUserSuccessfulResult,
} from './model/current-user/get';
import {
  UpdateCurrentUserResult,
  UpdatedCurrentUserResult,
} from './model/current-user/update';
import { Keystrokes } from './model/keystrokes';
import {
  SendKeystrokeResult,
  SendKeystrokesRequest,
} from './model/keystrokes/send';
import {
  FileUserMessage,
  isFileMessage,
  Message,
  TextUserMessage,
} from './model/message';
import {
  GetMessagesRequest,
  GetMessagesResult,
  GetMessagesSucceededResult,
} from './model/message/get';
import { ReadMessageRequest } from './model/message/read';
import {
  SendChannelFileMessageRequest,
  SendChannelTextMessageRequest,
  SendMessageRequest,
  SendMessageResult,
  SentFileMessageResult,
  SentTextMessageResult,
} from './model/message/send';
import {
  NoActiveSessionError,
  StartedSessionResult,
  StartSessionInProgressError,
  StartSessionRequest,
  StartSessionResult
} from './model/session/start';
import { User } from './model/user';
import {
  CannotHaveMembersError,
  GetChannelMembersRequest,
  GetContactsRequest,
  GetUserResult,
  GetUsersResult,
  GetUsersSucceededResult,
} from './model/user/get';
import { ChatkittyObserver, ChatKittyUnsubscribe } from './observer';
import { ChatKittyPaginator } from './pagination';
import {
  ChatKittyFailedResult,
  GetCountResult,
  GetCountSucceedResult,
} from './result';
import StompX from './stompx';

export default class ChatKitty {
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
          this.stompX.listenToTopic({ topic: user._topics.notifications });
          this.stompX.listenToTopic({ topic: user._topics.contacts });
          this.stompX.listenToTopic({ topic: user._topics.participants });

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
        },
        onError: (error) => {
          this.isStartingSession = false;

          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public endSession() {
    this.stompX.disconnect({
      onSuccess: () => {
        this.currentUserNextSubject.next(null);
      },
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
      let relay = currentUser._relays.channels;

      if (isGetChannelsRequest(request)) {
        if (request.joinable) {
          relay = currentUser._relays.joinableChannels;
        }

        if (request.filter?.unread) {
          relay = currentUser._relays.unreadChannels;
        }
      }

      ChatKittyPaginator.createInstance<Channel>({
        stompX: this.stompX,
        relay: relay,
        contentName: 'channels',
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

  public getUnreadChannelsCount(): Promise<GetCountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: currentUser._relays.unreadChannelsCount,
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
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
      resolve({ channel: request.channel });
    });
  }

  public startChatSession(
    request: StartChatSessionRequest
  ): StartChatSessionResult {
    let unsubscribe: () => void;

    const onReceivedMessage = request.onReceivedMessage;
    const onReceivedKeystrokes = request.onReceivedKeystrokes;
    const onParticipantEnteredChat = request.onParticipantEnteredChat;
    const onParticipantLeftChat = request.onParticipantLeftChat;
    const onTypingStarted = request.onTypingStarted;
    const onTypingStopped = request.onTypingStopped;
    const onParticipantPresenceChanged = request.onParticipantPresenceChanged;
    const onMessageUpdated = request.onMessageUpdated;

    let receivedMessageUnsubscribe: () => void;
    let receivedKeystrokesUnsubscribe: () => void;
    let participantEnteredChatUnsubscribe: () => void;
    let participantLeftChatUnsubscribe: () => void;
    let typingStartedUnsubscribe: () => void;
    let typingStoppedUnsubscribe: () => void;
    let participantPresenceChangedUnsubscribe: () => void;
    let messageUpdatedUnsubscribe: () => void;

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

        unsubscribe = () => {
          messageUpdatedUnsubscribe?.();
          participantPresenceChangedUnsubscribe?.();
          participantLeftChatUnsubscribe?.();
          participantEnteredChatUnsubscribe?.();
          typingStoppedUnsubscribe?.();
          typingStartedUnsubscribe?.();
          receivedKeystrokesUnsubscribe?.();
          receivedMessageUnsubscribe?.();

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
      end: () => {
        if (unsubscribe) {
          unsubscribe();
        }
      },
    };

    this.chatSessions.set(request.channel.id, session);

    return new StartedChatSessionResult(session);
  }

  public endChatSession(session: ChatSession) {
    session.end();
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
        this.stompX.sendToStream<FileUserMessage>({
          stream: request.channel._streams.messages,
          grant: <string>this.writeFileGrant,
          blob: request.file,
          onSuccess: (message) => {
            resolve(new SentFileMessageResult(this.messageMapper.map(message)));
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

  public readMessage(request: ReadMessageRequest) {
    this.stompX.performAction<never>({
      destination: request.message._actions.read,
      body: {},
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
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });

      resolve({ ...request });
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

  public getContacts(request?: GetContactsRequest): Promise<GetUsersResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let parameters: Record<string, unknown> | undefined = undefined;

      if (isGetContactsRequest(request)) {
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

  public getContactsCount(
    request?: GetContactsRequest
  ): Promise<GetCountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let parameters: Record<string, unknown> | undefined = undefined;

      if (isGetContactsRequest(request)) {
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

  public onContactPresenceChanged(
    onNextOrObserver: ChatkittyObserver<User> | ((contact: User) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<User>({
      topic: currentUser._topics.contacts,
      event: 'contact.presence.changed',
      onSuccess: (contact) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(contact);
        } else {
          onNextOrObserver.onNext(contact);
        }
      },
    });

    return () => unsubscribe;
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

function isGetChannelsRequest(param: unknown): param is GetChannelsRequest {
  const request = param as GetChannelsRequest;

  return request?.joinable !== undefined || request?.filter !== undefined;
}

function isGetContactsRequest(param: unknown): param is GetContactsRequest {
  const request = param as GetContactsRequest;

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
