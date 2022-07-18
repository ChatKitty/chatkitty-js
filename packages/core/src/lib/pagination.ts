import StompX, { StompXError, StompXPage } from './stompx';

import { ChatKittyError } from './error';

export class ChatKittyPaginator<I> {
  static async createInstance<I>(
    request: CreatePaginatorRequest<I>
  ): Promise<ChatKittyPaginator<I>> {
    const page = await new Promise<StompXPage>((resolve, reject) => {
      request.stompX.relayResource<StompXPage>({
        destination: request.relay,
        parameters: request.parameters,
        onSuccess: (resource) => resolve(resource),
        onError: (error) => reject(error),
      });
    });

    let items: I[] = [];

    if (page._embedded) {
      items = page._embedded[request.contentName] as I[];
    }

    const mapper = request.mapper;

    const asyncMapper = request.asyncMapper;

    if (mapper) {
      items = items.map((item) => mapper(item));
    } else if (asyncMapper) {
      const mappedItems: I[] = [];

      for (const item of items) {
        mappedItems.concat(await asyncMapper(item));
      }

      items = mappedItems;
    }

    return new ChatKittyPaginator<I>(
      items,
      request.stompX,
      request.contentName,
      page._relays.prev,
      page._relays.next,
      request.parameters,
      mapper,
      asyncMapper
    );
  }

  private constructor(
    public items: I[],
    private stompX: StompX,
    private contentName: string,
    private prevRelay?: string,
    private nextRelay?: string,
    private parameters?: Record<string, unknown>,
    private mapper?: (item: I) => I,
    private asyncMapper?: (item: I) => Promise<I>
  ) {}

  get hasPrevPage(): boolean {
    return !!this.prevRelay;
  }

  get hasNextPage(): boolean {
    return !!this.nextRelay;
  }

  async prevPage(): Promise<ChatKittyPaginator<I>> {
    return this.getPage(this.prevRelay);
  }

  async nextPage(): Promise<ChatKittyPaginator<I>> {
    return this.getPage(this.nextRelay);
  }

  private async getPage(relay?: string): Promise<ChatKittyPaginator<I>> {
    const page = await new Promise<StompXPage>((resolve, reject) => {
      if (relay) {
        this.stompX.relayResource<StompXPage>({
          destination: relay,
          parameters: this.parameters,
          onSuccess: (resource) => resolve(resource),
          onError: (error) => reject(error),
        });
      } else {
        reject(new PageOutOfBoundsError());
      }
    });

    let items: I[] = [];

    if (page._embedded) {
      items = page._embedded[this.contentName] as I[];
    }

    const mapper = this.mapper;

    const asyncMapper = this.asyncMapper;

    if (mapper) {
      items = items.map((item) => mapper(item));
    } else if (asyncMapper) {
      const mappedItems: I[] = [];

      for (const item of items) {
        mappedItems.concat(await asyncMapper(item));
      }

      items = mappedItems;
    }

    return new ChatKittyPaginator<I>(
      items,
      this.stompX,
      this.contentName,
      page._relays.prev,
      page._relays.next,
      this.parameters,
      this.mapper,
      this.asyncMapper
    );
  }
}

export declare class CreatePaginatorRequest<I> {
  stompX: StompX;
  relay: string;
  contentName: string;
  parameters?: Record<string, unknown>;
  mapper?: (item: I) => I;
  asyncMapper?: (item: I) => Promise<I>;
  onError?: (error: StompXError) => void;
}

export class PageOutOfBoundsError extends ChatKittyError {
  constructor() {
    super(
      'PageOutOfBoundsError',
      "You've requested a page that doesn't exists."
    );
  }
}
