import { ChatKittyPaginator } from '../../pagination';
import { ChatKittySucceededResult } from '../../result';
import { Channel } from '../channel';

import { Message } from './index';

export declare class GetMessagesRequest {
  channel: Channel;
}

export class GetMessagesResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Message>) {
    super();
  }
}
