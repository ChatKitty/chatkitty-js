import { Channel } from './channel';
import {
  ChatKittyFile,
  ChatKittyUploadProgressListener,
  CreateChatKittyFileProperties,
} from './file';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export type Message = SystemMessage | UserMessage;

export type SystemMessage = TextSystemMessage | FileSystemMessage;

export type UserMessage = TextUserMessage | FileUserMessage;

export type TextMessage = TextSystemMessage | TextUserMessage;

export type FileMessage = FileSystemMessage | FileUserMessage;

export interface MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
  _actions: MessageActions;
}

export declare class TextSystemMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
  body: string;
  links: [MessageLink];
  _actions: MessageActions;
}

export declare class FileSystemMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
  file: ChatKittyFile;
  _actions: MessageActions;
}

export declare class TextUserMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
  user: User;
  body: string;
  links: [MessageLink];
  _actions: MessageActions;
}

export declare class FileUserMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
  user: User;
  file: ChatKittyFile;
  _actions: MessageActions;
}

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

export declare class MessageActions {
  read: string;
}

export function isTextMessage(message: Message): message is TextMessage {
  return (message as TextMessage).body !== undefined;
}

export function isFileMessage(message: Message): message is FileMessage {
  return (message as FileMessage).file !== undefined;
}

export declare class GetMessagesRequest {
  channel: Channel;
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

export type SendMessageRequest =
  | SendChannelTextMessageRequest
  | SendChannelFileMessageRequest;

export declare class SendChannelTextMessageRequest {
  channel: Channel;
  body: string;
}

export declare class SendChannelFileMessageRequest {
  channel: Channel;
  file: CreateChatKittyFileProperties;
  progressListener?: ChatKittyUploadProgressListener;
}

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
