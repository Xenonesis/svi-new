import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReceiptsTable } from '@/src/components/admin/payment-receipts/ReceiptsTable';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ReceiptsTable', () => {
  const mockReceipts: SavedReceipt[] = [
    {
      id: 'receipt-1',
      document_type: 'payment_receipt',
      status: 'completed',
      created_at: '2026-03-15T10:00:00Z',
      form_data: {
        receiptNo: '2064',
        date: '2026-03-15',
        salutation: 'Mr.',
        name: 'Ramesh Sharma',
        refId: 'PL-2078',
        amount: '250000',
        amountWords: 'Two Lakh Fifty Thousand',
        paymentRef: 'UPI-7788',
        drawnOn: 'SBI Bank',
        plotNo: '101',
        plotSize: '150',
        account: 'A/C 1',
        paymentMethod: 'UPI',
      },
    },
    {
      id: 'receipt-2',
      document_type: 'payment_receipt',
      status: 'completed',
      created_at: '2026-03-16T11:00:00Z',
      form_data: {
        receiptNo: '2065',
        date: '2026-03-16',
        salutation: 'Ms.',
        name: 'Priya Patel',
        refId: 'PL-2079',
        amount: '100000',
        amountWords: 'One Lakh Only',
        paymentRef: 'CHQ-1122',
        drawnOn: 'HDFC Bank',
        plotNo: '102',
        plotSize: '200',
        account: 'A/C 2',
        paymentMethod: 'Cheque',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders table headers including RECEIPT NO and REF ID', () => {
    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={mockReceipts}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={vi.fn()}
      />
    );

    expect(screen.getByText('RECEIPT NO')).toBeDefined();
    expect(screen.getByText('REF ID')).toBeDefined();
    expect(screen.getByText('CLIENT NAME')).toBeDefined();
    expect(screen.getByText('DATE')).toBeDefined();
    expect(screen.getByText('AMOUNT')).toBeDefined();
    expect(screen.getByText('METHOD')).toBeDefined();
    expect(screen.getByText('PLOT INFO')).toBeDefined();
    expect(screen.getByText('ACTIONS')).toBeDefined();
  });

  it('renders Ref ID with copy button and copies to clipboard on click', async () => {
    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={mockReceipts}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={vi.fn()}
      />
    );

    const ledgerBtn = screen.getAllByTitle('Open Customer Ledger')[0];
    expect(ledgerBtn.textContent).toContain('PL-2078');

    const copyBtn = screen.getAllByTitle('Click to copy Ref ID')[0];
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('PL-2078');
  });

  it('shows dash when refId is missing', () => {
    const receiptsWithoutRef: SavedReceipt[] = [
      {
        ...mockReceipts[0],
        id: 'receipt-no-ref',
        form_data: {
          ...mockReceipts[0].form_data,
          refId: '',
        },
      },
    ];

    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={receiptsWithoutRef}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={vi.fn()}
      />
    );

    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('calls onShareWhatsApp when WhatsApp quick action button is clicked', () => {
    const onShareWhatsApp = vi.fn();
    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={mockReceipts}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={vi.fn()}
        onShareWhatsApp={onShareWhatsApp}
      />
    );

    const waBtn = screen.getAllByLabelText('Share via WhatsApp')[0];
    fireEvent.click(waBtn);
    expect(onShareWhatsApp).toHaveBeenCalledWith(mockReceipts[0]);
  });

  it('calls setSelectedReceipt when View & Print quick button is clicked', () => {
    const setSelectedReceipt = vi.fn();
    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={mockReceipts}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={setSelectedReceipt}
        setDeleteTarget={vi.fn()}
      />
    );

    const viewBtn = screen.getAllByLabelText('View & Print')[0];
    fireEvent.click(viewBtn);
    expect(setSelectedReceipt).toHaveBeenCalledWith(mockReceipts[0]);
  });

  it('calls onOpenLedger when Ref ID button is clicked or from row action menu', () => {
    const onOpenLedger = vi.fn();
    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={mockReceipts}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={vi.fn()}
        onOpenLedger={onOpenLedger}
      />
    );

    // 1. Direct Ref ID in table cell
    const ledgerRefBtn = screen.getAllByTitle('Open Customer Ledger')[0];
    fireEvent.click(ledgerRefBtn);
    expect(onOpenLedger).toHaveBeenCalledWith('PL-2078');

    // 2. Through the row action menu
    const moreActionsBtns = screen.getAllByLabelText('More actions');
    fireEvent.click(moreActionsBtns[0]);
    const ledgerMenuItem = screen.getByRole('menuitem', { name: /customer ledger/i });
    fireEvent.click(ledgerMenuItem);
    expect(onOpenLedger).toHaveBeenCalledWith('PL-2078');
  });

  it('calls setDeleteTarget when Delete Receipt is clicked from row action menu', () => {
    const setDeleteTarget = vi.fn();
    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={mockReceipts}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={setDeleteTarget}
      />
    );

    const moreActionsBtns = screen.getAllByLabelText('More actions');
    fireEvent.click(moreActionsBtns[0]);
    const deleteMenuItem = screen.getByRole('menuitem', { name: /delete receipt/i });
    fireEvent.click(deleteMenuItem);
    expect(setDeleteTarget).toHaveBeenCalledWith(mockReceipts[0]);
  });

  it('renders enterprise bottom pagination bar with counts and page pills', () => {
    const setCurrentPage = vi.fn();
    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={mockReceipts}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={vi.fn()}
        currentPage={1}
        setCurrentPage={setCurrentPage}
        pageSize={1}
        totalPages={2}
      />
    );

    expect(screen.getByText(/showing/i)).toBeDefined();
    expect(screen.getByRole('button', { name: '1' })).toBeDefined();
    expect(screen.getByRole('button', { name: '2' })).toBeDefined();

    // Next button should be enabled
    const nextBtn = screen.getByLabelText('Next page');
    expect(nextBtn.hasAttribute('disabled')).toBe(false);
    fireEvent.click(nextBtn);
    expect(setCurrentPage).toHaveBeenCalledWith(2);

    // Previous button should be disabled on page 1
    const prevBtn = screen.getByLabelText('Previous page');
    expect(prevBtn.hasAttribute('disabled')).toBe(true);
  });

  it('uses paginatedReceipts when provided', () => {
    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={mockReceipts}
        paginatedReceipts={[mockReceipts[1]]}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={vi.fn()}
        currentPage={2}
        pageSize={1}
        totalPages={2}
      />
    );

    // Only Priya Patel should be visible in the table rows
    expect(screen.queryByText('Ramesh Sharma')).toBeNull();
    expect(screen.getByText('Priya Patel')).toBeDefined();
  });

  it('renders trash bin tab with restore and permanent delete buttons', () => {
    const onRestore = vi.fn();
    const setDeleteTarget = vi.fn();
    const setIsPermanentDelete = vi.fn();
    const onEmptyTrash = vi.fn();

    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={mockReceipts}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={setDeleteTarget}
        activeTab="trash"
        onRestore={onRestore}
        setIsPermanentDelete={setIsPermanentDelete}
        onEmptyTrash={onEmptyTrash}
      />
    );

    expect(screen.getByText(/trash bin/i)).toBeDefined();
    expect(screen.getByText('Empty Trash')).toBeDefined();

    const restoreBtn = screen.getAllByTitle('Restore Receipt to Active List')[0];
    fireEvent.click(restoreBtn);
    expect(onRestore).toHaveBeenCalledWith(mockReceipts[0]);

    const permDeleteBtn = screen.getAllByLabelText('Delete Permanently')[0];
    fireEvent.click(permDeleteBtn);
    expect(setIsPermanentDelete).toHaveBeenCalledWith(true);
    expect(setDeleteTarget).toHaveBeenCalledWith(mockReceipts[0]);
  });
});
