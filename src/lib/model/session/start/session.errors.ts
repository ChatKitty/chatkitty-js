import { ChatKittyError } from '../../chatkitty.error';

export class AccessDeniedSessionError extends ChatKittyError {
  constructor() {
    super('AccessDeniedSessionError', 'ChatKitty session did not start. Access denied.');
  }
}
