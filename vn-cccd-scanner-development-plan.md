# Plan phát triển `vn-cccd-scanner`

> **Mục tiêu:** Tự tay xây dựng một module mã nguồn mở quét QR CCCD Việt
> Nam bằng webcam, vừa học đúng trình tự phát triển một thư viện
> frontend, vừa tạo repository GitHub có thể dùng và tham khảo được
> trong cộng đồng.

## 1. Định hướng dự án

### MVP

Người dùng mở chức năng quét trên website → đưa QR CCCD vào khung hình →
thư viện nhận diện và giải mã → phát tiếng xác nhận → tự dừng webcam →
trả dữ liệu cho ứng dụng tích hợp.

MVP tập trung vào **QR CCCD**, không mở rộng thành hệ thống định danh
công dân.

### Ngoài phạm vi MVP

-   OCR chữ in trên mặt CCCD.
-   Đọc chip NFC.
-   Backend, database hoặc lưu trữ dữ liệu công dân.
-   Kết nối API định danh/xác thực quốc gia.
-   AI nhận diện hoặc xử lý ảnh.
-   Cam kết xác thực tính thật/giả của CCCD.

## 2. Tech stack đã thống nhất

-   **TypeScript:** ngôn ngữ chính, định nghĩa API và kiểu dữ liệu.
-   **Web APIs:** `getUserMedia`, video, canvas, audio.
-   **ZXing Browser:** thư viện giải mã QR từ camera.
-   **TypeScript parser:** chuyển chuỗi QR thành dữ liệu có cấu trúc.
-   **Web Components:** cung cấp component độc lập framework.
-   **Vite:** dev server, demo và build thư viện.
-   **npm:** đóng gói và phát hành package.
-   **Git/GitHub:** version control, issue, release và cộng đồng.

Tên package/repository `vn-cccd-scanner` là tên tạm; kiểm tra tính khả
dụng trước khi publish.

## 3. Nguyên tắc học và cách làm

Dự án này không thực hiện theo kiểu giao AI tạo lần lượt toàn bộ file.
Mỗi bước nên theo chu trình:

1.  **Tìm hiểu vấn đề:** đọc tài liệu chính thức hoặc source của thư
    viện liên quan.
2.  **Tự thiết kế:** viết vài dòng mô tả cách giải quyết, API hoặc luồng
    dữ liệu.
3.  **Tự code:** triển khai phần nhỏ nhất có thể chạy được.
4.  **Tự kiểm tra:** thử tình huống bình thường, lỗi và biên.
5.  **Nhờ AI review:** hỏi về bug, thiết kế, edge case hoặc cách đơn
    giản hóa; không yêu cầu tạo cả module thay mình.
6.  **Ghi lại điều học được:** cập nhật README/notes hoặc commit với
    thông điệp rõ ràng.

AI đóng vai trò **mentor, reviewer và người giải thích**, không phải
người viết thay toàn bộ dự án.

## 4. Các giai đoạn phát triển

### Step 0 --- Khảo sát và xác định hợp đồng dữ liệu

**Tự làm** - Tìm hiểu cấu trúc QR CCCD từ nguồn đáng tin cậy và các ví
dụ hợp pháp. - Xác định dữ liệu đầu vào/đầu ra, trường nào có thể thiếu
hoặc không hợp lệ. - Xác định thư viện QR decoder và kiểm tra license,
tình trạng bảo trì, API browser. - Viết MVP và các giới hạn bảo mật.

**Đầu ra** - `docs/qr-data-format.md` - Bảng field và ví dụ dữ liệu đã
ẩn danh. - Quyết định kỹ thuật ngắn (ADR) cho decoder và component
model.

**Không làm** - Không tự suy đoán format QR từ một ví dụ duy nhất. -
Không commit ảnh hoặc dữ liệu CCCD thật.

### Step 1 --- Khởi tạo repository và môi trường

**Tự làm** - Tạo repository GitHub, license, `.gitignore`. - Khởi tạo
TypeScript + Vite. - Cấu hình lint/format và script cơ bản. - Tạo demo
page trống, xác nhận dev server và build hoạt động.

**Đầu ra** - Repository chạy được. - Các lệnh `dev`, `build`,
`typecheck` (và `test` khi đã thiết lập test).

**Mục tiêu học** - Hiểu cấu trúc một package frontend thay vì chỉ cấu
trúc một ứng dụng.

### Step 2 --- Thử webcam bằng Web APIs thuần

**Tự làm** - Xin quyền camera bằng
`navigator.mediaDevices.getUserMedia`. - Hiển thị stream trong thẻ
video. - Xử lý trường hợp người dùng từ chối quyền, không có camera hoặc
camera đang được ứng dụng khác sử dụng. - Viết hàm dừng stream và giải
phóng toàn bộ track.

**Đầu ra** - Demo bật/tắt camera ổn định, chưa cần QR.

**Mục tiêu học** - Nắm lifecycle của camera và quyền trình duyệt trước
khi thêm thư viện.

### Step 3 --- Tích hợp QR decoder

**Tự làm** - Đọc API của ZXing Browser. - Kết nối decoder với video
stream. - Hiển thị kết quả QR thô trong demo. - Chống xử lý lặp cùng một
QR trong nhiều frame. - Chủ động dừng vòng quét khi thành công.

**Đầu ra** - Webcam đọc được QR thông thường. - Decoder được bọc sau một
interface nhỏ để có thể thay thư viện sau này.

**Mục tiêu học** - Hiểu phần nào do mình quản lý, phần nào do dependency
đảm nhiệm.

### Step 4 --- Viết CCCD parser độc lập

**Tự làm** - Viết parser nhận chuỗi QR và trả về object có kiểu
TypeScript. - Kiểm tra format, số trường, kiểu dữ liệu và trường
thiếu. - Trả lỗi có mã/ý nghĩa rõ ràng; không để dữ liệu sai thành kết
quả hợp lệ. - Viết unit test cho dữ liệu hợp lệ, sai format và biên.

**Đầu ra** - `parseCccdQr()` độc lập với webcam và UI. - Test chạy được
mà không cần mở camera.

**Mục tiêu học** - Tách nghiệp vụ khỏi giao diện và thiết bị.

### Step 5 --- Thiết kế API public và Web Component

**Tự làm** - Quyết định cách khởi tạo, cấu hình, nhận kết quả và xử lý
lỗi. - Xây custom element `<vn-cccd-scanner>`. - Định nghĩa event thành
công, event lỗi và phương thức dừng/hủy. - Giữ API nhỏ, có kiểu, không
để người dùng phải biết chi tiết ZXing.

**Đầu ra** - Một ví dụ HTML/JavaScript sử dụng component. - API được ghi
rõ trước khi hoàn thiện UI.

**Mục tiêu học** - Thiết kế thư viện cho người khác sử dụng, không chỉ
cho code của chính mình.

### Step 6 --- Hoàn thiện trải nghiệm quét

**Tự làm** - Khung quét, trạng thái đang quét và trạng thái thành
công. - Beep sau khi dữ liệu hợp lệ. - Tắt camera ngay sau thành công. -
Nút quét lại và xử lý đóng component giữa chừng. - Có fallback nếu trình
duyệt không hỗ trợ audio/camera.

**Đầu ra** - Luồng hoàn chỉnh: mở → quét → xác nhận → dừng camera → trả
kết quả.

**Mục tiêu học** - Quản lý state và cleanup trong component browser.

### Step 7 --- Kiểm thử và hardening

**Tự làm** - Unit test parser. - Test API/component với mock camera hoặc
test thủ công trên thiết bị thật. - Kiểm tra QR mờ, nghiêng, ánh sáng
yếu, camera không khả dụng và quyền bị từ chối. - Kiểm tra không
quét/phát beep nhiều lần. - Kiểm tra cleanup khi unmount/đóng modal. -
Xác nhận dữ liệu không tự gửi đi hoặc lưu lại.

**Đầu ra** - Checklist test trong `docs/testing.md`. - Các lỗi đã biết
được ghi rõ.

### Step 8 --- Đóng gói thư viện

**Tự làm** - Cấu hình Vite library mode. - Xuất public entry point và
TypeScript declarations. - Kiểm tra dependency được bundle hay khai báo
external đúng cách. - Thử cài package từ file build vào một demo
consumer riêng. - Kiểm tra tree-shaking, kích thước bundle và license
dependency.

**Đầu ra** - Package cài được và sử dụng được bên ngoài repository.

### Step 9 --- Documentation và public release

**Tự làm** - README: mục đích, demo, cài đặt, quick start, API, browser
support. - Viết hướng dẫn bảo mật/quyền riêng tư và giới hạn chức
năng. - Thêm ví dụ HTML thuần; framework adapter để phiên bản sau. - Tạo
release đầu tiên, changelog và issue templates. - Chỉ publish khi đã
kiểm tra package thực tế.

**Đầu ra** - Repository đủ rõ để người lạ clone, cài, chạy và báo lỗi.

## 5. Cấu trúc thư mục dự kiến

``` text
vn-cccd-scanner/
├─ src/
│  ├─ core/
│  │  ├─ camera.ts
│  │  ├─ qr-decoder.ts
│  │  └─ scanner.ts
│  ├─ parser/
│  │  └─ cccd-parser.ts
│  ├─ component/
│  │  ├─ cccd-scanner.ts
│  │  └─ cccd-scanner.css
│  └─ index.ts
├─ demo/
├─ tests/
├─ docs/
│  ├─ qr-data-format.md
│  └─ testing.md
├─ README.md
├─ LICENSE
└─ package.json
```

Đây là cấu trúc mục tiêu, không cần tạo sẵn tất cả file từ ngày đầu. Chỉ
thêm file khi một bước phát triển thực sự cần nó.

## 6. Tiêu chí hoàn thành MVP

-   [ ] Có thể chạy demo bằng webcam trên trình duyệt hỗ trợ.
-   [ ] Đọc được QR CCCD hợp lệ theo format đã xác minh.
-   [ ] Trả dữ liệu TypeScript có cấu trúc và lỗi rõ ràng.
-   [ ] Quét thành công một lần, phát beep và tự dừng camera.
-   [ ] Có thao tác quét lại.
-   [ ] Camera được giải phóng khi đóng component hoặc xảy ra lỗi.
-   [ ] Không gửi/lưu dữ liệu CCCD ngoài ý muốn.
-   [ ] Package build được, có type declarations.
-   [ ] Có thể cài và dùng trong một project khác.
-   [ ] README đủ để người mới tích hợp mà không cần hỏi tác giả.

## 7. Quy tắc làm việc với AI trong dự án

Dùng AI cho các việc: - Giải thích API browser hoặc thuật toán chưa
rõ. - Review đoạn code mình đã viết. - Đề xuất test case và edge case. -
Phân tích lỗi từ log. - So sánh phương án kiến trúc khi có trade-off.

Tránh: - Yêu cầu AI tạo toàn bộ repository hoặc hàng loạt file ngay từ
đầu. - Copy code mà chưa hiểu lifecycle và luồng dữ liệu. - Thêm
dependency chỉ vì AI đề xuất mà chưa kiểm tra. - Để AI quyết định public
API thay mình.

**Nhịp làm việc đề xuất:** mỗi step hoàn thành bằng một commit nhỏ, có
thể giải thích được mình đã làm gì và vì sao.

## 8. Roadmap sau MVP

Chỉ cân nhắc sau khi bản đầu đã ổn định:

-   React adapter.
-   Vue/Angular usage examples.
-   Hỗ trợ QR decoder khác.
-   Tùy chỉnh UI/theme sâu hơn.
-   OCR mặt thẻ dưới dạng package/plugin riêng.
-   Benchmark và tối ưu trên nhiều webcam/trình duyệt.

------------------------------------------------------------------------

**Nguyên tắc cuối:** xây dựng theo thứ tự từ nền tảng browser → decoder
→ parser → API → UI → package → release. Đây là trình tự giúp hiểu cách
một developer tự phát triển module thực tế, thay vì chỉ hoàn thành code
bằng cách giao AI chạy từng file.

## 9. Progress log / Lịch sử sửa

> Ghi sau mỗi bước để xem tiến trình và các lần điều chỉnh.
> Định dạng: `YYYY-MM-DD — Step X — Đã làm / Quyết định / File / Lỗi đã fix`.

### 2026-11-22

- **Step 0.1 — Khảo sát format QR** (xong)
  - Đọc CAKE EN + CAKE VI + luatvietnam.vn + cand.vn.
  - Xác nhận payload 7 field phân tách bằng `|`: `id` 12 số, `legacyId` 9 số hoặc rỗng, `dob`/`issueDate` `DDMMYYYY`, `gender` `Nam`/`Nữ`.
  - Phát hiện 3 điểm rủi ro: (1) field 6 bị gọi tên khác nhau giữa các nguồn; (2) payload thực có các `|` rỗng thừa ở cuối (`...|22022023||||`); (3) cand.vn nói 6 field trong khi CAKE/luatvietnam nói 7.
  - File: chưa có — bước này là nghiên cứu thuần.

- **Step 0.2 + 0.2b — Chốt data contract** (xong)
  - Input: `raw: string` (chuỗi QR thô từ decoder). Output: `CccdData` (xem dưới).
  - Giữ ngày ở dạng `DDMMYYYY` raw, không tự chuyển sang ISO — tránh mất dữ liệu, consumer tự normalize nếu cần. API nhỏ hơn.
  - **Quyết định field 6:** đặt tên `nativePlace` theo CAKE (nguồn mô tả output decoder thực tế), nhưng tài liệu phải ghi rõ luatvietnam.vn/cand.vn gọi là "địa chỉ thường trú". Thư viện coi đây là **văn bản không giải thích ngữ nghĩa**.
  - Từ chối payload có số field không phải 7 (sau khi bỏ trailing empty). Không đoán field bị thiếu là gì — đúng nguyên tắc "không suy đoán từ một ví dụ".
  - File: chưa có; sẽ ghi đầy đủ vào `docs/qr-data-format.md` ở Step 0.4.

#### Hợp đồng dữ liệu chốt ở Step 0.2

```ts
type Gender = 'Nam' | 'Nữ';

interface CccdData {
  id: string;          // ^[0-9]{12}$
  legacyId?: string;   // ^[0-9]{9}$, undefined nếu field rỗng
  name: string;        // Unicode, giữ nguyên
  dob: string;         // DDMMYYYY, ngày có thật
  gender: Gender;      // 'Nam' | 'Nữ'
  nativePlace: string; // field 6, văn bản thô (có thể rỗng)
  issueDate: string;   // DDMMYYYY, ngày có thật
}

type CccdParseErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_FIELD_COUNT'
  | 'INVALID_ID'
  | 'INVALID_LEGACY_ID'
  | 'INVALID_NAME'          // bổ sung ở Step 4.2
  | 'INVALID_DOB'
  | 'INVALID_GENDER'
  | 'INVALID_ISSUE_DATE';

class CccdParseError extends Error {
  readonly code: CccdParseErrorCode;
  readonly field?: string;
}
```

Ánh xạ mã lỗi CAKE (`2007001`→`INVALID_ID`, `2007002`→`INVALID_LEGACY_ID`,
`2007003`→`INVALID_DOB`, `2007004`→`INVALID_GENDER`, `2007005`→`INVALID_ISSUE_DATE`).

Quy tắc parse: `trim()` ngoài cùng → `split('|')` → bỏ các segment rỗng **ở cuối** →
yêu cầu đúng 7 segment → validate từng field. Không xóa field rỗng ở giữa.

- **Step 0.3 — Chọn decoder + ADR** (xong)
  - Nguồn: npm `@zxing/browser`, GitHub `zxing-js/browser`, MDN `BarcodeDetector`, MDN browser-compat-data, npm `jsqr`, strich.io comparison (10/2026).
  - **Sửa lại giả định cũ:** `@zxing/browser` cấp **MIT**, còn `@zxing/library` (engine) cấp **Apache-2.0**. Không phải Apache-2.0 cho cả hai.
  - Quyết định: dùng `@zxing/browser`, bọc sau interface `QrDecoder`. **Không** dùng `decodeFromVideoDevice()` (ZXing sẽ tự chiếm camera) mà dùng `decodeFromStream(stream, video, callback)` để Step 2 vẫn là nơi duy nhất quản lý `getUserMedia` và track. Sẽ kiểm chữ ký hàm này ở Step 3.1.
  - **Không** dùng `BarcodeDetector` làm decoder chính: experimental, "Limited availability", Firefox không hỗ trợ, Safari tắt mặc định, Chrome chỉ partial (macOS/ChromeOS).
  - **Không** dùng `jsqr`: bản cuối 1.4.0 từ 04/2021, không còn maintain; chỉ QR, bắt tự viết vòng lặp canvas.
  - File: chưa có — ADR ghi tại đây, sẽ trích vào README ở bước cuối.

#### ADR-001 — Chọn ZXing Browser làm QR decoder

- **Trạng thái:** Accepted (22/11/2026)
- **Bối cảnh:** cần giải mã QR CCCD từ webcam, chạy hoàn toàn client, có kiểu TypeScript, license dùng được cho thương mại, còn được bảo trì.
- **Phương án so sánh:**

| Phương án | License | Tình trạng | Đánh giá |
| --- | --- | --- | --- |
| `@zxing/browser` 0.2.1 (+ `@zxing/library` 0.23.0) | MIT / Apache-2.0 | Còn phát hành bản mới (2026); chế độ maintenance, chỉ fix bug | ✅ Chọn |
| `BarcodeDetector` (native) | — | Experimental; Firefox ❌, Safari tắt mặc định, Chrome partial | ❌ Loại |
| `jsqr` 1.4.0 | Apache-2.0 | Bản cuối 04/2021, không maintain | ❌ Loại |

- **Quyết định:** `@zxing/browser`, dùng `BrowserQRCodeReader` và feed `MediaStream` do chính module tạo. Giấu hoàn toàn ZXing sau interface `QrDecoder`.
- **Hệ quả:** bundle lớn hơn một decoder QR-only; phải giữ thông báo license MIT + Apache-2.0; API public không lộ chi tiết ZXing, có thể thay decoder sau.

#### ADR-002 — Dùng Web Component làm đơn vị đóng gói

- **Trạng thái:** Accepted (22/11/2026)
- **Quyết định:** custom element `<vn-cccd-scanner>` — framework-agnostic, không kéo React/Vue vào dependency, CSS nằm trong Shadow DOM.
- **Trade-off:** khó override style từ ngoài; phải tự định nghĩa event (`cccd-success`, `cccd-error`) và method `stop()`/`destroy()` rõ ràng. Không làm adapter framework trong MVP (để roadmap).

#### Bảng field QR CCCD (chốt Step 0.4)

| # | Field (TS) | Ý nghĩa | Kiểu / validate | Bắt buộc |
| --- | --- | --- | --- | --- |
| 1 | `id` | Số định danh cá nhân | `^[0-9]{12}$` | Có |
| 2 | `legacyId` | Số CMND cũ 9 số | Rỗng → `undefined`; ngược lại `^[0-9]{9}$` | Không |
| 3 | `name` | Họ tên đầy đủ | Unicode; không rỗng sau `trim()` | Có |
| 4 | `dob` | Ngày sinh | `DDMMYYYY`, phải là ngày có thật | Có |
| 5 | `gender` | Giới tính | Đúng `Nam` hoặc `Nữ` | Có |
| 6 | `nativePlace` | Xem ghi chú dưới | Văn bản thô; **cho phép rỗng** | Có slot |
| 7 | `issueDate` | Ngày cấp | `DDMMYYYY`, phải là ngày có thật | Có |

> **Ghi chú field 6:** CAKE gọi là *quê quán*, luatvietnam.vn và cand.vn gọi là *địa chỉ/nơi thường trú*. Thư viện không phán đoán ngữ nghĩa — chỉ giữ nguyên chuỗi và đặt tên `nativePlace` theo CAKE.

#### Ví dụ payload đã ẩn danh (số và tên đều giả)

```text
# 1. Hợp lệ, đủ 7 field
001090123456|123456789|Nguyễn Văn A|12011990|Nam|Tổ 1, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh|01012021

# 2. Không có CMND cũ (field 2 rỗng) + ngày sinh nhuận
079200012345||Trần Thị B|29022000|Nữ|Xã Bình Chánh, Huyện Bình Chánh, TP. Hồ Chí Minh|15062021

# 3. Có 4 field rỗng thừa ở cuối (payload thực tế hay gặp)
026199912345|987654321|Lê Văn C|31121995|Nam|Thôn 2, Xã Đức Trọng, Huyện Đức Trọng, Tỉnh Lâm Đồng|22022023||||
```

⚠️ Không commit ảnh hoặc dữ liệu CCCD thật. Các ví dụ trên là dữ liệu giả để test parser.

#### Ngoài phạm vi MVP (nhắc lại để tránh scope creep)

OCR mặt thẻ · đọc chip NFC · backend/database/lưu trữ · kết nối API định danh quốc gia · AI xử lý ảnh · cam kết xác thực thật/giả.

- **Step 1.1 — Khởi tạo repo local** (xong)
  - File tạo: `package.json`, `.gitignore`, `LICENSE`.
  - Quyết định: tên `vn-cccd-scanner` (còn trống trên npm), `version 0.1.0`, `license MIT`, `author kimthien128`, `type: module`, chưa `git init` theo yêu cầu.
  - Môi trường: Node `v24.15.0`, npm `11.12.1`.
  - Chọn version: Vite `^8.3.8`, Vitest `^5.1.1`, ESLint `^10.15.0`, Prettier `^3.10.1`, `@typescript-eslint/*` `^8.73.0`.
  - **Lỗi đã tránh:** TypeScript bản mới nhất là 7.0.2 nhưng `@typescript-eslint@8.73` chỉ hỗ trợ `typescript >=4.8.4 <6.1.0` → dùng `^5.9.3`.
  - Scripts có sẵn: `dev`, `build`, `typecheck`, `test`, `test:watch`. Chưa có config Vite/tsconfig → `build` sẽ lỗi cho đến Step 1.2–1.4.

- **Step 1.2 — Cấu hình TypeScript + Vite** (xong)
  - File tạo: `tsconfig.json`, `vite.config.ts`.
  - `tsconfig`: `target ES2022`, `lib ES2022 + DOM + DOM.Iterable`, `module ESNext`, `moduleResolution Bundler`, `strict`, `noUnusedLocals/Parameters`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`, `isolatedModules`, `verbatimModuleSyntax`, `skipLibCheck`, `types: ["vite/client"]`; `include` = `src`, `demo`, `tests`, `vite.config.ts`.
  - **Không bật** `exactOptionalPropertyTypes` để tránh rắc rối với `legacyId?: string` khi gán `undefined` ở Step 4.
  - `vite.config.ts`: tạm thời `defineConfig({})`, library mode dời sang Step 8.
  - Quyết định demo: `index.html` ở root + `demo/main.ts`.

- **Step 1.3 — Cấu hình lint/format** (xong)
  - File tạo: `eslint.config.js`, `.prettierrc.json`, `.prettierignore`; sửa `package.json` thêm 4 script (`lint`, `lint:fix`, `format`, `format:check`).
  - ESLint 10 flat config dùng trực tiếp `@typescript-eslint/parser` + `eslint-plugin` đã cài ở 1.1 — **không thêm dependency**.
  - Chỉ lint `**/*.ts`; tắt `no-undef`/`no-unused-vars` gốc, bật bản TS tương ứng (`no-unused-vars` warn, bỏ qua đối số `_`), `no-explicit-any` warn.
  - Prettier: `singleQuote`, `semi`, `trailingComma all`, `printWidth 100`, `tabWidth 2`.

- **Step 1.4 — Demo trống + kiểm tra build** (xong)
  - File tạo: `index.html` (root), `demo/main.ts` (chỉ ghi text placeholder).
  - Sửa script `test` → `vitest run --passWithNoTests` để không báo lỗi giả khi chưa có test (test thật ở Step 4).
  - Chưa có camera/QR — đúng phạm vi Step 1.

#### Tổng kết Step 1

Repo local chạy được: `dev` / `build` / `typecheck` / `test` / `lint` / `format`. Chưa `git init` (theo yêu cầu). Chưa dependency runtime nào — ZXing sẽ thêm ở Step 3. `dist/` hiện chứa demo, Step 8 sẽ đổi sang lib build.

- **Step 2.1 — `src/core/camera.ts`, phần bật camera** (xong)
  - File tạo: `src/core/camera.ts`.
  - `CameraErrorCode`: `PERMISSION_DENIED` / `NOT_FOUND` / `IN_USE` / `NOT_SUPPORTED` / `UNKNOWN`; ánh xạ từ `DOMException.name` (`NotAllowedError`, `NotFoundError`, `NotReadableError`, …).
  - `startCamera(video, options?)`: kiểm tra `navigator.mediaDevices?.getUserMedia`, constraints 1280x720 ideal + tuỳ chọn `deviceId` (exact) hoặc `facingMode` (ideal), `audio: false`, gán `srcObject`, `muted`, `playsInline`, `await video.play()`.
  - **Lỗi đã phòng:** nếu `play()` thất bại → `track.stop()` toàn bộ + `srcObject = null` rồi mới throw, không để camera bật vô chủ.
  - Chưa có hàm dừng camera (Step 2.2).

- **Step 2.2 — Hàm dừng camera** (xong)
  - Thêm `stopCamera(video, stream?)` vào `src/core/camera.ts`: lấy stream từ tham số hoặc `video.srcObject`, `track.stop()` toàn bộ, `video.pause()`, `video.srcObject = null`.
  - Idempotent, không throw → dùng được cả ở nhánh lỗi và `disconnectedCallback` (Step 6).
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅ (không có output lỗi).
  - Thứ tự cleanup khi có decoder (Step 3): `controls.stop()` trước → `stopCamera()` sau.

- **Step 2.3 — Demo bật/tắt camera** (xong)
  - Sửa `index.html`: `<video id="preview">`, nút Bật/Tắt, `<p id="status">`, ít CSS tối thiểu; giữ nguyên `<script type="module" src="/demo/main.ts">`.
  - Sửa `demo/main.ts`: gọi `startCamera`/`stopCamera`, giữ `stream`, disable nút lúc đang xin quyền, hiện thông báo theo `CameraError.code`, lắng nghe `ended` của track (phòng trường hợp thu hồi quyền).
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅.
  - Chưa có QR — đúng phạm vi Step 2.

#### Tổng kết Step 2

Lifecycle camera nằm hoàn toàn ở `src/core/camera.ts`: một chỗ bật (`startCamera`), một chỗ tắt (`stopCamera`). Step 3 sẽ feed `MediaStream` này vào ZXing thay vì để ZXing tự mở camera.

- **Step 3.1 — Interface decoder + dependency** (xong)
  - Sửa `package.json`: thêm `dependencies.@zxing/browser = ^0.2.1` (MIT). Chưa cài — đưa lệnh `npm install` cho bạn chạy.
  - File tạo: `src/core/qr-decoder.ts` — `QrDecodeSession { stop() }` và `QrDecoder { decode(video, stream, onResult) }`.
  - Đọc source `BrowserCodeReader.ts` của ZXing, ghi nhận 3 điểm thiết kế:
    1. `decodeFromStream(stream, preview, callback)` **không gọi `getUserMedia`** → đúng ADR-001, camera vẫn do module mình quản lý.
    2. `controls.stop()` của ZXing tự `track.stop()` + `cleanVideoSource()` → `stopCamera()` của ta bị thừa nhưng vẫn idempotent, giữ lại để cleanup thống nhất.
    3. `scan()` **không tự dừng khi thành công** (vẫn `setTimeout(loop, 500)`) và callback bắn `NotFoundException` mỗi frame → Step 3.4 phải tự `stop()` khi có result hợp lệ và bỏ qua lỗi không nguy hiểm.
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅.

- **Step 3.2 — Implement ZXing** (xong)
  - File tạo: `src/core/zx-qr-decoder.ts` — `ZxQrDecoder implements QrDecoder`, dùng `BrowserQRCodeReader.decodeFromStream(stream, video, callback)`.
  - Callback chỉ gọi `onResult(result.getText())` khi có `result`; bỏ qua toàn bộ lỗi decode của ZXing.
  - Trả về session với `stop: () => controls.stop()`; chưa tự dừng khi có result (để Step 3.4).
  - **File duy nhất được import `@zxing/browser`** — các phần khác chỉ thấy `QrDecoder`.
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅.

- **Step 3.3 — Nối stream → decoder, hiện QR thô** (xong)
  - File tạo: `src/core/scanner.ts` — `startScan(video, stream, decoder, { onResult, onError? })` trả `ScanSession.stop()` có cờ `stopped` (idempotent). Chưa có dedup/tự dừng (Step 3.4).
  - Sửa `index.html`: thêm `<p id="qr-raw">`.
  - Sửa `demo/main.ts`: import `ZxQrDecoder` (demo là composition root), giữ `scanSession`, gọi `startScan()` sau khi bật camera; khi tắt → `scanSession.stop()` rồi mới `stopCamera()`; cũng dừng session trong `handleTrackEnded` và nhánh catch.
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅.
  - Chưa test thực tế với QR — đưa lệnh `npm run dev` cho bạn.

- **Step 3.4 — Chống lặp + tự dừng** (xong)
  - Sửa `src/core/scanner.ts`: giữ `lastRaw`/`lastAt`, bỏ qua cùng chuỗi trong vòng `DEDUP_WINDOW_MS = 1000`; khi có chuỗi mới → `onResult` 1 lần → `stopInternal()` → `onStopped?.()`.
  - Thêm `onStopped?` vào `ScanCallbacks`, **chỉ bắn khi tự dừng**, không bắn khi ngoài gọi `ScanSession.stop()`.
  - **Lỗi đã phòng:** callback có thể chạy trước khi `await decoder.decode()` trả session → dùng cờ `pendingStop`, gọi `session.stop()` ngay sau khi có session.
  - Sửa `demo/main.ts`: dùng `autoStopped` để tránh gán lại session đã dừng; tự cập nhật trạng thái "camera đã tự dừng".
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅.

#### Tổng kết Step 3

Chuỗi: `startCamera()` (Step 2) → `startScan()` → `QrDecoder` → `ZxQrDecoder` (duy nhất import ZXing). Decoder được thay được nhờ interface. Tự dừng + chống lặp đã có. Step 4 sẽ viết parser độc lập để validate chuỗi QR.

- **Step 4.1 — Khung parser** (xong)
  - File tạo: `src/parser/cccd-parser.ts` — `Gender`, `CccdData`, `CccdParseErrorCode` (7 mã), `CccdParseError`, `parseCccdQr()`.
  - `splitPayload()`: `trim()` → `split('|')` → bỏ field rỗng **ở cuối** → yêu cầu đúng 7 field; ném `EMPTY_INPUT` / `INVALID_FIELD_COUNT`.
  - `legacyId === ''` → `undefined`; field 6 giữ nguyên tên `nativePlace`.
  - Chưa validate nội dung từng field (Step 4.2); cast `gender as Gender` tạm thời.
  - Không import camera/decoder/UI — chạy thuần, sẵn sàng cho unit test.
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅.

- **Step 4.2 — Validation đầy đủ** (xong)
  - **Đính chính contract:** thêm mã thứ 8 `INVALID_NAME` (bảng field Step 0.4 yêu cầu name không rỗng nhưng 7 mã cũ thiếu). Đã sửa cả code block Step 0.2.
  - Validate theo thứ tự field 1→7, ném lỗi đầu tiên kèm `code` + `field`:
    `id ^[0-9]{12}$`, `legacyId ^[0-9]{9}$` hoặc rỗng→`undefined`, `name` không rỗng sau trim, `dob`/`issueDate` `DDMMYYYY` + ngày có thật, `gender` đúng `Nam`/`Nữ`.
  - `isLeapYear`: chia 4 và (không chia 100 hoặc chia 400); `29022000` hợp lệ, `29021900` không. `nativePlace` cho phép rỗng, giữ nguyên chuỗi.
  - Output vẫn giữ `DDMMYYYY` thô — không tự normalize ISO.
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅. Unit test ở Step 4.3.

- **Step 4.3 — Unit test parser** (xong)
  - File tạo: `tests/cccd-parser.test.ts` — 14 case, dùng 3 payload ẩn danh trong plan làm fixture, helper `expectParseError` kiểm tra cả `code` lẫn `field`.
  - Hợp lệ: đủ 7 field, legacy rỗng, trailing `||||`, ngày nhuận.
  - Lỗi: `EMPTY_INPUT` (rỗng/spaces), `INVALID_FIELD_COUNT` (thiếu/thừa), `INVALID_ID`, `INVALID_LEGACY_ID`, `INVALID_NAME`, `INVALID_DOB` (29021900), `INVALID_GENDER`, `INVALID_ISSUE_DATE`.
  - Tự kiểm tra: `npm test` ✅ **14/14**, `npm run typecheck` ✅, `npm run lint` ✅.

#### Tổng kết Step 4

`parseCccdQr()` hoàn toàn độc lập camera/decoder/UI — chạy và test thuần trong Node. Sẵn sàng để Step 5 gọi từ API public.

- **Step 5.1 — Thiết kế public API** (xong)
  - Chưa có file code; đặc tả được chốt tại đây, sẽ gộp vào README ở bước cuối.

#### Đặc tả API public (chốt Step 5.1)

```ts
// Web Component — API chính
<vn-cccd-scanner facing-mode="environment"></vn-cccd-scanner>

// Methods
start(): Promise<void>;
stop(): void;
destroy(): void;

// Events
cccd-success  → CustomEvent<CccdData>        // detail = kết quả đã parse
cccd-error    → CustomEvent<ScannerErrorDetail>

type ScannerErrorCode =
  | CameraErrorCode                 // PERMISSION_DENIED | NOT_FOUND | IN_USE | NOT_SUPPORTED | UNKNOWN
  | CccdParseErrorCode              // INVALID_ID | INVALID_NAME | ... (8 mã)
  | 'SCAN_FAILED';

interface ScannerErrorDetail {
  code: ScannerErrorCode;
  message: string;
  field?: string;
}

// Export từ src/index.ts ở Step 8
defineCccdScanner(tagName?: string): void;
parseCccdQr(raw: string): CccdData;
export type { CccdData, ScannerErrorDetail, ScannerErrorCode };
```

**Quyết định thiết kế:**
- Component **không tự bật camera ở `connectedCallback`** — phải gọi `start()` để xin quyền sau user gesture. `disconnectedCallback` tự cleanup.
- `facing-mode`: `environment` (mặc định) hoặc `user`.
- Consumer **không bao giờ thấy ZXing** — mọi chi tiết decoder nằm sau `QrDecoder`.
- Luồng thành công: `start()` → camera → scan → `parseCccdQr()` → emit `cccd-success` → tự dừng decode + camera.
- **Lỗi parse** (QR không phải CCCD/sai field) → emit `cccd-error` rồi **tiếp tục quét** (có thể người dùng đưa nhầm thẻ/QR khác).
- **Lỗi camera** (`PERMISSION_DENIED`, `IN_USE`, …) → emit `cccd-error` rồi **dừng hẳn**, trả về trạng thái idle.

- **Step 5.2 — Khung Web Component** (xong)
  - File tạo: `src/component/cccd-scanner.ts`, `src/component/cccd-scanner.css`.
  - CSS import dạng `?inline` (Vite) rồi chèn vào `<style>` trong Shadow DOM — phát hành dạng thư viện không phụ thuộc file CSS riêng.
  - Cấu trúc Shadow DOM: `<video>` + khung 4 góc + thanh trạng thái; expose `part="scanner|video|frame|status"` để consumer decorate có giới hạn.
  - `CccdScannerElement` chưa có `start/stop/destroy` — để Step 5.3. `connectedCallback` chỉ hiện text, **không tự bật camera** đúng quyết định 5.1.
  - `defineCccdScanner(tagName?)` có guard `customElements.get()` — gọi nhiều lần không lỗi.

- **Step 5.3 — Event + method lifecycle** (xong)
  - File tạo: `src/types.ts` — `ScannerErrorCode` (camera + parse + `SCAN_FAILED`), `ScannerErrorDetail`.
  - Viết lại `src/component/cccd-scanner.ts`:
    - `start()`: camera → scan; có cờ `starting` chặn double-start; bắt `ended` của track.
    - `handleResult()`: `parseCccdQr()` → emit `cccd-success` (detail `CccdData`); lỗi parse → emit `cccd-error` + **vẫn tiếp tục quét**.
    - `stop()` / `destroy()` / `disconnectedCallback()`: `scanSession.stop()` → `stopCamera()`; `destroy()` khoá không cho start lại; disconnect dùng `stop()` để có thể gắn lại.
    - Event `bubbles: true, composed: true` (thoát Shadow DOM); thêm `data-state="idle|scanning|success|error"`.
  - **Chưa có beep** — Step 6.
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅, `npm test` ✅ 14/14.

- **Step 5.4 — Ví dụ consumer thuần HTML/JS** (xong)
  - Sửa `index.html`: dùng `<vn-cccd-scanner id="scanner" facing-mode="environment">` thay `<video>` tự dựng; giữ 2 nút + thêm `<pre id="result">`.
  - Sửa `demo/main.ts`: chỉ còn `defineCccdScanner()`, nghe 2 event (`cccd-success` → JSON, `cccd-error` → mã/lỗi), và gọi `scanner.start()` / `scanner.stop()`. Không còn import camera/decoder trực tiếp — chứng minh API public đủ dùng.
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅. Chưa test camera thực tế — đưa `npm run dev` cho bạn.

#### Tổng kết Step 5

API public hoạt động độc lập: consumer chỉ cần `<vn-cccd-scanner>` + 2 event + `start()/stop()/destroy()`. ZXing, parser, camera đều nằm bên trong. Step 6 sẽ thêm beep, khung trạng thái và nút "Quét lại".
  - Tự kiểm tra: `npm run typecheck` ✅, `npm run lint` ✅.
