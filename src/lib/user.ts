import { Channel } from './channel';
import { ChatKittyModelReference } from './model';
import { ChatKittyPaginator } from './pagination';
import {
  ChatKittyFailedResult,
  ChatKittyResult,
  ChatKittySucceededResult
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

export declare class GetUsersRequest {
  filter?: GetUsersFilter;
}

export declare class GetUsersFilter {
  name?: string;
  displayName?: string;
  online?: boolean;
}

export type GetUsersResult =
  | ChatKittyResult<GetUsersSucceededResult>
  | GetUsersSucceededResult
  | ChatKittyFailedResult;

export class GetUsersSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<User>) {
    super();
  }
}

export type GetUserResult =
  | ChatKittyResult<GetUserSucceededResult>
  | GetUserSucceededResult
  | ChatKittyFailedResult;

export class GetUserSucceededResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}

export declare class GetUserIsChannelMemberRequest {
  user: User;
  channel: Channel;
}

export type GetUserIsChannelMemberResult =
  | ChatKittyResult<GetUserIsChannelMemberSucceededResult>
  | GetUserIsChannelMemberSucceededResult
  | ChatKittyFailedResult;

export class GetUserIsChannelMemberSucceededResult extends ChatKittySucceededResult {
  constructor(public isMember: boolean) {
    super();
  }
}

export declare class BlockUserRequest {
  user: User;
}

export type BlockUserResult =
  | ChatKittyResult<BlockUserSucceededResult>
  | BlockUserSucceededResult
  | ChatKittyFailedResult;

export class BlockUserSucceededResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}
