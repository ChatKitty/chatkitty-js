import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import { Versions } from '@stomp/stompjs';
import Axios, { AxiosInstance } from 'axios';
import { Subscription } from 'rxjs';
import { v4 } from 'uuid';

import { StompXConnectRequest } from './request/stompx.connect.request';
import { StompXDisconnectRequest } from './request/stompx.disconnect.request';
import { StompXListenForEventRequest } from './request/stompx.listen-for-event.request';
import { StompxListenToTopicRequest } from './request/stompx.listen-to-topic.request';
import { StompXPerformActionRequest } from './request/stompx.perform-action.request';
import { StompXRelayResourceRequest } from './request/stompx.relay-resource.request';
import { StompXSendToStreamRequest } from './request/stompx.send-to-stream.request';
import { StompXConfiguration } from './stompx.configuration';
import { StompXEvent } from './stompx.event';
import { StompXEventHandler } from './stompx.event-handler';

export class StompXClient {
  private readonly httpBaseUrl: string;

  private readonly rxStompConfig: RxStompConfig;

  private readonly rxStomp: RxStomp = new RxStomp();

  private readonly axios: AxiosInstance = Axios;

  private readonly topics: Map<string, Subscription> = new Map();

  private readonly pendingActions: Map<
    string,
    (resource: unknown) => void
  > = new Map();

  private readonly eventHandlers: Map<
    string,
    Set<StompXEventHandler<unknown>>
  > = new Map();

  constructor(configuration: StompXConfiguration) {
    let httpScheme: string;
    if (configuration.isSecure) {
      httpScheme = 'https';
    } else {
      httpScheme = 'http';
    }

    this.httpBaseUrl = httpScheme + '://' + configuration.host;

    let wsScheme: string;
    if (configuration.isSecure) {
      wsScheme = 'wss';
    } else {
      wsScheme = 'ws';
    }

    const brokerUrl =
      wsScheme + '://' + configuration.host + '/stompx/websocket';

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
      },
    };
  }

  public connect(request: StompXConnectRequest) {
    let brokerURL =
      this.rxStompConfig.brokerURL +
      '?' +
      `api_key=${encodeURIComponent(
        request.apiKey
      )}&stompx_user=${encodeURIComponent(request.username)}`;

    if (request.authParams) {
      brokerURL =
        brokerURL +
        `&stompx_auth_params=${encodeURIComponent(
          JSON.stringify(request.authParams)
        )}`;
    }

    this.rxStomp.configure({
      ...this.rxStompConfig,
      brokerURL: brokerURL,
    });

    this.rxStomp.activate();

    const errorSubscription = this.rxStomp.stompErrors$.subscribe((frame) => {
      request.onError(JSON.parse(frame.body));

      errorSubscription.unsubscribe();

      this.rxStomp.deactivate();
    });

    const successSubscription = this.rxStomp.connected$.subscribe(() => {
      request.onSuccess();

      successSubscription.unsubscribe();
      errorSubscription.unsubscribe();
    });
  }

  public relayResource<R>(request: StompXRelayResourceRequest<R>) {
    this.rxStomp
      .watch(request.destination, {
        id: StompXClient.generateSubscriptionId(),
      })
      .subscribe((message) => {
        request.onSuccess(JSON.parse(message.body).resource);
      });
  }

  public listenToTopic(request: StompxListenToTopicRequest): () => void {
    const subscriptionReceipt = StompXClient.generateReceipt();

    const callback = request.callback;

    if (callback) {
      this.rxStomp.watchForReceipt(subscriptionReceipt, () => {
        callback();
      });
    }

    const subscription = this.rxStomp
      .watch(request.topic, {
        id: StompXClient.generateSubscriptionId(),
        receipt: subscriptionReceipt,
      })
      .subscribe((message) => {
        const event: StompXEvent<unknown> = JSON.parse(message.body);

        const receipt = message.headers['receipt-id'];

        if (receipt !== undefined) {
          const action = this.pendingActions.get(receipt);

          if (action !== undefined) {
            action(event.resource);

            this.pendingActions.delete(receipt);
          }
        }

        const handlers = this.eventHandlers.get(request.topic);

        if (handlers) {
          handlers.forEach((handler) => {
            if (handler.event === event.type) {
              handler.onSuccess(event.resource);
            }
          });
        }
      });

    this.topics.set(request.topic, subscription);

    return () => {
      subscription.unsubscribe();
    };
  }

  public listenForEvent<R>(
    request: StompXListenForEventRequest<R>
  ): () => void {
    let handlers = this.eventHandlers.get(request.topic);

    if (handlers === undefined) {
      handlers = new Set<StompXEventHandler<unknown>>();
    }

    const handler = {
      event: request.event,
      onSuccess: request.onSuccess as (resource: unknown) => void,
    };

    handlers.add(handler);

    this.eventHandlers.set(request.topic, handlers);

    return () => {
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  public performAction<R>(request: StompXPerformActionRequest<R>) {
    const receipt = StompXClient.generateReceipt();

    if (request.onSuccess) {
      this.pendingActions.set(
        receipt,
        request.onSuccess as (resource: unknown) => void
      );
    }

    this.rxStomp.publish({
      destination: request.destination,
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        receipt: receipt,
      },
      body: JSON.stringify(request.body),
    });
  }

  public sendToStream<R>(request: StompXSendToStreamRequest<R>) {
    const data = new FormData();

    data.append('file', request.blob);

    if (request.properties) {
      request.properties.forEach((value, key) => {
        data.append(key, value);
      });
    }

    this.axios({
      method: 'post',
      baseURL: this.httpBaseUrl,
      url: request.stream,
      data: data,
      headers: { 'Content-Type': 'multipart/form-data', Grant: request.grant },
    })
      .then((response) => {
        if (request.onSuccess) {
          request.onSuccess(response.data);
        }
      })
      .catch(() => {
        if (request.onError) {
          // TODO
        }
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
