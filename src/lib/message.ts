import { Channel } from './channel';
import {ChatKittyError} from "./error";
import {
  ChatKittyFile,
  ChatKittyUploadProgressListener,
  CreateChatKittyFileProperties
} from './file';
import { ChatKittyPaginator } from './pagination';
import { ReactionSummary } from './reaction';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export type Message = SystemMessage | UserMessage;

export type SystemMessage = TextSystemMessage | FileSystemMessage;

export type UserMessage = TextUserMessage | FileUserMessage;

export type TextMessage = TextSystemMessage | TextUserMessage;

export type FileMessage = FileSystemMessage | FileUserMessage;

export interface BaseMessage {
  id: number;
  type: string;
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
  links: [MessageLink];
  mentions?: [MessageMention];
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
  react: string;
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
  | ReadMessageSucceededResult
  | ChatKittyFailedResult;

export class ReadMessageSucceededResult extends ChatKittySucceededResult {
  constructor(public message: Message) {
    super();
  }
}

export declare class DeleteMessageForMeRequest {
  message: Message;
}

export type DeleteMessageForMeResult =
  | DeleteMessageForMeSucceededResult
  | ChatKittyFailedResult;

export class DeleteMessageForMeSucceededResult extends ChatKittySucceededResult {
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

export type SendTextMessageRequest = (
  | SendChannelMessageRequest
  | SendMessageReplyRequest
  ) & {
  body: string;
  groupTag?: string;
  properties?: unknown;
};

export type SendFileMessageRequest = (
  | SendChannelMessageRequest
  | SendMessageReplyRequest
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

export function sentTextMessage(
  result: SentMessageResult
): result is SentTextMessageResult {
  return (
    (result as SentTextMessageResult).message !== undefined &&
    result.message.type === 'TEXT'
  );
}

export function sentFileMessage(
  result: SentMessageResult
): result is SentFileMessageResult {
  return (
    (result as SentFileMessageResult).message !== undefined &&
    result.message.type === 'FILE'
  );
}

export declare class GetUnreadMessagesCountRequest {
  channel: Channel;
}

export declare class GetMessageRepliesCountRequest {
  message: Message;
}

export declare class GetMessageParentRequest {
  message: Message;
}

export type GetMessageParentResult =
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
