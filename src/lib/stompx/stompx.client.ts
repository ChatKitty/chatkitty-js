import { RxStomp } from '@stomp/rx-stomp';
import { RxStompConfig } from '@stomp/rx-stomp';
import { Versions } from '@stomp/stompjs';
import { Subscription } from 'rxjs';
import SockJS from 'sockjs-client';

import { StompXConfiguration } from './stompx.configuration';

export class StompXClient {
  private readonly rxStompConfig: RxStompConfig;

  private rxStomp: RxStomp = new RxStomp();

  private connectedSubscription: Subscription | null = null;

  constructor(configuration: StompXConfiguration) {
    let brokerUrl: string;

    if (typeof WebSocket !== 'function') {
      let scheme: string;
      if (configuration.isSecure) {
        scheme = 'https';
      } else {
        scheme = 'http';
      }

      brokerUrl = scheme + '://' + configuration.host + '/stompx';

      this.rxStomp.stompClient.webSocketFactory = function() {
        console.log('Using SockJS');

        return new SockJS(brokerUrl);
      };

    } else {
      let scheme: string;
      if (configuration.isSecure) {
        scheme = 'wss';
      } else {
        scheme = 'ws';
      }

      brokerUrl = scheme + '://' + configuration.host + '/stompx/websocket';
    }

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

  public connect(headers: Record<string, string>, onConnected: () => void) {
    const params = new URLSearchParams(headers);

    const brokerURL = this.rxStompConfig.brokerURL + '?' + params.toString();

    console.log('URL is: ' + brokerURL);


    this.rxStomp.configure({
      ...this.rxStompConfig,
      brokerURL: brokerURL
    });

    this.rxStomp.activate();

    this.connectedSubscription = this.rxStomp.connected$.subscribe(() =>
      onConnected()
    );
  }

  public disconnect(onDisconnected: () => void) {
    this.rxStomp.deactivate();

    if (this.connectedSubscription) {
      this.connectedSubscription.unsubscribe();
    }

    onDisconnected();
  }
}
