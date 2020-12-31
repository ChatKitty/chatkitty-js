import { ChatKittyError } from '../../error';
import { ChatKittySucceededResult } from '../../result';
import { Channel } from '../channel';
import { Message } from '../message';

import { ChatSession } from './index';

export declare class StartChatSessionRequest {
  channel: Channel;
  onReceivedMessage?: (message: Message) => void;
}

export type StartChatSessionResult = StartedChatSessionResult;

export class StartedChatSessionResult extends ChatKittySucceededResult {
  constructor(public session: ChatSession) {
    super();
  }
}

export function startedChatSession(
  result: StartChatSessionResult
): result is StartedChatSessionResult {
  return (result as StartedChatSessionResult).session !== undefined;
}

export class NoActiveChatSessionChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'NoActiveChatSessionChatKittyError',
      `You haven't started a chat session for the channel ${channel.name}.`
    );
  }
}
