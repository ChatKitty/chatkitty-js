import { ChatKittyError } from '../../error';
import { ChatKittySucceededResult } from '../../result';

import { Channel } from './index';

export declare class JoinChannelRequest {
  channel: Channel;
}

export type JoinChannelResult = JoinedChannelResult;

export class JoinedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export class ChannelNotPubliclyJoinableChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'ChannelNotPubliclyJoinableChatKittyError',
      `The channel ${channel.name} can't be joined without an invite.`
    );
  }
}

export function joinedChannel(
  result: JoinChannelResult
): result is JoinedChannelResult {
  return (result as JoinedChannelResult).channel !== undefined;
}
