import { describe, it, expect, vi } from 'vitest';
import { generateReceiptsCsv, downloadReceiptsCsv } from '@/src/lib/receipt/receiptCsvExport';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

describe('receiptCsvExport utility', () => {
  const mockReceipts: SavedReceipt[] = [
    {
      id: 'rec-1',
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
        paymentRef: 'UPI-12345',
        drawnOn: 'HDFC Bank, Civil Lines',
        plotNo: '42',
        plotSize: '1000',
        account: 'Savings',
        paymentMethod: 'UPI',
        clientPhone: '9876543210',
      },
    },
    {
      id: 'rec-2',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-06-15T10:00:00Z',
      form_data: {
        receiptNo: '2065',
        date: '2026-06-15',
        salutation: 'Mr.',
        name: 'Gupta & "Sons"',
        refId: 'SVI2051',
        amount: '25000',
        amountWords: 'Twenty Five Thousand',
        paymentRef: 'NEFT-888',
        drawnOn: 'SBI',
        plotNo: '10',
        plotSize: '',
        account: 'Current',
        paymentMethod: 'Bank Transfer',
      },
    },
  ];

  it('generates correct CSV headers and rows with escaped values', () => {
    const csv = generateReceiptsCsv(mockReceipts);
    const lines = csv.split('\n');

    expect(lines[0]).toBe(
      'Receipt No,Ref ID,Date,Client Name,Phone,Amount (INR),Payment Method,Payment Ref / UTR,Bank / Drawn On,Plot No,Plot Size (Sq. Yds.),Account,Created At'
    );
    expect(lines[1]).toContain(
      '2064,PL-2078,2026-06-12,Mrs. Rani Bhatnagar,9876543210,14578,UPI,UPI-12345,"HDFC Bank, Civil Lines",42,1000,Savings'
    );
    expect(lines[2]).toContain('"Mr. Gupta & ""Sons"""');
  });

  it('handles empty receipts array without crashing', () => {
    const csv = generateReceiptsCsv([]);
    expect(csv.trim()).toBe(
      'Receipt No,Ref ID,Date,Client Name,Phone,Amount (INR),Payment Method,Payment Ref / UTR,Bank / Drawn On,Plot No,Plot Size (Sq. Yds.),Account,Created At'
    );
  });

  it('triggers browser download with blob and anchor element', () => {
    const clickSpy = vi.fn();
    const mockAnchor = {
      setAttribute: vi.fn(),
      click: clickSpy,
    };
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockAnchor as unknown as HTMLElement);
    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => mockAnchor as unknown as HTMLElement);
    const removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => mockAnchor as unknown as HTMLElement);
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    downloadReceiptsCsv(mockReceipts, 'test_export.csv');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.setAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
    expect(mockAnchor.setAttribute).toHaveBeenCalledWith('download', 'test_export.csv');
    expect(clickSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});
