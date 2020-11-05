import { ChatKittySucceededResult } from '../../chatkitty.result';
import { CurrentUser } from '../current-user.model';

export type UpdateCurrentUserResult =
  UpdatedCurrentUserResult

export class UpdatedCurrentUserResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export function updatedCurrentUser(result: UpdateCurrentUserResult): result is UpdatedCurrentUserResult {
  return (result as UpdatedCurrentUserResult).user !== undefined;
}
