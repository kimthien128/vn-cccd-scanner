import type { QrDecodeSession, QrDecoder } from './qr-decoder';

export interface ScanSession {
  /** Dừng vòng quét. Có thể gọi nhiều lần. */
  stop(): void;
}

export interface ScanCallbacks {
  onResult: (raw: string) => void;
  onError?: (error: unknown) => void;
  /** Chỉ bắn khi tự dừng sau khi đọc được mã — không bắn khi gọi stop() từ ngoài. */
  onStopped?: () => void;
}

const DEDUP_WINDOW_MS = 1000;

/**
 * Nối stream camera với decoder, chống đọc lặp và tự dừng khi có kết quả.
 */
export async function startScan(
  video: HTMLVideoElement,
  stream: MediaStream,
  decoder: QrDecoder,
  callbacks: ScanCallbacks,
): Promise<ScanSession> {
  let stopped = false;
  let session: QrDecodeSession | null = null;
  let pendingStop = false;
  let lastRaw: string | null = null;
  let lastAt = 0;

  function stopInternal(): void {
    if (stopped) {
      return;
    }
    stopped = true;
    if (session) {
      session.stop();
    } else {
      // callback có thể chạy trước khi decode() trả về session
      pendingStop = true;
    }
  }

  const createdSession: QrDecodeSession = await decoder.decode(video, stream, (raw) => {
    if (stopped) {
      return;
    }

    const now = Date.now();
    if (raw === lastRaw && now - lastAt < DEDUP_WINDOW_MS) {
      return;
    }
    lastRaw = raw;
    lastAt = now;

    callbacks.onResult(raw);
    stopInternal();
    callbacks.onStopped?.();
  });

  session = createdSession;
  if (pendingStop) {
    pendingStop = false;
    session.stop();
  }

  return {
    stop(): void {
      stopInternal();
    },
  };
}
