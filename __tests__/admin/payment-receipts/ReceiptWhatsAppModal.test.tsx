import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReceiptWhatsAppModal } from '@/src/components/admin/payment-receipts/ReceiptWhatsAppModal';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ReceiptWhatsAppModal', () => {
  const mockReceipt: SavedReceipt = {
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
      plotSize: '1000',
      account: 'Savings',
      paymentMethod: 'UPI',
      clientPhone: '9876543210',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders modal with prefilled phone and message', () => {
    render(<ReceiptWhatsAppModal receipt={mockReceipt} onClose={vi.fn()} />);

    expect(screen.getByText('Share Receipt via WhatsApp')).toBeDefined();
    const phoneInput = screen.getByPlaceholderText('9876543210') as HTMLInputElement;
    expect(phoneInput.value).toBe('9876543210');

    const sendBtn = screen.getByRole('button', { name: /Open WhatsApp/i });
    expect(sendBtn).toBeDefined();
    expect((sendBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('opens WhatsApp URL in window.open when valid phone is provided', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const onClose = vi.fn();

    render(<ReceiptWhatsAppModal receipt={mockReceipt} onClose={onClose} />);

    const sendBtn = screen.getByRole('button', { name: /Open WhatsApp/i });
    fireEvent.click(sendBtn);

    expect(openSpy).toHaveBeenCalled();
    const url = openSpy.mock.calls[0][0] as string;
    expect(url).toContain('https://wa.me/919876543210?text=');
    expect(onClose).toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it('returns null when receipt is null', () => {
    const { container } = render(<ReceiptWhatsAppModal receipt={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
