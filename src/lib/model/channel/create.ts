import { ChatKittyError } from '../../error';
import { ChatKittyFailedResult, ChatKittySucceededResult } from '../../result';
import { ChatKittyModelReference } from '../index';

import { Channel } from './index';

export type CreateChannelResult =
  | CreatedChannelResult
  | CreateChannelFailedResult;

export declare class CreateChannelRequest {
  type: string;
  name?: string;
  members?: ChatKittyModelReference[];
  properties?: unknown;
}

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
