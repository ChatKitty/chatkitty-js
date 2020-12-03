import { ChatKittySucceededResult } from '../../../chatkitty.result';
import { Channel } from '../channel.model';

export type CreateChannelResult = CreatedChannelResult;

export class CreatedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export function createdChannel(
  result: CreateChannelResult
): result is CreatedChannelResult {
  return (result as CreatedChannelResult).channel !== undefined;
}
