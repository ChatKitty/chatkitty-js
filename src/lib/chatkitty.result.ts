import { ChatKittyError } from './chatkitty.error';

export interface ChatKittyResult {
  succeeded: boolean;
  cancelled: boolean;
  failed: boolean;
}

export abstract class ChatKittySucceededResult implements ChatKittyResult {
  succeeded = true;
  cancelled = false;
  failed = false;
}

export abstract class ChatKittyCancelledResult implements ChatKittyResult {
  succeeded = false;
  cancelled = true;
  failed = false;
}

export abstract class ChatKittyFailedResult implements ChatKittyResult {
  succeeded = false;
  cancelled = false;
  failed = true;
  abstract error: ChatKittyError;
}
