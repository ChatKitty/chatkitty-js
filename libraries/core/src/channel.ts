import { ChatKittyError } from './error';
import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { ChatKittyUserReference, User } from './user';

export type Channel = DirectChannel | PublicChannel | PrivateChannel;

export interface BaseChannel {
	id: number;
	name: string;
	creator?: User;
	lastReceivedMessage?: Message;
	createdTime: string;
	properties: unknown;
	/** @internal */
	_relays: ChannelRelays;
	/** @internal */
	_topics: ChannelTopics;
	/** @internal */
	_actions: ChannelActions;
	/** @internal */
	_streams: ChannelStreams;
}

export interface GroupChannel extends BaseChannel {
	displayName: string;
}

export type DirectChannel = BaseChannel & {
	type: 'DIRECT';
	members: User[];
};

export type PublicChannel = GroupChannel & {
	type: 'PUBLIC';
};

export type PrivateChannel = GroupChannel & {
	type: 'PRIVATE';
};

declare class ChannelRelays {
	self: string;
	context: string;
	messages: string;
	messagesCount: string;
	lastReceivedMessage: string;
	lastReadMessage: string;
	unread: string;
	members: string;
	threads: string;
	calls: string;
}

declare class ChannelTopics {
	self: string;
	messages: string;
	keystrokes: string;
	typing: string;
	participants: string;
	readReceipts: string;
	reactions: string;
	events: string;
}

declare class ChannelActions {
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

declare class ChannelStreams {
	messages: string;
}

export declare class ChannelContext {
	startCursor: string;
	endCursor: string;
	readBy: { [key: string]: number[] };
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

export type CreateChannelResult = CreatedChannelResult | ChatKittyFailedResult;

export type CreateChannelRequest =
	| CreateDirectChannelRequest
	| CreatePublicChannelRequest
	| CreatePrivateChannelRequest;

export interface BaseCreateChannelRequest {
	members?: ChatKittyUserReference[];
	properties?: unknown;
}

export interface CreateGroupChannelRequest extends BaseCreateChannelRequest {
	name?: string;
	displayName?: string;
}

export type CreateDirectChannelRequest = BaseCreateChannelRequest & {
	type: 'DIRECT';
};

export type CreatePublicChannelRequest = CreateGroupChannelRequest & {
	type: 'PUBLIC';
};

export type CreatePrivateChannelRequest = CreateGroupChannelRequest & {
	type: 'PRIVATE';
};

export class CreatedChannelResult extends ChatKittySucceededResult {
	constructor(public channel: Channel) {
		super();
	}
}

export declare class ListChannelsRequest {
	filter?: ListChannelsFilter;
	size?: number;
	sort?: string;
}

export declare class ListChannelsFilter {
	name?: string;
	joined?: boolean;
	unread?: boolean;
}

export declare class ListUnreadChannelsRequest {
	filter: ListUnreadChannelsFilter;
}

export declare class ListUnreadChannelsFilter {
	type: string;
}

export type CountUnreadChannelsRequest = ListUnreadChannelsRequest;

export declare class RetrieveChannelContextRequest {
	channel: Channel;
	startCursor: string;
	endCursor: string;
}

export declare class RetrieveChannelUnreadRequest {
	channel: Channel;
}

export type ListChannelsResult = ListChannelsSucceededResult | ChatKittyFailedResult;

export class ListChannelsSucceededResult extends ChatKittySucceededResult {
	constructor(public paginator: ChatKittyPaginator<Channel>) {
		super();
	}
}

export type RetrieveChannelResult = RetrieveChannelSucceededResult | ChatKittyFailedResult;

export class RetrieveChannelSucceededResult extends ChatKittySucceededResult {
	constructor(public channel: Channel) {
		super();
	}
}

export type RetrieveChannelContextResult =
	| RetrieveChannelContextSucceededResult
	| ChatKittyFailedResult;

export class RetrieveChannelContextSucceededResult extends ChatKittySucceededResult {
	constructor(public context: ChannelContext) {
		super();
	}
}

export declare class CheckChannelUnreadRequest {
	channel: Channel;
}

export type CheckChannelUnreadResult = CheckChannelUnreadSucceededResult | ChatKittyFailedResult;

export class CheckChannelUnreadSucceededResult extends ChatKittySucceededResult {
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
			`The channel ${channel.name} can't be joined without an invite.`,
		);
	}
}

export declare class ListChannelMembersRequest {
	channel: Channel;
	filter?: ListChannelMembersFilter;
}

export declare class ListChannelMembersFilter {
	displayName?: string;
}

export declare class AddChannelModeratorRequest {
	channel: Channel;
	user: ChatKittyUserReference;
}

export type AddChannelModeratorResult = AddedChannelModeratorResult | ChatKittyFailedResult;

export class AddedChannelModeratorResult extends ChatKittySucceededResult {
	constructor(public channel: Channel) {
		super();
	}
}

export class CannotAddModeratorToChannelError extends ChatKittyError {
	constructor(public channel: Channel) {
		super(
			'CannotAddModeratorToChannel',
			`The channel ${channel.name} is not a group channel and cannot have moderators.`,
		);
	}
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

export declare class UnmuteChannelRequest {
	channel: Channel;
}

export type UnmuteChannelResult = UnmutedChannelResult | ChatKittyFailedResult;

export class UnmutedChannelResult extends ChatKittySucceededResult {
	constructor(public channel: Channel) {
		super();
	}
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
		super('NotAChannelMemberError', `You are not a member of channel ${channel.name}.`);
	}
}

export declare class ReadChannelRequest {
	channel: Channel;
}

export type ReadChannelResult = ReadChannelSucceededResult | ChatKittyFailedResult;

export class ReadChannelSucceededResult extends ChatKittySucceededResult {
	constructor(public channel: Channel) {
		super();
	}
}

export declare class ClearChannelHistoryRequest {
	channel: Channel;
}

export type ClearChannelHistoryResult = ClearChannelHistorySucceededResult | ChatKittyFailedResult;

export class ClearChannelHistorySucceededResult extends ChatKittySucceededResult {
	constructor(public channel: Channel) {
		super();
	}
}

export declare class HideChannelRequest {
	channel: DirectChannel;
}

export type HideChannelResult = HideChannelSucceededResult | ChatKittyFailedResult;

export class HideChannelSucceededResult extends ChatKittySucceededResult {
	constructor(public channel: DirectChannel) {
		super();
	}
}

export declare class InviteUserRequest {
	channel: Channel;
	user: ChatKittyUserReference;
}

export type InviteUserResult = InvitedUserResult | ChatKittyFailedResult;

export class InvitedUserResult extends ChatKittySucceededResult {
	constructor(public user: User) {
		super();
	}
}

export class ChannelNotInvitableError extends ChatKittyError {
	constructor(public channel: Channel) {
		super('ChannelNotInvitableError', `The channel ${channel.name} does not accept invites.`);
	}
}

export declare class UpdateChannelRequest {
	channel: Channel;
}

export type UpdateChannelResult = UpdatedChannelResult | ChatKittyFailedResult;

export class UpdatedChannelResult extends ChatKittySucceededResult {
	constructor(public channel: Channel) {
		super();
	}
}

export declare class DeleteChannelRequest {
	channel: Channel;
}

export type DeleteChannelResult = DeletedChannelResult | ChatKittyFailedResult;

export class DeletedChannelResult extends ChatKittySucceededResult {
	constructor() {
		super();
	}
}
