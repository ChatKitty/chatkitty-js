import { StompXError } from '../stompx.error';

export declare class StompXConnectRequest {
  apiKey: string;
  username: string;
  authParams?: unknown;
  onSuccess: () => void;
  onError: (error: StompXError) => void;
}
