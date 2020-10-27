export declare class Page<M> {
  _embedded?: M;
  _relays: PageRelays;
}

export declare class PageRelays {
  self: string;
  next?: string;
}
