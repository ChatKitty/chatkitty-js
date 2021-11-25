import { ChatKittyError } from './error';

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

export class ChatKittyFailedResult implements ChatKittyResult {
  succeeded = false;
  cancelled = false;
  failed = true;

  constructor(public error: ChatKittyError) {}
}

export type GetCountResult = GetCountSucceedResult | ChatKittyFailedResult;

export class GetCountSucceedResult extends ChatKittySucceededResult {
  constructor(public count: number) {
    super();
  }
}

export function succeeded<R extends ChatKittySucceededResult>(
  result: ChatKittyResult
): result is R {
  return result.succeeded;
}

export function failed<R extends ChatKittyFailedResult>(
  result: ChatKittyResult
): result is R {
  return result.failed;
}

export function cancelled<R extends ChatKittyCancelledResult>(
  result: ChatKittyResult
): result is R {
  return result.cancelled;
}
