import { Channel } from '../channel';

export type SendKeystrokesRequest =
  SendChannelKeystrokesRequest

export declare class SendChannelKeystrokesRequest {
  channel: Channel;
  keys: string;
}
