import { ChatKittySucceededResult } from '../../result';

import { CurrentUser } from './index';

export class GetCurrentUserResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}
