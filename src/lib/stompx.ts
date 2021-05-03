import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import { StompHeaders, Versions } from '@stomp/stompjs';
import Axios, { AxiosInstance } from 'axios';
import { Subscription } from 'rxjs';
import { v4 } from 'uuid';

let TransportFallback: { default: { new (arg: string): unknown } };

import('sockjs-client')
  .then((sockjs) => {
    TransportFallback = sockjs;
  })
  .catch((error) => {
    ErrorMessageTransportFallback.errorMessage = error.message;

    TransportFallback = { default: ErrorMessageTransportFallback };
  });

class ErrorMessageTransportFallback {
  static errorMessage: string;

  constructor() {
    throw new Error(
      'Encountered error when attempting to use transport fallback: ' +
        ErrorMessageTransportFallback.errorMessage
    );
  }
}

export default class StompX {
  private readonly host: string;

  private readonly wsScheme: string;

  private readonly httpScheme: string;

  private readonly rxStompConfig: RxStompConfig;

  private readonly axios: AxiosInstance;

  private readonly rxStomp: RxStomp = new RxStomp();

  private readonly topics: Map<string, Subscription> = new Map();

  private readonly pendingActions: Map<
    string,
    (resource: unknown) => void
  > = new Map();

  private readonly pendingRelayErrors: Map<
    string,
    (error: StompXError) => void
  > = new Map();

  private readonly pendingActionErrors: Map<
    string,
    (error: StompXError) => void
  > = new Map();

  private readonly eventHandlers: Map<
    string,
    Set<StompXEventHandler<unknown>>
  > = new Map();

  private connected = false;

  constructor(configuration: StompXConfiguration) {
    this.host = configuration.host;

    if (configuration.isSecure) {
      this.wsScheme = 'wss';
      this.httpScheme = 'https';
    } else {
      this.wsScheme = 'ws';
      this.httpScheme = 'http';
    }

    this.rxStompConfig = {
      stompVersions: new Versions(['1.2']),
      connectionTimeout: 5000,
      heartbeatIncoming: 5000,
      heartbeatOutgoing: 300000,

      debug: (message) => {
        if (configuration.isDebug) {
          console.log('StompX Debug:\n' + message);
        }
      },
    };

    if (typeof navigator != 'undefined' && navigator.product == 'ReactNative') {
      this.rxStompConfig.forceBinaryWSFrames = true;
      this.rxStompConfig.appendMissingNULLonIncoming = true;
    }

    this.axios = Axios.create({
      baseURL: this.httpScheme + '://' + this.host,
    });
  }

  public connect<U>(request: StompXConnectRequest<U>) {
    const host = this.host;

    const headers: StompHeaders = {
      'StompX-User': request.username,
    };

    if (request.authParams) {
      headers['StompX-Auth-Params'] = JSON.stringify(request.authParams);
    }

    if (typeof WebSocket === 'function') {
      this.rxStompConfig.brokerURL = `${
        this.wsScheme
      }://${host}/stompx/websocket?api_key=${encodeURIComponent(
        request.apiKey
      )}`;
    } else {
      this.rxStompConfig.webSocketFactory = () => {
        return new TransportFallback.default(
          `${this.httpScheme}://${host}/stompx?api_key=${encodeURIComponent(
            request.apiKey
          )}`
        );
      };
    }

    this.rxStomp.configure({
      ...this.rxStompConfig,
      connectHeaders: headers,
    });

    this.rxStomp.activate();

    this.rxStomp.connected$.subscribe(() => {
      this.relayResource<U>({
        destination: '/application/v1/users/me.relay',
        onSuccess: (user) => {
          request.onConnected(user);

          if (!this.connected) {
            this.rxStomp
              .watch('/user/queue/v1/errors', {
                id: StompX.generateSubscriptionId(),
              })
              .subscribe((message) => {
                const error: StompXError = JSON.parse(message.body);

                const subscription = message.headers['subscription-id'];
                const receipt = message.headers['receipt-id'];

                if (subscription) {
                  const handler = this.pendingRelayErrors.get(subscription);

                  if (handler) {
                    handler(error);

                    this.pendingRelayErrors.delete(subscription);
                  }
                }

                if (receipt) {
                  const handler = this.pendingActionErrors.get(receipt);

                  if (handler) {
                    handler(error);

                    this.pendingActionErrors.delete(receipt);
                  }
                }

                if (!subscription && !receipt) {
                  this.pendingActionErrors.forEach((handler) => {
                    handler(error);
                  });

                  this.pendingActionErrors.clear();
                }
              });

            request.onSuccess(user);

            this.connected = true;
          }
        },
      });
    });

    this.rxStomp.stompErrors$.subscribe((frame) => {
      let error;

      try {
        error = JSON.parse(frame.body);
      } catch (e) {
        error = {
          error: 'UnknownChatKittyError',
          message: 'An unknown error occurred.',
          timestamp: new Date().toISOString(),
        };
      }

      request.onError(error);

      if (error.error == 'AccessDeniedError') {
        this.rxStomp.deactivate();
      }
    });

    this.rxStomp.webSocketErrors$.subscribe(() => {
      request.onError({
        error: 'ChatKittyConnectionError',
        message: 'Could not connect to ChatKitty',
        timestamp: new Date().toISOString(),
      });
    });
  }

  public relayResource<R>(request: StompXRelayResourceRequest<R>) {
    const subscriptionId = StompX.generateSubscriptionId();

    if (request.onError) {
      this.pendingRelayErrors.set(subscriptionId, request.onError);
    }

    this.rxStomp.stompClient.subscribe(
      request.destination,
      (message) => {
        request.onSuccess(JSON.parse(message.body).resource);
      },
      {
        ...request.parameters,
        id: subscriptionId,
      }
    );
  }

  public listenToTopic(request: StompXListenToTopicRequest): () => void {
    const subscriptionReceipt = StompX.generateReceipt();

    const onSuccess = request.onSuccess;

    if (onSuccess) {
      this.rxStomp.watchForReceipt(subscriptionReceipt, () => {
        onSuccess();
      });
    }

    const subscription = this.rxStomp
      .watch(request.topic, {
        id: StompX.generateSubscriptionId(),
        receipt: subscriptionReceipt,
        ack: 'client-individual',
      })
      .subscribe((message) => {
        const event: StompXEvent<unknown> = JSON.parse(message.body);

        const receipt = message.headers['receipt-id'];

        if (receipt) {
          const action = this.pendingActions.get(receipt);

          if (action) {
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

        message.ack();
      });

    this.topics.set(request.topic, subscription);

    return () => {
      subscription.unsubscribe();

      this.topics.delete(request.topic);
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
    const receipt = StompX.generateReceipt();

    if (request.onSent) {
      this.rxStomp.watchForReceipt(receipt, request.onSent);
    }

    if (request.onSuccess) {
      this.pendingActions.set(
        receipt,
        request.onSuccess as (resource: unknown) => void
      );
    }

    if (request.onError) {
      this.pendingActionErrors.set(receipt, request.onError);
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

    request.properties?.forEach((value, key) => {
      data.append(key, value);
    });

    request.progressListener?.onStarted?.();

    this.axios({
      method: 'post',
      url: request.stream,
      data: data,
      headers: { 'Content-Type': 'multipart/form-data', Grant: request.grant },
      onUploadProgress: (progressEvent) => {
        request.progressListener?.onProgress?.(
          progressEvent.loaded / progressEvent.total
        );
      },
    })
      .then((response) => {
        request.progressListener?.onCompleted?.();

        request.onSuccess?.(response.data);
      })
      .catch((error) => {
        request.progressListener?.onFailed?.();

        request.onError?.(error);
      });
  }

  public disconnect(request: StompXDisconnectRequest) {
    this.rxStomp
      .deactivate()
      .then(() => {
        this.connected = false;

        request.onSuccess();
      })
      .catch((e) => request.onError(e));
  }

  private static generateSubscriptionId(): string {
    return 'subscription-id-' + v4();
  }

  private static generateReceipt(): string {
    return 'receipt-' + v4();
  }
}

export declare class StompXConfiguration {
  public isSecure: boolean;
  public host: string;
  public isDebug: boolean;
}

export declare class StompXConnectRequest<U> {
  apiKey: string;
  username: string;
  authParams?: unknown;
  onSuccess: (user: U) => void;
  onConnected: (user: U) => void;
  onError: (error: StompXError) => void;
}

export declare class StompXDisconnectRequest {
  onSuccess: () => void;
  onError: (e: unknown) => void;
}

export declare class StompXListenForEventRequest<R> {
  topic: string;
  event: string;
  onSuccess: (resource: R) => void;
}

export declare class StompXListenToTopicRequest {
  topic: string;
  onSuccess?: () => void;
}

export declare class StompXPage {
  _embedded?: Record<string, unknown>;
  page: StompXPageMetadata;
  _relays: StompXPageRelays;
}

export declare class StompXPageMetadata {
  size: number;
  totalElement: number;
  totalPages: number;
  number: number;
}

export declare class StompXPageRelays {
  first?: string;
  prev?: string;
  self: string;
  next?: string;
  last?: string;
}

export declare class StompXRelayParameters {
  [key: string]: unknown;
}

export declare class StompXPerformActionRequest<R> {
  destination: string;
  body: unknown;
  onSent?: () => void;
  onSuccess?: (resource: R) => void;
  onError?: (error: StompXError) => void;
}

export declare class StompXRelayResourceRequest<R> {
  destination: string;
  parameters?: StompXRelayParameters;
  onSuccess: (resource: R) => void;
  onError?: (error: StompXError) => void;
}

export declare class StompXSendToStreamRequest<R> {
  stream: string;
  grant: string;
  blob: Blob;
  properties?: Map<string, string>;
  onSuccess?: (resource: R) => void;
  onError?: (error: StompXError) => void;
  progressListener?: StompXUploadProgressListener;
}

export declare class StompXEvent<R> {
  type: string;
  version: string;
  resource: R;
}

export declare class StompXError {
  error: string;
  message: string;
  timestamp: string;
}

export declare class StompXEventHandler<R> {
  event: string;
  onSuccess: (resource: R) => void;
}

export interface StompXUploadProgressListener {
  onStarted?: () => void;
  onProgress?: (progress: number) => void;
  onCompleted?: () => void;
  onFailed?: () => void;
  onCancelled?: () => void;
}
