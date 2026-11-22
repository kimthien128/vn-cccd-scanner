export type Gender = 'Nam' | 'Nữ';

export interface CccdData {
  id: string;
  legacyId?: string;
  name: string;
  /** DDMMYYYY */
  dob: string;
  gender: Gender;
  /** Field 6 — xem ghi chú trong plan về quê quán / địa chỉ thường trú. */
  nativePlace: string;
  /** DDMMYYYY */
  issueDate: string;
}

export type CccdParseErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_FIELD_COUNT'
  | 'INVALID_ID'
  | 'INVALID_LEGACY_ID'
  | 'INVALID_NAME'
  | 'INVALID_DOB'
  | 'INVALID_GENDER'
  | 'INVALID_ISSUE_DATE';

export class CccdParseError extends Error {
  readonly code: CccdParseErrorCode;
  readonly field?: string;

  constructor(code: CccdParseErrorCode, field: string | undefined, message: string) {
    super(message);
    this.name = 'CccdParseError';
    this.code = code;
    this.field = field;
  }
}

const EXPECTED_FIELD_COUNT = 7;
const ID_PATTERN = /^[0-9]{12}$/;
const LEGACY_ID_PATTERN = /^[0-9]{9}$/;
const DATE_PATTERN = /^([0-9]{2})([0-9]{2})([0-9]{4})$/;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function splitPayload(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new CccdParseError('EMPTY_INPUT', undefined, 'Chuỗi QR rỗng.');
  }

  const fields = trimmed.split('|');
  while (fields.length > 0 && fields[fields.length - 1] === '') {
    fields.pop();
  }

  if (fields.length !== EXPECTED_FIELD_COUNT) {
    throw new CccdParseError(
      'INVALID_FIELD_COUNT',
      undefined,
      `Cần đúng ${EXPECTED_FIELD_COUNT} trường, nhận được ${fields.length}.`,
    );
  }

  return fields;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(month: number, year: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1] ?? 0;
}

function validateDate(
  value: string,
  code: 'INVALID_DOB' | 'INVALID_ISSUE_DATE',
  field: string,
): void {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw new CccdParseError(code, field, `${field} phải có dạng DDMMYYYY.`);
  }

  const day = Number(match[1] ?? 0);
  const month = Number(match[2] ?? 0);
  const year = Number(match[3] ?? 0);

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(month, year)) {
    throw new CccdParseError(code, field, `${field} không phải ngày hợp lệ.`);
  }
}

/** Chuyển chuỗi QR CCCD thành object có kiểu, ném CccdParseError nếu dữ liệu sai. */
export function parseCccdQr(raw: string): CccdData {
  const [id, legacyId, name, dob, gender, nativePlace, issueDate] = splitPayload(raw);

  if (!id || !ID_PATTERN.test(id)) {
    throw new CccdParseError('INVALID_ID', 'id', 'Số CCCD phải gồm đúng 12 chữ số.');
  }

  let legacyIdValue: string | undefined;
  if (legacyId) {
    if (!LEGACY_ID_PATTERN.test(legacyId)) {
      throw new CccdParseError(
        'INVALID_LEGACY_ID',
        'legacyId',
        'Số CMND cũ phải gồm đúng 9 chữ số.',
      );
    }
    legacyIdValue = legacyId;
  }

  if (!name || !name.trim()) {
    throw new CccdParseError('INVALID_NAME', 'name', 'Họ tên không được rỗng.');
  }

  if (!dob) {
    throw new CccdParseError('INVALID_DOB', 'dob', 'Ngày sinh không được rỗng.');
  }
  validateDate(dob, 'INVALID_DOB', 'dob');

  if (gender !== 'Nam' && gender !== 'Nữ') {
    throw new CccdParseError('INVALID_GENDER', 'gender', 'Giới tính phải là Nam hoặc Nữ.');
  }

  if (!issueDate) {
    throw new CccdParseError('INVALID_ISSUE_DATE', 'issueDate', 'Ngày cấp không được rỗng.');
  }
  validateDate(issueDate, 'INVALID_ISSUE_DATE', 'issueDate');

  return {
    id,
    legacyId: legacyIdValue,
    name,
    dob,
    gender,
    nativePlace: nativePlace ?? '',
    issueDate,
  };
}
