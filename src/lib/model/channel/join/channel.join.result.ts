import {
  ChatKittySucceededResult
} from '../../chatkitty.result';
import { Channel } from '../channel.model';

export type JoinChannelResult =
  JoinedChannelResult

export class JoinedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export function joinedChannel(result: JoinChannelResult): result is JoinedChannelResult {
  return (result as JoinedChannelResult).channel !== undefined;
}
