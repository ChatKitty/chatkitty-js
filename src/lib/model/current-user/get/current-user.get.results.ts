import {
  ChatKittySuccessfulResult
} from '../../chatkitty.result';
import { CurrentUser } from '../current-user.model';

export class GetCurrentUserResult extends ChatKittySuccessfulResult {
  constructor(public currentUser: CurrentUser) {
    super();
  }
}
