import { Channel } from './channel';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';

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

export class SentKeystrokeResult extends ChatKittySucceededResult {
  constructor(public channel: Channel, public keys: string) {
    super();
  }
}
