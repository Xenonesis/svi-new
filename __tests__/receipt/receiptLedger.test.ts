import { describe, it, expect } from 'vitest';
import {
  normalizeRefId,
  groupReceiptsByRefId,
  calculateLedgerStatement,
} from '@/src/lib/receipt/receiptLedger';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

describe('receiptLedger engine', () => {
  const mockReceipts: SavedReceipt[] = [
    {
      id: '1',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-06-12T10:00:00Z',
      form_data: {
        receiptNo: '2064',
        date: '2026-06-12',
        salutation: 'Mr.',
        name: 'Piyush Sharma',
        refId: 'PL-2076',
        amount: '10000',
        amountWords: 'Ten Thousand',
        paymentRef: 'UPI1',
        drawnOn: 'HDFC',
        plotNo: '42',
        plotSize: '1000',
        account: 'Savings',
        paymentMethod: 'UPI',
      },
    },
    {
      id: '2',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-07-12T10:00:00Z',
      form_data: {
        receiptNo: '2075',
        date: '2026-07-12',
        salutation: 'Mr.',
        name: 'Piyush Sharma',
        refId: 'PL2076', // same normalized id
        amount: '15000',
        amountWords: 'Fifteen Thousand',
        paymentRef: 'UPI2',
        drawnOn: 'HDFC',
        plotNo: '42',
        plotSize: '1000',
        account: 'Savings',
        paymentMethod: 'UPI',
      },
    },
  ];

  it('normalizes ref IDs by trimming, stripping hyphens/spaces, and uppercasing', () => {
    expect(normalizeRefId('PL-2076')).toBe('PL2076');
    expect(normalizeRefId(' pl 2076 ')).toBe('PL2076');
    expect(normalizeRefId('svi002050')).toBe('SVI002050');
    expect(normalizeRefId('')).toBe('');
    expect(normalizeRefId(undefined)).toBe('');
  });

  it('groups receipts by normalized refId and aggregates total paid', () => {
    const summaries = groupReceiptsByRefId(mockReceipts, { PL2076: 50000 });
    expect(summaries.length).toBe(1);
    expect(summaries[0].normalizedRefId).toBe('PL2076');
    expect(summaries[0].totalPaid).toBe(25000);
    expect(summaries[0].receiptsCount).toBe(2);
    expect(summaries[0].agreedDealValue).toBe(50000);
    expect(summaries[0].balanceDue).toBe(25000);
    expect(summaries[0].percentCompleted).toBe(50);
  });

  it('calculates full ledger statement with receipts sorted chronologically', () => {
    const detail = calculateLedgerStatement('PL-2076', mockReceipts, 30000);
    expect(detail.receipts.length).toBe(2);
    expect(detail.totalPaid).toBe(25000);
    expect(detail.balanceDue).toBe(5000);
    expect(detail.percentCompleted).toBeCloseTo(83.33, 1);
    expect(detail.clientName).toBe('Piyush Sharma');
  });

  it('handles zero or missing agreed deal value cleanly', () => {
    const detail = calculateLedgerStatement('PL-2076', mockReceipts, 0);
    expect(detail.totalPaid).toBe(25000);
    expect(detail.balanceDue).toBe(0);
    expect(detail.percentCompleted).toBe(0);
  });
});
