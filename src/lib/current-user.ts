import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { UserProperties } from './user';

export declare class CurrentUser implements UserProperties {
  displayName: string;
  displayPictureUrl: string;
  id: number;
  isGuest: string;
  name: string;
  properties: unknown;
  _relays: CurrentUserRelays;
  _topics: CurrentUserTopics;
  _actions: CurrentUserActions;
}

export declare class CurrentUserRelays {
  self: string;
  readFileAccessGrant: string;
  writeFileAccessGrant: string;
  channels: string;
  joinableChannels: string;
  unreadChannelsCount: string;
  unreadChannels: string;
  contactsCount: string;
  contacts: string;
}

export declare class CurrentUserTopics {
  self: string;
  channels: string;
  notifications: string;
  contacts: string;
  participants: string;
}

export declare class CurrentUserActions {
  update: string;
  createChannel: string;
}

export type GetCurrentUserResult =
  | GetCurrentUserSuccessfulResult
  | ChatKittyFailedResult;

export class GetCurrentUserSuccessfulResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export type UpdateCurrentUserResult =
  | UpdatedCurrentUserResult
  | ChatKittyFailedResult;

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
