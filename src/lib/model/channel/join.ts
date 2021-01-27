import { ChatKittyError } from '../../error';
import { ChatKittyFailedResult, ChatKittySucceededResult } from '../../result';

import { Channel } from './index';

export declare class JoinChannelRequest {
  channel: Channel;
}

export type JoinChannelResult = JoinedChannelResult | ChatKittyFailedResult;

export class JoinedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export class ChannelNotPubliclyJoinableError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'ChannelNotPubliclyJoinableError',
      `The channel ${channel.name} can't be joined without an invite.`
    );
  }
}

export function joinedChannel(
  result: JoinChannelResult
): result is JoinedChannelResult {
  return (result as JoinedChannelResult).channel !== undefined;
}
