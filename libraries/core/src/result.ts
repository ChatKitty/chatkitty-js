import { ChatKittyError } from './error';

export abstract class ChatKittySucceededResult {
	succeeded = true as const;
	failed = false as const;
}

export class ChatKittyFailedResult {
	succeeded = false as const;
	failed = true as const;

	constructor(public error: ChatKittyError) {}
}

export type CountResult = CountSucceededResult | ChatKittyFailedResult;

export class CountSucceededResult extends ChatKittySucceededResult {
	constructor(public count: number) {
		super();
	}
}
