import { ChatKittyError } from '../../chatkitty.error';
import { Channel } from '../channel.model';

export class ChannelNotPubliclyJoinableChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super('ChannelNotPubliclyJoinableChatKittyError', `The channel ${channel.name} can't be joined without an invite.`);
  }
}
