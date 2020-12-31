import { ChatKittySucceededResult } from '../../chatkitty';

import { CurrentUser } from './model';

export class GetCurrentUserResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}
