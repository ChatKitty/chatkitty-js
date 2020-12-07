import { ChatKittyError } from '../../../chatkitty.error';
import {
  ChatKittyFailedResult,
  ChatKittySucceededResult,
} from '../../../chatkitty.result';
import { Channel } from '../channel.model';

export type CreateChannelResult =
  | CreatedChannelResult
  | CreateChannelFailedResult;

export class CreatedChannelResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}

export class CreateChannelFailedResult extends ChatKittyFailedResult {
  constructor(public error: ChatKittyError) {
    super();
  }
}

export function createdChannel(
  result: CreateChannelResult
): result is CreatedChannelResult {
  return (result as CreatedChannelResult).channel !== undefined;
}
