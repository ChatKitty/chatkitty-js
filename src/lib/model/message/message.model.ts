import { UserProperties } from '../user/user.properties';

export type Message =
  SystemMessage |
  UserMessage

interface MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: Map<string, unknown>;
}

export type SystemMessage =
  TextSystemMessage

export type UserMessage =
  TextUserMessage

export declare class TextSystemMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: Map<string, unknown>;
  body: string;
}

export declare class TextUserMessage implements MessageProperties {
  id: number;
  type: string;
  createdTime: string;
  properties: Map<string, unknown>;
  user: UserProperties;
  body: string;
}
