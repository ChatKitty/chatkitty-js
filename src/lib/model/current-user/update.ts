import { ChatKittySucceededResult } from '../../result';

import { CurrentUser } from './index';

export type UpdateCurrentUserResult = UpdatedCurrentUserResult;

export class UpdatedCurrentUserResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export function updatedCurrentUser(
  result: UpdateCurrentUserResult
): result is UpdatedCurrentUserResult {
  return (result as UpdatedCurrentUserResult).user !== undefined;
}