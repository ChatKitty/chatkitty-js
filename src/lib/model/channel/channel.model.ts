import { Message } from '../message/message.model';

export declare class Channel {
  id: number;
  type: string;
  name: string;
  lastReceivedMessage?: Message
  properties: unknown;
  _relays: ChannelRelays;
  _topics: ChannelTopics;
  _actions: ChannelActions;
  _streams: ChannelStreams;
}

export declare class ChannelRelays {
  self: string;
  messages: string;
  members?: string;
}

export declare class ChannelTopics {
  self: string;
  messages: string;
}

export declare class ChannelActions {
  message: string;
  join?: string;
}

export declare class ChannelStreams {
  messages: string;
}
