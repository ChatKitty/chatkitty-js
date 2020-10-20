import {
  SessionNotStartedResult,
  SessionStartedResult,
} from './session.start.results';

export interface SessionStartRequest {
  username: string;
  authParams?: unknown;
  callback: (result: SessionStartedResult | SessionNotStartedResult) => void;
}
