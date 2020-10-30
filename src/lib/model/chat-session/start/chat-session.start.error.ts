import { Channel } from '../../channel/channel.model';
import { ChatKittyError } from '../../chatkitty.error';

export class NoActiveChatSessionChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super('NoActiveChatSessionChatKittyError', `You haven't started a chat session for the channel ${channel.name}.`);
  }
}
