import { CurrentUser } from './current-user';
import { ChatKittyError } from './error';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';

export declare class UserSession {
  user: CurrentUser;
}

export type StartSessionResult = StartedSessionResult | ChatKittyFailedResult;

export declare class StartSessionRequest {
  username: string;
  authParams?: unknown;
}

export class StartedSessionResult extends ChatKittySucceededResult {
  constructor(public session: UserSession) {
    super();
  }
}

export function startedSession(
  result: StartSessionResult
): result is StartedSessionResult {
  return (result as StartedSessionResult).session !== undefined;
}

export class StartSessionInProgressError extends ChatKittyError {
  constructor() {
    super(
      'StartSessionInProgressError',
      'A start session request is already in progress.'
    );
  }
}

export class NoActiveSessionError extends ChatKittyError {
  constructor() {
    super('NoActiveSessionError', "You're not connected to ChatKitty.");
  }
}
