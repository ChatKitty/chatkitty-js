import { Channel } from '../../channel/channel.model';

export type CreateChannelMessageRequest =
  CreateChannelTextMessageRequest

export declare class CreateChannelTextMessageRequest {
  channel: Channel;
  body: string;
}

export function createTextMessage(request: CreateChannelMessageRequest): request is CreateChannelTextMessageRequest {
  return (request as CreateChannelTextMessageRequest).body !== undefined;
}

