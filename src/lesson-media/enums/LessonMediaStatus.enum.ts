export enum LessonMediaStatus {
  PENDING = 'pending', // FE requested upload session, not started yet
  UPLOADING = 'uploading', // Upload in progress (to TPStreams)
  PROCESSING = 'processing', // TPStreams is transcoding / processing
  READY = 'ready', // Video is fully ready to play
  FAILED = 'failed', // Upload or processing failed
  CANCELLED = 'cancelled', // Admin/teacher cancelled
}
