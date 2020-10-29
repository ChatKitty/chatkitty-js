import {
  ChatKittySucceededResult
} from '../../chatkitty.result';
import { ChannelSession } from '../channel-session.model';

export type StartChannelSessionResult =
  StartedChannelSessionResult

export class StartedChannelSessionResult extends ChatKittySucceededResult {
  constructor(public session: ChannelSession) {
    super();
  }
}

export function startedChannelSession(result: StartChannelSessionResult): result is StartedChannelSessionResult {
  return (result as StartedChannelSessionResult).session !== undefined;
}
