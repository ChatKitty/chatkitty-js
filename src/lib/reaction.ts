import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export declare class Reaction {
  user: User;
  createdTime: string;
  _relays: ReactionRelays;
}

export declare class ReactionRelays {
  message: string;
}

export declare class ReactToMessageRequest {
  message: Message;
  emoji: string;
}

export type ReactToMessageResult =
  | ReactedToMessageResult
  | ChatKittyFailedResult;

export class ReactedToMessageResult extends ChatKittySucceededResult {
  constructor(public reaction: Reaction) {
    super();
  }
}

export declare class GetReactionsRequest {
  message: Message;
}

export type GetReactionsResult =
  | GetReactionsSucceededResult
  | ChatKittyFailedResult;

export class GetReactionsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Reaction>) {
    super();
  }
}

export declare class RemoveReactionRequest {
  message: Message;
}

export type RemoveReactionResult =
  | RemovedReactionResult
  | ChatKittyFailedResult;

export class RemovedReactionResult extends ChatKittySucceededResult {
  constructor(public reaction: Reaction) {
    super();
  }
}
