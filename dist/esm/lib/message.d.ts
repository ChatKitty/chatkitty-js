import { Channel } from './channel';
import { ChatKittyError } from './error';
import { ChatKittyFile, ChatKittyUploadProgressListener, CreateChatKittyFileProperties } from './file';
import { ChatKittyPaginator } from './pagination';
import { ReactionSummary } from './reaction';
import { ChatKittyFailedResult, ChatKittyResult, ChatKittySucceededResult } from './result';
import { Thread } from './thread';
import { User } from './user';
export declare type Message = SystemMessage | UserMessage;
export declare type SystemMessage = TextSystemMessage | FileSystemMessage;
export declare type UserMessage = TextUserMessage | FileUserMessage;
export declare type TextMessage = TextSystemMessage | TextUserMessage;
export declare type FileMessage = FileSystemMessage | FileUserMessage;
export interface BaseMessage {
    id: number;
    type: string;
    channelId: number;
    createdTime: string;
    groupTag?: string;
    reactions?: ReactionSummary[];
    repliesCount?: number;
    properties: unknown;
    _relays: MessageRelays;
    _actions: MessageActions;
    _streams: MessageStreams;
}
export declare type BaseTextMessage = BaseMessage & {
    body: string;
    links: MessageLink[];
    mentions?: MessageMention[];
};
export declare type BaseFileMessage = BaseMessage & {
    file: ChatKittyFile;
};
export declare type BaseUserMessage = BaseMessage & {
    user: User;
};
export declare type TextSystemMessage = BaseTextMessage;
export declare type FileSystemMessage = BaseFileMessage;
export declare type TextUserMessage = BaseTextMessage & BaseUserMessage;
export declare type FileUserMessage = BaseFileMessage & BaseUserMessage;
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
export declare type MessageMention = ChannelMessageMention | UserMessageMention;
export interface BaseMessageMention {
    type: string;
    tag: string;
    startPosition: number;
    endPosition: number;
}
export declare type ChannelMessageMention = BaseMessageMention & {
    channel: Channel;
};
export declare type UserMessageMention = BaseMessageMention & {
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
    reply: string;
    deleteForMe: string;
    delete: string;
    react: string;
    edit: string;
    removeReaction: string;
}
declare class MessageStreams {
    replies: string;
}
export declare function isTextMessage(message: Message): message is TextMessage;
export declare function isFileMessage(message: Message): message is FileMessage;
export declare function isUserMessage(message: Message): message is UserMessage;
export declare function isSystemMessage(message: Message): message is SystemMessage;
export declare type GetMessagesRequest = GetChannelMessagesRequest | GetMessageRepliesRequest;
export declare class GetChannelMessagesRequest {
    channel: Channel;
    filter?: GetChannelMessagesFilter;
}
export declare class GetMessageRepliesRequest {
    message: Message;
}
export declare class GetChannelMessagesFilter {
    mainThread: boolean;
}
export declare class GetLastReadMessageRequest {
    channel: Channel;
    username: string;
}
export declare type GetMessagesResult = ChatKittyResult<GetMessagesSucceededResult> | GetMessagesSucceededResult | ChatKittyFailedResult;
export declare class GetMessagesSucceededResult extends ChatKittySucceededResult {
    paginator: ChatKittyPaginator<Message>;
    constructor(paginator: ChatKittyPaginator<Message>);
}
export declare class GetLastReadMessageResult extends ChatKittySucceededResult {
    message?: Message | undefined;
    constructor(message?: Message | undefined);
}
export declare class ReadMessageRequest {
    message: Message;
}
export declare type ReadMessageResult = ChatKittyResult<ReadMessageSucceededResult> | ReadMessageSucceededResult | ChatKittyFailedResult;
export declare class ReadMessageSucceededResult extends ChatKittySucceededResult {
    message: Message;
    constructor(message: Message);
}
export declare class EditMessageRequest {
    message: Message;
    body: string;
}
export declare type EditMessageResult = ChatKittyResult<EditedMessageSucceededResult> | EditedMessageSucceededResult | ChatKittyFailedResult;
export declare class EditedMessageSucceededResult extends ChatKittySucceededResult {
    message: Message;
    constructor(message: Message);
}
export declare class DeleteMessageForMeRequest {
    message: Message;
}
export declare type DeleteMessageForMeResult = ChatKittyResult<DeleteMessageForMeSucceededResult> | DeleteMessageForMeSucceededResult | ChatKittyFailedResult;
export declare class DeleteMessageForMeSucceededResult extends ChatKittySucceededResult {
    message: Message;
    constructor(message: Message);
}
export declare class DeleteMessageRequest {
    message: Message;
}
export declare type DeleteMessageResult = ChatKittyResult<DeleteMessageSucceededResult> | DeleteMessageSucceededResult | ChatKittyFailedResult;
export declare class DeleteMessageSucceededResult extends ChatKittySucceededResult {
    message: Message;
    constructor(message: Message);
}
export declare type SendMessageRequest = SendTextMessageRequest | SendFileMessageRequest;
export declare type SendChannelMessageRequest = {
    channel: Channel;
};
export declare type SendMessageReplyRequest = {
    message: Message;
};
export declare type SendThreadMessageRequest = {
    thread: Thread;
};
export declare type SendTextMessageRequest = (SendChannelMessageRequest | SendMessageReplyRequest | SendThreadMessageRequest) & {
    body: string;
    groupTag?: string;
    properties?: unknown;
};
export declare type SendFileMessageRequest = (SendChannelMessageRequest | SendMessageReplyRequest | SendThreadMessageRequest) & {
    file: CreateChatKittyFileProperties;
    groupTag?: string;
    properties?: unknown;
    progressListener?: ChatKittyUploadProgressListener;
};
export declare type SendMessageResult = ChatKittyResult<SentMessageResult> | SentMessageResult | ChatKittyFailedResult;
export declare type SentMessageResult = ChatKittyResult<SentTextMessageResult> | SentTextMessageResult | SentFileMessageResult;
export declare class SentTextMessageResult extends ChatKittySucceededResult {
    message: TextUserMessage;
    constructor(message: TextUserMessage);
}
export declare class SentFileMessageResult extends ChatKittySucceededResult {
    message: FileUserMessage;
    constructor(message: FileUserMessage);
}
export declare function sentTextMessage(result: SentMessageResult): result is SentTextMessageResult;
export declare function sentFileMessage(result: SentMessageResult): result is SentFileMessageResult;
export declare class GetUnreadMessagesCountRequest {
    channel: Channel;
}
export declare class GetMessageRepliesCountRequest {
    message: Message;
}
export declare class GetMessageChannelRequest {
    message: Message;
}
export declare type GetMessageChannelResult = ChatKittyResult<GetMessageChannelSucceededResult> | GetMessageChannelSucceededResult | ChatKittyFailedResult;
export declare class GetMessageChannelSucceededResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class GetMessageParentRequest {
    message: Message;
}
export declare type GetMessageParentResult = ChatKittyResult<GetMessageParentSucceededResult> | GetMessageParentSucceededResult | ChatKittyFailedResult;
export declare class GetMessageParentSucceededResult extends ChatKittySucceededResult {
    message: Message;
    constructor(message: Message);
}
export declare class MessageNotAReplyError extends ChatKittyError {
    messageModel: Message;
    constructor(messageModel: Message);
}
export {};
