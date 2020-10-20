import { environment } from '../environments/environment';

import { ChatKittyConfiguration } from './chatkitty.configuration';
import { CurrentUser } from './model/current-user/current-user.model';
import { SessionStartRequest } from './model/session/start/session.start.request';
import { SessionStartedResult } from './model/session/start/session.start.results';
import { StompXClient } from './stompx/stompx.client';

export default class ChatKitty {
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

    this.client.connect(headers, () => {
      this.client.relayResource<CurrentUser>('/application/v1/users/me.relay', user => {
        request.callback(new SessionStartedResult(user));
      });
    });
  }
}
