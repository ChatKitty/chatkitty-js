import { ChatKittyError } from './error';
import StompX, { StompXPage } from './stompx';

export class ChatKittyPaginator<I> {
  static async createInstance<I>(
    stompX: StompX,
    relay: string,
    contentName: string,
    mapper?: (item: I) => I
  ): Promise<ChatKittyPaginator<I>> {
    const page = await new Promise<StompXPage>((resolve) => {
      stompX.relayResource<StompXPage>({
        destination: relay,
        onSuccess: (resource) => resolve(resource),
      });
    });

    let items: I[] = [];

    if (page._embedded) {
      items = page._embedded[contentName] as I[];
    }

    if (mapper) {
      items = items.map((item) => mapper(item));
    }

    return new ChatKittyPaginator<I>(
      items,
      stompX,
      contentName,
      page._relays.prev,
      page._relays.next,
      mapper
    );
  }

  private constructor(
    public items: I[],
    private stompX: StompX,
    private contentName: string,
    private prevRelay?: string,
    private nextRelay?: string,
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
      page._relays.next
    );
  }
}

export class PageOutOfBoundsChatKittyError extends ChatKittyError {
  constructor() {
    super(
      'PageOutOfBoundsChatKittyError',
      "You've requested a page that doesn't exists."
    );
  }
}