import { environment } from '../environments/environment';

import { ChatKittyConfiguration } from './chatkitty.configuration';
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
  private static readonly currentUserRelay = '/application/v1/users/me.relay';

  private readonly client: StompXClient;

  public constructor(private readonly configuration: ChatKittyConfiguration) {
    this.client = new StompXClient({
      isSecure: configuration.isSecure === undefined || configuration.isSecure,
      host: configuration.host || 'api.chatkitty.com',
      isDebug: !environment.production
    });
  }

  public startSession(request: SessionStartRequest) {
    this.client.connect({
      apiKey: this.configuration.apiKey,
      username: request.username,
      authParams: request.authParams,
      onSuccess: () => {
        this.client.relayResource<CurrentUser>({
            destination: ChatKitty.currentUserRelay,
            onSuccess: user => {
              request.callback(new SessionStartedResult({ user: user }));
            }
          }
        );
      },
      onError: (error) => {
        if (error.error === 'AccessDeniedError') {
          request.callback(new SessionAccessDeniedResult(new SessionAccessDeniedError()));
        }
      }
    });
  }

  public getCurrentUser(callback: (result: GetCurrentUserResult) => void) {
    this.client.relayResource<CurrentUser>({
      destination: ChatKitty.currentUserRelay,
      onSuccess: user => {
        callback(new GetCurrentUserResult(user));
      }
    });
  }
}
