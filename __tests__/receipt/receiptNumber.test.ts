import { describe, it, expect } from 'vitest';
import {
  getNextReceiptNumber,
  isValidReceiptNumber,
  BASE_RECEIPT_NUMBER,
} from '@/src/lib/receipt/receiptNumber';

describe('receiptNumber utility', () => {
  it('returns 2056 when no receipts exist or array is empty', () => {
    expect(getNextReceiptNumber([])).toBe('2056');
    expect(getNextReceiptNumber(null)).toBe('2056');
    expect(getNextReceiptNumber(undefined)).toBe('2056');
  });

  it('calculates the next sequential receipt number from existing records', () => {
    const receipts = [
      { form_data: { receiptNo: '2056' } },
      { form_data: { receiptNo: '2057' } },
      { form_data: { receiptNo: '2093' } },
      { form_data: { receiptNo: '2094' } },
    ];
    expect(getNextReceiptNumber(receipts)).toBe('2095');
  });

  it('handles unordered receipt lists and calculates max + 1', () => {
    const receipts = [
      { form_data: { receiptNo: '2094' } },
      { form_data: { receiptNo: '2056' } },
      { form_data: { receiptNo: '2088' } },
    ];
    expect(getNextReceiptNumber(receipts)).toBe('2095');
  });

  it('handles gaps caused by deleted receipts without number collisions', () => {
    // If receipts 2056 and 2094 exist (e.g. 2080 was deleted), length is 2,
    // but next number MUST still be 2095 (not 2056 + 2 = 2058).
    const receipts = [{ form_data: { receiptNo: '2056' } }, { form_data: { receiptNo: '2094' } }];
    expect(getNextReceiptNumber(receipts)).toBe('2095');
  });

  it('ignores invalid, non-numeric, or missing receipt numbers', () => {
    const receipts = [
      { form_data: { receiptNo: '' } },
      { form_data: {} },
      { form_data: null },
      { form_data: { receiptNo: 'invalid-string' } },
      { form_data: { receiptNo: '2060' } },
    ];
    expect(getNextReceiptNumber(receipts)).toBe('2061');
  });

  it('handles receipts with numeric receiptNo types', () => {
    const receipts = [{ form_data: { receiptNo: 2056 } }, { form_data: { receiptNo: 2094 } }];
    expect(getNextReceiptNumber(receipts)).toBe('2095');
  });

  it('validates receipt number format with isValidReceiptNumber', () => {
    expect(isValidReceiptNumber('2095')).toBe(true);
    expect(isValidReceiptNumber(2095)).toBe(true);
    expect(isValidReceiptNumber('')).toBe(false);
    expect(isValidReceiptNumber('abc')).toBe(false);
    expect(isValidReceiptNumber(null)).toBe(false);
    expect(isValidReceiptNumber(undefined)).toBe(false);
    expect(isValidReceiptNumber(-5)).toBe(false);
    expect(isValidReceiptNumber('0')).toBe(false);
  });
});
