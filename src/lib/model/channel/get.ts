import { ChatKittyPaginator } from '../../pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from '../../result';

import { Channel } from './index';

export declare class GetChannelsRequest {
  joinable?: boolean;
  filter?: GetChannelsFilter;
}

export declare class GetChannelsFilter {
  unread?: boolean;
}

export declare class GetChannelUnreadRequest {
  channel: Channel;
}

export type GetChannelsResult =
  | GetChannelsSucceededResult
  | ChatKittyFailedResult;

export class GetChannelsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Channel>) {
    super();
  }
}

export type GetChannelResult =
  | GetChannelSucceededResult
  | ChatKittyFailedResult;

export class GetChannelSucceededResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export type GetChannelUnreadResult =
  | GetChannelUnreadSucceededResult
  | ChatKittyFailedResult;

export class GetChannelUnreadSucceededResult extends ChatKittySucceededResult {
  constructor(public unread: boolean) {
    super();
  }
}
