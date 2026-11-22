// Public entry point — chỉ export những gì consumer cần.
// ZXing, camera và decoder nội bộ không bao giờ lọt ra ngoài.

export {
  CccdScannerElement,
  DEFAULT_TAG_NAME,
  ERROR_EVENT,
  SUCCESS_EVENT,
  defineCccdScanner,
} from './component/cccd-scanner';

export { CccdParseError, parseCccdQr } from './parser/cccd-parser';
export type { CccdData, CccdParseErrorCode, Gender } from './parser/cccd-parser';

export type { ScannerErrorDetail, ScannerErrorCode } from './types';
