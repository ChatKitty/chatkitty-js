import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export declare class UserBlockedRecord {
	user: User;
	createdTime: string;
	/** @internal */
	_actions: UserBlockedRecordActions;
}

declare class UserBlockedRecordActions {
	delete: string;
}

export type ListUserBlockedRecordsResult =
	| ListUserBlockedRecordsSucceededResult
	| ChatKittyFailedResult;

export class ListUserBlockedRecordsSucceededResult extends ChatKittySucceededResult {
	constructor(public paginator: ChatKittyPaginator<UserBlockedRecord>) {
		super();
	}
}

export declare class DeleteUserBlockedRecordRequest {
	item: UserBlockedRecord;
}

export type DeleteUserBlockedRecordResult =
	| DeleteUserBlockedRecordSucceededResult
	| ChatKittyFailedResult;

export class DeleteUserBlockedRecordSucceededResult extends ChatKittySucceededResult {
	constructor(public user: User) {
		super();
	}
}
