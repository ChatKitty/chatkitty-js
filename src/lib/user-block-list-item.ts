import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export declare class UserBlockListItem {
  user: User;
  createdTime: string;
  _actions: UserBlockListItemActions;
}

export declare class UserBlockListItemActions {
  delete: string;
}

export type GetUserBlockListResult =
  | GetUserBlockListSucceededResult
  | ChatKittyFailedResult;

export class GetUserBlockListSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<UserBlockListItem>) {
    super();
  }
}

export declare class DeleteUserBlockListItemRequest {
  item: UserBlockListItem;
}

export type DeleteUserBlockListItemResult =
  | DeleteUserBlockListItemSucceededResult
  | ChatKittyFailedResult;

export class DeleteUserBlockListItemSucceededResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}
