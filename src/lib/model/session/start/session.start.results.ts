import {
  ChatKittyErrorResult,
  ChatKittySuccessfulResult,
} from '../../chatkitty.result';
import { CurrentUser } from '../../current-user/current-user.model';

import { SessionNotStartedError } from './session.start.errors';

export class SessionStartedResult extends ChatKittySuccessfulResult {
  constructor(public currentUser: CurrentUser) {
    super();
  }
}

export class SessionNotStartedResult extends ChatKittyErrorResult {
  constructor(public error: SessionNotStartedError) {
    super();
  }
}
