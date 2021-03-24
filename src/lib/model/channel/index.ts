import { Message } from '../message';
import { User } from '../user';

export type Channel = PublicChannel | DirectChannel;

export interface ChannelProperties {
  id: number;
  type: string;
  name: string;
  creator?: User;
  lastReceivedMessage?: Message;
  properties: unknown;
  _relays: ChannelRelays;
  _topics: ChannelTopics;
  _actions: ChannelActions;
  _streams: ChannelStreams;
}

export declare class DirectChannel implements ChannelProperties {
  id: number;
  type: string;
  name: string;
  creator?: User;
  members: User[];
  lastReceivedMessage?: Message;
  properties: unknown;
  _relays: ChannelRelays;
  _topics: ChannelTopics;
  _actions: ChannelActions;
  _streams: ChannelStreams;
}

export declare class PublicChannel implements ChannelProperties {
  id: number;
  type: string;
  name: string;
  creator?: User;
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
  last_read_message: string;
  unread: string;
  members?: string;
}

export declare class ChannelTopics {
  self: string;
  messages: string;
  keystrokes: string;
  typing: string;
  participants: string;
}

export declare class ChannelActions {
  message: string;
  keystrokes: string;
  join?: string;
  leave?: string;
  read: string;
}

export declare class ChannelStreams {
  messages: string;
}

export function isPublicChannel(channel: Channel): channel is PublicChannel {
  return channel.type === 'PUBLIC';
}

export function isDirectChannel(channel: Channel): channel is DirectChannel {
  return channel.type === 'DIRECT';
}
