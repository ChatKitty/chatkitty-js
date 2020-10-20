import { ChatKittyError } from '../../chatkitty.error';

export class SessionAccessDeniedError extends ChatKittyError {
  constructor() {
    super('SessionAccessDeniedError', 'ChatKitty session did not start. Access denied.');
  }
}
