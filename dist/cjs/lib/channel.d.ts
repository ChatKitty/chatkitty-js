import { ChatKittyError } from './error';
import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittyResult, ChatKittySucceededResult } from './result';
import { ChatKittyUserReference, User } from './user';
export declare type Channel = DirectChannel | PublicChannel | PrivateChannel;
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
export declare type DirectChannel = BaseChannel & {
    members: User[];
};
export declare type PublicChannel = BaseChannel;
export declare type PrivateChannel = BaseChannel;
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
export declare function isDirectChannel(channel: Channel): channel is DirectChannel;
export declare function isPublicChannel(channel: Channel): channel is PublicChannel;
export declare function isPrivateChannel(channel: Channel): channel is PrivateChannel;
export declare type CreateChannelResult = ChatKittyResult<CreatedChannelResult> | CreatedChannelResult | ChatKittyFailedResult;
export declare class CreateChannelRequest {
    type: string;
    name?: string;
    members?: ChatKittyUserReference[];
    properties?: unknown;
}
export declare class CreatedChannelResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
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
export declare type GetChannelsResult = ChatKittyResult<GetChannelsSucceededResult> | GetChannelsSucceededResult | ChatKittyFailedResult;
export declare class GetChannelsSucceededResult extends ChatKittySucceededResult {
    paginator: ChatKittyPaginator<Channel>;
    constructor(paginator: ChatKittyPaginator<Channel>);
}
export declare type GetChannelResult = ChatKittyResult<GetChannelSucceededResult> | GetChannelSucceededResult | ChatKittyFailedResult;
export declare class GetChannelSucceededResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare type GetChannelUnreadResult = ChatKittyResult<GetChannelUnreadSucceededResult> | GetChannelUnreadSucceededResult | ChatKittyFailedResult;
export declare class GetChannelUnreadSucceededResult extends ChatKittySucceededResult {
    unread: boolean;
    constructor(unread: boolean);
}
export declare class JoinChannelRequest {
    channel: Channel;
}
export declare type JoinChannelResult = ChatKittyResult<JoinedChannelResult> | JoinedChannelResult | ChatKittyFailedResult;
export declare class JoinedChannelResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class ChannelNotPubliclyJoinableError extends ChatKittyError {
    channel: Channel;
    constructor(channel: Channel);
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
export declare type AddChannelModeratorResult = ChatKittyResult<AddedChannelModeratorResult> | AddedChannelModeratorResult | ChatKittyFailedResult;
export declare class AddedChannelModeratorResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class CannotAddModeratorToChannelError extends ChatKittyError {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class MuteChannelRequest {
    channel: Channel;
}
export declare type MuteChannelResult = ChatKittyResult<MutedChannelResult> | MutedChannelResult | ChatKittyFailedResult;
export declare class MutedChannelResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class UnmuteChannelRequest {
    channel: Channel;
}
export declare type UnmuteChannelResult = ChatKittyResult<UnmutedChannelResult> | UnmutedChannelResult | ChatKittyFailedResult;
export declare class UnmutedChannelResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class LeaveChannelRequest {
    channel: Channel;
}
export declare type LeaveChannelResult = ChatKittyResult<LeftChannelResult> | LeftChannelResult | ChatKittyFailedResult;
export declare class LeftChannelResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class NotAChannelMemberError extends ChatKittyError {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class ReadChannelRequest {
    channel: Channel;
}
export declare type ReadChannelResult = ChatKittyResult<ReadChannelSucceededResult> | ReadChannelSucceededResult | ChatKittyFailedResult;
export declare class ReadChannelSucceededResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class ClearChannelHistoryRequest {
    channel: Channel;
}
export declare type ClearChannelHistoryResult = ChatKittyResult<ClearChannelHistorySucceededResult> | ClearChannelHistorySucceededResult | ChatKittyFailedResult;
export declare class ClearChannelHistorySucceededResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class HideChannelRequest {
    channel: DirectChannel;
}
export declare type HideChannelResult = ChatKittyResult<HideChannelSucceededResult> | HideChannelSucceededResult | ChatKittyFailedResult;
export declare class HideChannelSucceededResult extends ChatKittySucceededResult {
    channel: DirectChannel;
    constructor(channel: DirectChannel);
}
export declare class InviteUserRequest {
    channel: Channel;
    user: ChatKittyUserReference;
}
export declare type InviteUserResult = ChatKittyResult<InvitedUserResult> | InvitedUserResult | ChatKittyFailedResult;
export declare class InvitedUserResult extends ChatKittySucceededResult {
    user: User;
    constructor(user: User);
}
export declare class ChannelNotInvitableError extends ChatKittyError {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class UpdateChannelRequest {
    channel: Channel;
}
export declare type UpdateChannelResult = ChatKittyResult<UpdatedChannelResult> | UpdatedChannelResult | ChatKittyFailedResult;
export declare class UpdatedChannelResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class DeleteChannelRequest {
    channel: Channel;
}
export declare type DeleteChannelResult = ChatKittyResult<DeletedChannelResult> | DeletedChannelResult | ChatKittyFailedResult;
export declare class DeletedChannelResult extends ChatKittySucceededResult {
    constructor();
}
