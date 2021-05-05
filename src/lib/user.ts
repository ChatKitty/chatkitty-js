import { Channel } from './channel';
import { ChatKittyError } from './error';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';

export interface UserProperties {
  id: number;
  name: string;
  displayName: string;
  displayPictureUrl: string;
  isGuest: string;
  properties: unknown;
}

export declare class User implements UserProperties {
  displayName: string;
  displayPictureUrl: string;
  id: number;
  isGuest: string;
  name: string;
  properties: unknown;
}

export declare class ChatKittyUserReference {
  username: string;
}

export declare class GetContactsRequest {
  filter?: GetContactsFilter;
}

export declare class GetContactsFilter {
  name?: string;
  online?: boolean;
}

export declare class GetChannelMembersRequest {
  channel: Channel;
}

export type GetUsersResult = GetUsersSucceededResult | ChatKittyFailedResult;

export class GetUsersSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<User>) {
    super();
  }
}

export class GetUserResult extends ChatKittySucceededResult {
  constructor(public user: User) {
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

export class CannotHaveMembersError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'CannotHaveMembersError',
      `Channel ${channel.name} is not a group channel and cannot have members.`
    );
  }
}
