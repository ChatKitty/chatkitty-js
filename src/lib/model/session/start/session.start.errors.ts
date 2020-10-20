import { ChatKittyError } from '../../chatkitty.error';

export class SessionNotStartedError extends ChatKittyError {
  constructor() {
    super('SessionNotStarted', 'ChatKitty session has not started.');
  }
}
