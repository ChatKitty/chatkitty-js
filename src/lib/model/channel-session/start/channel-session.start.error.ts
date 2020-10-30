import { Channel } from '../../channel/channel.model';
import { ChatKittyError } from '../../chatkitty.error';

export class NoActiveChannelSessionChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super('NoActiveChannelSessionChatKittyError', `You haven't started a session for the channel ${channel.name}.`);
  }
}
