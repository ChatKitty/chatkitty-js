import { Subject } from 'rxjs';

import { environment } from '../environments/environment';

import { ChatKittyConfiguration } from './chatkitty.configuration';
import { UnknownChatKittyError } from './model/chatkitty.error';
import { ChatkittyObserver } from './model/chatkitty.observer';
import { ChatkittyUnsubscribable } from './model/chatkitty.unsubscribable';
import { CurrentUser } from './model/current-user/current-user.model';
import { GetCurrentUserResult } from './model/current-user/get/current-user.get.results';
import { SessionAccessDeniedError } from './model/session/start/session.errors';
import { SessionStartRequest } from './model/session/start/session.start.request';
import {
  SessionAccessDeniedResult,
  SessionStartedResult
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

  private readonly currentUserNextSubject = new Subject<CurrentUser | null>();

  public constructor(private readonly configuration: ChatKittyConfiguration) {
    this.client = new StompXClient({
      isSecure: configuration.isSecure === undefined || configuration.isSecure,
      host: configuration.host || 'api.chatkitty.com',
      isDebug: !environment.production
    });
  }

  public startSession(request: SessionStartRequest): Promise<SessionStartedResult | SessionAccessDeniedResult> {
    return new Promise(
      resolve => {
        this.client.connect({
          apiKey: this.configuration.apiKey,
          username: request.username,
          authParams: request.authParams,
          onSuccess: () => {
            this.client.relayResource<CurrentUser>({
                destination: ChatKitty.currentUserRelay,
                onSuccess: user => {
                  resolve(new SessionStartedResult({ user: user }));
                }
              }
            );
          },
          onError: (error) => {
            if (error.error === 'AccessDeniedError') {
              resolve(new SessionAccessDeniedResult(new SessionAccessDeniedError()));
            } else {
              resolve(new SessionAccessDeniedResult(new UnknownChatKittyError()));
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
            this.currentUserNextSubject.next(user);

            resolve(new GetCurrentUserResult(user));
          }
        });
      }
    );
  }

  public onCurrentUserChanged(observer: ChatkittyObserver<CurrentUser | null>): ChatkittyUnsubscribable {
    return this.currentUserNextSubject.subscribe(
      user => observer.onNext(user)
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
