import { ChatKittyError } from './error';

export abstract class ChatKittySucceededResult {
  succeeded: true = true;
  failed: false = false;
}

export class ChatKittyFailedResult {
  succeeded: false = false;
  failed: true = true;

  constructor(public error: ChatKittyError) {}
}

export type CountResult = CountSucceededResult | ChatKittyFailedResult;

export class CountSucceededResult extends ChatKittySucceededResult {
  constructor(public count: number) {
    super();
  }
}
