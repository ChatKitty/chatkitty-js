export declare class StompXListenForEventRequest<R> {
  topic: string;
  event: string;
  onSuccess: (resource: R) => void;
}
