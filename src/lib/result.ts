import { ChatKittyError } from './error';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ChatKittyResult<S extends ChatKittySucceededResult> {
  succeeded: boolean;
  cancelled: boolean;
  failed: boolean;
}

export abstract class ChatKittySucceededResult {
  succeeded: true = true;
  cancelled: false = false;
  failed: false = false;
}

export abstract class ChatKittyCancelledResult {
  succeeded: false = false;
  cancelled: true = true;
  failed: false = false;
}

export class ChatKittyFailedResult {
  succeeded: false = false;
  cancelled: false = false;
  failed: true = true;

  constructor(public error: ChatKittyError) {}
}

export type GetCountResult =
  | GetCountSucceedResult
  | ChatKittyFailedResult;

export class GetCountSucceedResult extends ChatKittySucceededResult {
  constructor(public count: number) {
    super();
  }
}

export function succeeded<R extends ChatKittySucceededResult>(
  result: ChatKittyResult<R>
): result is R {
  return result.succeeded;
}

export function failed<R extends ChatKittyFailedResult>(
  result: ChatKittyResult<never>
): result is R {
  return result.failed;
}

export function cancelled<R extends ChatKittyCancelledResult>(
  result: ChatKittyResult<never>
): result is R {
  return result.cancelled;
}
