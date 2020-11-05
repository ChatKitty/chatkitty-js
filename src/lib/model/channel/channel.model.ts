export declare class Channel {
  id: number;
  type: string;
  name: string;
  properties: unknown;
  _relays: ChannelRelays;
  _topics: ChannelTopics;
  _actions: ChannelActions;
}

export declare class ChannelRelays {
  self: string;
  messages: string;
}

export declare class ChannelTopics {
  self: string;
  messages: string;
}

export declare class ChannelActions {
  message: string;
  join?: string;
}
