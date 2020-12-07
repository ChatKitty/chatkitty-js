import { StompXError } from '../stompx.error';

export declare class StompXRelayResourceRequest<R> {
  destination: string;
  onSuccess: (resource: R) => void;
  onError?: (error: StompXError) => void;
}
