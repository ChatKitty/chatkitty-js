import { ChatKittySucceededResult } from '../../../chatkitty.result';
import { FileUserMessage, TextUserMessage } from '../message.model';

export type SendMessageResult = SentTextMessageResult | SentFileMessageResult;

export class SentTextMessageResult extends ChatKittySucceededResult {
  constructor(public message: TextUserMessage) {
    super();
  }
}

export class SentFileMessageResult extends ChatKittySucceededResult {
  constructor(public message: FileUserMessage) {
    super();
  }
}

export function sentTextMessage(
  result: SendMessageResult
): result is SentTextMessageResult {
  return (
    (result as SentTextMessageResult).message !== undefined &&
    result.message.type === 'TEXT'
  );
}

export function sentFileMessage(
  result: SendMessageResult
): result is SentFileMessageResult {
  return (
    (result as SentFileMessageResult).message !== undefined &&
    result.message.type === 'FILE'
  );
}
