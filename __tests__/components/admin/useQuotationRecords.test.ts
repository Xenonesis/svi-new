import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useQuotationRecords,
  DEFAULT_COMPANY_INFO,
} from '@/src/components/admin/quotation-records/useQuotationRecords';
import type { SavedQuotation } from '@/src/lib/quotation/types';
import { toast } from 'sonner';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({
    token: 'mock-admin-token',
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/src/lib/utils/documentExporter', () => ({
  exportToPDF: vi.fn().mockResolvedValue(undefined),
  exportToImage: vi.fn().mockResolvedValue(undefined),
}));

const mockQuotations: SavedQuotation[] = [
  {
    id: 'quote-1',
    document_type: 'quotation',
    status: 'completed',
    created_at: '2026-06-01T10:00:00Z',
    form_data: {
      quotationNo: 'Q-2026-001',
      quotationDate: '2026-06-01',
      validUntil: '2026-06-30',
      customerName: 'Aarav Sharma',
      customerPhone: '9876543210',
      customerEmail: 'aarav@example.com',
      customerAddress: 'Jaipur, Rajasthan',
      projectName: 'Shivani Vatika',
      plotNo: 'A-101',
      propertyType: 'Residential',
      area: '150',
      basicRate: '12000',
      edcRate: '500',
      plcPercent: '5',
      notes: 'Initial quotation',
      calculation: {
        area: 150,
        basicRate: 12000,
        basicPrice: 1800000,
        edcRate: 500,
        edcAmount: 75000,
        plcPercent: 5,
        plcAmount: 90000,
        grandTotal: 1965000,
        effectiveRate: 13100,
      },
    },
  },
  {
    id: 'quote-2',
    document_type: 'quotation',
    status: 'draft',
    created_at: '2026-06-02T11:00:00Z',
    form_data: {
      quotationNo: 'Q-2026-002',
      quotationDate: '2026-06-02',
      validUntil: '2026-07-02',
      customerName: 'Priya Patel',
      customerPhone: '9123456780',
      customerEmail: 'priya@example.com',
      customerAddress: 'Noida, Uttar Pradesh',
      projectName: 'Shyam Aangan',
      plotNo: 'B-205',
      propertyType: 'Villa',
      area: '200',
      basicRate: '15000',
      edcRate: '600',
      plcPercent: '10',
      notes: 'Draft proposal',
      calculation: {
        area: 200,
        basicRate: 15000,
        basicPrice: 3000000,
        edcRate: 600,
        edcAmount: 120000,
        plcPercent: 10,
        plcAmount: 300000,
        grandTotal: 3420000,
        effectiveRate: 17100,
      },
    },
  },
  {
    id: 'quote-3',
    document_type: 'quotation',
    status: 'draft',
    created_at: '2026-06-03T12:00:00Z',
    form_data: {
      quotationNo: 'Q-2026-003',
      quotationDate: '2026-06-03',
      validUntil: '2026-07-03',
      customerName: 'Vikram Singh',
      customerPhone: '9988776655',
      customerEmail: 'vikram@example.com',
      customerAddress: 'Ajmer, Rajasthan',
      projectName: 'Phulera Smart City',
      plotNo: 'C-309',
      propertyType: 'Commercial',
      area: '350',
      basicRate: '20000',
      edcRate: '800',
      plcPercent: '0',
      notes: 'Commercial plot inquiry',
      calculation: {
        area: 350,
        basicRate: 20000,
        basicPrice: 7000000,
        edcRate: 800,
        edcAmount: 280000,
        plcPercent: 0,
        plcAmount: 0,
        grandTotal: 7280000,
        effectiveRate: 20800,
      },
    },
  },
];

describe('useQuotationRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents?type=quotation')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ documents: mockQuotations }),
        });
      }
      if (url.includes('/api/admin/settings?key=company_info')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              value: {
                company_name: 'Custom SVI Infra Ltd.',
              },
            }),
        });
      }
      if (url.includes('/api/admin/documents/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization and data fetching', () => {
    it('initializes default state and fetches quotations and company settings', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      expect(result.current.searchQuery).toBe('');
      expect(result.current.statusFilter).toBe('all');
      expect(result.current.selectedQuotation).toBeNull();
      expect(result.current.deleteTarget).toBeNull();
      expect(result.current.deleteLoading).toBe(false);
      expect(result.current.pdfLoading).toBe(false);
      expect(result.current.imageLoading).toBe(false);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.quotations).toHaveLength(3);
      expect(result.current.companyInfo.company_name).toBe('Custom SVI Infra Ltd.');
    });

    it('handles fetch failure gracefully and sets error state', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/admin/documents?type=quotation')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Server error' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }) as unknown as typeof fetch;

      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch quotations');
      expect(result.current.quotations).toEqual([]);
    });

    it('supports custom initialQuotations and autoFetch false', () => {
      const { result } = renderHook(() =>
        useQuotationRecords({
          initialQuotations: [mockQuotations[0]],
          autoFetch: false,
        })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.quotations).toHaveLength(1);
      expect(result.current.quotations[0].id).toBe('quote-1');
      expect(result.current.companyInfo).toEqual(DEFAULT_COMPANY_INFO);
    });
  });

  describe('statistics calculations', () => {
    it('computes totalCount, totalValue, completedCount, and draftCount accurately', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalCount).toBe(3);
      expect(result.current.totalValue).toBe(1965000 + 3420000 + 7280000);
      expect(result.current.completedCount).toBe(1);
      expect(result.current.draftCount).toBe(2);
    });
  });

  describe('filtering and searching', () => {
    it('filters by status correctly', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setStatusFilter('completed');
      });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].id).toBe('quote-1');

      act(() => {
        result.current.setStatusFilter('draft');
      });
      expect(result.current.filtered).toHaveLength(2);
      expect(result.current.filtered.map((q) => q.id)).toEqual(['quote-2', 'quote-3']);

      act(() => {
        result.current.setStatusFilter('all');
      });
      expect(result.current.filtered).toHaveLength(3);
    });

    it('searches by quotation number', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSearchQuery('002');
      });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].form_data.quotationNo).toBe('Q-2026-002');
    });

    it('searches by customer name case-insensitively', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSearchQuery('priya');
      });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].form_data.customerName).toBe('Priya Patel');
    });

    it('searches by phone number', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSearchQuery('998877');
      });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].form_data.customerPhone).toBe('9988776655');
    });

    it('searches by project name, plot number, and area', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Project name
      act(() => {
        result.current.setSearchQuery('Phulera');
      });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].id).toBe('quote-3');

      // Plot number
      act(() => {
        result.current.setSearchQuery('A-101');
      });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].id).toBe('quote-1');

      // Area
      act(() => {
        result.current.setSearchQuery('350');
      });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].id).toBe('quote-3');
    });

    it('combines status filter and search query', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setStatusFilter('draft');
        result.current.setSearchQuery('Shivani');
      });

      // quote-1 matches Shivani, but is completed, not draft
      expect(result.current.filtered).toHaveLength(0);

      act(() => {
        result.current.setSearchQuery('Shyam');
      });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].id).toBe('quote-2');
    });
  });

  describe('delete workflow', () => {
    it('deletes the targeted quotation and shows success toast', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setDeleteTarget(mockQuotations[0]);
      });
      expect(result.current.deleteTarget?.id).toBe('quote-1');

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(result.current.deleteTarget).toBeNull();
      expect(result.current.quotations).toHaveLength(2);
      expect(result.current.quotations.find((q) => q.id === 'quote-1')).toBeUndefined();
      expect(toast.success).toHaveBeenCalledWith('Quotation deleted.');
    });

    it('handles delete failure with error toast', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/admin/documents?type=quotation')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ documents: mockQuotations }),
          });
        }
        if (url.includes('/api/admin/documents/')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Server error' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }) as unknown as typeof fetch;

      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setDeleteTarget(mockQuotations[1]);
      });

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(toast.error).toHaveBeenCalledWith('Unable to delete quotation.');
      expect(result.current.deleteLoading).toBe(false);
      expect(result.current.quotations).toHaveLength(3);
    });
  });

  describe('export handlers', () => {
    it('handles PDF export and updates status to completed', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSelectedQuotation(mockQuotations[1]); // quote-2 is draft
      });

      await act(async () => {
        await result.current.handleModalDownloadPDF();
      });

      expect(exportToPDF).toHaveBeenCalledWith({
        elementId: 'modalQuotationPreview',
        filename: 'SVI_Quotation_Q-2026-002.pdf',
      });

      expect(result.current.pdfLoading).toBe(false);
      // Status in quotations list should be updated to completed
      const updatedQuote = result.current.quotations.find((q) => q.id === 'quote-2');
      expect(updatedQuote?.status).toBe('completed');
    });

    it('handles PDF export error gracefully', async () => {
      vi.mocked(exportToPDF).mockRejectedValueOnce(new Error('Export failed'));

      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSelectedQuotation(mockQuotations[0]);
      });

      await act(async () => {
        await result.current.handleModalDownloadPDF();
      });

      expect(toast.error).toHaveBeenCalledWith('PDF generation failed.');
      expect(result.current.pdfLoading).toBe(false);
    });

    it('handles PNG export successfully', async () => {
      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSelectedQuotation(mockQuotations[0]);
      });

      await act(async () => {
        await result.current.handleModalDownloadPNG();
      });

      expect(exportToImage).toHaveBeenCalledWith({
        elementId: 'modalQuotationPreview',
        filename: 'SVI_Quotation_Q-2026-001.png',
      });
      expect(result.current.imageLoading).toBe(false);
    });

    it('handles PNG export error gracefully', async () => {
      vi.mocked(exportToImage).mockRejectedValueOnce(new Error('Image export failed'));

      const { result } = renderHook(() => useQuotationRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSelectedQuotation(mockQuotations[0]);
      });

      await act(async () => {
        await result.current.handleModalDownloadPNG();
      });

      expect(toast.error).toHaveBeenCalledWith('PNG generation failed.');
      expect(result.current.imageLoading).toBe(false);
    });
  });
});
