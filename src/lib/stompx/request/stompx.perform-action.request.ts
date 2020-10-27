export declare class StompXPerformActionRequest<B, R> {
  destination: string;
  body: B;
  onSuccess?: (resource: R) => void;
}
