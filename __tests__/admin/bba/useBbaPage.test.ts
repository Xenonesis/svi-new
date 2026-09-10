import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useBbaPage,
  calculateTotalCost,
  calculateFinancialValues,
  INITIAL_BBA_FORM_DATA,
} from '@/src/components/admin/bba/hooks/useBbaPage';

const mockExportToPDF = vi.fn();
const mockExportToImage = vi.fn();

vi.mock('@/src/lib/utils/documentExporter', () => ({
  exportToPDF: (...args: unknown[]) => mockExportToPDF(...args),
  exportToImage: (...args: unknown[]) => mockExportToImage(...args),
}));

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({ token: 'test-admin-token' }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
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

describe('BBA Cost Calculations', () => {
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

    it('returns 0 for empty, missing, or invalid values', () => {
      expect(calculateTotalCost()).toBe(0);
      expect(calculateTotalCost({})).toBe(0);
      expect(calculateTotalCost({ area: '', bsp: 'invalid' })).toBe(0);
      expect(calculateTotalCost({ area: '100', bsp: '0' })).toBe(0);
    });
  });

  describe('calculateFinancialValues', () => {
    it('computes totalCost and initialPayment (10% of totalCost)', () => {
      // area: 100, bsp: 5000 -> base: 500000
      // plc: 10% -> 50000
      // edc: 25000
      // totalCost = 575000
      // initialPayment = 575000 * 0.1 = 57500
      const values = calculateFinancialValues({
        area: '100',
        bsp: '5000',
        plc: '10',
        edc: '25000',
      });

      expect(values.totalCost).toBe(575000);
      expect(values.initialPayment).toBe(57500);
    });

    it('handles zero or missing values gracefully', () => {
      const values = calculateFinancialValues({});
      expect(values.totalCost).toBe(0);
      expect(values.initialPayment).toBe(0);
    });
  });
});

describe('useBbaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        document: {
          id: 'doc-bba-1',
          document_type: 'bba',
          status: 'draft',
          form_data: { clientName: 'Rajesh Kumar', ticketId: 'TKT-101' },
        },
        documents: [],
      }),
    } as unknown as Response);
  });

  it('initializes with default values, activeLanguage en, and calculated financial values', () => {
    const { result } = renderHook(() => useBbaPage());

    expect(result.current.formData.projectName).toBe('Shyam Aangan');
    expect(result.current.activeLanguage).toBe('en');
    expect(result.current.totalCost).toBe(0);
    expect(result.current.initialPayment).toBe(0);
    expect(result.current.preview).toBe(false);
    expect(result.current.documentId).toBeNull();
  });

  it('re-calculates financial values dynamically when form inputs change', () => {
    const { result } = renderHook(() => useBbaPage());

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
    // initialPayment = 97500
    expect(result.current.totalCost).toBe(975000);
    expect(result.current.initialPayment).toBe(97500);
  });

  describe('Language switching and state management', () => {
    it('switches activeLanguage and updates formData.language accordingly', () => {
      const { result } = renderHook(() => useBbaPage());

      expect(result.current.activeLanguage).toBe('en');

      act(() => {
        result.current.setActiveLanguage('hi');
      });

      expect(result.current.activeLanguage).toBe('hi');
      expect(result.current.formData.language).toBe('hi');

      act(() => {
        result.current.setActiveLanguage('en');
      });

      expect(result.current.activeLanguage).toBe('en');
      expect(result.current.formData.language).toBe('en');
    });

    it('synchronizes activeLanguage when formData.language is updated via handleChange', () => {
      const { result } = renderHook(() => useBbaPage());

      act(() => {
        result.current.handleChange({
          target: { name: 'language', value: 'hi' },
        } as React.ChangeEvent<HTMLSelectElement>);
      });

      expect(result.current.activeLanguage).toBe('hi');
    });
  });

  describe('Document Submission and Persistence', () => {
    it('creates a new document via POST when documentId is not set', async () => {
      const { result } = renderHook(() => useBbaPage());

      const mockPreventDefault = vi.fn();
      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: mockPreventDefault,
        } as unknown as React.FormEvent);
      });

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/documents',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-admin-token',
          }),
          body: expect.stringContaining('"document_type":"bba"'),
        })
      );

      expect(result.current.documentId).toBe('doc-bba-1');
      expect(result.current.preview).toBe(true);
      expect(result.current.savedBbas).toHaveLength(1);
    });

    it('updates an existing document via PATCH when documentId is set', async () => {
      const { result } = renderHook(() => useBbaPage());

      act(() => {
        result.current.setDocumentId('doc-existing-42');
        result.current.setSavedBbas([
          {
            id: 'doc-existing-42',
            document_type: 'bba',
            status: 'draft',
            created_at: new Date().toISOString(),
            form_data: { clientName: 'Old Name' },
          },
        ]);
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          document: {
            id: 'doc-existing-42',
            document_type: 'bba',
            status: 'draft',
            created_at: new Date().toISOString(),
            form_data: { clientName: 'Updated Name' },
          },
        }),
      } as unknown as Response);

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/documents/doc-existing-42',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-admin-token',
          }),
        })
      );

      expect(result.current.preview).toBe(true);
      expect(result.current.savedBbas[0].form_data?.clientName).toBe('Updated Name');
    });

    it('falls back to POST creating new record when PATCH returns 404', async () => {
      const { result } = renderHook(() => useBbaPage());

      act(() => {
        result.current.setDocumentId('doc-not-found');
      });

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: async () => 'Not Found',
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            document: {
              id: 'doc-recreated-99',
              document_type: 'bba',
              status: 'draft',
              form_data: { clientName: 'New Fallback Record' },
            },
          }),
        } as unknown as Response);

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.documentId).toBe('doc-recreated-99');
      expect(result.current.preview).toBe(true);
    });

    it('handles submission error gracefully without throwing', async () => {
      const { result } = renderHook(() => useBbaPage());

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await result.current.handleSubmit();
      });

      // Still sets preview to true to allow user inspection
      expect(result.current.preview).toBe(true);
    });
    it('explicitly creates a new BBA via handleCreateNew even when documentId is set', async () => {
      const { result } = renderHook(() => useBbaPage());

      act(() => {
        result.current.setDocumentId('doc-original-1');
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          document: {
            id: 'doc-brand-new-2',
            document_type: 'bba',
            status: 'draft',
            form_data: { clientName: 'Cloned Client' },
          },
        }),
      } as unknown as Response);

      await act(async () => {
        await result.current.handleCreateNew();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/documents',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"document_type":"bba"'),
        })
      );

      expect(result.current.documentId).toBe('doc-brand-new-2');
      expect(result.current.preview).toBe(true);
    });

    it('explicitly updates existing BBA via handleUpdateExisting without creating new record', async () => {
      const { result } = renderHook(() => useBbaPage());

      act(() => {
        result.current.setDocumentId('doc-existing-99');
        result.current.setSavedBbas([
          {
            id: 'doc-existing-99',
            document_type: 'bba',
            status: 'draft',
            created_at: new Date().toISOString(),
            form_data: { clientName: 'Prior Name' },
          },
        ]);
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          document: {
            id: 'doc-existing-99',
            document_type: 'bba',
            status: 'draft',
            created_at: new Date().toISOString(),
            form_data: { clientName: 'Updated In Place' },
          },
        }),
      } as unknown as Response);

      await act(async () => {
        await result.current.handleUpdateExisting();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/documents/doc-existing-99',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      expect(result.current.documentId).toBe('doc-existing-99');
      expect(result.current.savedBbas[0].form_data?.clientName).toBe('Updated In Place');
    });
  });

  describe('Record Loading and Clearing', () => {
    it('loads an existing BBA document by ID and synchronizes state', () => {
      const { result } = renderHook(() => useBbaPage());

      const mockSaved = {
        id: 'bba-rec-5',
        document_type: 'bba',
        status: 'draft',
        created_at: new Date().toISOString(),
        form_data: {
          clientName: 'Sunita Sharma',
          ticketId: 'TKT-555',
          language: 'hi',
          secondPaymentDays: '30',
        },
      };

      act(() => {
        result.current.setSavedBbas([mockSaved]);
      });

      act(() => {
        result.current.handleLoadBba('bba-rec-5');
      });

      expect(result.current.documentId).toBe('bba-rec-5');
      expect(result.current.formData.clientName).toBe('Sunita Sharma');
      expect(result.current.formData.ticketId).toBe('TKT-555');
      expect(result.current.activeLanguage).toBe('hi');
      expect(result.current.isCustomSecondPaymentDays).toBe(true);
    });

    it('clears record and resets form data via handleClearRecord', () => {
      const { result } = renderHook(() => useBbaPage());

      act(() => {
        result.current.setDocumentId('doc-to-clear');
        result.current.setActiveLanguage('hi');
        result.current.setIsCustomSecondPaymentDays(true);
        result.current.setIsCustomAdvisor(true);
        result.current.handleChange({
          target: { name: 'clientName', value: 'Some Name' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleClearRecord();
      });

      expect(result.current.documentId).toBeNull();
      expect(result.current.activeLanguage).toBe('en');
      expect(result.current.isCustomSecondPaymentDays).toBe(false);
      expect(result.current.isCustomAdvisor).toBe(false);
      expect(result.current.formData.clientName).toBe('');
      expect(result.current.formData).toEqual(INITIAL_BBA_FORM_DATA);
    });

    it('calling handleLoadBba with empty string also clears the record', () => {
      const { result } = renderHook(() => useBbaPage());

      act(() => {
        result.current.setDocumentId('doc-active');
      });

      act(() => {
        result.current.handleLoadBba('');
      });

      expect(result.current.documentId).toBeNull();
      expect(result.current.formData).toEqual(INITIAL_BBA_FORM_DATA);
    });
  });

  describe('Download handlers', () => {
    it('triggers PDF export and marks document status as completed when documentId exists', async () => {
      const { result } = renderHook(() => useBbaPage());

      act(() => {
        result.current.setDocumentId('doc-complete-1');
      });

      await act(async () => {
        await result.current.handleDownloadPDF();
      });

      expect(mockExportToPDF).toHaveBeenCalledWith({
        elementId: 'bbaPreview',
        filename: 'BBA_Document.pdf',
        width: '800px',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/documents/doc-complete-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        })
      );
    });

    it('triggers Image export with proper preview ID and filename', async () => {
      const { result } = renderHook(() => useBbaPage());

      await act(async () => {
        await result.current.handleDownloadImage();
      });

      expect(mockExportToImage).toHaveBeenCalledWith({
        elementId: 'bbaPreview',
        filename: 'BBA_Document.png',
      });
    });
  });
});
