import { Channel } from '../../channel/channel.model';

export type SendMessageRequest =
  SendChannelTextMessageRequest

export declare class SendChannelTextMessageRequest {
  channel: Channel;
  body: string;
}

export function sendChannelTextMessage(request: SendMessageRequest): request is SendChannelTextMessageRequest {
  return (request as SendChannelTextMessageRequest).body !== undefined;
}

