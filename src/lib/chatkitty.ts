import { BehaviorSubject } from 'rxjs';

import { environment } from '../environments/environment';

import { UnknownChatKittyError } from './error';
import { ChatKittyUploadResult } from './file';
import { Channel } from './model/channel';
import {
  CreateChannelFailedResult,
  CreateChannelRequest,
  CreateChannelResult,
  CreatedChannelResult,
} from './model/channel/create';
import {
  GetChannelReadRequest,
  GetChannelResult,
  GetChannelsCountResult,
  GetChannelsResult,
  GetChannelUnreadResult,
} from './model/channel/get';
import {
  ChannelNotPubliclyJoinableChatKittyError,
  JoinChannelRequest,
  JoinChannelResult,
  JoinedChannelResult,
} from './model/channel/join';
import { ReadChannelRequest } from './model/channel/read';
import { ChatSession } from './model/chat-session';
import {
  NoActiveChatSessionChatKittyError,
  StartChatSessionRequest,
  StartChatSessionResult,
  StartedChatSessionResult,
} from './model/chat-session/start';
import { CurrentUser } from './model/current-user';
import { GetCurrentUserResult } from './model/current-user/get';
import {
  UpdateCurrentUserResult,
  UpdatedCurrentUserResult,
} from './model/current-user/update';
import { Keystrokes } from './model/keystrokes';
import { SendKeystrokesRequest } from './model/keystrokes/send';
import {
  FileUserMessage,
  isFileMessage,
  Message,
  TextUserMessage,
} from './model/message';
import { GetMessagesRequest, GetMessagesResult } from './model/message/get';
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
  AccessDeniedSessionError,
  AccessDeniedSessionResult,
  NoActiveSessionChatKittyError,
  StartedSessionResult,
  StartSessionRequest,
  StartSessionResult,
} from './model/session/start';
import { User } from './model/user';
import {
  CannotHaveMembersChatKittyError,
  GetUserRequest,
  GetUserResult,
  GetUsersRequest,
  GetUsersResult,
} from './model/user/get';
import { ChatkittyObserver, ChatKittyUnsubscribe } from './observer';
import { ChatKittyPaginator } from './pagination';
import StompX from './stompx';

export default class ChatKitty {
  private static readonly _instances = new Map<string, ChatKitty>();

  private static readonly currentUserRelay = '/application/v1/users/me.relay';

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

  private currentUser: CurrentUser | undefined;
  private writeFileGrant: string | undefined;
  private chatSessions: Map<number, ChatSession> = new Map();

  private messageMapper: MessageMapper = new MessageMapper('');

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
    return new Promise((resolve) => {
      this.stompX.connect({
        apiKey: this.configuration.apiKey,
        username: request.username,
        authParams: request.authParams,
        onSuccess: () => {
          this.stompX.relayResource<CurrentUser>({
            destination: ChatKitty.currentUserRelay,
            onSuccess: (user) => {
              this.currentUser = user;

              this.stompX.listenToTopic({ topic: user._topics.channels });
              this.stompX.listenToTopic({ topic: user._topics.notifications });

              this.currentUserNextSubject.next(user);

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

              resolve(new StartedSessionResult({ user: user }));
            },
          });
        },
        onError: (error) => {
          if (error.error === 'AccessDeniedError') {
            resolve(
              new AccessDeniedSessionResult(new AccessDeniedSessionError())
            );
          } else {
            resolve(new AccessDeniedSessionResult(new UnknownChatKittyError()));
          }
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
    return new Promise((resolve) => {
      this.stompX.relayResource<CurrentUser>({
        destination: ChatKitty.currentUserRelay,
        onSuccess: (user) => {
          resolve(new GetCurrentUserResult(user));
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
    return new Promise((resolve, reject) => {
      if (this.currentUser === undefined) {
        reject(new NoActiveSessionChatKittyError());
      } else {
        this.stompX.performAction<CurrentUser>({
          destination: this.currentUser._actions.update,
          body: update(this.currentUser),
          onSuccess: (user) => {
            this.currentUserNextSubject.next(user);

            resolve(new UpdatedCurrentUserResult(user));
          },
        });
      }
    });
  }

  public createChannel(
    request: CreateChannelRequest
  ): Promise<CreateChannelResult> {
    return new Promise((resolve, reject) => {
      if (this.currentUser === undefined) {
        reject(new NoActiveSessionChatKittyError());
      } else {
        this.stompX.performAction<Channel>({
          destination: this.currentUser._actions.createChannel,
          body: request,
          onSuccess: (channel) => {
            resolve(new CreatedChannelResult(channel));
          },
          onError: (error) => {
            resolve(
              new CreateChannelFailedResult({
                ...error,
                type: error.error,
              })
            );
          },
        });
      }
    });
  }

  public getChannels(): Promise<GetChannelsResult> {
    return new Promise((resolve, reject) => {
      if (this.currentUser === undefined) {
        reject(new NoActiveSessionChatKittyError());
      } else {
        ChatKittyPaginator.createInstance<Channel>(
          this.stompX,
          this.currentUser._relays.channels,
          'channels'
        ).then((paginator) => resolve(new GetChannelsResult(paginator)));
      }
    });
  }

  public getJoinableChannels(): Promise<GetChannelsResult> {
    return new Promise((resolve, reject) => {
      if (this.currentUser === undefined) {
        reject(new NoActiveSessionChatKittyError());
      } else {
        ChatKittyPaginator.createInstance<Channel>(
          this.stompX,
          this.currentUser._relays.joinableChannels,
          'channels'
        ).then((paginator) => resolve(new GetChannelsResult(paginator)));
      }
    });
  }

  public getChannel(id: number): Promise<GetChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: ChatKitty.channelRelay(id),
        onSuccess: (channel) => {
          resolve(new GetChannelResult(channel));
        },
      });
    });
  }

  public joinChannel(request: JoinChannelRequest): Promise<JoinChannelResult> {
    return new Promise((resolve, reject) => {
      if (this.currentUser === undefined) {
        reject(new NoActiveSessionChatKittyError());
      } else {
        if (request.channel._actions.join) {
          this.stompX.performAction<Channel>({
            destination: request.channel._actions.join,
            body: request,
            onSuccess: (channel) => {
              resolve(new JoinedChannelResult(channel));
            },
          });
        } else {
          reject(new ChannelNotPubliclyJoinableChatKittyError(request.channel));
        }
      }
    });
  }

  public getUnreadChannelsCount(): Promise<GetChannelsCountResult> {
    return new Promise((resolve, reject) => {
      if (this.currentUser === undefined) {
        reject(new NoActiveSessionChatKittyError());
      } else {
        this.stompX.relayResource<{ count: number }>({
          destination: this.currentUser._relays.unreadChannelsCount,
          onSuccess: (resource) => {
            resolve(new GetChannelsCountResult(resource.count));
          },
        });
      }
    });
  }

  public getUnreadChannels(): Promise<GetChannelsResult> {
    return new Promise((resolve, reject) => {
      if (this.currentUser === undefined) {
        reject(new NoActiveSessionChatKittyError());
      } else {
        ChatKittyPaginator.createInstance<Channel>(
          this.stompX,
          this.currentUser._relays.unreadChannels,
          'channels'
        ).then((paginator) => resolve(new GetChannelsResult(paginator)));
      }
    });
  }

  public getChannelUnread(
    request: GetChannelReadRequest
  ): Promise<GetChannelUnreadResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<{ exists: boolean }>({
        destination: request.channel._relays.unread,
        onSuccess: (resource) => {
          resolve(new GetChannelUnreadResult(resource.exists));
        },
      });
    });
  }

  public readChannel(request: ReadChannelRequest) {
    this.stompX.performAction<never>({
      destination: request.channel._actions.read,
      body: {},
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

    let receivedMessageUnsubscribe: () => void;
    let receivedKeystrokesUnsubscribe: () => void;
    let participantEnteredChatUnsubscribe: () => void;
    let participantLeftChatUnsubscribe: () => void;
    let typingStartedUnsubscribe: () => void;
    let typingStoppedUnsubscribe: () => void;
    let participantPresenceChangedUnsubscribe: () => void;

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

    const channelUnsubscribe = this.stompX.listenToTopic({
      topic: request.channel._topics.self,
      callback: () => {
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
    return new Promise((resolve, reject) => {
      if (!this.chatSessions.has(request.channel.id)) {
        reject(new NoActiveChatSessionChatKittyError(request.channel));
      } else {
        if (sendChannelTextMessage(request)) {
          this.stompX.performAction<TextUserMessage>({
            destination: request.channel._actions.message,
            body: {
              type: 'TEXT',
              body: request.body,
            },
            onSuccess: (message) => {
              resolve(
                new SentTextMessageResult(this.messageMapper.map(message))
              );
            },
          });
        }

        if (sendChannelFileMessage(request)) {
          this.stompX.sendToStream<FileUserMessage>({
            stream: request.channel._streams.messages,
            grant: <string>this.writeFileGrant,
            blob: request.file,
            onSuccess: (message) => {
              resolve(
                new SentFileMessageResult(this.messageMapper.map(message))
              );
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

  public getMessages(request: GetMessagesRequest): Promise<GetMessagesResult> {
    return new Promise((resolve, reject) => {
      if (!this.chatSessions.has(request.channel.id)) {
        reject(new NoActiveChatSessionChatKittyError(request.channel));
      } else {
        ChatKittyPaginator.createInstance<Message>(
          this.stompX,
          request.channel._relays.messages,
          'messages',
          (message) => this.messageMapper.map(message)
        ).then((paginator) => resolve(new GetMessagesResult(paginator)));
      }
    });
  }

  public readMessage(request: ReadMessageRequest) {
    this.stompX.performAction<never>({
      destination: request.message._actions.read,
      body: {},
    });
  }

  public sendKeystrokes(request: SendKeystrokesRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.chatSessions.has(request.channel.id)) {
        reject(new NoActiveChatSessionChatKittyError(request.channel));
      } else {
        this.stompX.performAction<never>({
          destination: request.channel._actions.keystrokes,
          body: {
            keys: request.keys,
          },
        });

        resolve();
      }
    });
  }

  public onNotificationReceived(
    onNextOrObserver:
      | ChatkittyObserver<Notification>
      | ((notification: Notification) => void)
  ): ChatKittyUnsubscribe {
    if (this.currentUser === undefined) {
      throw new NoActiveSessionChatKittyError();
    }

    const unsubscribe = this.stompX.listenForEvent<Notification>({
      topic: this.currentUser._topics.notifications,
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

  public getUsers(request: GetUsersRequest): Promise<GetUsersResult> {
    return new Promise((resolve, reject) => {
      if (!request.channel._relays.members) {
        reject(new CannotHaveMembersChatKittyError(request.channel));
      } else {
        ChatKittyPaginator.createInstance<User>(
          this.stompX,
          request.channel._relays.members,
          'users'
        ).then((paginator) => resolve(new GetUsersResult(paginator)));
      }
    });
  }

  public getUser(param: number | GetUserRequest): Promise<GetUserResult> {
    return new Promise((resolve) => {
      let relay: string;

      if (getUser(param)) {
        if (param.id) {
          relay = ChatKitty.userRelay(param.id);
        } else {
          relay = ''; // TODO
        }
      } else {
        relay = ChatKitty.userRelay(param);
      }

      this.stompX.relayResource<User>({
        destination: relay,
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

function sendChannelTextMessage(
  request: SendMessageRequest
): request is SendChannelTextMessageRequest {
  return (request as SendChannelTextMessageRequest).body !== undefined;
}

function sendChannelFileMessage(
  request: SendMessageRequest
): request is SendChannelFileMessageRequest {
  return (request as SendChannelFileMessageRequest).file !== undefined;
}

function getUser(param: unknown): param is GetUserRequest {
  const request = param as GetUserRequest;

  return request.id !== undefined || request.name !== undefined;
}
