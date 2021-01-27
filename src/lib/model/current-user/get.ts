import { ChatKittyFailedResult, ChatKittySucceededResult } from '../../result';

import { CurrentUser } from './index';

export type GetCurrentUserResult =
  | GetCurrentUserSuccessfulResult
  | ChatKittyFailedResult;

export class GetCurrentUserSuccessfulResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}
