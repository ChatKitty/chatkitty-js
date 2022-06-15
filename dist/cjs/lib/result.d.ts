import { ChatKittyError } from './error';
export interface ChatKittyResult<S extends ChatKittySucceededResult> {
    succeeded: boolean;
    cancelled: boolean;
    failed: boolean;
}
export declare abstract class ChatKittySucceededResult {
    succeeded: boolean;
    cancelled: boolean;
    failed: boolean;
}
export declare abstract class ChatKittyCancelledResult {
    succeeded: boolean;
    cancelled: boolean;
    failed: boolean;
}
export declare class ChatKittyFailedResult {
    error: ChatKittyError;
    succeeded: boolean;
    cancelled: boolean;
    failed: boolean;
    constructor(error: ChatKittyError);
}
export declare type GetCountResult = ChatKittyResult<GetCountSucceedResult> | GetCountSucceedResult | ChatKittyFailedResult;
export declare class GetCountSucceedResult extends ChatKittySucceededResult {
    count: number;
    constructor(count: number);
}
export declare function succeeded<R extends ChatKittySucceededResult>(result: ChatKittyResult<R>): result is R;
export declare function failed<R extends ChatKittyFailedResult>(result: ChatKittyResult<never>): result is R;
export declare function cancelled<R extends ChatKittyCancelledResult>(result: ChatKittyResult<never>): result is R;
