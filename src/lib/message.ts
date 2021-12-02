import { Channel } from './channel';
import { ChatKittyError } from './error';
import {
  ChatKittyFile,
  ChatKittyUploadProgressListener,
  CreateChatKittyFileProperties,
} from './file';
import { ChatKittyPaginator } from './pagination';
import { ReactionSummary } from './reaction';
import {
  ChatKittyFailedResult,
  ChatKittyResult,
  ChatKittySucceededResult
} from './result';
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
  reactionsSummary?: ReactionSummary;
  repliesCount?: number;
  properties: unknown;
  _relays: MessageRelays;
  _actions: MessageActions;
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

export type TextSystemMessage = BaseTextMessage;

export type FileSystemMessage = BaseFileMessage;

export type TextUserMessage = BaseTextMessage & BaseUserMessage;

export type FileUserMessage = BaseFileMessage & BaseUserMessage;

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

export declare class MessageRelays {
  self: string;
  channel: string;
  parent?: string;
  readReceipts: string;
  repliesCount: string;
  replies: string;
  reactions: string;
}

export declare class MessageActions {
  read: string;
  reply: string;
  deleteForMe: string;
  delete: string;
  react: string;
  edit: string;
  removeReaction: string;
}

export declare class MessageStreams {
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

export type GetMessagesRequest =
  | GetChannelMessagesRequest
  | GetMessageRepliesRequest;

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

export type GetMessagesResult =
  | ChatKittyResult<GetMessagesSucceededResult>
  | GetMessagesSucceededResult
  | ChatKittyFailedResult;

export class GetMessagesSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Message>) {
    super();
  }
}

export class GetLastReadMessageResult extends ChatKittySucceededResult {
  constructor(public message?: Message) {
    super();
  }
}

export declare class ReadMessageRequest {
  message: Message;
}

export type ReadMessageResult =
  | ChatKittyResult<ReadMessageSucceededResult>
  | ReadMessageSucceededResult
  | ChatKittyFailedResult;

export class ReadMessageSucceededResult extends ChatKittySucceededResult {
  constructor(public message: Message) {
    super();
  }
}

export declare class EditMessageRequest {
  message: Message;
  body: string;
}

export type EditMessageResult =
  | ChatKittyResult<EditedMessageSucceededResult>
  | EditedMessageSucceededResult
  | ChatKittyFailedResult;

export class EditedMessageSucceededResult extends ChatKittySucceededResult {
  constructor(public message: Message) {
    super();
  }
}

export declare class DeleteMessageForMeRequest {
  message: Message;
}

export type DeleteMessageForMeResult =
  | ChatKittyResult<DeleteMessageForMeSucceededResult>
  | DeleteMessageForMeSucceededResult
  | ChatKittyFailedResult;

export class DeleteMessageForMeSucceededResult extends ChatKittySucceededResult {
  constructor(public message: Message) {
    super();
  }
}

export declare class DeleteMessageRequest {
  message: Message;
}

export type DeleteMessageResult =
  | ChatKittyResult<DeleteMessageSucceededResult>
  | DeleteMessageSucceededResult
  | ChatKittyFailedResult;

export class DeleteMessageSucceededResult extends ChatKittySucceededResult {
  constructor(public message: Message) {
    super();
  }
}

export type SendMessageRequest =
  | SendTextMessageRequest
  | SendFileMessageRequest;

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

export type SendMessageResult =
  | ChatKittyResult<SentMessageResult>
  | SentMessageResult
  | ChatKittyFailedResult;

export type SentMessageResult =
  | ChatKittyResult<SentTextMessageResult>
  | SentTextMessageResult
  | SentFileMessageResult;

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

export function sentTextMessage(
  result: SentMessageResult
): result is SentTextMessageResult {
  const message = (result as SentTextMessageResult).message;

  return message !== undefined && message.type === 'TEXT';
}

export function sentFileMessage(
  result: SentMessageResult
): result is SentFileMessageResult {
  const message = (result as SentFileMessageResult).message;

  return message !== undefined && message.type === 'FILE';
}

export declare class GetUnreadMessagesCountRequest {
  channel: Channel;
}

export declare class GetMessageRepliesCountRequest {
  message: Message;
}

export declare class GetMessageChannelRequest {
  message: Message;
}

export type GetMessageChannelResult =
  | ChatKittyResult<GetMessageChannelSucceededResult>
  | GetMessageChannelSucceededResult
  | ChatKittyFailedResult;

export class GetMessageChannelSucceededResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export declare class GetMessageParentRequest {
  message: Message;
}

export type GetMessageParentResult =
  | ChatKittyResult<GetMessageParentSucceededResult>
  | GetMessageParentSucceededResult
  | ChatKittyFailedResult;

export class GetMessageParentSucceededResult extends ChatKittySucceededResult {
  constructor(public message: Message) {
    super();
  }
}

export class MessageNotAReplyError extends ChatKittyError {
  constructor(public messageModel: Message) {
    super(
      'MessageNotAReplyError',
      `Message ${messageModel.id} is not a reply.`
    );
  }
}
