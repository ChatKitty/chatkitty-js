import { Channel } from '../../channel/channel.model';

export type CreateMessageRequest =
  CreateChannelTextMessageRequest

export declare class CreateChannelTextMessageRequest {
  channel: Channel;
  body: string;
}

export function createChannelTextMessage(request: CreateMessageRequest): request is CreateChannelTextMessageRequest {
  return (request as CreateChannelTextMessageRequest).body !== undefined;
}

