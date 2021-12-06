import {Channel} from "./channel";
import {
  ChatKittyFailedResult,
  ChatKittyResult,
  ChatKittySucceededResult
} from './result';
import { User } from './user';

export declare class Event {
  type: string;
  user: User;
  properties: unknown;
  _relays: EventRelays;
}

export declare class EventRelays {
  channel: string;
}

export declare class TriggerEventRequest {
  channel: Channel;
  type: string;
  properties: unknown;
}

export type TriggerEventResult =
  | ChatKittyResult<TriggeredEventResult>
  | TriggeredEventResult
  | ChatKittyFailedResult;

export class TriggeredEventResult extends ChatKittySucceededResult {
  constructor(public channel: Channel) {
    super();
  }
}
