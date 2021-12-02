import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import {
  ChatKittyFailedResult,
  ChatKittyResult,
  ChatKittySucceededResult
} from './result';
import { User } from './user';

export declare class ReadReceipt {
  user: User;
  createdTime: string;
  _relays: ReadReceiptRelays;
}

export declare class ReadReceiptRelays {
  message: string;
}

export declare class GetReadReceiptsRequest {
  message: Message;
}

export type GetReadReceiptsResult =
  | ChatKittyResult<GetReadReceiptsSucceededResult>
  | GetReadReceiptsSucceededResult
  | ChatKittyFailedResult;

export class GetReadReceiptsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<ReadReceipt>) {
    super();
  }
}
