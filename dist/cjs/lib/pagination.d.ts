import StompX, { StompXError } from '../stompx';
import { ChatKittyError } from './error';
export declare class ChatKittyPaginator<I> {
    items: I[];
    private stompX;
    private contentName;
    private prevRelay?;
    private nextRelay?;
    private parameters?;
    private mapper?;
    private asyncMapper?;
    static createInstance<I>(request: CreatePaginatorRequest<I>): Promise<ChatKittyPaginator<I>>;
    private constructor();
    get hasPrevPage(): boolean;
    get hasNextPage(): boolean;
    prevPage(): Promise<ChatKittyPaginator<I>>;
    nextPage(): Promise<ChatKittyPaginator<I>>;
    private getPage;
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
export declare class PageOutOfBoundsError extends ChatKittyError {
    constructor();
}
