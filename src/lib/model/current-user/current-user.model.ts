import { UserProperties } from '../user/user.model';

export declare class CurrentUser implements UserProperties {
  displayName: string;
  displayPictureUrl: string;
  id: number;
  isGuest: string;
  name: string;
  properties: unknown;
  _relays: CurrentUserRelays;
  _topics: CurrentUserTopics;
  _actions: CurrentUserActions;
}

export declare class CurrentUserRelays {
  self: string;
  readFileAccessGrant: string;
  writeFileAccessGrant: string;
  channels: string;
  joinableChannels: string;
}

export declare class CurrentUserTopics {
  channels: string;
  notifications: string;
}

export declare class CurrentUserActions {
  update: string;
  createChannel: string;
}
