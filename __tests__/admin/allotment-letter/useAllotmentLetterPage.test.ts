import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useAllotmentLetterPage,
  calculateTotalCost,
  calculateFinancialValues,
  INITIAL_ALLOTMENT_FORM_DATA,
} from '@/src/components/admin/allotment-letter/hooks/useAllotmentLetterPage';

const mockExportToPDF = vi.fn();
const mockExportToImage = vi.fn();

vi.mock('@/src/lib/utils/documentExporter', () => ({
  exportToPDF: (...args: unknown[]) => mockExportToPDF(...args),
  exportToImage: (...args: unknown[]) => mockExportToImage(...args),
}));

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({ token: 'test-admin-token' }),
}));

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

describe('Allotment Cost Calculations', () => {
  describe('calculateTotalCost', () => {
    it('calculates base cost correctly (area * bsp)', () => {
      const result = calculateTotalCost({ area: '100', bsp: '5000' });
      expect(result).toBe(500000);
    });

    it('adds PLC percentage to base cost correctly (base * plc / 100)', () => {
      // base = 100 * 5000 = 500000. plc = 10% -> 50000. total = 550000
      const result = calculateTotalCost({ area: '100', bsp: '5000', plc: '10' });
      expect(result).toBe(550000);
    });

    it('adds EDC amount to the sum of base and PLC', () => {
      // base = 500000, plc = 50000, edc = 25000 -> total = 575000
      const result = calculateTotalCost({ area: '100', bsp: '5000', plc: '10', edc: '25000' });
      expect(result).toBe(575000);
    });

    it('handles numeric input values as well as string inputs', () => {
      const result = calculateTotalCost({ area: 120, bsp: 4000, plc: 5, edc: 10000 });
      // base = 480000, plc = 24000, edc = 10000 -> total = 514000
      expect(result).toBe(514000);
    });

    it('returns 0 or graceful result for empty, missing, or invalid values', () => {
      expect(calculateTotalCost({})).toBe(0);
      expect(calculateTotalCost({ area: '', bsp: 'invalid' })).toBe(0);
      expect(calculateTotalCost({ area: '100', bsp: '0' })).toBe(0);
    });
  });

  describe('calculateFinancialValues', () => {
    it('computes totalCost, edcAmount, baseCost, and initial payment when edcInEmi is false', () => {
      // area: 100, bsp: 5000 -> base: 500000
      // plc: 10% -> 50000
      // edc: 25000
      // totalCost = 575000, baseCost = 550000
      // edcInEmi = false -> initialPayment = totalCost * (10 / 100) = 57500
      const values = calculateFinancialValues({
        area: '100',
        bsp: '5000',
        plc: '10',
        edc: '25000',
        edcInEmi: 'false',
        bookingPaymentPercent: '10',
      });

      expect(values.totalCost).toBe(575000);
      expect(values.edcAmount).toBe(25000);
      expect(values.edcInEmi).toBe(false);
      expect(values.baseCost).toBe(550000);
      expect(values.bookingPercent).toBe(10);
      expect(values.initialPayment).toBe(57500);
    });

    it('computes initial payment from baseCost when edcInEmi is true', () => {
      // totalCost = 575000, edcAmount = 25000, baseCost = 550000
      // edcInEmi = true -> initialPayment = baseCost * (10 / 100) = 55000
      const values = calculateFinancialValues({
        area: '100',
        bsp: '5000',
        plc: '10',
        edc: '25000',
        edcInEmi: 'true',
        bookingPaymentPercent: '10',
      });

      expect(values.edcInEmi).toBe(true);
      expect(values.baseCost).toBe(550000);
      expect(values.initialPayment).toBe(55000);
    });

    it('uses custom bookingPaymentPercent and defaults to 10% when empty', () => {
      const customPercent = calculateFinancialValues({
        area: '100',
        bsp: '5000',
        plc: '0',
        edc: '0',
        edcInEmi: 'false',
        bookingPaymentPercent: '25',
      });
      expect(customPercent.bookingPercent).toBe(25);
      expect(customPercent.initialPayment).toBe(125000);

      const defaultPercent = calculateFinancialValues({
        area: '100',
        bsp: '5000',
        plc: '0',
        edc: '0',
        bookingPaymentPercent: '',
      });
      expect(defaultPercent.bookingPercent).toBe(10);
      expect(defaultPercent.initialPayment).toBe(50000);
    });
  });
});

describe('useAllotmentLetterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        document: {
          id: 'doc-new-1',
          document_type: 'allotment_letter',
          status: 'draft',
          form_data: { ticketId: 'TKT-999' },
        },
        documents: [],
      }),
    } as unknown as Response);
  });

  it('initializes with default values and calculates financial numbers', () => {
    const { result } = renderHook(() => useAllotmentLetterPage());

    expect(result.current.formData.ticketId).toBe('');
    expect(result.current.formData.projectName).toBe('Shyam Aangan');
    expect(result.current.totalCost).toBe(0);
    expect(result.current.baseCost).toBe(0);
    expect(result.current.initialPayment).toBe(0);
    expect(result.current.showSaveModal).toBe(false);
    expect(result.current.duplicateRecordToOverwrite).toBeNull();
  });

  it('re-calculates financial values when form fields change', () => {
    const { result } = renderHook(() => useAllotmentLetterPage());

    act(() => {
      result.current.handleChange({
        target: { name: 'area', value: '150' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'bsp', value: '6000' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'plc', value: '5' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'edc', value: '30000' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // base = 150 * 6000 = 900000
    // plc = 900000 * 0.05 = 45000
    // edc = 30000
    // totalCost = 975000
    // baseCost = 945000
    // bookingPercent = 10 -> initialPayment = 97500
    expect(result.current.totalCost).toBe(975000);
    expect(result.current.baseCost).toBe(945000);
    expect(result.current.initialPayment).toBe(97500);
  });

  describe('Duplicate ticketId detection and persistence', () => {
    it('detects duplicate ticketId in savedAllotments and opens duplicate modal without saving', async () => {
      const { result } = renderHook(() => useAllotmentLetterPage());

      const mockExistingRecord = {
        id: 'rec-existing-1',
        form_data: {
          ticketId: 'TKT-EXISTING-101',
          clientName: 'Rahul Verma',
        },
      };

      act(() => {
        result.current.setSavedAllotments([mockExistingRecord]);
        result.current.handleChange({
          target: { name: 'ticketId', value: 'TKT-EXISTING-101' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      const mockPreventDefault = vi.fn();
      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: mockPreventDefault,
        } as unknown as React.FormEvent);
      });

      expect(mockPreventDefault).toHaveBeenCalled();
      // Should flag duplicate and open modal
      expect(result.current.showSaveModal).toBe(true);
      expect(result.current.duplicateRecordToOverwrite).toEqual(mockExistingRecord);

      // fetch should NOT have been called to save the document (only initial data load)
      expect(global.fetch).not.toHaveBeenCalledWith(
        '/api/admin/documents',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('saves directly when ticketId does not conflict with existing records', async () => {
      const { result } = renderHook(() => useAllotmentLetterPage());

      act(() => {
        result.current.handleChange({
          target: { name: 'ticketId', value: 'TKT-UNIQUE-202' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.showSaveModal).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/documents',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-admin-token',
          }),
        })
      );
      expect(result.current.documentId).toBe('doc-new-1');
      expect(result.current.preview).toBe(true);
    });

    it('allows overwriting duplicate record via handleOverwrite', async () => {
      const { result } = renderHook(() => useAllotmentLetterPage());

      const mockExisting = {
        id: 'rec-dup-456',
        form_data: { ticketId: 'TKT-DUP' },
      };

      act(() => {
        result.current.setDuplicateRecordToOverwrite(mockExisting);
        result.current.setShowSaveModal(true);
      });

      await act(async () => {
        await result.current.handleOverwrite();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/documents/rec-dup-456',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-admin-token',
          }),
        })
      );
      expect(result.current.showSaveModal).toBe(false);
      expect(result.current.duplicateRecordToOverwrite).toBeNull();
    });

    it('allows creating new record despite duplicate via handleCreateNew', async () => {
      const { result } = renderHook(() => useAllotmentLetterPage());

      act(() => {
        result.current.setShowSaveModal(true);
        result.current.setDuplicateRecordToOverwrite({ id: 'rec-dup-456' });
      });

      await act(async () => {
        await result.current.handleCreateNew();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/documents',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.current.showSaveModal).toBe(false);
      expect(result.current.duplicateRecordToOverwrite).toBeNull();
    });

    it('cancels duplicate prompt via handleCancelDuplicate', () => {
      const { result } = renderHook(() => useAllotmentLetterPage());

      act(() => {
        result.current.setShowSaveModal(true);
        result.current.setDuplicateRecordToOverwrite({ id: 'rec-123' });
      });

      act(() => {
        result.current.handleCancelDuplicate();
      });

      expect(result.current.showSaveModal).toBe(false);
      expect(result.current.duplicateRecordToOverwrite).toBeNull();
    });
  });

  describe('Reset and Export handlers', () => {
    it('resets form data and record state via handleClearRecord', () => {
      const { result } = renderHook(() => useAllotmentLetterPage());

      act(() => {
        result.current.setSelectedRecordId('rec-123');
        result.current.setDocumentId('doc-123');
        result.current.handleChange({
          target: { name: 'clientName', value: 'Test Client' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.clientName).toBe('Test Client');
      expect(result.current.selectedRecordId).toBe('rec-123');

      act(() => {
        result.current.handleClearRecord();
      });

      expect(result.current.selectedRecordId).toBe('');
      expect(result.current.documentId).toBeNull();
      expect(result.current.formData).toEqual(INITIAL_ALLOTMENT_FORM_DATA);
    });

    it('calls exportToPDF and updates document status to completed if documentId exists', async () => {
      const { result } = renderHook(() => useAllotmentLetterPage());

      act(() => {
        result.current.setDocumentId('doc-completed-1');
      });

      await act(async () => {
        await result.current.handleDownloadPDF();
      });

      expect(mockExportToPDF).toHaveBeenCalledWith({
        elementId: 'allotmentPreview',
        filename: 'Allotment_Letter.pdf',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/documents/doc-completed-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        })
      );
    });

    it('calls exportToImage with preview element ID and filename', async () => {
      const { result } = renderHook(() => useAllotmentLetterPage());

      await act(async () => {
        await result.current.handleDownloadImage();
      });

      expect(mockExportToImage).toHaveBeenCalledWith({
        elementId: 'allotmentPreview',
        filename: 'Allotment_Letter.png',
      });
    });
  });
});
