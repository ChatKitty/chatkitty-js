import { Channel } from './channel';
import {
  ChatKittyFailedResult,
  ChatKittySucceededResult,
} from './result';
import { User } from './user';

export declare class Event {
  type: string;
  user: User;
  properties: unknown;
  /** @internal */
  _relays: EventRelays;
}

declare class EventRelays {
  channel: string;
}

export declare class TriggerEventRequest {
  channel: Channel;
  type: string;
  properties: unknown;
}

export type TriggerEventResult = TriggeredEventResult | ChatKittyFailedResult;

export class TriggeredEventResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}
