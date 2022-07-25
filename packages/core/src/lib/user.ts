import { Channel } from './channel';
import { ChatKittyModelReference } from './model';
import { ChatKittyPaginator } from './pagination';
import {
  ChatKittyFailedResult,
  ChatKittySucceededResult,
} from './result';

export interface BaseUser {
  id: number;
  name: string;
  displayName: string;
  displayPictureUrl: string;
  isGuest: boolean;
  presence: UserPresence;
  properties: unknown;
}

export declare class UserPresence {
  status: string;
  online: boolean;
}

export type User = BaseUser & {
  _relays: UserRelays;
};

export declare class UserRelays {
  self: string;
  channelMember: string;
}

export type ChatKittyUserReference =
  | ChatKittyModelReference
  | {
      username: string;
    };

export declare class ListUsersRequest {
  filter?: ListUsersFilter;
}

export declare class ListUsersFilter {
  name?: string;
  displayName?: string;
  online?: boolean;
}

export type ListUsersResult = ListUsersSucceededResult | ChatKittyFailedResult;

export class ListUsersSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<User>) {
    super();
  }
}

export type RetrieveUserResult = ListUserSucceededResult | ChatKittyFailedResult;

export class ListUserSucceededResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}

export declare class CheckUserIsChannelMemberRequest {
  user: User;
  channel: Channel;
}

export type CheckUserIsChannelMemberResult = CheckUserIsChannelMemberSucceededResult | ChatKittyFailedResult;

export class CheckUserIsChannelMemberSucceededResult extends ChatKittySucceededResult {
  constructor(public isChannelMember: boolean) {
    super();
  }
}

export declare class BlockUserRequest {
  user: User;
}

export type BlockUserResult = BlockUserSucceededResult | ChatKittyFailedResult;

export class BlockUserSucceededResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}
