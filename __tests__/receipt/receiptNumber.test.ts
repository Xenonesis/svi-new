import { describe, it, expect } from 'vitest';
import {
  getNextReceiptNumber,
  getNextReceiptNumberFromDb,
  verifyAndAssignUniqueReceiptNumber,
  isValidReceiptNumber,
  type ReceiptDatabaseClient,
} from '@/src/lib/receipt/receiptNumber';

describe('receiptNumber utility', () => {
  it('returns 2056 when no receipts exist or array is empty', () => {
    expect(getNextReceiptNumber([])).toBe('2056');
    expect(getNextReceiptNumber(null)).toBe('2056');
    expect(getNextReceiptNumber(undefined)).toBe('2056');
  });
  it('skips permanently reserved receipt number 2999', () => {
    expect(getNextReceiptNumber([{ form_data: { receiptNo: '2998' } }])).toBe('3000');
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

  it('skips receipts marked as trashed in metadata', () => {
    const receipts = [
      { form_data: { receiptNo: '2056' } },
      { form_data: { receiptNo: '2094' }, metadata: { is_trashed: true } },
      { form_data: { receiptNo: '2060' } },
    ];
    expect(getNextReceiptNumber(receipts)).toBe('2061');
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

  it('fetches and calculates next receipt number from database client', async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            limit: async () => ({
              data: [{ form_data: { receiptNo: '2100' } }, { form_data: { receiptNo: '2105' } }],
              error: null,
            }),
            filter: async () => ({
              data: [],
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReceiptDatabaseClient;

    const nextNo = await getNextReceiptNumberFromDb(mockSupabase);
    expect(nextNo).toBe('2106');
  });

  it('accepts requested receipt number when no active collision exists', async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            limit: async () => ({
              data: [],
              error: null,
            }),
            filter: async () => ({
              data: [],
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReceiptDatabaseClient;

    const result = await verifyAndAssignUniqueReceiptNumber(mockSupabase, '2148');
    expect(result).toBe('2148');
  });

  it('re-allocates next sequence when requested number collides with an active receipt', async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            filter: async () => ({
              data: [{ id: 'doc-1', metadata: {} }],
              error: null,
            }),
            limit: async () => ({
              data: [{ form_data: { receiptNo: '2140' } }, { form_data: { receiptNo: '2147' } }],
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReceiptDatabaseClient;

    const result = await verifyAndAssignUniqueReceiptNumber(mockSupabase, '2147');
    expect(result).toBe('2148');
  });

  it('allows reusing a number if previous matching record was trashed', async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            filter: async () => ({
              data: [{ id: 'doc-trashed', metadata: { is_trashed: true } }],
              error: null,
            }),
            limit: async () => ({
              data: [],
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReceiptDatabaseClient;

    const result = await verifyAndAssignUniqueReceiptNumber(mockSupabase, '2148');
    expect(result).toBe('2148');
  });
  it('never assigns permanently reserved receipt number 2999', async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            filter: async () => ({ data: [], error: null }),
            limit: async () => ({
              data: [{ form_data: { receiptNo: '2998' } }],
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReceiptDatabaseClient;

    const result = await verifyAndAssignUniqueReceiptNumber(mockSupabase, '2999');
    expect(result).toBe('3000');
  });
});
