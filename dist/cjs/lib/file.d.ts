export declare class ChatKittyFile {
    type: string;
    url: string;
    name: string;
    contentType: string;
    size: number;
}
export declare type CreateChatKittyFileProperties = CreateChatKittyExternalFileProperties | File | {
    name: string;
    type: string;
    uri: string;
    size: number;
};
export declare class CreateChatKittyExternalFileProperties {
    url: string;
    name: string;
    contentType: string;
    size: number;
}
export declare enum ChatKittyUploadResult {
    COMPLETED = 0,
    FAILED = 1,
    CANCELLED = 2
}
export interface ChatKittyUploadProgressListener {
    onStarted: () => void;
    onProgress: (progress: number) => void;
    onCompleted: (result: ChatKittyUploadResult) => void;
}
