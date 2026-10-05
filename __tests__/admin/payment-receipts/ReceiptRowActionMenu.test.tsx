import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReceiptRowActionMenu } from '@/src/components/admin/payment-receipts/ReceiptRowActionMenu';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

describe('ReceiptRowActionMenu', () => {
  const mockReceipt: SavedReceipt = {
    id: 'receipt-123',
    document_type: 'payment_receipt',
    status: 'completed',
    created_at: '2026-03-15T10:00:00Z',
    form_data: {
      receiptNo: 'REC-1001',
      date: '2026-03-15',
      salutation: 'Mr.',
      name: 'John Doe',
      refId: 'REF-999',
      amount: '500000',
      amountWords: 'Five Lakh Rupees',
      paymentRef: 'UPI-12345',
      drawnOn: 'HDFC Bank',
      plotNo: '42',
      plotSize: '200',
      account: 'A/C 1',
      paymentMethod: 'UPI',
      clientPhone: '9876543210',
    },
  };

  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    // Setup mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('renders trigger button with More actions label', () => {
    render(<ReceiptRowActionMenu receipt={mockReceipt} onDelete={vi.fn()} />);

    const trigger = screen.getByLabelText('More actions');
    expect(trigger).toBeDefined();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens dropdown menu on trigger button click', () => {
    render(<ReceiptRowActionMenu receipt={mockReceipt} onDelete={vi.fn()} />);

    const trigger = screen.getByLabelText('More actions');
    fireEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('menu')).toBeDefined();
    expect(screen.getByText('Use as Template')).toBeDefined();
    expect(screen.getByText('Email Receipt')).toBeDefined();
    expect(screen.getByText('Delete Receipt')).toBeDefined();
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <ReceiptRowActionMenu receipt={mockReceipt} onDelete={vi.fn()} />
      </div>
    );

    const trigger = screen.getByLabelText('More actions');
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeDefined();

    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes dropdown on Escape key press', () => {
    render(<ReceiptRowActionMenu receipt={mockReceipt} onDelete={vi.fn()} />);

    const trigger = screen.getByLabelText('More actions');
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders Use as Template link with templateId query param', () => {
    render(<ReceiptRowActionMenu receipt={mockReceipt} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('More actions'));
    const templateLink = screen.getByRole('menuitem', { name: /use as template/i });
    expect(templateLink.getAttribute('href')).toBe('/admin/payment-receipt?templateId=receipt-123');
  });

  it('handles Email Receipt action by writing to sessionStorage and redirecting', () => {
    render(<ReceiptRowActionMenu receipt={mockReceipt} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('More actions'));
    const emailBtn = screen.getByRole('menuitem', { name: /email receipt/i });
    fireEvent.click(emailBtn);

    expect(sessionStorage.getItem('emailPrefillRecord')).toBe(JSON.stringify(mockReceipt));
    expect(window.location.href).toBe('/admin/email?tab=compose&prefillReceipt=true');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders Customer Ledger button and calls onOpenLedger with refId', () => {
    const onOpenLedger = vi.fn();
    render(
      <ReceiptRowActionMenu receipt={mockReceipt} onOpenLedger={onOpenLedger} onDelete={vi.fn()} />
    );

    fireEvent.click(screen.getByLabelText('More actions'));
    const ledgerBtn = screen.getByRole('menuitem', { name: /customer ledger/i });
    fireEvent.click(ledgerBtn);

    expect(onOpenLedger).toHaveBeenCalledWith('REF-999');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('calls onDelete callback when Delete Receipt is clicked', () => {
    const onDelete = vi.fn();
    render(<ReceiptRowActionMenu receipt={mockReceipt} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText('More actions'));
    const deleteBtn = screen.getByRole('menuitem', { name: /delete receipt/i });
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(mockReceipt);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('calls onShareWhatsApp callback when Share via WhatsApp is clicked', () => {
    const onShareWhatsApp = vi.fn();
    render(
      <ReceiptRowActionMenu
        receipt={mockReceipt}
        onDelete={vi.fn()}
        onShareWhatsApp={onShareWhatsApp}
      />
    );

    fireEvent.click(screen.getByLabelText('More actions'));
    const waBtn = screen.getByRole('menuitem', { name: /share whatsapp/i });
    fireEvent.click(waBtn);

    expect(onShareWhatsApp).toHaveBeenCalledWith(mockReceipt);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
