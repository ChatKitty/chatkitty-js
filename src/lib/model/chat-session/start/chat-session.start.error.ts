import { ChatKittyError } from '../../../chatkitty.error';
import { Channel } from '../../channel/channel.model';

export class NoActiveChatSessionChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'NoActiveChatSessionChatKittyError',
      `You haven't started a chat session for the channel ${channel.name}.`
    );
  }
}
