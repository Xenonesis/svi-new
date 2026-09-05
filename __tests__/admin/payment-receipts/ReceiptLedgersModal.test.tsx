import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReceiptLedgersModal } from '@/src/components/admin/payment-receipts/ReceiptLedgersModal';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

describe('ReceiptLedgersModal', () => {
  const mockReceipts: SavedReceipt[] = [
    {
      id: 'receipt-1',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-06-12T10:00:00Z',
      form_data: {
        receiptNo: '2064',
        date: '2026-06-12',
        salutation: 'Mr.',
        name: 'Piyush Sharma',
        refId: 'SVI2051',
        amount: '16042',
        amountWords: 'Sixteen Thousand Forty Two',
        paymentRef: 'UPI12345',
        drawnOn: 'HDFC Bank',
        plotNo: '42',
        plotSize: '1000',
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
        salutation: 'Mrs.',
        name: 'Rani Bhatnagar',
        refId: 'PL2078',
        amount: '20000',
        amountWords: 'Twenty Thousand',
        paymentRef: 'UPI888',
        drawnOn: 'SBI',
        plotNo: '10',
        plotSize: '',
        account: 'Current',
        paymentMethod: 'Cash',
      },
    },
  ];

  it('renders summary cards and accounts list', () => {
    render(
      <ReceiptLedgersModal
        receipts={mockReceipts}
        dealValuesMap={{ SVI2051: 50000 }}
        onSelectLedger={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Customer Ledgers Master Overview')).toBeDefined();
    expect(screen.getByText('2 Ref IDs')).toBeDefined();
    expect(screen.getByText('SVI2051')).toBeDefined();
    expect(screen.getByText('PL2078')).toBeDefined();
  });

  it('filters rows by search input', () => {
    render(
      <ReceiptLedgersModal
        receipts={mockReceipts}
        dealValuesMap={{}}
        onSelectLedger={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search by Ref ID/i);
    fireEvent.change(searchInput, { target: { value: 'Piyush' } });

    expect(screen.getByText('SVI2051')).toBeDefined();
    expect(screen.queryByText('PL2078')).toBeNull();
  });

  it('calls onSelectLedger when row is clicked', () => {
    const onSelect = vi.fn();
    render(
      <ReceiptLedgersModal
        receipts={mockReceipts}
        dealValuesMap={{}}
        onSelectLedger={onSelect}
        onClose={vi.fn()}
      />
    );

    const row = screen.getByText('SVI2051');
    fireEvent.click(row);

    expect(onSelect).toHaveBeenCalledWith('SVI2051');
  });
});
