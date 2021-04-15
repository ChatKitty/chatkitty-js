export declare class ChatKittyFile {
  type: string;
  url: string;
  name: string;
  contentType: string;
  size: number;
}

export type CreateChatKittyFileProperties =
  | CreateChatKittyExternalFileProperties
  | File;

export declare class CreateChatKittyExternalFileProperties {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

export enum ChatKittyUploadResult {
  COMPLETED,
  FAILED,
  CANCELLED,
}

export interface ChatKittyUploadProgressListener {
  onStarted: () => void;
  onProgress: (progress: number) => void;
  onCompleted: (result: ChatKittyUploadResult) => void;
}
