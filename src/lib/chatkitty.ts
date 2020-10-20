import { environment } from '../environments/environment';

import { ChatKittyConfiguration } from './chatkitty.configuration';
import { CurrentUser } from './model/current-user/current-user.model';
import { GetCurrentUserResult } from './model/current-user/get/current-user.get.results';
import { SessionAccessDeniedError } from './model/session/start/session.errors';
import { SessionStartRequest } from './model/session/start/session.start.request';
import {
  SessionAccessDeniedErrorResult,
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
    let headers: Record<string, string> = {
      api_key: this.configuration.apiKey,
      stompx_user: request.username
    };

    if (request.authParams) {
      headers = {
        ...headers,
        stompx_auth_params: JSON.stringify(request.authParams)
      };
    }

    this.client.connect(headers,
      () => {
        this.client.relayResource<CurrentUser>(ChatKitty.currentUserRelay, user => {
          request.callback(new SessionStartedResult({ user: user }));
        });
      },
      (error) => {
        if (error.error === 'AccessDeniedError') {
          request.callback(new SessionAccessDeniedErrorResult(new SessionAccessDeniedError()));
        }
      });
  }

  public getCurrentUser(callback: (result: GetCurrentUserResult) => void) {
    this.client.relayResource<CurrentUser>(ChatKitty.currentUserRelay, user => {
      callback(new GetCurrentUserResult(user));
    });
  }
}
