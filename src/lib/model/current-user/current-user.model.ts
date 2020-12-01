export declare class CurrentUser {
  id: number;
  name: string;
  displayPictureUrl: string;
  properties: unknown;
  _relays: CurrentUserRelays;
  _topics: CurrentUserTopics;
  _actions: CurrentUserActions;
}

export declare class CurrentUserRelays {
  self: string;
  fileAccessGrant: string;
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
