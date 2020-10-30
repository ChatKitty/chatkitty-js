import { ChatKittyPaginator } from '../../chatkitty.paginator';
import {
  ChatKittySucceededResult
} from '../../chatkitty.result';
import { Channel } from '../channel.model';

export class GetChannelsResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Channel>) {
    super();
  }
}
