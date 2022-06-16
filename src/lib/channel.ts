import { ChatKittyError } from './error';
import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import {
  ChatKittyFailedResult,
  ChatKittyResult,
  ChatKittySucceededResult
} from './result';
import { ChatKittyUserReference, User } from './user';

export type Channel = DirectChannel | PublicChannel | PrivateChannel;

export interface BaseChannel {
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

export type DirectChannel = BaseChannel & {
  members: User[];
};

export type PublicChannel = BaseChannel;

export type PrivateChannel = BaseChannel;

export declare class ChannelRelays {
  self: string;
  messages: string;
  messagesCount: string;
  lastReceivedMessage: string;
  lastReadMessage: string;
  unread: string;
  members: string;
  threads: string;
  calls: string;
}

export declare class ChannelTopics {
  self: string;
  messages: string;
  keystrokes: string;
  typing: string;
  participants: string;
  readReceipts: string;
  reactions: string;
  events: string;
}

export declare class ChannelActions {
  message: string;
  keystrokes: string;
  join?: string;
  leave?: string;
  addModerator?: string;
  invite?: string;
  read: string;
  mute: string;
  call: string;
  triggerEvent: string;
  update: string;
  delete: string;
  clearHistory: string;
  hide: string;
  createThread: string;
}

export declare class ChannelStreams {
  messages: string;
}

export function isDirectChannel(channel: Channel): channel is DirectChannel {
  return channel.type === 'DIRECT';
}

export function isPublicChannel(channel: Channel): channel is PublicChannel {
  return channel.type === 'PUBLIC';
}

export function isPrivateChannel(channel: Channel): channel is PrivateChannel {
  return channel.type === 'PRIVATE';
}

export type CreateChannelResult =
  | CreatedChannelResult
  | ChatKittyFailedResult;

export declare class CreateChannelRequest {
  type: string;
  name?: string;
  members?: ChatKittyUserReference[];
  properties?: unknown;
}

export class CreatedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export declare class GetChannelsRequest {
  filter?: GetChannelsFilter;
}

export declare class GetChannelsFilter {
  name?: string;
  joined?: boolean;
  unread?: boolean;
}

export declare class GetUnreadChannelsRequest {
  filter: GetUnreadChannelsFilter;
}

export declare class GetUnreadChannelsFilter {
  type: string;
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

export type JoinChannelResult =
  | JoinedChannelResult
  | ChatKittyFailedResult;

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

export declare class GetChannelMembersRequest {
  channel: Channel;
  filter?: GetChannelMembersFilter;
}

export declare class GetChannelMembersFilter {
  displayName?: string;
}

export declare class AddChannelModeratorRequest {
  channel: Channel;
  user: ChatKittyUserReference;
}

export type AddChannelModeratorResult =
  | AddedChannelModeratorResult
  | ChatKittyFailedResult;

export class AddedChannelModeratorResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export class CannotAddModeratorToChannelError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'CannotAddModeratorToChannel',
      `The channel ${channel.name} is not a group channel and cannot have moderators.`
    );
  }
}

export declare class MuteChannelRequest {
  channel: Channel;
}

export type MuteChannelResult =
  | MutedChannelResult
  | ChatKittyFailedResult;

export class MutedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export declare class UnmuteChannelRequest {
  channel: Channel;
}

export type UnmuteChannelResult =
  | UnmutedChannelResult
  | ChatKittyFailedResult;

export class UnmutedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export declare class LeaveChannelRequest {
  channel: Channel;
}

export type LeaveChannelResult =
  | LeftChannelResult
  | ChatKittyFailedResult;

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

export declare class HideChannelRequest {
  channel: DirectChannel;
}

export type HideChannelResult =
  | HideChannelSucceededResult
  | ChatKittyFailedResult;

export class HideChannelSucceededResult extends ChatKittySucceededResult {
  constructor(public channel: DirectChannel) {
    super();
  }
}

export declare class InviteUserRequest {
  channel: Channel;
  user: ChatKittyUserReference;
}

export type InviteUserResult =
  | InvitedUserResult
  | ChatKittyFailedResult;

export class InvitedUserResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}

export class ChannelNotInvitableError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'ChannelNotInvitableError',
      `The channel ${channel.name} does not accept invites.`
    );
  }
}

export declare class UpdateChannelRequest {
  channel: Channel;
}

export type UpdateChannelResult =
  | UpdatedChannelResult
  | ChatKittyFailedResult;

export class UpdatedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export declare class DeleteChannelRequest {
  channel: Channel;
}

export type DeleteChannelResult =
  | DeletedChannelResult
  | ChatKittyFailedResult;

export class DeletedChannelResult extends ChatKittySucceededResult {
  constructor() {
    super();
  }
}
