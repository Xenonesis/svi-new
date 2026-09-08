import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  usePaymentReceiptsRecords,
  parseAmount,
} from '@/src/components/admin/payment-receipts/usePaymentReceiptsRecords';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';
import { downloadReceiptsCsv } from '@/src/lib/receipt/receiptCsvExport';
import { toast } from 'sonner';

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

vi.mock('@/src/lib/receipt/receiptCsvExport', () => ({
  downloadReceiptsCsv: vi.fn(),
}));

vi.mock('@/src/lib/utils/documentExporter', () => ({
  exportToPDF: vi.fn().mockResolvedValue(undefined),
  exportToImage: vi.fn().mockResolvedValue(undefined),
}));

const mockReceipts: SavedReceipt[] = [
  {
    id: 'receipt-1',
    document_type: 'payment_receipt',
    status: 'active',
    created_at: '2026-06-10T10:00:00Z',
    form_data: {
      receiptNo: 'REC-001',
      date: '2026-06-10',
      salutation: 'Mr.',
      name: 'John Doe',
      refId: 'REF-101',
      amount: '5000',
      amountWords: 'Five Thousand Only',
      paymentRef: 'UPI-111',
      drawnOn: 'HDFC',
      plotNo: 'P-12',
      plotSize: '1000',
      account: 'Savings',
      paymentMethod: 'UPI',
      clientPhone: '9876543210',
    },
  },
  {
    id: 'receipt-2',
    document_type: 'payment_receipt',
    status: 'active',
    created_at: '2026-06-15T12:00:00Z',
    form_data: {
      receiptNo: 'REC-002',
      date: '2026-06-15',
      salutation: 'Mrs.',
      name: 'Jane Smith',
      refId: 'REF-102',
      amount: '15000',
      amountWords: 'Fifteen Thousand Only',
      paymentRef: 'CSH-222',
      drawnOn: 'Cash',
      plotNo: 'P-34',
      plotSize: '1200',
      account: 'Current',
      paymentMethod: 'Cash',
      clientPhone: '9123456780',
    },
  },
  {
    id: 'receipt-3',
    document_type: 'payment_receipt',
    status: 'active',
    created_at: '2026-06-20T14:00:00Z',
    form_data: {
      receiptNo: 'REC-003',
      date: '2026-06-20',
      salutation: 'Dr.',
      name: 'Robert Brown',
      refId: 'REF-103',
      amount: '25000',
      amountWords: 'Twenty Five Thousand Only',
      paymentRef: 'CHQ-333',
      drawnOn: 'ICICI Bank',
      plotNo: 'P-56',
      plotSize: '1500',
      account: 'Savings',
      paymentMethod: 'Cheque',
      clientPhone: '9988776655',
    },
  },
  {
    id: 'receipt-4',
    document_type: 'payment_receipt',
    status: 'active',
    created_at: '2026-06-25T16:00:00Z',
    form_data: {
      receiptNo: 'REC-004',
      date: '2026-06-25',
      salutation: 'Ms.',
      name: 'Alice Green',
      refId: 'REF-104',
      amount: '10000',
      amountWords: 'Ten Thousand Only',
      paymentRef: 'NEFT-444',
      drawnOn: 'SBI',
      plotNo: 'P-78',
      plotSize: '800',
      account: 'Current',
      paymentMethod: 'Online',
      clientPhone: '9765432109',
    },
  },
];

describe('usePaymentReceiptsRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents?type=payment_receipt')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ documents: mockReceipts }),
        });
      }
      if (url.includes('/api/admin/settings?key=receipt_deal_values')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ value: { 'REF-101': 500000 } }),
        });
      }
      if (url.includes('/api/admin/settings')) {
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

  describe('parseAmount helper', () => {
    it('correctly handles various amount representations', () => {
      expect(parseAmount(5000)).toBe(5000);
      expect(parseAmount('5000')).toBe(5000);
      expect(parseAmount('₹ 15,000.50')).toBe(15000.5);
      expect(parseAmount('')).toBe(0);
      expect(parseAmount(null)).toBe(0);
      expect(parseAmount(undefined)).toBe(0);
    });
  });

  it('initializes default state and fetches receipts and deal values on mount', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    expect(result.current.searchQuery).toBe('');
    expect(result.current.methodFilter).toBe('');
    expect(result.current.sortConfig).toEqual({ key: 'date', direction: 'desc' });
    expect(result.current.dateRange).toEqual({ start: '', end: '' });
    expect(result.current.selectedReceipt).toBeNull();
    expect(result.current.deleteTarget).toBeNull();
    expect(result.current.deleteLoading).toBe(false);
    expect(result.current.whatsAppReceipt).toBeNull();
    expect(result.current.ledgerRefId).toBeNull();
    expect(result.current.isLedgersModalOpen).toBe(false);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.receipts).toHaveLength(4);
    expect(result.current.dealValuesMap).toHaveProperty('REF101', 500000);
  });

  it('calculates totalAmount and statistics breakdown accurately', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalAmount).toBe(55000);
    expect(result.current.totalCount).toBe(4);
    expect(result.current.upiCount).toBe(1);
    expect(result.current.cashCount).toBe(1);

    expect(result.current.stats.total).toBe(4);
    expect(result.current.stats.cash).toBe(1);
    expect(result.current.stats.cheque).toBe(1);
    expect(result.current.stats.online).toBe(2); // UPI + Online
  });

  it('filters receipts by search query across multiple fields', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Search by name
    act(() => {
      result.current.setSearchQuery('Jane');
    });
    expect(result.current.filteredReceipts).toHaveLength(1);
    expect(result.current.filteredReceipts[0].id).toBe('receipt-2');

    // Search by receiptNo
    act(() => {
      result.current.setSearchQuery('REC-003');
    });
    expect(result.current.filteredReceipts).toHaveLength(1);
    expect(result.current.filteredReceipts[0].id).toBe('receipt-3');

    // Search by refId
    act(() => {
      result.current.setSearchQuery('REF-101');
    });
    expect(result.current.filteredReceipts).toHaveLength(1);
    expect(result.current.filteredReceipts[0].id).toBe('receipt-1');

    // Search by phone
    act(() => {
      result.current.setSearchQuery('9765432109');
    });
    expect(result.current.filteredReceipts).toHaveLength(1);
    expect(result.current.filteredReceipts[0].id).toBe('receipt-4');

    // Search by plotNo
    act(() => {
      result.current.setSearchQuery('P-56');
    });
    expect(result.current.filteredReceipts).toHaveLength(1);
    expect(result.current.filteredReceipts[0].id).toBe('receipt-3');

    // Search by amount
    act(() => {
      result.current.setSearchQuery('25000');
    });
    expect(result.current.filteredReceipts).toHaveLength(1);
    expect(result.current.filteredReceipts[0].id).toBe('receipt-3');
  });

  it('filters receipts by payment method', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setMethodFilter('Cash');
    });
    expect(result.current.filteredReceipts).toHaveLength(1);
    expect(result.current.filteredReceipts[0].id).toBe('receipt-2');

    act(() => {
      result.current.setMethodFilter('Cheque');
    });
    expect(result.current.filteredReceipts).toHaveLength(1);
    expect(result.current.filteredReceipts[0].id).toBe('receipt-3');
  });

  it('filters receipts by date range', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setDateRange({ start: '2026-06-12', end: '2026-06-22' });
    });
    expect(result.current.filteredReceipts).toHaveLength(2);
    expect(result.current.filteredReceipts.map((r) => r.id)).toEqual(['receipt-3', 'receipt-2']);
  });

  it('sorts receipts by various criteria and toggles sort direction with handleSort', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Default sort: date desc -> receipt-4 (25th), receipt-3 (20th), receipt-2 (15th), receipt-1 (10th)
    expect(result.current.filteredReceipts.map((r) => r.id)).toEqual([
      'receipt-4',
      'receipt-3',
      'receipt-2',
      'receipt-1',
    ]);

    // Sort date asc
    act(() => {
      result.current.handleSort('date');
    });
    expect(result.current.sortConfig).toEqual({ key: 'date', direction: 'asc' });
    expect(result.current.filteredReceipts.map((r) => r.id)).toEqual([
      'receipt-1',
      'receipt-2',
      'receipt-3',
      'receipt-4',
    ]);

    // Sort by name asc
    act(() => {
      result.current.handleSort('name');
    });
    expect(result.current.sortConfig).toEqual({ key: 'name', direction: 'asc' });
    expect(result.current.filteredReceipts.map((r) => r.form_data.name)).toEqual([
      'Alice Green',
      'Jane Smith',
      'John Doe',
      'Robert Brown',
    ]);

    // Sort by amount asc
    act(() => {
      result.current.handleSort('amount');
    });
    expect(result.current.sortConfig).toEqual({ key: 'amount', direction: 'asc' });
    expect(result.current.filteredReceipts.map((r) => r.id)).toEqual([
      'receipt-1', // 5000
      'receipt-4', // 10000
      'receipt-2', // 15000
      'receipt-3', // 25000
    ]);
  });

  it('resets all filters on handleClearFilters', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearchQuery('Jane');
      result.current.setMethodFilter('Cash');
      result.current.handleSort('amount');
      result.current.setDateRange({ start: '2026-06-01', end: '2026-06-30' });
    });

    expect(result.current.searchQuery).toBe('Jane');
    expect(result.current.methodFilter).toBe('Cash');

    act(() => {
      result.current.handleClearFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.methodFilter).toBe('');
    expect(result.current.sortConfig).toEqual({ key: 'date', direction: 'desc' });
    expect(result.current.dateRange).toEqual({ start: '', end: '' });
    expect(result.current.filteredReceipts).toHaveLength(4);
  });

  it('handles optimistic deletion of receipts', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    act(() => {
      result.current.setDeleteTarget(mockReceipts[0]);
    });
    expect(result.current.deleteTarget?.id).toBe('receipt-1');

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    expect(result.current.deleteTarget).toBeNull();
    expect(result.current.receipts).toHaveLength(3);
    expect(result.current.receipts.find((r) => r.id === 'receipt-1')).toBeUndefined();
    expect(toast.success).toHaveBeenCalledWith('Payment receipt deleted successfully.');
  });

  it('triggers handleExportCSV and calls downloadReceiptsCsv', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleExportCSV();
    });

    expect(downloadReceiptsCsv).toHaveBeenCalledWith(result.current.filteredReceipts, undefined);
    expect(toast.success).toHaveBeenCalledWith('Exported 4 receipts to CSV');
  });

  it('updates dealValuesMap and persists it via handleSaveDealValue', async () => {
    const { result } = renderHook(() => usePaymentReceiptsRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await act(async () => {
      await result.current.handleSaveDealValue('REF-102', 750000);
    });

    expect(result.current.dealValuesMap).toHaveProperty('REF-102', 750000);
  });
});
