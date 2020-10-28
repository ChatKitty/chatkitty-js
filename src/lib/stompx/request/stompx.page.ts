export declare class StompXPage {
  _embedded?: Record<string, unknown>;
  page: StompXPageMetadata;
  _relays: StompXPageRelays;
}

export declare class StompXPageMetadata {
  size: number;
  totalElement: number;
  totalPages: number;
  number: number;
}

export declare class StompXPageRelays {
  first?: string;
  prev?: string;
  self: string;
  next?: string;
  last?: string;
}
