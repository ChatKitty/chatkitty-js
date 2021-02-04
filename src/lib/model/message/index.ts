import { ChatKittyFile } from '../../file';
import { User } from '../user';

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
