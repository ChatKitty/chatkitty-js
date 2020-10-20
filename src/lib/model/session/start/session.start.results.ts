import {
  ChatKittyErrorResult,
  ChatKittySuccessfulResult
} from '../../chatkitty.result';
import { Session } from '../session.model';

import { SessionAccessDeniedError } from './session.errors';

export class SessionStartedResult extends ChatKittySuccessfulResult {
  constructor(public session: Session) {
    super();
  }
}

export class SessionAccessDeniedErrorResult extends ChatKittyErrorResult {
  constructor(public error: SessionAccessDeniedError) {
    super();
  }
}

export function sessionWasStarted(result:
                                    SessionStartedResult |
                                    SessionAccessDeniedErrorResult
): result is SessionStartedResult {
  return (result as SessionStartedResult).session !== undefined;
}
