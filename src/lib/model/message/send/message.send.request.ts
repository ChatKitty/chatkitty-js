import { ChatKittyUploadProgressListener } from '../../../chatkitty.upload';
import { Channel } from '../../channel/channel.model';

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

export function sendChannelTextMessage(
  request: SendMessageRequest
): request is SendChannelTextMessageRequest {
  return (request as SendChannelTextMessageRequest).body !== undefined;
}

export function sendChannelFileMessage(
  request: SendMessageRequest
): request is SendChannelFileMessageRequest {
  return (request as SendChannelFileMessageRequest).file !== undefined;
}
