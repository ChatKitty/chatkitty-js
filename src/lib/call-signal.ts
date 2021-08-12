import {
  RTCIceCandidateType,
  RTCSessionDescriptionType,
} from 'react-native-webrtc';

import { ChatKittyModelReference } from './model';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export type CallSignal =
  | CreateOfferCallSignal
  | AnswerOfferCallSignal
  | AddCandidateCallSignal
  | SendDescriptionCallSignal
  | DisconnectPeerCallSignal;

type CallSignalProperties = {
  type: string;
  peer: User;
  createdTime: string;
};

type SystemCallSignal = CallSignalProperties;

type ClientCallSignal = {
  payload: unknown;
} & CallSignalProperties;

export type CreateOfferCallSignal = SystemCallSignal;

export type AnswerOfferCallSignal = SystemCallSignal;

export type AddCandidateCallSignal = {
  payload: RTCIceCandidateType;
} & ClientCallSignal;

export type SendDescriptionCallSignal = {
  payload: RTCSessionDescriptionType;
} & ClientCallSignal;

export type DisconnectPeerCallSignal = SystemCallSignal;

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

export function isAddCandidateCallSignal(
  signal: CallSignal
): signal is AddCandidateCallSignal {
  return signal.type === 'ADD_CANDIDATE';
}

export function isSendDescriptionCallSignal(
  signal: CallSignal
): signal is SendDescriptionCallSignal {
  return signal.type === 'SEND_DESCRIPTION';
}

export function isDisconnectPeerCallSignal(
  signal: CallSignal
): signal is DisconnectPeerCallSignal {
  return signal.type === 'DISCONNECT_PEER';
}

export declare class CreateCallSignalRequest {
  type: string;
  peer: ChatKittyModelReference;
  payload: RTCIceCandidateType | RTCSessionDescriptionType;
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
