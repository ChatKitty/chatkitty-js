import { Channel } from './channel';
import { Event } from "./event";
import { Keystrokes } from './keystrokes';
import { Message } from './message';
import { ChatKittyUnsubscribe } from './observer';
import { Reaction } from './reaction';
import { ReadReceipt } from './read-receipt';
import { ChatKittySucceededResult } from './result';
import { Thread } from './thread';
import { User } from './user';
export declare class ChatSession {
    channel: Channel;
    thread: Thread | null;
    end: ChatKittyUnsubscribe;
    setThread(thread: Thread): void;
}
export declare type StartChatSessionResult = StartedChatSessionResult;
export declare class StartChatSessionRequest {
    channel: Channel;
    onReceivedMessage?: (message: Message, parent?: Message) => void;
    onReceivedKeystrokes?: (keystrokes: Keystrokes) => void;
    onTypingStarted?: (user: User) => void;
    onTypingStopped?: (user: User) => void;
    onParticipantEnteredChat?: (user: User) => void;
    onParticipantLeftChat?: (user: User) => void;
    onParticipantPresenceChanged?: (user: User) => void;
    onEventTriggered?: (event: Event) => void;
    onMessageUpdated?: (message: Message) => void;
    onChannelUpdated?: (channel: Channel) => void;
    onMessageRead?: (message: Message, receipt: ReadReceipt) => void;
    onMessageReactionAdded?: (message: Message, reaction: Reaction) => void;
    onMessageReactionRemoved?: (message: Message, reaction: Reaction) => void;
    onThreadReceivedMessage?: (thread: Thread, message: Message) => void;
    onThreadReceivedKeystrokes?: (thread: Thread, keystrokes: Keystrokes) => void;
    onThreadTypingStarted?: (thread: Thread, user: User) => void;
    onThreadTypingStopped?: (thread: Thread, user: User) => void;
}
export declare class StartedChatSessionResult extends ChatKittySucceededResult {
    session: ChatSession;
    constructor(session: ChatSession);
}
