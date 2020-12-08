import { ChatKittyFile } from '../../chatkitty.file';
import { User } from '../user/user.model';

export interface MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
}

export type Message = SystemMessage | UserMessage;

export type SystemMessage = TextSystemMessage | FileSystemMessage;

export type UserMessage = TextUserMessage | FileUserMessage;

export type TextMessage = TextSystemMessage | TextUserMessage;

export type FileMessage = FileSystemMessage | FileUserMessage;

export declare class TextSystemMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
  body: string;
}

export declare class FileSystemMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
  file: ChatKittyFile;
}

export declare class TextUserMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
  user: User;
  body: string;
}

export declare class FileUserMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: unknown;
  user: User;
  file: ChatKittyFile;
}

export function isTextMessage(
  message: Message
): message is TextMessage {
  return (message as TextMessage).body !== undefined;
}

export function isFileMessage(
  message: Message
): message is FileMessage {
  return (message as FileMessage).file !== undefined;
}
