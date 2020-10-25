import { RxStomp } from '@stomp/rx-stomp';
import { RxStompConfig } from '@stomp/rx-stomp';
import { Versions } from '@stomp/stompjs';
import { v4 } from 'uuid';

import { StompXConnectRequest } from './request/stompx.connect.request';
import { StompXDisconnectRequest } from './request/stompx.disconnect.request';
import { StompXRelayResourceRequest } from './request/stompx.relay-resource.request';
import { StompXConfiguration } from './stompx.configuration';

export class StompXClient {
  private readonly rxStompConfig: RxStompConfig;

  private rxStomp: RxStomp = new RxStomp();

  constructor(configuration: StompXConfiguration) {
    let scheme: string;
    if (configuration.isSecure) {
      scheme = 'wss';
    } else {
      scheme = 'ws';
    }

    const brokerUrl = scheme + '://' + configuration.host + '/stompx/websocket';

    this.rxStompConfig = {
      brokerURL: brokerUrl,

      stompVersions: new Versions(['1.2']),
      heartbeatIncoming: 5000,
      heartbeatOutgoing: 5000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,

      debug: (message) => {
        if (configuration.isDebug) {
          console.log('StompX Debug:\n' + message);
        }
      }
    };
  }

  public connect(request: StompXConnectRequest) {
    let headers: Record<string, string> = {
      api_key: request.apiKey,
      stompx_user: request.username
    };

    if (request.authParams) {
      headers = {
        ...headers,
        stompx_auth_params: JSON.stringify(request.authParams)
      };
    }

    const params = new URLSearchParams(headers);

    const brokerURL = this.rxStompConfig.brokerURL + '?' + params.toString();

    this.rxStomp.configure({
      ...this.rxStompConfig,
      brokerURL: encodeURI(brokerURL)
    });

    this.rxStomp.activate();

    const successSubscription = this.rxStomp.connected$.subscribe(() => {
      request.onSuccess();

      successSubscription.unsubscribe();
    });

    const errorSubscription = this.rxStomp.stompErrors$.subscribe(frame => {
      request.onError(JSON.parse(frame.body));

      errorSubscription.unsubscribe();

      this.rxStomp.deactivate();
    });
  }

  public relayResource<R>(request: StompXRelayResourceRequest<R>) {
    this.rxStomp.watch(request.destination, {
      id: request.destination,
      receipt: StompXClient.generateReceipt()
    })
    .subscribe(message => {
      request.onSuccess(JSON.parse(message.body).resource);
    });
  }

  public disconnect(request: StompXDisconnectRequest) {
    this.rxStomp.deactivate();

    request.onSuccess();
  }

  private static generateReceipt(): string {
    return 'receipt-' + v4();
  }
}
