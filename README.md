# vn-cccd-scanner

Thư viện frontend quét mã QR trên CCCD Việt Nam bằng webcam. Không framework, chạy hoàn toàn trong trình duyệt.

## Cài đặt

```bash
npm install vn-cccd-scanner
```

## Dùng nhanh

```js
import { defineCccdScanner } from 'vn-cccd-scanner';

defineCccdScanner();
```

```html
<vn-cccd-scanner facing-mode="environment"></vn-cccd-scanner>
<button id="start">Bật camera</button>

<script type="module">
  const scanner = document.querySelector('vn-cccd-scanner');
  scanner.addEventListener('cccd-success', (e) => console.log(e.detail));
  scanner.addEventListener('cccd-error', (e) => console.error(e.detail));
  document.querySelector('#start').addEventListener('click', () => scanner.start());
</script>
```

Sau khi đọc thành công: phát tiếng "tít", hiện dấu ✓ và **tự dừng camera**. Gọi `scanner.start()` lại để quét tiếp.

## API

| Thành phần                | Kiểu            | Ghi chú                                                                          |
| ------------------------- | --------------- | -------------------------------------------------------------------------------- |
| `defineCccdScanner(tag?)` | function        | Đăng ký custom element; gọi nhiều lần không lỗi. Tag mặc định `vn-cccd-scanner`. |
| `start()`                 | `Promise<void>` | Xin quyền camera rồi bắt đầu quét. Phải gọi sau user gesture.                    |
| `stop()`                  | `void`          | Dừng quét và giải phóng camera.                                                  |
| `destroy()`               | `void`          | Dừng vĩnh viễn, không thể `start()` lại.                                         |
| `facing-mode`             | attribute       | `environment` (mặc định) hoặc `user`.                                            |
| `cccd-success`            | event           | `CustomEvent<CccdData>` — dữ liệu đã parse.                                      |
| `cccd-error`              | event           | `CustomEvent<ScannerErrorDetail>` — `{ code, message, field? }`.                 |

`data-state` trên element: `idle` · `scanning` · `success` · `error` — dùng để tự style qua `::part(...)`.

Lỗi parse (QR không phải CCCD) → báo `cccd-error` nhưng **vẫn quét tiếp**. Lỗi camera → dừng hẳn.

### Dùng parser riêng

```js
import { parseCccdQr } from 'vn-cccd-scanner';

const data = parseCccdQr(rawQr);
// { id, legacyId?, name, dob, gender, nativePlace, issueDate }
```

Ngày giữ nguyên dạng `DDMMYYYY`. Mã lỗi: `EMPTY_INPUT`, `INVALID_FIELD_COUNT`, `INVALID_ID`, `INVALID_LEGACY_ID`, `INVALID_NAME`, `INVALID_DOB`, `INVALID_GENDER`, `INVALID_ISSUE_DATE`, cùng `CameraError` (`PERMISSION_DENIED`, `NOT_FOUND`, `IN_USE`, `NOT_SUPPORTED`) và `SCAN_FAILED`.

## Định dạng QR CCCD

Chuỗi 7 trường phân tách bằng `|`:

```text
<Số CCCD 12 số>|<CMND cũ 9 số hoặc rỗng>|<Họ tên>|<DOB DDMMYYYY>|<Nam|Nữ>|<Field 6>|<Ngày cấp DDMMYYYY>
```

Ví dụ (dữ liệu giả):

```text
001090123456|123456789|Nguyễn Văn A|12011990|Nam|Tổ 1, Phường Bến Nghé, Quận 1|01012021
```

Field 6 được lưu thành `nativePlace`. CAKE gọi là _quê quán_, một số nguồn pháp lý gọi là _địa chỉ thường trú_ — thư viện giữ nguyên văn bản, không giải thích ngữ nghĩa.

## Trình duyệt & bản quyền

Cần `getUserMedia` → chạy trên `https://` hoặc `localhost`. Decoder dùng `@zxing/browser` (MIT) + `@zxing/library` (Apache-2.0), được cài tự động qua `dependencies` (không đóng gói vào bundle). Repo này dùng license MIT.

## Quyền riêng tư & giới hạn

- Không gửi dữ liệu đi đâu, không lưu vào `localStorage`/`indexedDB`, không dùng mạng.
- Chỉ giải mã QR — **không** xác thực thật/giả, không OCR, không đọc chip NFC, không kết nối API định danh.
- Payload phải đúng 7 trường; payload 6 trường bản cũ bị từ chối thay vì đoán.

## Phát triển

```bash
npm install
npm run dev        # demo tại http://localhost:5173
npm test           # 26 unit test (parser, scanner, camera)
npm run typecheck
npm run lint
npm run build      # dist/ : ESM + CJS + type declarations
```

Kiểm tra tay quan trọng: từ chối quyền, không có camera, camera bận, QR thường (báo lỗi nhưng vẫn quét), quét lại, đóng tab lúc đang quét.

## License

MIT © 2026 kimthien128
