import { Message } from '../message';

export declare class Channel {
  id: number;
  type: string;
  name: string;
  lastReceivedMessage?: Message;
  properties: unknown;
  _relays: ChannelRelays;
  _topics: ChannelTopics;
  _actions: ChannelActions;
  _streams: ChannelStreams;
}

export declare class ChannelRelays {
  self: string;
  messages: string;
  unread: string;
  members?: string;
}

export declare class ChannelTopics {
  self: string;
  messages: string;
  keystrokes: string;
}

export declare class ChannelActions {
  message: string;
  keystrokes: string;
  join?: string;
  read: string;
}

export declare class ChannelStreams {
  messages: string;
}
