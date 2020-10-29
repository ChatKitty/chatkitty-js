import { Channel } from './channel/channel.model';

export abstract class ChatKittyError {
  protected constructor(public type: string, public message: string) {
  }
}

export class UnknownChatKittyError extends ChatKittyError {
  constructor() {
    super('UnknownChatKittyError', 'An unknown error has occurred.');
  }
}

export class NoActiveSessionChatKittyError extends ChatKittyError {
  constructor() {
    super('NoActiveSessionChatKittyError', 'You\'re not connected to ChatKitty.');
  }
}

export class NoActiveChannelSessionChatKittyError extends ChatKittyError {
  constructor(public channel: Channel) {
    super('NoActiveChannelSessionChatKittyError', `You haven't started a session for the channel ${channel.name}.`);
  }
}

export class PageOutOfBoundsChatKittyError extends ChatKittyError {
  constructor() {
    super('PageOutOfBoundsChatKittyError', 'You\'ve requested a page that doesn\'t exists.');
  }
}
