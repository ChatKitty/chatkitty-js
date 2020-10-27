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
}

export declare class CurrentUserTopics {
  channels: string;
}

export declare class CurrentUserActions {
  createChannel: string;
}
