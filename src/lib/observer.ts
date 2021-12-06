import { ChatKittyError } from './error';

export interface ChatKittyObserver<T> {
  onNext: (value: T) => void;
  onError: (value: ChatKittyError) => void;
  onComplete: () => void;
}

export type ChatKittyUnsubscribe = () => void;
