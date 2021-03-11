import { ChatKittyFailedResult, ChatKittySucceededResult } from '../../result';
import { ChatKittyModelReference } from '../index';
import { ChatKittyUserReference } from '../user';

import { Channel } from './index';

export type CreateChannelResult = CreatedChannelResult | ChatKittyFailedResult;

export declare class CreateChannelRequest {
  type: string;
  name?: string;
  members?: ChatKittyModelReference[] | ChatKittyUserReference[];
  properties?: unknown;
}

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
