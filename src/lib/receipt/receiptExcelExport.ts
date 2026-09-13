import ExcelJS from 'exceljs';
import { toast } from 'sonner';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

export async function exportReceiptsToExcel(
  receipts: SavedReceipt[],
  filename?: string
): Promise<void> {
  if (!receipts || receipts.length === 0) {
    toast.error('No receipts available to export');
    return;
  }

  try {
    toast.info('Generating Excel workbook...');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SVI Infra Systems';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Payment Receipts', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    worksheet.columns = [
      { header: 'Receipt No', key: 'receiptNo', width: 16 },
      { header: 'Ref ID', key: 'refId', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Client Name', key: 'clientName', width: 26 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'Amount (INR)', key: 'amount', width: 18 },
      { header: 'Payment Method', key: 'paymentMethod', width: 18 },
      { header: 'Payment Ref / UTR', key: 'paymentRef', width: 22 },
      { header: 'Bank / Drawn On', key: 'drawnOn', width: 20 },
      { header: 'Plot No', key: 'plotNo', width: 14 },
      { header: 'Plot Size (Sq. Yds.)', key: 'plotSize', width: 20 },
      { header: 'Account', key: 'account', width: 16 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Created At', key: 'createdAt', width: 22 },
    ];

    // Header styling: SVI brand dark navy with white bold text
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F2942' },
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FFC59A45' } }, // Brand gold accent line
      };
    });

    // Populate data rows
    receipts.forEach((r, idx) => {
      const d = r.form_data || ({} as SavedReceipt['form_data']);
      const fullName = d.salutation ? `${d.salutation} ${d.name}`.trim() : d.name || '';
      const numAmount = parseFloat(d.amount || '0');
      const safeAmount = isNaN(numAmount) ? 0 : numAmount;

      const row = worksheet.addRow({
        receiptNo: d.receiptNo || '—',
        refId: d.refId || '—',
        date: d.date || '—',
        clientName: fullName || '—',
        phone: d.clientPhone || '—',
        amount: safeAmount,
        paymentMethod: d.paymentMethod || '—',
        paymentRef: d.paymentRef || '—',
        drawnOn: d.drawnOn || '—',
        plotNo: d.plotNo || '—',
        plotSize: d.plotSize || '—',
        account: d.account || '—',
        status: r.metadata?.is_trashed ? 'Trashed' : r.status || 'Active',
        createdAt: r.created_at
          ? new Date(r.created_at).toISOString().replace('T', ' ').slice(0, 19)
          : '—',
      });

      row.height = 22;

      // Alternating row background (zebra striping)
      const isEven = idx % 2 === 0;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle' };

        if (!isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        // Center align code/ID/date columns
        if ([1, 2, 3, 5, 7, 10, 11, 13].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Currency format for amount column (col 6)
        if (colNumber === 6) {
          cell.numFmt = '₹#,##0.00';
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.font = { name: 'Segoe UI', size: 10, bold: true };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const nowStr = new Date().toISOString().split('T')[0];
    const finalFilename = filename || `SVI_Payment_Receipts_${nowStr}.xlsx`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${receipts.length} receipts to Excel (.xlsx)`);
  } catch (err) {
    console.error('Excel export error:', err);
    toast.error('Failed to generate Excel file.');
  }
}
