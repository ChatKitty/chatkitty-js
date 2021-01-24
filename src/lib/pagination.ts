import { ChatKittyError } from './error';
import StompX, { StompXPage } from './stompx';

export class ChatKittyPaginator<I> {
  static async createInstance<I>(
    request: CreatePaginatorRequest<I>
  ): Promise<ChatKittyPaginator<I>> {
    const page = await new Promise<StompXPage>((resolve) => {
      request.stompX.relayResource<StompXPage>({
        destination: request.relay,
        parameters: request.parameters,
        onSuccess: (resource) => resolve(resource),
      });
    });

    let items: I[] = [];

    if (page._embedded) {
      items = page._embedded[request.contentName] as I[];
    }

    const mapper = request.mapper;

    if (mapper) {
      items = items.map((item) => mapper(item));
    }

    return new ChatKittyPaginator<I>(
      items,
      request.stompX,
      request.contentName,
      page._relays.prev,
      page._relays.next,
      request.parameters,
      mapper
    );
  }

  private constructor(
    public items: I[],
    private stompX: StompX,
    private contentName: string,
    private prevRelay?: string,
    private nextRelay?: string,
    private parameters?: Record<string, unknown>,
    private mapper?: (item: I) => I
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
          onSuccess: (resource) => resolve(resource),
        });
      } else {
        reject(new PageOutOfBoundsChatKittyError());
      }
    });

    let items: I[] = [];

    if (page._embedded) {
      items = page._embedded[this.contentName] as I[];
    }

    const mapper = this.mapper;

    if (mapper) {
      items = items.map((item) => mapper(item));
    }

    return new ChatKittyPaginator<I>(
      items,
      this.stompX,
      this.contentName,
      page._relays.prev,
      page._relays.next,
      this.parameters,
      this.mapper
    );
  }
}

export declare class CreatePaginatorRequest<I>{
  stompX: StompX
  relay: string
  contentName: string
  parameters?: Record<string, unknown>
  mapper?: (item: I) => I
}

export class PageOutOfBoundsChatKittyError extends ChatKittyError {
  constructor() {
    super(
      'PageOutOfBoundsChatKittyError',
      "You've requested a page that doesn't exists."
    );
  }
}
