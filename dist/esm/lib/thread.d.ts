import { Channel } from './channel';
import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittyResult, ChatKittySucceededResult } from './result';
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
export declare type CreateThreadResult = ChatKittyResult<CreatedThreadResult> | CreatedThreadResult | ChatKittyFailedResult;
export declare class CreatedThreadResult extends ChatKittySucceededResult {
    thread: Thread;
    constructor(thread: Thread);
}
export declare type GetThreadsRequest = GetChannelThreadsRequest;
export declare class GetChannelThreadsRequest {
    channel: Channel;
    filter?: GetChannelThreadsFilter;
}
export declare class GetChannelThreadsFilter {
    includeMainThread?: boolean;
    standalone?: boolean;
}
export declare type GetThreadsResult = ChatKittyResult<GetThreadsSucceededResult> | GetThreadsSucceededResult | ChatKittyFailedResult;
export declare class GetThreadsSucceededResult extends ChatKittySucceededResult {
    paginator: ChatKittyPaginator<Thread>;
    constructor(paginator: ChatKittyPaginator<Thread>);
}
export declare class GetThreadChannelRequest {
    thread: Thread;
}
export declare type GetThreadChannelResult = ChatKittyResult<GetThreadChannelSucceededResult> | GetThreadChannelSucceededResult | ChatKittyFailedResult;
export declare class GetThreadChannelSucceededResult extends ChatKittySucceededResult {
    channel: Channel;
    constructor(channel: Channel);
}
export declare class GetThreadMessageRequest {
    thread: Thread;
}
export declare type GetThreadMessageResult = ChatKittyResult<GetThreadMessageSucceededResult> | GetThreadMessageSucceededResult | ChatKittyFailedResult;
export declare class GetThreadMessageSucceededResult extends ChatKittySucceededResult {
    message: Message;
    constructor(message: Message);
}
export declare class ReadThreadRequest {
    thread: Thread;
}
export declare type ReadThreadResult = ChatKittyResult<ReadThreadSucceededResult> | ReadThreadSucceededResult | ChatKittyFailedResult;
export declare class ReadThreadSucceededResult extends ChatKittySucceededResult {
    thread: Thread;
    constructor(thread: Thread);
}
