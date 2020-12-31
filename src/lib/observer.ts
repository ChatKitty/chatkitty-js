import { ChatKittyError } from './error';

export interface ChatkittyObserver<T> {
  onNext: (value: T) => void;
  onError: (value: ChatKittyError) => void;
  onComplete: () => void;
}

export type ChatKittyUnsubscribe = () => void;
