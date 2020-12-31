import { ChatKittyPaginator, ChatKittySucceededResult } from '../../chatkitty';
import { Channel } from '../channel/model';

import { Message } from './model';

export declare class GetMessagesRequest {
  channel: Channel;
}

export class GetMessagesResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Message>) {
    super();
  }
}
