import {
  ChatKittySucceededResult
} from '../../chatkitty.result';
import { TextUserMessage } from '../message.model';

export type CreateMessageResult =
  CreatedTextMessageResult

export class CreatedTextMessageResult extends ChatKittySucceededResult {
  constructor(public message: TextUserMessage) {
    super();
  }
}

export function createdTextMessage(result: CreateMessageResult): result is CreatedTextMessageResult {
  return (result as CreatedTextMessageResult).message !== undefined &&
    result.message.type === 'TEXT';
}
