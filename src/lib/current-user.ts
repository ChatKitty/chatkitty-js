import {
  ChatKittyUploadProgressListener,
  CreateChatKittyFileProperties,
} from './file';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { BaseUser } from './user';

export type CurrentUser = BaseUser & {
  _relays: CurrentUserRelays;
  _topics: CurrentUserTopics;
  _actions: CurrentUserActions;
  _streams: CurrentUserStreams;
};

export declare class CurrentUserRelays {
  self: string;
  readFileAccessGrant: string;
  writeFileAccessGrant: string;
  channelsCount: string;
  channels: string;
  joinableChannels: string;
  unreadChannelsCount: string;
  unreadChannels: string;
  unreadMessagesCount: string;
  contactsCount: string;
  contacts: string;
  userBlockListItems: string;
}

export declare class CurrentUserTopics {
  self: string;
  channels: string;
  messages: string;
  notifications: string;
  contacts: string;
  participants: string;
  users: string;
  reactions: string;
}

export declare class CurrentUserActions {
  update: string;
  createChannel: string;
  updateDisplayPicture: string;
}

export declare class CurrentUserStreams {
  displayPicture: string;
}

export type GetCurrentUserResult =
  | GetCurrentUserSuccessfulResult
  | ChatKittyFailedResult;

export class GetCurrentUserSuccessfulResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export type UpdateCurrentUserResult =
  | UpdatedCurrentUserResult
  | ChatKittyFailedResult;

export class UpdatedCurrentUserResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export function updatedCurrentUser(
  result: UpdateCurrentUserResult
): result is UpdatedCurrentUserResult {
  return (result as UpdatedCurrentUserResult).user !== undefined;
}

export declare class UpdateCurrentUserDisplayPictureRequest {
  file: CreateChatKittyFileProperties;
  progressListener?: ChatKittyUploadProgressListener;
}

export type UpdateCurrentUserDisplayPictureResult =
  | UpdatedCurrentUserResult
  | ChatKittyFailedResult;

export class UpdatedCurrentUserDisplayPictureResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export function updatedCurrentUserDisplayPicture(
  result: UpdateCurrentUserDisplayPictureResult
): result is UpdatedCurrentUserDisplayPictureResult {
  return (result as UpdatedCurrentUserDisplayPictureResult).user !== undefined;
}
