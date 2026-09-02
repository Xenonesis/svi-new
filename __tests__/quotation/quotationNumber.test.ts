import { describe, it, expect, vi } from 'vitest';
import {
  formatQuotationNumber,
  isValidQuotationNumber,
  parseQuotationNumber,
  computeNextQuotationNumber,
  generateQuotationNumber,
  getNextQuotationNumberFromDb,
  type QuotationDocLike,
} from '@/src/lib/quotation/quotationNumber';

describe('quotationNumber utilities', () => {
  describe('formatQuotationNumber', () => {
    it('formats with default date and sequence 1', () => {
      const result = formatQuotationNumber('2026-09-02', 1);
      expect(result).toBe('SVI-QTN-20260902-0001');
    });

    it('handles dates without dashes and pads 4 digits', () => {
      expect(formatQuotationNumber('20260902', 42)).toBe('SVI-QTN-20260902-0042');
      expect(formatQuotationNumber('20260902', 1005)).toBe('SVI-QTN-20260902-1005');
    });

    it('enforces minimum sequence of 1', () => {
      expect(formatQuotationNumber('20260902', 0)).toBe('SVI-QTN-20260902-0001');
      expect(formatQuotationNumber('20260902', -10)).toBe('SVI-QTN-20260902-0001');
    });
  });

  describe('isValidQuotationNumber', () => {
    it('validates standard quotation numbers', () => {
      expect(isValidQuotationNumber('SVI-QTN-20260902-0001')).toBe(true);
      expect(isValidQuotationNumber('SVI-QTN-20260902-12345')).toBe(true);
    });

    it('rejects invalid or empty quotation numbers', () => {
      expect(isValidQuotationNumber('')).toBe(false);
      expect(isValidQuotationNumber('   ')).toBe(false);
      expect(isValidQuotationNumber(null)).toBe(false);
      expect(isValidQuotationNumber(undefined)).toBe(false);
      expect(isValidQuotationNumber('QTN-20260902-0001')).toBe(false);
      expect(isValidQuotationNumber('SVI-QTN-2026-0001')).toBe(false);
      expect(isValidQuotationNumber('SVI-QTN-20260902-')).toBe(false);
      expect(isValidQuotationNumber('SVI-QTN-20260902-abc')).toBe(false);
    });
  });

  describe('parseQuotationNumber', () => {
    it('extracts datePart and sequence', () => {
      const parsed = parseQuotationNumber('SVI-QTN-20260902-0042');
      expect(parsed).toEqual({
        datePart: '20260902',
        sequence: 42,
      });
    });

    it('returns null for invalid quotation numbers', () => {
      expect(parseQuotationNumber('invalid')).toBeNull();
      expect(parseQuotationNumber('')).toBeNull();
      expect(parseQuotationNumber(null)).toBeNull();
    });
  });

  describe('computeNextQuotationNumber', () => {
    it('starts with sequence 0001 when no existing records exist', () => {
      const nextNo = computeNextQuotationNumber([], '2026-09-02');
      expect(nextNo).toBe('SVI-QTN-20260902-0001');
    });

    it('increments highest sequence for matching date', () => {
      const existing = ['SVI-QTN-20260902-0001', 'SVI-QTN-20260902-0002', 'SVI-QTN-20260902-0003'];
      const nextNo = computeNextQuotationNumber(existing, '2026-09-02');
      expect(nextNo).toBe('SVI-QTN-20260902-0004');
    });

    it('handles unordered records and objects with form_data.quotationNo', () => {
      const existing: QuotationDocLike[] = [
        { form_data: { quotationNo: 'SVI-QTN-20260902-0005' } },
        { form_data: { quotationNo: 'SVI-QTN-20260902-0001' } },
        { form_data: { quotationNo: 'SVI-QTN-20260902-0012' } },
      ];
      const nextNo = computeNextQuotationNumber(existing, '2026-09-02');
      expect(nextNo).toBe('SVI-QTN-20260902-0013');
    });

    it('starts fresh at 0001 for a new date even if other dates have high numbers', () => {
      const existing = ['SVI-QTN-20260901-0099', 'SVI-QTN-20260901-0100'];
      const nextNo = computeNextQuotationNumber(existing, '2026-09-02');
      expect(nextNo).toBe('SVI-QTN-20260902-0001');
    });

    it('skips numbers that collide to guarantee absolute uniqueness', () => {
      const existing = ['SVI-QTN-20260902-0001', 'SVI-QTN-20260902-0002'];
      const nextNo = computeNextQuotationNumber(existing, '2026-09-02');
      expect(nextNo).toBe('SVI-QTN-20260902-0003');
    });

    it('ignores invalid, empty, or non-matching entries safely', () => {
      const existing: Array<string | QuotationDocLike> = [
        '',
        { form_data: null },
        { form_data: { quotationNo: 'invalid-pattern' } },
        'SVI-QTN-20260902-0007',
      ];
      const nextNo = computeNextQuotationNumber(existing, '2026-09-02');
      expect(nextNo).toBe('SVI-QTN-20260902-0008');
    });
  });

  describe('generateQuotationNumber fallback', () => {
    it('returns a formatted sequence 1 for target date', () => {
      const no = generateQuotationNumber('2026-09-02');
      expect(no).toBe('SVI-QTN-20260902-0001');
    });
  });

  describe('getNextQuotationNumberFromDb', () => {
    it('uses PostgreSQL RPC function when available', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: 'SVI-QTN-20260902-0015',
        error: null,
      });
      const mockClient = {
        rpc: mockRpc,
        from: vi.fn(),
      };

      const result = await getNextQuotationNumberFromDb(
        mockClient as unknown as Parameters<typeof getNextQuotationNumberFromDb>[0],
        '2026-09-02'
      );
      expect(result).toBe('SVI-QTN-20260902-0015');
      expect(mockRpc).toHaveBeenCalledWith('get_next_quotation_number', {
        target_date: '20260902',
      });
    });

    it('falls back to querying documents table if RPC returns error or is not found', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'function does not exist' },
      });

      const mockLimit = vi.fn().mockResolvedValue({
        data: [
          { form_data: { quotationNo: 'SVI-QTN-20260902-0003' } },
          { form_data: { quotationNo: 'SVI-QTN-20260902-0004' } },
        ],
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      const mockClient = {
        rpc: mockRpc,
        from: mockFrom,
      };

      const result = await getNextQuotationNumberFromDb(
        mockClient as unknown as Parameters<typeof getNextQuotationNumberFromDb>[0],
        '2026-09-02'
      );
      expect(result).toBe('SVI-QTN-20260902-0005');
      expect(mockFrom).toHaveBeenCalledWith('documents');
      expect(mockSelect).toHaveBeenCalledWith('form_data');
      expect(mockEq).toHaveBeenCalledWith('document_type', 'quotation');
    });

    it('returns default sequence 0001 if database query encounters an error', async () => {
      const mockRpc = vi.fn().mockRejectedValue(new Error('RPC failed'));
      const mockLimit = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'DB connection error' },
      });
      const mockEq = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      const mockClient = {
        rpc: mockRpc,
        from: mockFrom,
      };

      const result = await getNextQuotationNumberFromDb(
        mockClient as unknown as Parameters<typeof getNextQuotationNumberFromDb>[0],
        '2026-09-02'
      );
      expect(result).toBe('SVI-QTN-20260902-0001');
    });
  });
});
