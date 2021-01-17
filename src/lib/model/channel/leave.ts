import { ChatKittyError } from '../../error';
import { ChatKittySucceededResult } from '../../result';

import { Channel } from './index';

export declare class LeaveChannelRequest {
  channel: Channel;
}

export type LeaveChannelResult = LeftChannelResult;

export class LeftChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export class NotAChannelMemberChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'NotAChannelMemberChatKittyError',
      `You are not a member of channel ${channel.name}.`
    );
  }
}

export function leftChannel(
  result: LeaveChannelResult
): result is LeftChannelResult {
  return (result as LeftChannelResult).channel !== undefined;
}
