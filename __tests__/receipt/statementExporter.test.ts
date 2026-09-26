import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportStatementExcel } from '@/src/lib/receipt/statementExporter';
import { CustomerLedgerDetail } from '@/src/lib/receipt/receiptLedger';

describe('statementExporter', () => {
  const mockLedger: CustomerLedgerDetail = {
    normalizedRefId: 'SVI002134',
    displayRefId: 'SVI002134',
    clientName: 'ABHILASHA VARMA',
    plotNo: '1',
    plotSize: '193.90',
    totalPaid: 708867,
    agreedDealValue: 1066450,
    balanceDue: 357583,
    percentCompleted: 66.47,
    ratePerSqYd: 5500,
    receipts: [
      {
        id: 'r1',
        document_type: 'payment_receipt',
        status: 'active',
        created_at: '2026-06-05T10:00:00Z',
        form_data: {
          receiptNo: '101',
          date: '2026-06-05',
          salutation: 'Ms.',
          name: 'ABHILASHA VARMA',
          refId: 'SVI002134',
          amount: '50000',
          amountWords: 'Fifty Thousand',
          paymentRef: 'UPI1',
          drawnOn: 'HDFC',
          plotNo: '1',
          plotSize: '193.90',
          account: 'SVI',
          paymentMethod: 'UPI',
        },
      },
      {
        id: 'r2',
        document_type: 'payment_receipt',
        status: 'active',
        created_at: '2026-06-07T10:00:00Z',
        form_data: {
          receiptNo: '102',
          date: '2026-06-07',
          salutation: 'Ms.',
          name: 'ABHILASHA VARMA',
          refId: 'SVI002134',
          amount: '50000',
          amountWords: 'Fifty Thousand',
          paymentRef: 'UPI2',
          drawnOn: 'HDFC',
          plotNo: '1',
          plotSize: '193.90',
          account: 'SVI',
          paymentMethod: 'UPI',
        },
      },
      {
        id: 'r3',
        document_type: 'payment_receipt',
        status: 'active',
        created_at: '2026-06-07T12:00:00Z',
        form_data: {
          receiptNo: '103',
          date: '2026-06-07',
          salutation: 'Ms.',
          name: 'ABHILASHA VARMA',
          refId: 'SVI002134',
          amount: '1000',
          amountWords: 'One Thousand',
          paymentRef: 'UPI3',
          drawnOn: 'HDFC',
          plotNo: '1',
          plotSize: '193.90',
          account: 'SVI',
          paymentMethod: 'UPI',
        },
      },
      {
        id: 'r4',
        document_type: 'payment_receipt',
        status: 'active',
        created_at: '2026-06-08T10:00:00Z',
        form_data: {
          receiptNo: '104',
          date: '2026-06-08',
          salutation: 'Ms.',
          name: 'ABHILASHA VARMA',
          refId: 'SVI002134',
          amount: '430125',
          amountWords: 'Four Lakh Thirty Thousand One Hundred Twenty Five',
          paymentRef: 'UPI4',
          drawnOn: 'HDFC',
          plotNo: '1',
          plotSize: '193.90',
          account: 'SVI',
          paymentMethod: 'UPI',
        },
      },
      {
        id: 'r5',
        document_type: 'payment_receipt',
        status: 'active',
        created_at: '2026-08-03T10:00:00Z',
        form_data: {
          receiptNo: '105',
          date: '2026-08-03',
          salutation: 'Ms.',
          name: 'ABHILASHA VARMA',
          refId: 'SVI002134',
          amount: '177742',
          amountWords: 'One Lakh Seventy Seven Thousand Seven Hundred Forty Two',
          paymentRef: 'UPI5',
          drawnOn: 'HDFC',
          plotNo: '1',
          plotSize: '193.90',
          account: 'SVI',
          paymentMethod: 'UPI',
        },
      },
    ],
  };

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      })
    );
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('generates an Excel statement matching Delhi Office format without error', async () => {
    // Mock document.createElement for download link
    const clickMock = vi.fn();
    const appendChildMock = vi.fn();
    const removeChildMock = vi.fn();

    vi.spyOn(document, 'createElement').mockReturnValue({
      set href(val: string) {},
      set download(val: string) {},
      click: clickMock,
    } as unknown as HTMLElement);

    vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock);
    vi.spyOn(document.body, 'removeChild').mockImplementation(removeChildMock);

    await exportStatementExcel({
      ledger: mockLedger,
      advisorName: 'Muskan Varshney',
      area: 193.9,
      ratePerSqYd: 5500,
    });

    expect(clickMock).toHaveBeenCalled();
  }, 15000);
});
