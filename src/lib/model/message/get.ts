import { ChatKittyPaginator } from '../../pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from '../../result';
import { Channel } from '../channel';

import { Message } from './index';

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
