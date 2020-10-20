import { ChatKittyError } from './chatkitty.error';

export interface ChatKittyResult {
  wasSuccessful: boolean;
  wasCancelled: boolean;
  isError: boolean;
}

export abstract class ChatKittySuccessfulResult implements ChatKittyResult {
  wasSuccessful = true;
  wasCancelled = false;
  isError = false;
}

export abstract class ChatKittyCancelledResult implements ChatKittyResult {
  wasSuccessful = false;
  wasCancelled = true;
  isError = false;
}

export abstract class ChatKittyErrorResult implements ChatKittyResult {
  wasSuccessful = false;
  wasCancelled = false;
  isError = true;
  abstract error: ChatKittyError;
}
