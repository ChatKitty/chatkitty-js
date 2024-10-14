import { CurrentUser } from './current-user';
import { ChatKittyError } from './error';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';

export declare class UserSession {
	user: CurrentUser;
}

export type StartSessionResult = StartedSessionResult | ChatKittyFailedResult;

export declare class StartSessionRequest {
	username: string;
	authParams?: unknown;
}

export class StartedSessionResult extends ChatKittySucceededResult {
	constructor(public session: UserSession) {
		super();
	}
}

export class SessionActiveError extends ChatKittyError {
	constructor() {
		super(
			'SessionActiveError',
			'A user session is already active and must be ended before this instance can start a new session.',
		);
	}
}

export class NoActiveSessionError extends ChatKittyError {
	constructor() {
		super('NoActiveSessionError', "You're not connected to ChatKitty.");
	}
}
