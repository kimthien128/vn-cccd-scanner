export type CameraErrorCode =
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'IN_USE'
  | 'NOT_SUPPORTED'
  | 'UNKNOWN';

export class CameraError extends Error {
  readonly code: CameraErrorCode;

  constructor(code: CameraErrorCode, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'CameraError';
    this.code = code;
  }
}

export interface CameraOptions {
  deviceId?: string;
  facingMode?: 'user' | 'environment';
}

function toCameraError(error: unknown): CameraError {
  if (!(error instanceof DOMException)) {
    return new CameraError('UNKNOWN', 'Không thể khởi động camera.', error);
  }

  switch (error.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return new CameraError('PERMISSION_DENIED', 'Quyền truy cập camera bị từ chối.', error);
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return new CameraError('NOT_FOUND', 'Không tìm thấy camera nào.', error);
    case 'NotReadableError':
    case 'TrackStartError':
      return new CameraError('IN_USE', 'Camera đang được ứng dụng khác sử dụng.', error);
    default:
      return new CameraError('UNKNOWN', `Lỗi camera không xác định: ${error.name}`, error);
  }
}

export async function startCamera(
  video: HTMLVideoElement,
  options: CameraOptions = {},
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new CameraError('NOT_SUPPORTED', 'Trình duyệt không hỗ trợ getUserMedia.');
  }

  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  if (options.deviceId) {
    videoConstraints.deviceId = { exact: options.deviceId };
  } else if (options.facingMode) {
    videoConstraints.facingMode = { ideal: options.facingMode };
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
  } catch (error) {
    throw toCameraError(error);
  }

  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  try {
    await video.play();
  } catch (error) {
    // Không được để camera sáng vô chủ nếu play() thất bại.
    for (const track of stream.getTracks()) {
      track.stop();
    }
    video.srcObject = null;
    throw new CameraError('UNKNOWN', 'Không thể phát luồng video.', error);
  }

  return stream;
}

/**
 * Dừng camera và giải phóng toàn bộ track. Có thể gọi nhiều lần (idempotent).
 */
export function stopCamera(video: HTMLVideoElement, stream?: MediaStream | null): void {
  const activeStream = stream ?? (video.srcObject as MediaStream | null);

  if (activeStream) {
    for (const track of activeStream.getTracks()) {
      track.stop();
    }
  }

  video.pause();
  video.srcObject = null;
}
