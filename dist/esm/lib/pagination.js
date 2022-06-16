var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ChatKittyError } from './error';
export class ChatKittyPaginator {
    constructor(items, stompX, contentName, prevRelay, nextRelay, parameters, mapper, asyncMapper) {
        this.items = items;
        this.stompX = stompX;
        this.contentName = contentName;
        this.prevRelay = prevRelay;
        this.nextRelay = nextRelay;
        this.parameters = parameters;
        this.mapper = mapper;
        this.asyncMapper = asyncMapper;
    }
    static createInstance(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield new Promise((resolve, reject) => {
                request.stompX.relayResource({
                    destination: request.relay,
                    parameters: request.parameters,
                    onSuccess: (resource) => resolve(resource),
                    onError: (error) => reject(error),
                });
            });
            let items = [];
            if (page._embedded) {
                items = page._embedded[request.contentName];
            }
            const mapper = request.mapper;
            const asyncMapper = request.asyncMapper;
            if (mapper) {
                items = items.map((item) => mapper(item));
            }
            else if (asyncMapper) {
                const mappedItems = [];
                for (const item of items) {
                    mappedItems.concat(yield asyncMapper(item));
                }
                items = mappedItems;
            }
            return new ChatKittyPaginator(items, request.stompX, request.contentName, page._relays.prev, page._relays.next, request.parameters, mapper, asyncMapper);
        });
    }
    get hasPrevPage() {
        return !!this.prevRelay;
    }
    get hasNextPage() {
        return !!this.nextRelay;
    }
    prevPage() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getPage(this.prevRelay);
        });
    }
    nextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getPage(this.nextRelay);
        });
    }
    getPage(relay) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield new Promise((resolve, reject) => {
                if (relay) {
                    this.stompX.relayResource({
                        destination: relay,
                        parameters: this.parameters,
                        onSuccess: (resource) => resolve(resource),
                        onError: (error) => reject(error),
                    });
                }
                else {
                    reject(new PageOutOfBoundsError());
                }
            });
            let items = [];
            if (page._embedded) {
                items = page._embedded[this.contentName];
            }
            const mapper = this.mapper;
            const asyncMapper = this.asyncMapper;
            if (mapper) {
                items = items.map((item) => mapper(item));
            }
            else if (asyncMapper) {
                const mappedItems = [];
                for (const item of items) {
                    mappedItems.concat(yield asyncMapper(item));
                }
                items = mappedItems;
            }
            return new ChatKittyPaginator(items, this.stompX, this.contentName, page._relays.prev, page._relays.next, this.parameters, this.mapper, this.asyncMapper);
        });
    }
}
export class PageOutOfBoundsError extends ChatKittyError {
    constructor() {
        super('PageOutOfBoundsError', "You've requested a page that doesn't exists.");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvcGFnaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFFQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXpDLE1BQU0sT0FBTyxrQkFBa0I7SUErQzdCLFlBQ1MsS0FBVSxFQUNULE1BQWMsRUFDZCxXQUFtQixFQUNuQixTQUFrQixFQUNsQixTQUFrQixFQUNsQixVQUFvQyxFQUNwQyxNQUF1QixFQUN2QixXQUFxQztRQVB0QyxVQUFLLEdBQUwsS0FBSyxDQUFLO1FBQ1QsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLGNBQVMsR0FBVCxTQUFTLENBQVM7UUFDbEIsY0FBUyxHQUFULFNBQVMsQ0FBUztRQUNsQixlQUFVLEdBQVYsVUFBVSxDQUEwQjtRQUNwQyxXQUFNLEdBQU4sTUFBTSxDQUFpQjtRQUN2QixnQkFBVyxHQUFYLFdBQVcsQ0FBMEI7SUFDNUMsQ0FBQztJQXZESixNQUFNLENBQU8sY0FBYyxDQUN6QixPQUFrQzs7WUFFbEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDN0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQWE7b0JBQ3ZDLFdBQVcsRUFBRSxPQUFPLENBQUMsS0FBSztvQkFDMUIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVO29CQUM5QixTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7b0JBQzFDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztpQkFDbEMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLEtBQUssR0FBUSxF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