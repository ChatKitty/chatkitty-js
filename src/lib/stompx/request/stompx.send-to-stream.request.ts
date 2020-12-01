import { StompXError } from '../stompx.error';

export declare class StompXSendToStreamRequest<R> {
  stream: string;
  grant: string;
  blob: Blob;
  properties?: Map<string, string>;
  onSuccess?: (resource: R) => void;
  onError?: (error: StompXError) => void;
}
