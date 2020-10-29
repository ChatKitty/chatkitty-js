export declare class StompXPerformActionRequest<R> {
  destination: string;
  body: unknown;
  onSuccess?: (resource: R) => void;
}
