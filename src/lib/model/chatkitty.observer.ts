import { ChatKittyError } from './chatkitty.error';

export interface ChatkittyObserver<T> {
  onNext: (value: T) => void
  onError: (value: ChatKittyError) => void
  onComplete: () => void
}
