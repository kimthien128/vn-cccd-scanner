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
const result = required<HTMLPreElement>('#result');

scanner.addEventListener('cccd-success', (event) => {
  const data = (event as CustomEvent<CccdData>).detail;
  result.textContent = JSON.stringify(data, null, 2);
});

scanner.addEventListener('cccd-error', (event) => {
  const detail = (event as CustomEvent<ScannerErrorDetail>).detail;
  const field = detail.field ? ` (${detail.field})` : '';
  result.textContent = `${detail.code}: ${detail.message}${field}`;
});

startButton.addEventListener('click', () => {
  void scanner.start();
});

stopButton.addEventListener('click', () => {
  scanner.stop();
});
