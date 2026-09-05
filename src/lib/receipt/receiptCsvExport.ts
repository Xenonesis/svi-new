import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateReceiptsCsv(receipts: SavedReceipt[]): string {
  const headers = [
    'Receipt No',
    'Ref ID',
    'Date',
    'Client Name',
    'Phone',
    'Amount (INR)',
    'Payment Method',
    'Payment Ref / UTR',
    'Bank / Drawn On',
    'Plot No',
    'Plot Size (Sq. Yds.)',
    'Account',
    'Created At',
  ];

  const rows = receipts.map((r) => {
    const d = r.form_data || ({} as SavedReceipt['form_data']);
    const fullName = d.salutation ? `${d.salutation} ${d.name}`.trim() : d.name || '';
    const numericAmount = parseFloat(d.amount || '0');

    return [
      escapeCsvCell(d.receiptNo),
      escapeCsvCell(d.refId),
      escapeCsvCell(d.date),
      escapeCsvCell(fullName),
      escapeCsvCell(d.clientPhone || ''),
      escapeCsvCell(Number.isNaN(numericAmount) ? 0 : numericAmount),
      escapeCsvCell(d.paymentMethod),
      escapeCsvCell(d.paymentRef || ''),
      escapeCsvCell(d.drawnOn || ''),
      escapeCsvCell(d.plotNo || ''),
      escapeCsvCell(d.plotSize || ''),
      escapeCsvCell(d.account || ''),
      escapeCsvCell(r.created_at || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadReceiptsCsv(receipts: SavedReceipt[], filename?: string): void {
  const csvContent = generateReceiptsCsv(receipts);
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `SVI_Payment_Receipts_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
