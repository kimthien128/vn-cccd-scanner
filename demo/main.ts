import { CameraError, startCamera, stopCamera } from '../src/core/camera';
import type { QrDecoder } from '../src/core/qr-decoder';
import { ZxQrDecoder } from '../src/core/zx-qr-decoder';
import { startScan } from '../src/core/scanner';
import type { ScanSession } from '../src/core/scanner';

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Thiếu phần tử ${selector}`);
  }
  return element;
}

const video = required<HTMLVideoElement>('#preview');
const startButton = required<HTMLButtonElement>('#start');
const stopButton = required<HTMLButtonElement>('#stop');
const status = required<HTMLParagraphElement>('#status');
const qrRaw = required<HTMLParagraphElement>('#qr-raw');

const decoder: QrDecoder = new ZxQrDecoder();

let stream: MediaStream | null = null;
let scanSession: ScanSession | null = null;

function setRunning(running: boolean): void {
  startButton.disabled = running;
  stopButton.disabled = !running;
}

function messageForError(error: unknown): string {
  if (error instanceof CameraError) {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return 'Quyền camera bị từ chối. Hãy cho phép trong thanh địa chỉ.';
      case 'NOT_FOUND':
        return 'Không tìm thấy camera nào.';
      case 'IN_USE':
        return 'Camera đang được ứng dụng khác sử dụng.';
      case 'NOT_SUPPORTED':
        return 'Trình duyệt không hỗ trợ getUserMedia (cần HTTPS hoặc localhost).';
      default:
        return error.message;
    }
  }
  return error instanceof Error ? error.message : 'Lỗi không xác định.';
}

function handleTrackEnded(): void {
  scanSession?.stop();
  scanSession = null;
  if (!stream) {
    return;
  }
  stream = null;
  setRunning(false);
  status.textContent = 'Camera đã dừng (track kết thúc).';
}

startButton.addEventListener('click', async () => {
  startButton.disabled = true;
  status.textContent = 'Đang xin quyền camera…';

  try {
    stream = await startCamera(video);
    const track = stream.getVideoTracks()[0];
    track?.addEventListener('ended', handleTrackEnded, { once: true });

    let autoStopped = false;
    const created = await startScan(video, stream, decoder, {
      onResult: (raw) => {
        qrRaw.textContent = raw;
      },
      onStopped: () => {
        autoStopped = true;
        scanSession = null;
        stream = null;
        setRunning(false);
        status.textContent = 'Đã đọc mã QR — camera đã tự dừng.';
      },
    });
    scanSession = autoStopped ? null : created;

    if (!autoStopped) {
      setRunning(true);
      status.textContent = 'Camera đang chạy — đưa QR vào khung hình.';
    }
  } catch (error) {
    scanSession?.stop();
    scanSession = null;
    stream = null;
    setRunning(false);
    status.textContent = messageForError(error);
  }
});

stopButton.addEventListener('click', () => {
  // Dừng vòng decode trước, rồi mới giải phóng camera.
  scanSession?.stop();
  scanSession = null;
  stopCamera(video, stream);
  stream = null;
  setRunning(false);
  status.textContent = 'Đã tắt camera.';
});
