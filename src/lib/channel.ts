import { ChatKittyError } from './error';
import { Message } from './message';
import { ChatKittyModelReference } from './model';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { ChatKittyUserReference, User } from './user';

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
  messagesCount: string;
  lastReceivedMessage: string;
  lastReadMessage: string;
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
  mute: string;
  clearHistory: string;
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

export type CreateChannelResult = CreatedChannelResult | ChatKittyFailedResult;

export declare class CreateChannelRequest {
  type: string;
  name?: string;
  members?: ChatKittyModelReference[] | ChatKittyUserReference[];
  properties?: unknown;
}

export class CreatedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export function createdChannel(
  result: CreateChannelResult
): result is CreatedChannelResult {
  return (result as CreatedChannelResult).channel !== undefined;
}

export declare class GetChannelsRequest {
  joinable?: boolean;
  filter?: GetChannelsFilter;
}

export declare class GetChannelsFilter {
  unread?: boolean;
}

export declare class GetChannelUnreadRequest {
  channel: Channel;
}

export type GetChannelsResult =
  | GetChannelsSucceededResult
  | ChatKittyFailedResult;

export class GetChannelsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Channel>) {
    super();
  }
}

export type GetChannelResult =
  | GetChannelSucceededResult
  | ChatKittyFailedResult;

export class GetChannelSucceededResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export type GetChannelUnreadResult =
  | GetChannelUnreadSucceededResult
  | ChatKittyFailedResult;

export class GetChannelUnreadSucceededResult extends ChatKittySucceededResult {
  constructor(public unread: boolean) {
    super();
  }
}

export declare class JoinChannelRequest {
  channel: Channel;
}

export type JoinChannelResult = JoinedChannelResult | ChatKittyFailedResult;

export class JoinedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export class ChannelNotPubliclyJoinableError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'ChannelNotPubliclyJoinableError',
      `The channel ${channel.name} can't be joined without an invite.`
    );
  }
}

export function joinedChannel(
  result: JoinChannelResult
): result is JoinedChannelResult {
  return (result as JoinedChannelResult).channel !== undefined;
}

export declare class MuteChannelRequest {
  channel: Channel;
}

export type MuteChannelResult = MutedChannelResult | ChatKittyFailedResult;

export class MutedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export function mutedChannel(
  result: MuteChannelResult
): result is MutedChannelResult {
  return (result as MutedChannelResult).channel !== undefined;
}

export declare class UnmuteChannelRequest {
  channel: Channel;
}

export type UnmuteChannelResult = UnmutedChannelResult | ChatKittyFailedResult;

export class UnmutedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export function unmutedChannel(
  result: UnmuteChannelResult
): result is UnmutedChannelResult {
  return (result as UnmutedChannelResult).channel !== undefined;
}

export declare class LeaveChannelRequest {
  channel: Channel;
}

export type LeaveChannelResult = LeftChannelResult | ChatKittyFailedResult;

export class LeftChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export class NotAChannelMemberError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'NotAChannelMemberError',
      `You are not a member of channel ${channel.name}.`
    );
  }
}

export function leftChannel(
  result: LeaveChannelResult
): result is LeftChannelResult {
  return (result as LeftChannelResult).channel !== undefined;
}

export declare class ReadChannelRequest {
  channel: Channel;
}

export type ReadChannelResult =
  | ReadChannelSucceededResult
  | ChatKittyFailedResult;

export class ReadChannelSucceededResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export declare class ClearChannelHistoryRequest {
  channel: Channel;
}

export type ClearChannelHistoryResult =
  | ClearChannelHistorySucceededResult
  | ChatKittyFailedResult;

export class ClearChannelHistorySucceededResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}
