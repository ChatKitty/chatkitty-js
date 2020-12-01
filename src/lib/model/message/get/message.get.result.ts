import { ChatKittyPaginator } from '../../chatkitty.paginator';
import { ChatKittySucceededResult } from '../../chatkitty.result';
import { Message } from '../message.model';

export class GetMessagesResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Message>) {
    super();
  }
}
