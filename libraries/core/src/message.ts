import { Channel } from './channel';
import { ChatKittyError } from './error';
import {
	ChatKittyFile,
	ChatKittyUploadProgressListener,
	CreateChatKittyFileProperties,
} from './file';
import { ChatKittyPaginator } from './pagination';
import { ReactionSummary } from './reaction';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { Thread } from './thread';
import { User } from './user';

export type Message = SystemMessage | UserMessage;

export type SystemMessage = TextSystemMessage | FileSystemMessage;

export type UserMessage = TextUserMessage | FileUserMessage;

export type TextMessage = TextSystemMessage | TextUserMessage;

export type FileMessage = FileSystemMessage | FileUserMessage;

export interface BaseMessage {
	id: number;
	type: string;
	channelId: number;
	createdTime: string;
	groupTag?: string;
	reactions?: ReactionSummary[];
	repliesCount?: number;
	properties: unknown;
	/** @internal */
	_relays: MessageRelays;
	/** @internal */
	_actions: MessageActions;
	/** @internal */
	_streams: MessageStreams;
}

export type BaseTextMessage = BaseMessage & {
	body: string;
	links: MessageLink[];
	mentions?: MessageMention[];
};

export type BaseFileMessage = BaseMessage & {
	file: ChatKittyFile;
};

export type BaseUserMessage = BaseMessage & {
	user: User;
};

export type TextSystemMessage = BaseTextMessage & {
	type: 'SYSTEM_TEXT';
};

export type FileSystemMessage = BaseFileMessage & {
	type: 'SYSTEM_FILE';
};

export type TextUserMessage = BaseTextMessage &
	BaseUserMessage & {
		type: 'TEXT';
	};

export type FileUserMessage = BaseFileMessage &
	BaseUserMessage & {
		type: 'FILE';
	};

export declare class MessageLink {
	source: string;
	startPosition: number;
	endPosition: number;
	preview?: MessageLinkPreview;
}

export declare class MessageLinkPreview {
	url: string;
	title: string;
	image: MessageLinkPreviewImage;
	description?: string;
	siteName?: string;
}

export declare class MessageLinkPreviewImage {
	source: string;
}

export type MessageMention = ChannelMessageMention | UserMessageMention;

export interface BaseMessageMention {
	type: string;
	tag: string;
	startPosition: number;
	endPosition: number;
}

export type ChannelMessageMention = BaseMessageMention & {
	channel: Channel;
};

export type UserMessageMention = BaseMessageMention & {
	user: User;
};

declare class MessageRelays {
	self: string;
	channel: string;
	parent?: string;
	readReceipts: string;
	repliesCount: string;
	replies: string;
	reactions: string;
}

declare class MessageActions {
	read: string;
	unread: string;
	reply: string;
	deleteForMe: string;
	delete: string;
	react: string;
	edit: string;
	removeReaction: string;
	updateProperties: string;
}

declare class MessageStreams {
	replies: string;
}

export function isTextMessage(message: Message): message is TextMessage {
	return (message as TextMessage).body !== undefined;
}

export function isFileMessage(message: Message): message is FileMessage {
	return (message as FileMessage).file !== undefined;
}

export function isUserMessage(message: Message): message is UserMessage {
	return (message as UserMessage).user !== undefined;
}

export function isSystemMessage(message: Message): message is SystemMessage {
	return (message as UserMessage).user === undefined;
}

export type ListMessagesRequest =
	| ListUsersMessagesRequest
	| ListChannelMessagesRequest
	| ListMessageRepliesRequest;

export declare class ListUsersMessagesRequest {
	filter?: ListUsersMessagesFilter;
}

export declare class ListChannelMessagesRequest {
	channel: Channel;
	filter?: ListChannelMessagesFilter;
}

export declare class ListMessageRepliesRequest {
	message: Message;
}

export declare class ListUsersMessagesFilter {
	type: 'FILE' | undefined;
}

export declare class ListChannelMessagesFilter {
	mainThread: boolean;
	type: 'FILE' | undefined;
}

export declare class RetrieveLastReadMessageRequest {
	channel: Channel;
	username: string;
}

export type ListMessagesResult = ListMessagesSucceededResult | ChatKittyFailedResult;

export class ListMessagesSucceededResult extends ChatKittySucceededResult {
	constructor(public paginator: ChatKittyPaginator<Message>) {
		super();
	}
}

export type RetrieveLastReadMessageResult =
	| RetrieveLastReadMessageSucceededResult
	| ChatKittyFailedResult;

export class RetrieveLastReadMessageSucceededResult extends ChatKittySucceededResult {
	constructor(public message?: Message) {
		super();
	}
}

export declare class ReadMessageRequest {
	message: Message;
}

export declare class UnreadMessageRequest {
	message: Message;
}

export type ReadMessageResult = ReadMessageSucceededResult | ChatKittyFailedResult;

export class ReadMessageSucceededResult extends ChatKittySucceededResult {
	constructor(public message: Message) {
		super();
	}
}

export type UnreadMessageResult = UnreadMessageSucceededResult | ChatKittyFailedResult;

export class UnreadMessageSucceededResult extends ChatKittySucceededResult {
	constructor(public message: Message) {
		super();
	}
}

export declare class EditMessageRequest {
	message: Message;
	body: string;
}

export type EditMessageResult = EditedMessageSucceededResult | ChatKittyFailedResult;

export class EditedMessageSucceededResult extends ChatKittySucceededResult {
	constructor(public message: Message) {
		super();
	}
}

export declare class UpdateMessagePropertiesRequest {
	message: Message;
	properties: unknown;
}

export type UpdateMessagePropertiesResult =
	| UpdatedMessagePropertiesSucceededResult
	| ChatKittyFailedResult;

export class UpdatedMessagePropertiesSucceededResult extends ChatKittySucceededResult {
	constructor(public message: Message) {
		super();
	}
}

export declare class DeleteMessageRequest {
	message: Message;
}

export type DeleteMessageResult = DeleteMessageSucceededResult | ChatKittyFailedResult;

export class DeleteMessageSucceededResult extends ChatKittySucceededResult {
	constructor(public message: Message) {
		super();
	}
}

export type SendMessageRequest = SendTextMessageRequest | SendFileMessageRequest;

export type SendChannelMessageRequest = {
	channel: Channel;
};

export type SendMessageReplyRequest = {
	message: Message;
};

export type SendThreadMessageRequest = {
	thread: Thread;
};

export type SendTextMessageRequest = (
	| SendChannelMessageRequest
	| SendMessageReplyRequest
	| SendThreadMessageRequest
) & {
	body: string;
	groupTag?: string;
	properties?: unknown;
};

export type SendFileMessageRequest = (
	| SendChannelMessageRequest
	| SendMessageReplyRequest
	| SendThreadMessageRequest
) & {
	file: CreateChatKittyFileProperties;
	groupTag?: string;
	properties?: unknown;
	progressListener?: ChatKittyUploadProgressListener;
};

export type SendMessageResult = SentMessageResult | ChatKittyFailedResult;

export type SentMessageResult = SentTextMessageResult | SentFileMessageResult;

export class SentTextMessageResult extends ChatKittySucceededResult {
	constructor(public message: TextUserMessage) {
		super();
	}
}

export class SentFileMessageResult extends ChatKittySucceededResult {
	constructor(public message: FileUserMessage) {
		super();
	}
}

export function sentTextMessage(result: SentMessageResult): result is SentTextMessageResult {
	const message = (result as SentTextMessageResult).message;

	return message !== undefined && message.type === 'TEXT';
}

export function sentFileMessage(result: SentMessageResult): result is SentFileMessageResult {
	const message = (result as SentFileMessageResult).message;

	return message !== undefined && message.type === 'FILE';
}

export declare class CountUnreadMessagesRequest {
	channel: Channel;
}

export declare class CountMessageRepliesRequest {
	message: Message;
}

export declare class RetrieveMessageChannelRequest {
	message: Message;
}

export type RetrieveMessageChannelResult =
	| RetrieveMessageChannelSucceededResult
	| ChatKittyFailedResult;

export class RetrieveMessageChannelSucceededResult extends ChatKittySucceededResult {
	constructor(public channel: Channel) {
		super();
	}
}

export declare class RetrieveMessageParentRequest {
	message: Message;
}

export type RetrieveMessageParentResult =
	| RetrieveMessageParentSucceededResult
	| ChatKittyFailedResult;

export class RetrieveMessageParentSucceededResult extends ChatKittySucceededResult {
	constructor(public message: Message) {
		super();
	}
}

export class MessageNotAReplyError extends ChatKittyError {
	constructor(public messageModel: Message) {
		super('MessageNotAReplyError', `Message ${messageModel.id} is not a reply.`);
	}
}
