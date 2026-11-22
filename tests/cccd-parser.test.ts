import { describe, expect, it } from 'vitest';
import type { CccdParseErrorCode } from '../src/parser/cccd-parser';
import { CccdParseError, parseCccdQr } from '../src/parser/cccd-parser';

// Dữ liệu giả — không phải CCCD thật.
const VALID =
  '001090123456|123456789|Nguyễn Văn A|12011990|Nam|Tổ 1, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh|01012021';
const NO_LEGACY =
  '079200012345||Trần Thị B|29022000|Nữ|Xã Bình Chánh, Huyện Bình Chánh, TP. Hồ Chí Minh|15062021';
const TRAILING_EMPTY =
  '026199912345|987654321|Lê Văn C|31121995|Nam|Thôn 2, Xã Đức Trọng, Huyện Đức Trọng, Tỉnh Lâm Đồng|22022023||||';

const FIELDS = VALID.split('|');

function payloadWith(index: number, value: string): string {
  const fields = [...FIELDS];
  fields[index] = value;
  return fields.join('|');
}

function expectParseError(raw: string, code: CccdParseErrorCode, field?: string): void {
  let thrown: unknown;
  try {
    parseCccdQr(raw);
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(CccdParseError);
  if (thrown instanceof CccdParseError) {
    expect(thrown.code).toBe(code);
    if (field) {
      expect(thrown.field).toBe(field);
    }
  }
}

describe('parseCccdQr', () => {
  describe('payload hợp lệ', () => {
    it('trả về object đúng 7 trường, giữ nguyên chuỗi ngày', () => {
      expect(parseCccdQr(VALID)).toEqual({
        id: '001090123456',
        legacyId: '123456789',
        name: 'Nguyễn Văn A',
        dob: '12011990',
        gender: 'Nam',
        nativePlace: 'Tổ 1, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        issueDate: '01012021',
      });
    });

    it('field CMND cũ rỗng → legacyId undefined', () => {
      expect(parseCccdQr(NO_LEGACY).legacyId).toBeUndefined();
    });

    it('bỏ qua các field rỗng ở cuối', () => {
      expect(parseCccdQr(TRAILING_EMPTY)).toMatchObject({
        id: '026199912345',
        issueDate: '22022023',
      });
    });

    it('chấp nhận ngày sinh nhuận 29/02/2000', () => {
      expect(parseCccdQr(NO_LEGACY).dob).toBe('29022000');
    });
  });

  describe('payload sai', () => {
    it('chuỗi rỗng → EMPTY_INPUT', () => {
      expectParseError('', 'EMPTY_INPUT');
    });

    it('chuỗi chỉ có khoảng trắng → EMPTY_INPUT', () => {
      expectParseError('   ', 'EMPTY_INPUT');
    });

    it('thiếu một field → INVALID_FIELD_COUNT', () => {
      expectParseError(FIELDS.slice(0, 6).join('|'), 'INVALID_FIELD_COUNT');
    });

    it('thừa field không rỗng → INVALID_FIELD_COUNT', () => {
      expectParseError(`${VALID}|extra`, 'INVALID_FIELD_COUNT');
    });

    it('id sai → INVALID_ID + field=id', () => {
      expectParseError(payloadWith(0, '00109012345'), 'INVALID_ID', 'id');
    });

    it('CMND cũ sai → INVALID_LEGACY_ID + field=legacyId', () => {
      expectParseError(payloadWith(1, '12345678'), 'INVALID_LEGACY_ID', 'legacyId');
    });

    it('tên rỗng → INVALID_NAME + field=name', () => {
      expectParseError(payloadWith(2, ''), 'INVALID_NAME', 'name');
    });

    it('ngày không tồn tại → INVALID_DOB + field=dob', () => {
      expectParseError(payloadWith(3, '29021900'), 'INVALID_DOB', 'dob');
    });

    it('giới tính sai → INVALID_GENDER + field=gender', () => {
      expectParseError(payloadWith(4, 'nam'), 'INVALID_GENDER', 'gender');
    });

    it('ngày cấp sai → INVALID_ISSUE_DATE + field=issueDate', () => {
      expectParseError(payloadWith(6, '3112202x'), 'INVALID_ISSUE_DATE', 'issueDate');
    });
  });
});
