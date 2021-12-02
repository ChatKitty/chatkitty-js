import { Channel } from './channel';
import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import {
  ChatKittyFailedResult,
  ChatKittyResult,
  ChatKittySucceededResult
} from './result';

export declare class Thread {
  id: string;
  type: string;
  name?: string;
  properties: unknown;
  createdTime: string;
  _relays: ThreadRelays;
  _topics: ThreadTopics;
  _actions: ThreadActions;
  _streams: ThreadStreams;
}

export declare class ThreadRelays {
  channel: string;
  message: string;
}

export declare class ThreadTopics {
  self: string;
  messages: string;
  keystrokes: string;
  typing: string;
}

export declare class ThreadActions {
  message: string;
  keystrokes: string;
  read: string;
}

export declare class ThreadStreams {
  messages: string;
}

export declare class CreateThreadRequest {
  channel: Channel;
  name: string;
  properties?: unknown;
}

export type CreateThreadResult =
  | ChatKittyResult<CreatedThreadResult>
  | CreatedThreadResult
  | ChatKittyFailedResult;

export class CreatedThreadResult extends ChatKittySucceededResult {
  constructor(public thread: Thread) {
    super();
  }
}

export type GetThreadsRequest =
  GetChannelThreadsRequest

export declare class GetChannelThreadsRequest {
  channel: Channel;
  filter?: GetChannelThreadsFilter;
}

export declare class GetChannelThreadsFilter {
  includeMainThread?: boolean;
  standalone?: boolean;
}

export type GetThreadsResult =
  | ChatKittyResult<GetThreadsSucceededResult>
  | GetThreadsSucceededResult
  | ChatKittyFailedResult;

export class GetThreadsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Thread>) {
    super();
  }
}

export declare class GetThreadChannelRequest {
  thread: Thread
}

export type GetThreadChannelResult =
  | ChatKittyResult<GetThreadChannelSucceededResult>
  | GetThreadChannelSucceededResult
  | ChatKittyFailedResult;

export class GetThreadChannelSucceededResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export declare class GetThreadMessageRequest {
  thread: Thread
}

export type GetThreadMessageResult =
  | ChatKittyResult<GetThreadMessageSucceededResult>
  | GetThreadMessageSucceededResult
  | ChatKittyFailedResult;

export class GetThreadMessageSucceededResult extends ChatKittySucceededResult {
  constructor(public message: Message) {
    super();
  }
}

export declare class ReadThreadRequest {
  thread: Thread;
}

export type ReadThreadResult =
  | ChatKittyResult<ReadThreadSucceededResult>
  | ReadThreadSucceededResult
  | ChatKittyFailedResult;

export class ReadThreadSucceededResult extends ChatKittySucceededResult {
  constructor(public thread: Thread) {
    super();
  }
}


