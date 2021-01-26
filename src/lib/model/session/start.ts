import { ChatKittyError } from '../../error';
import { ChatKittyFailedResult, ChatKittySucceededResult } from '../../result';

import { Session } from './index';

export type StartSessionResult =
  | StartedSessionResult
  | AccessDeniedSessionResult;

export declare class StartSessionRequest {
  username: string;
  authParams?: unknown;
}

export class StartedSessionResult extends ChatKittySucceededResult {
  constructor(public session: Session) {
    super();
  }
}

export class AccessDeniedSessionResult extends ChatKittyFailedResult {
  constructor(public error: AccessDeniedSessionError) {
    super();
  }
}

export function startedSession(
  result: StartSessionResult
): result is StartedSessionResult {
  return (result as StartedSessionResult).session !== undefined;
}

export class AccessDeniedSessionError extends ChatKittyError {
  constructor() {
    super(
      'AccessDeniedSessionError',
      'ChatKitty session did not start. Access denied.'
    );
  }
}

export class NoActiveSessionError extends ChatKittyError {
  constructor() {
    super('NoActiveSessionError', "You're not connected to ChatKitty.");
  }
}
