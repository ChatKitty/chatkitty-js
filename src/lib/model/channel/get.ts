import { ChatKittyPaginator } from '../../paginator';
import { ChatKittySucceededResult } from '../../result';

import { Channel } from './index';

export declare class GetChannelReadRequest {
  channel: Channel;
}

export class GetChannelsCountResult extends ChatKittySucceededResult {
  constructor(public count: number) {
    super();
  }
}

export class GetChannelsResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Channel>) {
    super();
  }
}

export class GetChannelUnreadResult extends ChatKittySucceededResult {
  constructor(public unread: boolean) {
    super();
  }
}

export class GetChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}
