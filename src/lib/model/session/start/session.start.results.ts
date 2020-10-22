import {
  ChatKittyFailedResult,
  ChatKittySucceededResult
} from '../../chatkitty.result';
import { Session } from '../session.model';

import { SessionAccessDeniedError } from './session.errors';

export class SessionStartedResult extends ChatKittySucceededResult {
  constructor(public session: Session) {
    super();
  }
}

export class SessionAccessDeniedResult extends ChatKittyFailedResult {
  constructor(public error: SessionAccessDeniedError) {
    super();
  }
}

export function sessionStarted(result:
                                 SessionStartedResult |
                                 SessionAccessDeniedResult
): result is SessionStartedResult {
  return (result as SessionStartedResult).session !== undefined;
}
