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
      status: 'active',
      created_at: '2026-06-12T10:00:00Z',
      form_data: {
        receiptNo: '2064',
        date: '2026-06-12',
        salutation: 'Mrs.',
        name: 'Rani Bhatnagar',
        refId: 'PL-2078',
        amount: '14578',
        amountWords: 'Fourteen Thousand Five Hundred Seventy Eight',
        paymentRef: 'UPI12345',
        drawnOn: 'HDFC Bank',
        plotNo: '42',
        plotSize: '1000 sq.ft',
        account: 'Savings',
        paymentMethod: 'UPI',
      },
    },
    {
      id: 'receipt-2',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-06-15T10:00:00Z',
      form_data: {
        receiptNo: '2065',
        date: '2026-06-15',
        salutation: 'Mr.',
        name: 'Empty Ref Client',
        refId: '',
        amount: '5000',
        amountWords: 'Five Thousand',
        paymentRef: '',
        drawnOn: '',
        plotNo: '',
        plotSize: '',
        account: '',
        paymentMethod: 'Cash',
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

  it('renders REF ID table header', () => {
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

    expect(screen.getByText('REF ID')).toBeDefined();
    expect(screen.getByText('RECEIPT NO')).toBeDefined();
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

    const ledgerBtn = screen.getByTitle('Open Customer Ledger');
    expect(ledgerBtn.textContent).toContain('PL-2078');

    const copyBtn = screen.getByTitle('Click to copy Ref ID');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('PL-2078');
  });

  it('shows dash when refId is missing', () => {
    render(
      <ReceiptsTable
        loading={false}
        error={null}
        filteredReceipts={[mockReceipts[1]]}
        searchQuery=""
        fetchReceipts={vi.fn()}
        setSelectedReceipt={vi.fn()}
        setDeleteTarget={vi.fn()}
      />
    );

    // There should be a dash rendered for missing refId
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('calls onShareWhatsApp when WhatsApp action button is clicked', () => {
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

  it('calls onOpenLedger when Ref ID or Ledger button is clicked', () => {
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

    const ledgerRefBtn = screen.getAllByTitle('Open Customer Ledger')[0];
    fireEvent.click(ledgerRefBtn);
    expect(onOpenLedger).toHaveBeenCalledWith('PL-2078');

    const ledgerActionBtn = screen.getAllByLabelText('Customer Ledger')[0];
    fireEvent.click(ledgerActionBtn);
    expect(onOpenLedger).toHaveBeenCalledWith('PL-2078');
  });
});
