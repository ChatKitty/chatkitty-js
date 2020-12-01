import { ChatKittySucceededResult } from '../../chatkitty.result';
import { CurrentUser } from '../current-user.model';

export class GetCurrentUserResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}
