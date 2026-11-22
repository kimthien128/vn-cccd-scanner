/**
 * Lớp trừu tượng cho decoder QR — không lộ chi tiết của ZXing ra bên ngoài.
 */
export interface QrDecodeSession {
  /** Dừng vòng quét. Nên gọi được nhiều lần. */
  stop(): void;
}

export interface QrDecoder {
  /**
   * Bắt đầu giải mã QR từ video. Stream đã được tạo ở Step 2,
   * decoder không tự xin quyền camera.
   *
   * `onResult` chỉ được gọi khi có chuỗi QR giải mã được.
   */
  decode(
    video: HTMLVideoElement,
    stream: MediaStream,
    onResult: (raw: string) => void,
  ): Promise<QrDecodeSession>;
}
