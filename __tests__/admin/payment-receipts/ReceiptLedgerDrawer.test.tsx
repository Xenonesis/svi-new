import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReceiptLedgerDrawer } from '@/src/components/admin/payment-receipts/ReceiptLedgerDrawer';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ReceiptLedgerDrawer', () => {
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
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Ref ID header, total received amount and balance', () => {
    render(
      <ReceiptLedgerDrawer
        refId="SVI2051"
        allReceipts={mockReceipts}
        dealValue={50000}
        onSaveDealValue={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Ref ID: SVI2051/i)).toBeDefined();
    expect(screen.getByText('Piyush Sharma')).toBeDefined();
    expect(screen.getByText('Total Received')).toBeDefined();
    expect(screen.getByText('Agreed Plot Value')).toBeDefined();
    expect(screen.getByText('Balance Due')).toBeDefined();
  });

  it('calls onSaveDealValue when deal value form is submitted', () => {
    const onSave = vi.fn();
    render(
      <ReceiptLedgerDrawer
        refId="SVI2051"
        allReceipts={mockReceipts}
        dealValue={0}
        onSaveDealValue={onSave}
        onClose={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('e.g. 2500000');
    fireEvent.change(input, { target: { value: '100000' } });

    const saveBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith('SVI2051', 100000);
  });

  it('renders null when refId is null', () => {
    const { container } = render(
      <ReceiptLedgerDrawer
        refId={null}
        allReceipts={mockReceipts}
        dealValue={0}
        onSaveDealValue={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
