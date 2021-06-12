import { Channel } from './channel';

export declare class Keystrokes {
  username: string;
  keys: string;
  _relays: KeystrokesRelays;
}

export declare class KeystrokesRelays {
  thread: string;
  user: string;
}

export type SendKeystrokesRequest = SendChannelKeystrokesRequest;

export declare class SendChannelKeystrokesRequest {
  channel: Channel;
  keys: string;
}
