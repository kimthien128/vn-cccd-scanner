import type { CameraErrorCode } from './core/camera';
import type { CccdParseErrorCode } from './parser/cccd-parser';

/** Mã lỗi public: gộp lỗi camera, lỗi parse và lỗi quét chung. */
export type ScannerErrorCode = CameraErrorCode | CccdParseErrorCode | 'SCAN_FAILED';

export interface ScannerErrorDetail {
  code: ScannerErrorCode;
  message: string;
  field?: string;
}
