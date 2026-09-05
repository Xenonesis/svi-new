import { describe, it, expect } from 'vitest';
import {
  cleanIndianPhoneNumber,
  isValidIndianPhoneNumber,
  buildReceiptWhatsAppMessage,
  buildWhatsAppShareUrl,
} from '@/src/lib/receipt/receiptWhatsApp';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

describe('receiptWhatsApp utility', () => {
  it('cleans and normalizes various Indian phone formats to 10 digits', () => {
    expect(cleanIndianPhoneNumber('+91 98765-43210')).toBe('9876543210');
    expect(cleanIndianPhoneNumber('09876543210')).toBe('9876543210');
    expect(cleanIndianPhoneNumber('919876543210')).toBe('9876543210');
    expect(cleanIndianPhoneNumber('9876543210')).toBe('9876543210');
    expect(cleanIndianPhoneNumber('')).toBe('');
  });

  it('validates 10-digit Indian mobile numbers starting with 6-9', () => {
    expect(isValidIndianPhoneNumber('9876543210')).toBe(true);
    expect(isValidIndianPhoneNumber('7300007643')).toBe(true);
    expect(isValidIndianPhoneNumber('6234567890')).toBe(true);
    expect(isValidIndianPhoneNumber('1234567890')).toBe(false);
    expect(isValidIndianPhoneNumber('98765')).toBe(false);
    expect(isValidIndianPhoneNumber('')).toBe(false);
  });

  it('builds professional WhatsApp message template', () => {
    const receipt: SavedReceipt = {
      id: 'rec-1',
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
        paymentRef: 'UPI-999',
        drawnOn: 'HDFC',
        plotNo: '42',
        plotSize: '1000',
        account: 'Savings',
        paymentMethod: 'UPI',
      },
    };

    const msg = buildReceiptWhatsAppMessage(receipt, 'https://www.sviinfrasolutions.com');
    expect(msg).toContain('Dear Mr. Piyush Sharma');
    expect(msg).toContain('₹16,042');
    expect(msg).toContain('Plot 42');
    expect(msg).toContain('Ref ID: SVI2051');
    expect(msg).toContain('*Receipt No:* #2064');
    expect(msg).toContain('https://www.sviinfrasolutions.com');
  });

  it('builds wa.me URL with 91 prefix and URI encoded message', () => {
    const url = buildWhatsAppShareUrl('9876543210', 'Hello SVI');
    expect(url).toBe('https://wa.me/919876543210?text=Hello%20SVI');

    const emptyPhoneUrl = buildWhatsAppShareUrl('', 'Hello SVI');
    expect(emptyPhoneUrl).toBe('https://wa.me/?text=Hello%20SVI');
  });
});
