import { ChatKittyError } from '../../../chatkitty.error';
import { Channel } from '../../channel/channel.model';

export class NotAGroupChannelChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super(
      'NotAGroupChannelKittyError',
      `Channel ${channel.name} is not a group channel and cannot have members.`
    );
  }
}
