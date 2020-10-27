import {
  ChatKittyFailedResult,
  ChatKittySucceededResult
} from '../../chatkitty.result';
import { Session } from '../session.model';

import { AccessDeniedSessionError } from './session.errors';

export type StartSessionResult =
  StartedSessionResult |
  AccessDeniedSessionResult

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

export function startedSession(result: StartSessionResult): result is StartedSessionResult {
  return (result as StartedSessionResult).session !== undefined;
}
