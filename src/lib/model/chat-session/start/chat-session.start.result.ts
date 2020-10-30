import {
  ChatKittySucceededResult
} from '../../chatkitty.result';
import { ChatSession } from '../chat-session.model';

export type StartChatSessionResult =
  StartedChatSessionResult

export class StartedChatSessionResult extends ChatKittySucceededResult {
  constructor(public session: ChatSession) {
    super();
  }
}

export function startedChatSession(result: StartChatSessionResult): result is StartedChatSessionResult {
  return (result as StartedChatSessionResult).session !== undefined;
}
