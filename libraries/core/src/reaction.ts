import { Emoji } from './emoji';
import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export declare class Reaction {
	emoji: Emoji;
	user: User;
	createdTime: string;
	/** @internal */
	_relays: ReactionRelays;
}

declare class ReactionRelays {
	message: string;
}

export declare class ReactionSummary {
	emoji: Emoji;
	users: User[];
	count: number;
}

export declare class ReactToMessageRequest {
	message: Message;
	emoji: string;
}

export type ReactToMessageResult = ReactedToMessageResult | ChatKittyFailedResult;

export class ReactedToMessageResult extends ChatKittySucceededResult {
	constructor(public reaction: Reaction) {
		super();
	}
}

export declare class ListReactionsRequest {
	message: Message;
}

export type ListReactionsResult = ListReactionsSucceededResult | ChatKittyFailedResult;

export class ListReactionsSucceededResult extends ChatKittySucceededResult {
	constructor(public paginator: ChatKittyPaginator<Reaction>) {
		super();
	}
}

export declare class RemoveReactionRequest {
	message: Message;
	emoji: string;
}

export type RemoveReactionResult = RemovedReactionResult | ChatKittyFailedResult;

export class RemovedReactionResult extends ChatKittySucceededResult {
	constructor(public reaction: Reaction) {
		super();
	}
}
