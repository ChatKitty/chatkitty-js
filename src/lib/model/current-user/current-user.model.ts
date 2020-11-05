export declare class CurrentUser {
  id: number;
  name: string;
  displayPictureUrl: string;
  _relays: CurrentUserRelays;
  _topics: CurrentUserTopics;
  _actions: CurrentUserActions;
}

export declare class CurrentUserRelays {
  self: string;
  channels: string;
  joinableChannels: string;
}

export declare class CurrentUserTopics {
  channels: string;
  notifications: string;
}

export declare class CurrentUserActions {
  createChannel: string;
}
