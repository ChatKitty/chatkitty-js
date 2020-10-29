import { BehaviorSubject, Subscription } from 'rxjs';

import { environment } from '../environments/environment';

import { ChatKittyConfiguration } from './chatkitty.configuration';
import { ChannelSession } from './model/channel-session/channel-session.model';
import { StartChannelSessionRequest } from './model/channel-session/start/channel-session.start.request';
import { StartedChannelSessionResult } from './model/channel-session/start/channel-session.start.results';
import { Channel } from './model/channel/channel.model';
import { CreateChannelRequest } from './model/channel/create/channel.create.request';
import {
  CreateChannelResult,
  CreatedChannelResult
} from './model/channel/create/channel.create.results';
import { GetChannelsResult } from './model/channel/get/channel.get.results';
import {
  NoActiveChannelSessionChatKittyError,
  NoActiveSessionChatKittyError,
  UnknownChatKittyError
} from './model/chatkitty.error';
import { ChatkittyObserver } from './model/chatkitty.observer';
import { ChatKittyPaginator } from './model/chatkitty.paginator';
import { ChatKittyUnsubscribe } from './model/chatkitty.unsubscribe';
import { CurrentUser } from './model/current-user/current-user.model';
import { GetCurrentUserResult } from './model/current-user/get/current-user.get.results';
import {
  CreateChannelMessageRequest,
  createTextMessage
} from './model/message/create/message.create.request';
import {
  CreatedTextMessageResult,
  CreateMessageResult
} from './model/message/create/message.create.results';
import { GetChannelMessagesRequest } from './model/message/get/message.get.request';
import { GetMessagesResult } from './model/message/get/message.get.results';
import { Message, TextUserMessage } from './model/message/message.model';
import { AccessDeniedSessionError } from './model/session/start/session.errors';
import { StartSessionRequest } from './model/session/start/session.start.request';
import {
  AccessDeniedSessionResult,
  StartedSessionResult, StartSessionResult
} from './model/session/start/session.start.results';
import { StompXClient } from './stompx/stompx.client';

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

  private readonly client: StompXClient;

  private readonly currentUserNextSubject = new BehaviorSubject<CurrentUser | null>(null);

  private currentUser: CurrentUser | undefined;
  private channelSessions: Map<number, ChannelSession> = new Map();

  public constructor(private readonly configuration: ChatKittyConfiguration) {
    this.client = new StompXClient({
      isSecure: configuration.isSecure === undefined || configuration.isSecure,
      host: configuration.host || 'api.chatkitty.com',
      isDebug: !environment.production
    });
  }

  public startSession(request: StartSessionRequest): Promise<StartSessionResult> {
    return new Promise(
      resolve => {
        this.client.connect({
          apiKey: this.configuration.apiKey,
          username: request.username,
          authParams: request.authParams,
          onSuccess: () => {
            this.client.relayResource<CurrentUser>(
              {
                destination: ChatKitty.currentUserRelay,
                onSuccess: user => {
                  this.currentUser = user;

                  this.client.listenToTopic(user._topics.channels);

                  this.currentUserNextSubject.next(user);

                  resolve(new StartedSessionResult({ user: user }));
                }
              }
            );
          },
          onError: (error) => {
            if (error.error === 'AccessDeniedError') {
              resolve(new AccessDeniedSessionResult(new AccessDeniedSessionError()));
            } else {
              resolve(new AccessDeniedSessionResult(new UnknownChatKittyError()));
            }
          }
        });
      }
    );
  }

  public getCurrentUser(): Promise<GetCurrentUserResult> {
    return new Promise(
      resolve => {
        this.client.relayResource<CurrentUser>({
          destination: ChatKitty.currentUserRelay,
          onSuccess: user => {
            resolve(new GetCurrentUserResult(user));
          }
        });
      }
    );
  }

  public onCurrentUserChanged(onNextOrObserver:
                                | ChatkittyObserver<CurrentUser | null>
                                | ((user: CurrentUser | null) => void)): ChatKittyUnsubscribe {
    const subscription = this.currentUserNextSubject.subscribe(user => {
      if (typeof onNextOrObserver === 'function') {
        onNextOrObserver(user);
      } else {
        onNextOrObserver.onNext(user);
      }
    });

    return () => subscription.unsubscribe();
  }

  public createChannel(request: CreateChannelRequest): Promise<CreateChannelResult> {
    return new Promise(
      (resolve, reject) => {
        if (this.currentUser === undefined) {
          reject(new NoActiveSessionChatKittyError());
        } else {
          this.client.performAction<Channel>({
            destination: this.currentUser._actions.createChannel,
            body: request,
            onSuccess: channel => {
              resolve(new CreatedChannelResult(channel));
            }
          });
        }
      }
    );
  }

  public getChannels(): Promise<GetChannelsResult> {
    return new Promise(
      (resolve, reject) => {
        if (this.currentUser === undefined) {
          reject(new NoActiveSessionChatKittyError());
        } else {
          ChatKittyPaginator.createInstance<Channel>(this.client, this.currentUser._relays.channels, 'channels')
          .then(paginator => resolve(new GetChannelsResult(paginator)));
        }
      }
    );
  }

  public getJoinableChannels(): Promise<GetChannelsResult> {
    return new Promise(
      (resolve, reject) => {
        if (this.currentUser === undefined) {
          reject(new NoActiveSessionChatKittyError());
        } else {
          ChatKittyPaginator.createInstance<Channel>(this.client, this.currentUser._relays.joinableChannels, 'channels')
          .then(paginator => resolve(new GetChannelsResult(paginator)));
        }
      }
    );
  }

  public startChannelSession(request: StartChannelSessionRequest): StartedChannelSessionResult {
    const channelUnsubscribe = this.client.listenToTopic(request.channel._topics.self);
    const messagesUnsubscribe = this.client.listenToTopic(request.channel._topics.messages);

    let receivedMessageUnsubscribe: () => void;

    const onReceivedMessage = request.onReceivedMessage;

    if (onReceivedMessage) {
      receivedMessageUnsubscribe = this.client.listenForEvent<Message>({
        topic: request.channel._topics.messages,
        event: 'thread.message.created',
        onSuccess: message => {
          onReceivedMessage(message);
        }
      });
    }

    return new StartedChannelSessionResult({
      channel: request.channel,
      unsubscribe: () => {
        channelUnsubscribe();
        messagesUnsubscribe();

        if (receivedMessageUnsubscribe) {
          receivedMessageUnsubscribe();
        }
      }
    });
  }

  public createChannelMessage(request: CreateChannelMessageRequest): Promise<CreateMessageResult> {
    return new Promise(
      (resolve, reject) => {
        if (this.channelSessions.has(request.channel.id)) {
          reject(new NoActiveChannelSessionChatKittyError(request.channel));
        } else {
          if (createTextMessage(request)) {
            this.client.performAction<TextUserMessage>({
              destination: request.channel._actions.message,
              body: {
                type: 'TEXT',
                body: request.body
              },
              onSuccess: message => {
                resolve(new CreatedTextMessageResult(message));
              }
            });
          }
        }
      }
    );
  }

  public getChannelMessages(request: GetChannelMessagesRequest): Promise<GetMessagesResult> {
    return new Promise(
      (resolve, reject) => {
        if (this.channelSessions.has(request.channel.id)) {
          reject(new NoActiveChannelSessionChatKittyError(request.channel));
        } else {
          ChatKittyPaginator.createInstance<Message>(this.client, request.channel._relays.messages, 'messages')
          .then(paginator => resolve(new GetMessagesResult(paginator)));
        }
      }
    );
  }

  public endChannelSession(session: ChannelSession) {
    session.unsubscribe();
  }

  public endSession() {
    this.client.disconnect({
      onSuccess: () => {
        this.currentUserNextSubject.next(null);
      }
    });
  }
}
