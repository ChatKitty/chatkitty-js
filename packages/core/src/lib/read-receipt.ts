import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import {
  ChatKittyFailedResult,
  ChatKittySucceededResult,
} from './result';
import { User } from './user';

export declare class ReadReceipt {
  user: User;
  createdTime: string;
  /** @internal */
  _relays: ReadReceiptRelays;
}

declare class ReadReceiptRelays {
  message: string;
}

export declare class ListReadReceiptsRequest {
  message: Message;
}

export type ListReadReceiptsResult =
  | ListReadReceiptsSucceededResult
  | ChatKittyFailedResult;

export class ListReadReceiptsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<ReadReceipt>) {
    super();
  }
}
