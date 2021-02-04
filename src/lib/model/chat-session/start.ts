import { ChatKittyError } from '../../error';
import { ChatKittySucceededResult } from '../../result';
import { Channel } from '../channel';
import { Keystrokes } from '../keystrokes';
import { Message } from '../message';
import { User } from '../user';

import { ChatSession } from './index';

export type StartChatSessionResult = StartedChatSessionResult;

export declare class StartChatSessionRequest {
  channel: Channel;
  onReceivedMessage?: (message: Message) => void;
  onReceivedKeystrokes?: (keystrokes: Keystrokes) => void;
  onTypingStarted?: (user: User) => void;
  onTypingStopped?: (user: User) => void;
  onParticipantEnteredChat?: (user: User) => void;
  onParticipantLeftChat?: (user: User) => void;
  onParticipantPresenceChanged?: (user: User) => void;
  onMessageUpdated?: (message: Message) => void;
}

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

export class NoActiveChatSessionError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'NoActiveChatSessionError',
      `You haven't started a chat session for the channel ${channel.name}.`
    );
  }
}
