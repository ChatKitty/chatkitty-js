import { Channel } from './channel';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export type Call = VoiceCall | VideoCall;

type CallProperties = {
  id: number;
  type: string;
  creator: User;
  state: string;
  properties: unknown;
  createdTime: string;
  endTime?: string;
  _relays: CallRelays;
  _topics: CallTopics;
  _actions: CallActions;
};

export type VoiceCall = CallProperties;

export type VideoCall = CallProperties;

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

export function isVoiceCall(call: Call): call is VoiceCall {
  return call.type === 'VOICE';
}

export function isVideoCall(call: Call): call is VideoCall {
  return call.type === 'VIDEO';
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
