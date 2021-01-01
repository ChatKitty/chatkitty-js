import { ChatKittyError } from '../../error';
import { ChatKittyPaginator } from '../../pagination';
import { ChatKittySucceededResult } from '../../result';
import { Channel } from '../channel';

import { User } from './index';

export type GetUsersRequest = GetMembersRequest;

export declare class GetMembersRequest {
  channel: Channel;
}

export declare class GetUserRequest {
  id?: null;
  name?: string;
}

export class GetUsersResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<User>) {
    super();
  }
}

export class GetUserResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}
export class CannotHaveMembersChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'CannotHaveMembersChatKittyError',
      `Channel ${channel.name} is not a group channel and cannot have members.`
    );
  }
}
