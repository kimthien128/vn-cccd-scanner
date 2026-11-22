import styles from './cccd-scanner.css?inline';
import { playSuccessBeep, prepareBeep } from '../core/beep';
import { CameraError, startCamera, stopCamera } from '../core/camera';
import type { QrDecoder } from '../core/qr-decoder';
import { ZxQrDecoder } from '../core/zx-qr-decoder';
import { startScan } from '../core/scanner';
import type { ScanSession } from '../core/scanner';
import { CccdParseError, parseCccdQr } from '../parser/cccd-parser';
import type { ScannerErrorDetail } from '../types';

export const DEFAULT_TAG_NAME = 'vn-cccd-scanner';

type ScannerState = 'idle' | 'scanning' | 'success' | 'error';

export const SUCCESS_EVENT = 'cccd-success';
export const ERROR_EVENT = 'cccd-error';

function emitDetail<T>(target: HTMLElement, name: string, detail: T): void {
  target.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, composed: true }));
}

/** Custom element quét QR CCCD: tự quản lý camera, decoder và parser. */
export class CccdScannerElement extends HTMLElement {
  protected readonly shadow: ShadowRoot;
  protected readonly video: HTMLVideoElement;
  protected readonly statusText: HTMLSpanElement;
  protected readonly icon: HTMLSpanElement;

  private readonly decoder: QrDecoder = new ZxQrDecoder();
  private stream: MediaStream | null = null;
  private scanSession: ScanSession | null = null;
  private trackEndedHandler: (() => void) | null = null;
  private starting = false;
  private destroyed = false;
  private state: ScannerState = 'idle';

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>${styles}</style>
      <div part="scanner">
        <video part="video" autoplay playsinline muted></video>
        <div class="frame" part="frame" aria-hidden="true">
          <span class="corner corner--tl"></span>
          <span class="corner corner--tr"></span>
          <span class="corner corner--bl"></span>
          <span class="corner corner--br"></span>
        </div>
        <div class="overlay" part="overlay" aria-hidden="true">
          <span>✓</span>
          <span>Đã đọc thành công</span>
        </div>
        <p class="status" part="status">
          <span class="icon" aria-hidden="true">•</span>
          <span class="status-text">Sẵn sàng</span>
        </p>
      </div>
    `;

    this.video = this.shadow.querySelector('video')!;
    this.statusText = this.shadow.querySelector('.status-text')!;
    this.icon = this.shadow.querySelector('.icon')!;
  }

  connectedCallback(): void {
    if (this.state === 'idle') {
      this.setStatus('Sẵn sàng — gọi start() để bật camera');
    }
  }

  disconnectedCallback(): void {
    // Dùng stop() thay vì destroy() để phần tử có thể được gắn lại sau này.
    this.stop();
  }

  /** Bật camera và bắt đầu quét. Gọi lại khi đang chạy sẽ bị bỏ qua. */
  async start(): Promise<void> {
    if (this.destroyed || this.starting || this.scanSession) {
      return;
    }

    prepareBeep();
    this.starting = true;
    this.setState('scanning');
    this.setStatus('Đang mở camera…');

    try {
      const stream = await startCamera(this.video, { facingMode: this.getFacingMode() });
      this.stream = stream;

      const track = stream.getVideoTracks()[0];
      if (track) {
        this.trackEndedHandler = () => this.handleTrackEnded();
        track.addEventListener('ended', this.trackEndedHandler, { once: true });
      }

      let autoStopped = false;
      const created = await startScan(this.video, stream, this.decoder, {
        onResult: (raw) => this.handleResult(raw),
        onStopped: () => {
          autoStopped = true;
          this.handleAutoStop();
        },
      });

      this.scanSession = autoStopped ? null : created;
      if (!autoStopped) {
        this.setStatus('Đang quét — đưa QR CCCD vào khung hình.');
      }
    } catch (error) {
      const detail = this.toErrorDetail(error);
      emitDetail<ScannerErrorDetail>(this, ERROR_EVENT, detail);
      this.cleanup();
      this.setState('error');
      this.setStatus(detail.message);
    } finally {
      this.starting = false;
    }
  }

  /** Dừng quét và giải phóng camera. */
  stop(): void {
    this.cleanup();
    if (this.state !== 'success') {
      this.setState('idle');
    }
    this.setStatus('Đã dừng.');
  }

  /** Dừng vĩnh viễn — phần tử không thể start() lại. */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.cleanup();
    this.setState('idle');
  }

  protected getFacingMode(): 'user' | 'environment' {
    return this.getAttribute('facing-mode') === 'user' ? 'user' : 'environment';
  }

  protected setStatus(message: string): void {
    this.statusText.textContent = message;
  }

  private setState(state: ScannerState): void {
    this.state = state;
    this.setAttribute('data-state', state);

    const icons: Record<ScannerState, string> = {
      idle: '•',
      scanning: '◌',
      success: '✓',
      error: '!',
    };
    this.icon.textContent = icons[state];
  }

  private handleResult(raw: string): void {
    try {
      const data = parseCccdQr(raw);
      this.setState('success');
      this.setStatus('Đọc thành công.');
      playSuccessBeep();
      emitDetail(this, SUCCESS_EVENT, data);
    } catch (error) {
      // QR không phải CCCD → báo lỗi nhưng vẫn tiếp tục quét.
      const detail = this.toErrorDetail(error);
      emitDetail<ScannerErrorDetail>(this, ERROR_EVENT, detail);
      this.setState('error');
      this.setStatus(detail.message);
    }
  }

  private handleAutoStop(): void {
    this.cleanup();
  }

  private handleTrackEnded(): void {
    this.emitErrorMessage('SCAN_FAILED', 'Camera đã dừng.');
    this.cleanup();
    this.setState('idle');
    this.setStatus('Camera đã dừng.');
  }

  private cleanup(): void {
    this.scanSession?.stop();
    this.scanSession = null;

    if (this.trackEndedHandler && this.stream) {
      const track = this.stream.getVideoTracks()[0];
      track?.removeEventListener('ended', this.trackEndedHandler);
    }
    this.trackEndedHandler = null;

    stopCamera(this.video, this.stream);
    this.stream = null;
  }

  private emitErrorMessage(code: ScannerErrorDetail['code'], message: string): void {
    emitDetail<ScannerErrorDetail>(this, ERROR_EVENT, { code, message });
  }

  private toErrorDetail(error: unknown): ScannerErrorDetail {
    if (error instanceof CccdParseError) {
      return { code: error.code, message: error.message, field: error.field };
    }
    if (error instanceof CameraError) {
      return { code: error.code, message: error.message };
    }
    if (error instanceof Error) {
      return { code: 'SCAN_FAILED', message: error.message };
    }
    return { code: 'SCAN_FAILED', message: 'Lỗi không xác định.' };
  }
}

/** Đăng ký custom element. Gọi nhiều lần không bị lỗi. */
export function defineCccdScanner(tagName: string = DEFAULT_TAG_NAME): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, CccdScannerElement);
  }
}
