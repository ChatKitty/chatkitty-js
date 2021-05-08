import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export type CallSignal = ConnectPeerCallSignal;

type CallSignalProperties = {
  type: string;
  user: User;
  createdTime: string;
};

type SystemCallSignal = CallSignalProperties;

type ClientCallSignal = {
  payload: unknown;
} & CallSignalProperties;

export type ConnectPeerCallSignal = SystemCallSignal;

export type AddCandidateCallSignal = {
  payload: RTCIceCandidateInit;
} & ClientCallSignal;

export type CreateOfferCallSignal = {
  payload: RTCSessionDescriptionInit;
} & ClientCallSignal;

export type AnswerOfferCallSignal = {
  payload: RTCSessionDescriptionInit;
} & ClientCallSignal;

export type SendErrorCallSignal = ClientCallSignal;

export type DisconnectPeerCallSignal = SystemCallSignal;

export function isConnectPeerCallSignal(
  signal: CallSignal
): signal is ConnectPeerCallSignal {
  return signal.type === 'CONNECT_PEER';
}

export function isAddCandidateCallSignal(
  signal: CallSignal
): signal is AddCandidateCallSignal {
  return signal.type === 'ADD_CANDIDATE';
}

export function isCreateOfferCallSignal(
  signal: CallSignal
): signal is CreateOfferCallSignal {
  return signal.type === 'CREATE_OFFER';
}

export function isAnswerOfferCallSignal(
  signal: CallSignal
): signal is AnswerOfferCallSignal {
  return signal.type === 'ANSWER_OFFER';
}

export function isSendErrorCallSignal(
  signal: CallSignal
): signal is SendErrorCallSignal {
  return signal.type === 'SEND_ERROR';
}

export function isDisconnectPeerCallSignal(
  signal: CallSignal
): signal is DisconnectPeerCallSignal {
  return signal.type === 'DISCONNECT_PEER';
}

export declare class CreateCallSignalRequest {
  type: string;
  payload: unknown;
}

export type CreateCallSignalResult =
  | CreatedCallSignalResult
  | ChatKittyFailedResult;

export class CreatedCallSignalResult extends ChatKittySucceededResult {
  constructor(public signal: CallSignal) {
    super();
  }
}

export function createdCallSignal(
  result: CreateCallSignalResult
): result is CreatedCallSignalResult {
  return (result as CreatedCallSignalResult).signal !== undefined;
}
