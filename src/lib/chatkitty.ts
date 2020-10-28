import { BehaviorSubject } from 'rxjs';

import { environment } from '../environments/environment';

import { ChatKittyConfiguration } from './chatkitty.configuration';
import { Channel } from './model/channel/channel.model';
import { CreateChannelRequest } from './model/channel/create/channel.create.request';
import {
  CreateChannelResult,
  CreatedChannelResult
} from './model/channel/create/channel.create.results';
import {
  NoActiveSessionChatKittyError,
  UnknownChatKittyError
} from './model/chatkitty.error';
import { ChatkittyObserver } from './model/chatkitty.observer';
import { ChatKittyPaginator } from './model/chatkitty.paginator';
import { ChatkittyUnsubscribable } from './model/chatkitty.unsubscribable';
import { CurrentUser } from './model/current-user/current-user.model';
import { GetCurrentUserResult } from './model/current-user/get/current-user.get.results';
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
                                | ((user: CurrentUser | null) => void)): ChatkittyUnsubscribable {
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
          this.client.performAction<CreateChannelRequest, Channel>({
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

  public getJoinableChannels(): Promise<ChatKittyPaginator<Channel>> {
    return new Promise(
      (resolve, reject) => {
        if (this.currentUser === undefined) {
          reject(new NoActiveSessionChatKittyError());
        } else {
          ChatKittyPaginator.createInstance<Channel>(this.client, this.currentUser._relays.joinableChannels, 'channels')
          .then(paginator => resolve(paginator));
        }
      }
    );
  }

  public endSession(): Promise<void> {
    return new Promise(
      resolve => {
        this.client.disconnect({
          onSuccess: () => {
            this.currentUserNextSubject.next(null);

            resolve();
          }
        });
      }
    );
  }
}
