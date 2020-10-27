import { RxStomp } from '@stomp/rx-stomp';
import { RxStompConfig } from '@stomp/rx-stomp';
import { Versions } from '@stomp/stompjs';
import { Subscription } from 'rxjs';
import { v4 } from 'uuid';

import { StompXConnectRequest } from './request/stompx.connect.request';
import { StompXDisconnectRequest } from './request/stompx.disconnect.request';
import { StompXPerformActionRequest } from './request/stompx.perform-action.request';
import { StompXRelayResourceRequest } from './request/stompx.relay-resource.request';
import { StompXConfiguration } from './stompx.configuration';

export class StompXClient {
  private readonly rxStompConfig: RxStompConfig;

  private readonly rxStomp: RxStomp = new RxStomp();

  private readonly topics: Map<string, Subscription> = new Map();

  private readonly pendingActions: Map<string, (resource: unknown) => void> = new Map();

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
    let brokerURL = this.rxStompConfig.brokerURL + '?' +
      `api_key=${encodeURIComponent(request.apiKey)}&stompx_user=${encodeURIComponent(request.username)}`;

    if (request.authParams) {
      brokerURL = brokerURL + `&stompx_auth_params=${encodeURIComponent(JSON.stringify(request.authParams))}`;
    }

    this.rxStomp.configure({
      ...this.rxStompConfig,
      brokerURL: brokerURL
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
      id: StompXClient.generateSubscriptionId()
    })
    .subscribe(message => {
      request.onSuccess(JSON.parse(message.body).resource);
    });
  }

  public listenToTopic(topic: string) {
    const subscription = this.rxStomp.watch(topic, {
      id: StompXClient.generateSubscriptionId(),
      receipt: StompXClient.generateReceipt()
    })
    .subscribe(message => {
        const receipt = message.headers['receipt-id'];

        if (receipt !== undefined) {
          const action = this.pendingActions.get(receipt);

          if (action !== undefined) {
            action(JSON.parse(message.body).resource);

            this.pendingActions.delete(receipt);
          }
        }
      }
    );

    this.topics.set(topic, subscription);
  }

  public performAction<B, R>(request: StompXPerformActionRequest<B, R>) {
    const receipt = StompXClient.generateReceipt();

    if (request.onSuccess) {
      this.pendingActions.set(receipt, request.onSuccess as (resource: unknown) => void);
    }

    this.rxStomp.publish({
      destination: request.destination,
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'receipt': receipt
      },
      body: JSON.stringify(request.body)
    });
  }

  public disconnect(request: StompXDisconnectRequest) {
    this.rxStomp.deactivate();

    request.onSuccess();
  }

  private static generateSubscriptionId(): string {
    return 'subscription-id-' + v4();
  }

  private static generateReceipt(): string {
    return 'receipt-' + v4();
  }
}
