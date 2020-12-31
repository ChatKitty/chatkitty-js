import {
  ChatKittyError,
  ChatKittyFailedResult,
  ChatKittySucceededResult,
} from '../../chatkitty';

import { Session } from './model';

export declare class StartSessionRequest {
  username: string;
  authParams?: unknown;
}

export type StartSessionResult =
  | StartedSessionResult
  | AccessDeniedSessionResult;

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

export class NoActiveSessionChatKittyError extends ChatKittyError {
  constructor() {
    super(
      'NoActiveSessionChatKittyError',
      "You're not connected to ChatKitty."
    );
  }
}
