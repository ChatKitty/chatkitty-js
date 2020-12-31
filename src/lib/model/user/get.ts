import {
  ChatKittyError,
  ChatKittyPaginator,
  ChatKittySucceededResult,
} from '../../chatkitty';
import { Channel } from '../channel/model';

import { User } from './model';

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
export class NotAGroupChannelChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'NotAGroupChannelKittyError',
      `Channel ${channel.name} is not a group channel and cannot have members.`
    );
  }
}
