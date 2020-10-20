import { RxStomp } from '@stomp/rx-stomp';
import { RxStompConfig } from '@stomp/rx-stomp';
import { Versions } from '@stomp/stompjs';
import { v4 } from 'uuid';

import { StompXConfiguration } from './stompx.configuration';
import { StompXError } from './stompx.error';

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

  public connect(headers: Record<string, string>, onSuccess: () => void, onError: (error: StompXError) => void) {
    const params = new URLSearchParams(headers);

    const brokerURL = this.rxStompConfig.brokerURL + '?' + params.toString();

    this.rxStomp.configure({
      ...this.rxStompConfig,
      brokerURL: brokerURL
    });

    this.rxStomp.activate();

    const successSubscription = this.rxStomp.connected$.subscribe(() => {
      onSuccess();

      successSubscription.unsubscribe();
    });

    const errorSubscription = this.rxStomp.stompErrors$.subscribe(frame => {
      onError(JSON.parse(frame.body));

      errorSubscription.unsubscribe();

      this.rxStomp.deactivate();
    });
  }

  public relayResource<R>(destination: string, onResourceRelayed: (resource: R) => void) {
    this.rxStomp.watch(destination, {
      id: destination,
      receipt: StompXClient.generateReceipt()
    })
    .subscribe(message => {
      onResourceRelayed(JSON.parse(message.body));
    });
  }

  public disconnect(onDisconnected: () => void) {
    this.rxStomp.deactivate();

    onDisconnected();
  }

  private static generateReceipt(): string {
    return 'receipt-' + v4();
  }
}
