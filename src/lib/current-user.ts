import {
  ChatKittyUploadProgressListener,
  CreateChatKittyFileProperties,
} from './file';
import {
  ChatKittyFailedResult,
  ChatKittyResult,
  ChatKittySucceededResult
} from './result';
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
  threads: string;
  calls: string;
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
  | ChatKittyResult<GetCurrentUserSuccessfulResult>
  | GetCurrentUserSuccessfulResult
  | ChatKittyFailedResult;

export class GetCurrentUserSuccessfulResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export type UpdateCurrentUserResult =
  | ChatKittyResult<UpdatedCurrentUserResult>
  | UpdatedCurrentUserResult
  | ChatKittyFailedResult;

export class UpdatedCurrentUserResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export declare class UpdateCurrentUserDisplayPictureRequest {
  file: CreateChatKittyFileProperties;
  progressListener?: ChatKittyUploadProgressListener;
}

export type UpdateCurrentUserDisplayPictureResult =
  | ChatKittyResult<UpdatedCurrentUserDisplayPictureResult>
  | UpdatedCurrentUserDisplayPictureResult
  | ChatKittyFailedResult;

export class UpdatedCurrentUserDisplayPictureResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}
