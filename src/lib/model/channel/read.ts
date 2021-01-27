import { ChatKittyFailedResult } from '../../result';

import { Channel } from './index';

export declare class ReadChannelRequest {
  channel: Channel;
}

export type ReadChannelResult =
  | ReadChannelSucceededResult
  | ChatKittyFailedResult;

export declare class ReadChannelSucceededResult {}
