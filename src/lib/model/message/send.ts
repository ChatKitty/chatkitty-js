import { ChatKittyUploadProgressListener } from '../../file';
import { ChatKittyFailedResult, ChatKittySucceededResult } from '../../result';
import { Channel } from '../channel';

import { FileUserMessage, TextUserMessage } from './index';

export type SendMessageRequest =
  | SendChannelTextMessageRequest
  | SendChannelFileMessageRequest;

export declare class SendChannelTextMessageRequest {
  channel: Channel;
  body: string;
}

export declare class SendChannelFileMessageRequest {
  channel: Channel;
  file: File;
  progressListener?: ChatKittyUploadProgressListener;
}

export type SendMessageResult = SentMessageResult | ChatKittyFailedResult;

export type SentMessageResult = SentTextMessageResult | SentFileMessageResult;

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
  result: SentMessageResult
): result is SentTextMessageResult {
  return (
    (result as SentTextMessageResult).message !== undefined &&
    result.message.type === 'TEXT'
  );
}

export function sentFileMessage(
  result: SentMessageResult
): result is SentFileMessageResult {
  return (
    (result as SentFileMessageResult).message !== undefined &&
    result.message.type === 'FILE'
  );
}
