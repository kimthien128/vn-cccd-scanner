import { BrowserQRCodeReader } from '@zxing/browser';
import type { QrDecodeSession, QrDecoder } from './qr-decoder';

/**
 * Implementation của QrDecoder dùng ZXing Browser.
 * Đây là file duy nhất được phép import @zxing/browser.
 */
export class ZxQrDecoder implements QrDecoder {
  async decode(
    video: HTMLVideoElement,
    stream: MediaStream,
    onResult: (raw: string) => void,
  ): Promise<QrDecodeSession> {
    const reader = new BrowserQRCodeReader();

    const controls = await reader.decodeFromStream(stream, video, (result) => {
      // ZXing bắn NotFoundException ở hầu hết frame — chỉ xử lý khi có kết quả.
      if (result) {
        onResult(result.getText());
      }
    });

    return {
      stop: () => controls.stop(),
    };
  }
}
