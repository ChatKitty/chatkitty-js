import { ChatKittyFailedResult } from '../../result';
import { Channel } from '../channel';

export type SendKeystrokesRequest = SendChannelKeystrokesRequest;

export declare class SendChannelKeystrokesRequest {
  channel: Channel;
  keys: string;
}

export type SendKeystrokeResult = SentKeystrokeResult | ChatKittyFailedResult;

export declare class SentKeystrokeResult {}
