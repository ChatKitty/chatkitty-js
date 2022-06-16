export default class StompX {
    private readonly host;
    private readonly wsScheme;
    private readonly httpScheme;
    private readonly rxStompConfig;
    private readonly axios;
    private readonly topics;
    private readonly pendingActions;
    private readonly pendingRelayErrors;
    private readonly pendingActionErrors;
    private readonly eventHandlers;
    private rxStomp;
    initialized: boolean;
    constructor(configuration: StompXConfiguration);
    connect<U>(request: StompXConnectRequest<U>): void;
    relayResource<R>(request: StompXRelayResourceRequest<R>): void;
    listenToTopic(request: StompXListenToTopicRequest): () => void;
    listenForEvent<R>(request: StompXListenForEventRequest<R>): () => void;
    sendAction<R>(request: StompXSendActionRequest<R>): void;
    sendToStream<R>(request: StompXSendToStreamRequest<R>): void;
    disconnect(request: StompXDisconnectRequest): void;
    private guardConnected;
    private static dataUriToFile;
    private static generateSubscriptionId;
    private static generateReceipt;
}
export declare class StompXConfiguration {
    isSecure: boolean;
    host: string;
    isDebug: boolean;
}
export declare class StompXConnectRequest<U> {
    apiKey: string;
    username: string;
    authParams?: unknown;
    onSuccess: (user: U, writeFileGrant: string, readFileGrant: string) => void;
    onConnected: (user: U) => void;
    onConnectionLost: () => void;
    onConnectionResumed: () => void;
    onError: (error: StompXError) => void;
}
export declare class StompXDisconnectRequest {
    onSuccess: () => void;
    onError: (e: unknown) => void;
}
export declare class StompXListenForEventRequest<R> {
    topic: string;
    event: string;
    onSuccess: (resource: R) => void;
}
export declare class StompXListenToTopicRequest {
    topic: string;
    onSuccess?: () => void;
}
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
export declare class StompXRelayParameters {
    [key: string]: unknown;
}
export declare class StompXSendActionRequest<R> {
    destination: string;
    body: unknown;
    events?: string[];
    onSent?: () => void;
    onSuccess?: (resource: R) => void;
    onError?: (error: StompXError) => void;
}
export declare class StompXRelayResourceRequest<R> {
    destination: string;
    parameters?: StompXRelayParameters;
    onSuccess: (resource: R) => void;
    onError?: (error: StompXError) => void;
}
export declare class StompXSendToStreamRequest<R> {
    stream: string;
    grant: string;
    file: File | {
        uri: string;
        name: string;
    };
    properties?: Map<string, unknown>;
    onSuccess?: (resource: R) => void;
    onError?: (error: StompXError) => void;
    progressListener?: StompXUploadProgressListener;
}
export declare class StompXEvent<R> {
    type: string;
    version: string;
    resource: R;
}
export declare class StompXError {
    error: string;
    message: string;
    timestamp: string;
}
export declare class StompXEventHandler<R> {
    event: string;
    onSuccess: (resource: R) => void;
}
export interface StompXUploadProgressListener {
    onStarted?: () => void;
    onProgress?: (progress: number) => void;
    onCompleted?: () => void;
    onFailed?: () => void;
    onCancelled?: () => void;
}
