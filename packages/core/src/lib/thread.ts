import { Channel } from './channel';
import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';

export declare class Thread {
  id: string;
  type: string;
  name?: string;
  properties: unknown;
  createdTime: string;
  /** @internal */
  _relays: ThreadRelays;
  /** @internal */
  _topics: ThreadTopics;
  /** @internal */
  _actions: ThreadActions;
  /** @internal */
  _streams: ThreadStreams;
}

declare class ThreadRelays {
  channel: string;
  message: string;
}

declare class ThreadTopics {
  self: string;
  messages: string;
  keystrokes: string;
  typing: string;
}

declare class ThreadActions {
  message: string;
  keystrokes: string;
  read: string;
}

declare class ThreadStreams {
  messages: string;
}

export declare class CreateThreadRequest {
  channel: Channel;
  name: string;
  properties?: unknown;
}

export type CreateThreadResult = CreatedThreadResult | ChatKittyFailedResult;

export class CreatedThreadResult extends ChatKittySucceededResult {
  constructor(public thread: Thread) {
    super();
  }
}

export type ListThreadsRequest = ListChannelThreadsRequest;

export declare class ListChannelThreadsRequest {
  channel: Channel;
  filter?: ListChannelThreadsFilter;
}

export declare class ListChannelThreadsFilter {
  includeMainThread?: boolean;
  standalone?: boolean;
}

export type ListThreadsResult =
  | ListThreadsSucceededResult
  | ChatKittyFailedResult;

export class ListThreadsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Thread>) {
    super();
  }
}

export declare class RetrieveThreadChannelRequest {
  thread: Thread;
}

export type RetrieveThreadChannelResult =
  | RetrieveThreadChannelSucceededResult
  | ChatKittyFailedResult;

export class RetrieveThreadChannelSucceededResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export declare class RetrieveThreadMessageRequest {
  thread: Thread;
}

export type RetrieveThreadMessageResult =
  | RetrieveThreadMessageSucceededResult
  | ChatKittyFailedResult;

export class RetrieveThreadMessageSucceededResult extends ChatKittySucceededResult {
  constructor(public message: Message) {
    super();
  }
}

export declare class ReadThreadRequest {
  thread: Thread;
}

export type ReadThreadResult =
  | ReadThreadSucceededResult
  | ChatKittyFailedResult;

export class ReadThreadSucceededResult extends ChatKittySucceededResult {
  constructor(public thread: Thread) {
    super();
  }
}
