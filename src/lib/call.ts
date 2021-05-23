import { Channel } from './channel';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export type Call = ConferenceCall | PresenterCall;

type CallProperties = {
  id: number;
  type: string;
  creator: User;
  state: string;
  p2p: boolean;
  properties: unknown;
  createdTime: string;
  endTime?: string;
  _relays: CallRelays;
  _topics: CallTopics;
  _actions: CallActions;
};

export type ConferenceCall = CallProperties;

export type PresenterCall = CallProperties;

declare class CallRelays {
  self: string;
}

declare class CallTopics {
  self: string;
  signals: string;
}

declare class CallActions {
  ready: string;
  signal: string;
}

export function isConferenceCall(call: Call): call is ConferenceCall {
  return call.type === 'CONFERENCE';
}

export function isPresenterCall(call: Call): call is PresenterCall {
  return call.type === 'PRESENTER';
}

export declare class StartCallRequest {
  channel: Channel;
  type: string;
  properties?: unknown;
}

export type StartCallResult = StartedCallResult | ChatKittyFailedResult;

export class StartedCallResult extends ChatKittySucceededResult {
  constructor(public call: Call) {
    super();
  }
}

export function startedCall(
  result: StartCallResult
): result is StartedCallResult {
  return (result as StartedCallResult).call !== undefined;
}

export declare class GetCallsRequest {
  channel: Channel;
  filter?: GetCallsFilter;
}

export declare class GetCallsFilter {
  active?: boolean;
}

export type GetCallsResult = GetCallsSucceededResult | ChatKittyFailedResult;

export class GetCallsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Call>) {
    super();
  }
}
