export interface StompXUploadProgressListener {
  onStarted?: () => void;
  onProgress?: (progress: number) => void;
  onCompleted?: () => void;
  onFailed?: () => void;
  onCancelled?: () => void;
}
