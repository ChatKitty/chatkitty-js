import { ChatKittyError } from '../../error';
import { ChatKittyPaginator } from '../../pagination';
import { ChatKittySucceededResult } from '../../result';
import { Channel } from '../channel';

import { User } from './index';

export declare class GetContactsRequest {
  filter?: GetContactsFilter;
}

export declare class GetChannelMembersRequest {
  channel: Channel;
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

export class CannotHaveMembersError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'CannotHaveMembersError',
      `Channel ${channel.name} is not a group channel and cannot have members.`
    );
  }
}

export declare class GetContactsFilter {
  name?: string;
  online?: boolean;
}
