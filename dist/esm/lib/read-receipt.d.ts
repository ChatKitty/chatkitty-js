import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittyResult, ChatKittySucceededResult } from './result';
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
export declare type GetReadReceiptsResult = ChatKittyResult<GetReadReceiptsSucceededResult> | GetReadReceiptsSucceededResult | ChatKittyFailedResult;
export declare class GetReadReceiptsSucceededResult extends ChatKittySucceededResult {
    paginator: ChatKittyPaginator<ReadReceipt>;
    constructor(paginator: ChatKittyPaginator<ReadReceipt>);
}
