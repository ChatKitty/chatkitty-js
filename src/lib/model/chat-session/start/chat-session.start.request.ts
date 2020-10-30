import { Channel } from '../../channel/channel.model';
import { Message } from '../../message/message.model';

export declare class StartChatSessionRequest {
  channel: Channel;
  onReceivedMessage?: (message: Message) => void;
}
