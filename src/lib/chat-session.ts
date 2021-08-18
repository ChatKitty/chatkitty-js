import { Channel } from './channel';
import { Keystrokes } from './keystrokes';
import { Message } from './message';
import { ChatKittyUnsubscribe } from './observer';
import { Reaction } from './reaction';
import { ReadReceipt } from './read-receipt';
import { ChatKittySucceededResult } from './result';
import { User } from './user';

export declare class ChatSession {
  channel: Channel;
  end: ChatKittyUnsubscribe;
}

export type StartChatSessionResult = StartedChatSessionResult;

export declare class StartChatSessionRequest {
  channel: Channel;
  onReceivedMessage?: (message: Message, parent?: Message) => void;
  onReceivedKeystrokes?: (keystrokes: Keystrokes) => void;
  onTypingStarted?: (user: User) => void;
  onTypingStopped?: (user: User) => void;
  onParticipantEnteredChat?: (user: User) => void;
  onParticipantLeftChat?: (user: User) => void;
  onParticipantPresenceChanged?: (user: User) => void;
  onMessageUpdated?: (message: Message) => void;
  onChannelUpdated?: (channel: Channel) => void;
  onMessageRead?: (message: Message, receipt: ReadReceipt) => void;
  onMessageReactionAdded?: (message: Message, reaction: Reaction) => void;
  onMessageReactionRemoved?: (message: Message, reaction: Reaction) => void;
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
