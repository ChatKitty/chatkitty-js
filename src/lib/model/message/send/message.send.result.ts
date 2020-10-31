import {
  ChatKittySucceededResult
} from '../../chatkitty.result';
import { TextUserMessage } from '../message.model';

export type SendMessageResult =
  SentTextMessageResult

export class SentTextMessageResult extends ChatKittySucceededResult {
  constructor(public message: TextUserMessage) {
    super();
  }
}

export function sentTextMessage(result: SendMessageResult): result is SentTextMessageResult {
  return (result as SentTextMessageResult).message !== undefined &&
    result.message.type === 'TEXT';
}
