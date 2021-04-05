import { Channel } from './channel';
import { ChatKittyFailedResult } from './result';

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

export type SendKeystrokeResult = SentKeystrokeResult | ChatKittyFailedResult;

export declare class SentKeystrokeResult {
  channel: Channel;
  keys: string;
}
