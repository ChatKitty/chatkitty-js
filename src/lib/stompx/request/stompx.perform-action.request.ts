import { StompXError } from '../stompx.error';

export declare class StompXPerformActionRequest<R> {
  destination: string;
  body: unknown;
  onSuccess?: (resource: R) => void;
  onError?: (error: StompXError) => void;
}
