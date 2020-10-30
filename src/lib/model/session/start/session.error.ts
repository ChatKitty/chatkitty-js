import { ChatKittyError } from '../../chatkitty.error';

export class AccessDeniedSessionError extends ChatKittyError {
  constructor() {
    super('AccessDeniedSessionError', 'ChatKitty session did not start. Access denied.');
  }
}

export class NoActiveSessionChatKittyError extends ChatKittyError {
  constructor() {
    super('NoActiveSessionChatKittyError', 'You\'re not connected to ChatKitty.');
  }
}
