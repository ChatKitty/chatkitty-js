import { ChatKittyPaginator } from '../../pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from '../../result';
import { Channel } from '../channel';

import { Message } from './index';

export declare class GetMessagesRequest {
  channel: Channel;
}

export type GetMessagesResult =
  | GetMessagesSucceededResult
  | ChatKittyFailedResult;

export class GetMessagesSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Message>) {
    super();
  }
}
