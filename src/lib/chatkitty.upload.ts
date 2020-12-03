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
