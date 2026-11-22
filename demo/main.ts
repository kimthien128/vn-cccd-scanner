import { defineCccdScanner } from '../src/component/cccd-scanner';
import type { CccdScannerElement } from '../src/component/cccd-scanner';
import type { CccdData } from '../src/parser/cccd-parser';
import type { ScannerErrorDetail } from '../src/types';

defineCccdScanner();

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Thiếu phần tử ${selector}`);
  }
  return element;
}

const scanner = required<CccdScannerElement>('#scanner');
const startButton = required<HTMLButtonElement>('#start');
const stopButton = required<HTMLButtonElement>('#stop');
const rescanButton = required<HTMLButtonElement>('#rescan');
const statusLine = required<HTMLParagraphElement>('#status');

const fields: Record<keyof CccdData, HTMLInputElement> = {
  id: required<HTMLInputElement>('#f-id'),
  legacyId: required<HTMLInputElement>('#f-legacy'),
  name: required<HTMLInputElement>('#f-name'),
  dob: required<HTMLInputElement>('#f-dob'),
  gender: required<HTMLInputElement>('#f-gender'),
  nativePlace: required<HTMLInputElement>('#f-place'),
  issueDate: required<HTMLInputElement>('#f-issue'),
};

function setStatus(message: string, kind?: 'success' | 'error'): void {
  statusLine.textContent = message;
  if (kind) {
    statusLine.dataset.kind = kind;
  } else {
    delete statusLine.dataset.kind;
  }
}

/** Parser trả DDMMYYYY — chỉ định dạng lại lúc hiển thị, không đổi dữ liệu. */
function formatDate(value: string): string {
  const match = /^(\d{2})(\d{2})(\d{4})$/.exec(value);
  return match ? `${match[1]}/${match[2]}/${match[3]}` : value;
}

function fillForm(data: CccdData): void {
  for (const [key, input] of Object.entries(fields)) {
    const value = String(data[key as keyof CccdData] ?? '');
    input.value = key === 'dob' || key === 'issueDate' ? formatDate(value) : value;
  }
}

function clearForm(): void {
  for (const input of Object.values(fields)) {
    input.value = '';
  }
}

scanner.addEventListener('cccd-success', (event) => {
  const data = (event as CustomEvent<CccdData>).detail;
  fillForm(data);
  setStatus('Đã đọc mã QR — các trường đã được điền vào form.', 'success');
});

scanner.addEventListener('cccd-error', (event) => {
  const detail = (event as CustomEvent<ScannerErrorDetail>).detail;
  const field = detail.field ? ` (${detail.field})` : '';
  setStatus(`${detail.code}: ${detail.message}${field}`, 'error');
});

startButton.addEventListener('click', () => {
  clearForm();
  setStatus('Đang mở camera…');
  void scanner.start();
});

stopButton.addEventListener('click', () => {
  scanner.stop();
  setStatus('Đã tắt camera.');
});

rescanButton.addEventListener('click', () => {
  clearForm();
  setStatus('Đang mở lại camera…');
  void scanner.start();
});
