import { CurrentUser } from './current-user';
import { ChatKittyError } from './error';
import { ChatKittyFailedResult, ChatKittyResult, ChatKittySucceededResult } from './result';
export declare class UserSession {
    user: CurrentUser;
}
export declare type StartSessionResult = ChatKittyResult<StartedSessionResult> | StartedSessionResult | ChatKittyFailedResult;
export declare class StartSessionRequest {
    username: string;
    authParams?: unknown;
}
export declare class StartedSessionResult extends ChatKittySucceededResult {
    session: UserSession;
    constructor(session: UserSession);
}
export declare class SessionActiveError extends ChatKittyError {
    constructor();
}
export declare class NoActiveSessionError extends ChatKittyError {
    constructor();
}
