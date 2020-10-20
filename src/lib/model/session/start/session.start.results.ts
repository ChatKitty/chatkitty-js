import {
  ChatKittyErrorResult,
  ChatKittySuccessfulResult
} from '../../chatkitty.result';
import { Session } from '../session.model';

import { SessionNotStartedError } from './session.errors';

export class SessionStartedResult extends ChatKittySuccessfulResult {
  constructor(public session: Session) {
    super();
  }
}

export class SessionNotStartedResult extends ChatKittyErrorResult {
  constructor(public error: SessionNotStartedError) {
    super();
  }
}

export function sessionWasStarted(result: SessionStartedResult | SessionNotStartedResult): result is SessionStartedResult {
  return (result as SessionStartedResult).session !== undefined;
}
