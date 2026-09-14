import ExcelJS from 'exceljs';
import { toast } from 'sonner';
import { CustomerLedgerDetail } from './receiptLedger';
import { exportToPDF } from '@/src/lib/utils/documentExporter';

interface ExportStatementOptions {
  ledger: CustomerLedgerDetail;
  advisorName?: string;
  area?: number | string | null;
  ratePerSqYd?: number | string | null;
  filename?: string;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into D.M.YY format matching Delhi Office format,
 * or DD/MM/YYYY fallback.
 */
function formatStatementDate(rawDate?: string): string {
  if (!rawDate) return '—';
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = String(d.getFullYear()).slice(-2);
      return `${day}.${month}.${year}`;
    }
  } catch {
    // Ignore and fallback
  }
  return rawDate;
}

/**
 * Exports client payment statement as Excel (.xlsx) matching exact structure of
 * DELHI OFFICE STATEMENT (1).xlsx (Sheet P.NO. 36), including corporate SVI logo and formulas.
 */
export async function exportStatementExcel({
  ledger,
  advisorName = 'Direct / SVI Official',
  area,
  ratePerSqYd,
  filename,
}: ExportStatementOptions): Promise<void> {
  if (!ledger || !ledger.receipts || ledger.receipts.length === 0) {
    toast.error('No payment receipts recorded for this client statement.');
    return;
  }

  try {
    toast.info('Generating Excel statement...');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SVI Infra Solutions Pvt. Ltd.';
    workbook.created = new Date();

    const sheetName = ledger.plotNo ? `P.NO. ${ledger.plotNo}` : `Ref ${ledger.displayRefId}`;
    const worksheet = workbook.addWorksheet(sheetName.slice(0, 31), {
      views: [{ showGridLines: true }],
    });

    // Exact column widths tuned to Abhilasha statement
    worksheet.columns = [
      { width: 24 }, // A: NAME OF CLIENT
      { width: 14 }, // B: PLOT NO.
      { width: 14 }, // C: PLOT SIZE
      { width: 12 }, // D: RATE
      { width: 16 }, // E: PLOT AMT.
      { width: 18 }, // F: DRAW DATE
      { width: 16 }, // G: AMOUNT
      { width: 24 }, // H: ADVISOR
    ];

    // ── 1. Embed Official Corporate SVI Logo ─────────────────────────────────
    try {
      const logoRes = await fetch('/logo.png');
      if (logoRes.ok) {
        const logoBuffer = await logoRes.arrayBuffer();
        const logoId = workbook.addImage({
          buffer: logoBuffer,
          extension: 'png',
        });
        worksheet.addImage(logoId, {
          tl: { col: 0.15, row: 0.2 },
          ext: { width: 130, height: 42 },
        });
      }
    } catch (logoErr) {
      console.warn('Could not embed logo image into Excel:', logoErr);
    }

    // ── 2. Top Corporate Header ─────────────────────────────────────────────
    worksheet.mergeCells('C1:H1');
    const titleCell = worksheet.getCell('C1');
    titleCell.value = 'SHREE VENKATESHWARA INFRASTRUCTURE PVT. LTD.';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0F2942' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('C2:H2');
    const subCell = worksheet.getCell('C2');
    subCell.value = `CUSTOMER PAYMENT STATEMENT & LEDGER • REF ID: ${ledger.displayRefId}`;
    subCell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFC59A45' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.getRow(1).height = 24;
    worksheet.getRow(2).height = 20;
    worksheet.getRow(3).height = 10; // Spacing gap

    // ── 3. Table Column Headers (Row 4) ─────────────────────────────────────
    const startRow = 4;
    const headerRow = worksheet.getRow(startRow);
    headerRow.height = 26;

    const headers = [
      'NAME OF CLIENT',
      'PLOT NO.',
      'PLOT SIZE',
      'RATE',
      'PLOT AMT.',
      'DRAW DATE',
      'AMOUNT',
      'ADVISOR',
    ];

    const medBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } },
    };

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } },
    };

    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F4F7' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = medBorder;
    });

    // ── 4. Calculate Dimensions & Positions ─────────────────────────────────
    const plotSizeNum =
      parseFloat(String(area || ledger.plotSize || '0').replace(/[^\d.]/g, '')) || 0;
    const rateNum =
      parseFloat(String(ratePerSqYd || ledger.ratePerSqYd || '0').replace(/[^\d.]/g, '')) || 0;
    const agreedDealValue =
      ledger.agreedDealValue > 0
        ? ledger.agreedDealValue
        : plotSizeNum > 0 && rateNum > 0
          ? Math.round(plotSizeNum * rateNum)
          : 0;

    const receiptsList = [...ledger.receipts].sort((a, b) => {
      const dateA = new Date(a.form_data?.date || a.created_at).getTime();
      const dateB = new Date(b.form_data?.date || b.created_at).getTime();
      return dateA - dateB;
    });

    const receiptsCount = receiptsList.length;
    const tableDataRowCount = Math.max(3, receiptsCount);
    const firstDataRow = startRow + 1; // 5
    const lastDataRow = firstDataRow + tableDataRowCount - 1;
    const sumRow = lastDataRow + 1;

    for (let r = firstDataRow; r <= sumRow; r++) {
      worksheet.getRow(r).height = 22;
    }

    // ── 5. Row 1: Client Information & First Receipt ────────────────────────
    const r1 = worksheet.getRow(firstDataRow);
    // Client Name
    r1.getCell(1).value = (ledger.clientName || 'N/A').toUpperCase();
    r1.getCell(1).font = { name: 'Calibri', size: 12, bold: true };
    r1.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    r1.getCell(1).border = medBorder;

    // Plot No.
    r1.getCell(2).value = ledger.plotNo || '—';
    r1.getCell(2).font = { name: 'Calibri', size: 12, bold: true };
    r1.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    r1.getCell(2).border = medBorder;

    // Plot Size
    r1.getCell(3).value = plotSizeNum > 0 ? plotSizeNum : ledger.plotSize || '—';
    r1.getCell(3).font = { name: 'Calibri', size: 12, bold: true };
    r1.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
    r1.getCell(3).border = medBorder;

    // Rate
    r1.getCell(4).value = rateNum > 0 ? rateNum : '—';
    r1.getCell(4).font = { name: 'Calibri', size: 12, bold: true };
    r1.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
    r1.getCell(4).border = medBorder;

    // Plot Amount (Formula: C5*D5 or agreedDealValue)
    if (plotSizeNum > 0 && rateNum > 0) {
      r1.getCell(5).value = {
        formula: `C${firstDataRow}*D${firstDataRow}`,
        result: agreedDealValue,
      };
    } else {
      r1.getCell(5).value = agreedDealValue > 0 ? agreedDealValue : '—';
    }
    r1.getCell(5).font = { name: 'Calibri', size: 12, bold: true };
    r1.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
    r1.getCell(5).border = medBorder;

    // ── 6. Row 2: TOTAL REC. AMOUNT ─────────────────────────────────────────
    const r2 = worksheet.getRow(firstDataRow + 1);
    r2.getCell(1).border = { left: { style: 'medium', color: { argb: 'FF000000' } } };

    worksheet.mergeCells(`B${firstDataRow + 1}:D${firstDataRow + 1}`);
    const totalRecCell = worksheet.getCell(`B${firstDataRow + 1}`);
    totalRecCell.value = 'TOTAL REC. AMOUNT';
    totalRecCell.font = { name: 'Calibri', size: 12, bold: true };
    totalRecCell.alignment = { vertical: 'middle', horizontal: 'center' };
    for (let c = 2; c <= 4; c++) {
      r2.getCell(c).border = medBorder;
    }

    r2.getCell(5).value = {
      formula: `G${sumRow}`,
      result: ledger.totalPaid,
    };
    r2.getCell(5).font = { name: 'Calibri', size: 12, bold: true };
    r2.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
    r2.getCell(5).border = medBorder;

    // ── 7. Row 3: BALANCE ───────────────────────────────────────────────────
    const r3 = worksheet.getRow(firstDataRow + 2);
    r3.getCell(1).border = { left: { style: 'medium', color: { argb: 'FF000000' } } };

    worksheet.mergeCells(`B${firstDataRow + 2}:D${firstDataRow + 2}`);
    const balCell = worksheet.getCell(`B${firstDataRow + 2}`);
    balCell.value = 'BALANCE';
    balCell.font = { name: 'Calibri', size: 12, bold: true };
    balCell.alignment = { vertical: 'middle', horizontal: 'center' };
    for (let c = 2; c <= 4; c++) {
      r3.getCell(c).border = medBorder;
    }

    const calcBalance = Math.max(0, agreedDealValue - ledger.totalPaid);
    r3.getCell(5).value = {
      formula: `E${firstDataRow}-E${firstDataRow + 1}`,
      result: calcBalance,
    };
    r3.getCell(5).font = { name: 'Calibri', size: 12, bold: true };
    r3.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
    r3.getCell(5).border = medBorder;

    // ── 8. Subsequent Rows left border continuity ───────────────────────────
    for (let r = firstDataRow + 3; r <= lastDataRow; r++) {
      worksheet.getRow(r).getCell(1).border = {
        left: { style: 'medium', color: { argb: 'FF000000' } },
      };
    }

    // ── 9. Populate Chronological Payment Receipts (Cols F & G) ─────────────
    for (let i = 0; i < tableDataRowCount; i++) {
      const rowIdx = firstDataRow + i;
      const row = worksheet.getRow(rowIdx);
      const rec = receiptsList[i];

      if (rec) {
        const amt = parseFloat(rec.form_data?.amount || '0') || 0;
        row.getCell(6).value = formatStatementDate(rec.form_data?.date || rec.created_at);
        row.getCell(7).value = amt;
      } else {
        row.getCell(6).value = '';
        row.getCell(7).value = '';
      }

      row.getCell(6).font = { name: 'Calibri', size: 11, bold: true };
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(6).border = thinBorder;

      row.getCell(7).font = { name: 'Calibri', size: 11, bold: true };
      row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(7).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'medium', color: { argb: 'FF000000' } },
      };
    }

    // ── 10. Summary Row: TOTAL AMT. REC. ────────────────────────────────────
    const sumR = worksheet.getRow(sumRow);
    sumR.height = 24;
    sumR.getCell(6).value = 'TOTAL AMT. REC.';
    sumR.getCell(6).font = { name: 'Calibri', size: 13, bold: true };
    sumR.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
    sumR.getCell(6).border = medBorder;

    sumR.getCell(7).value = {
      formula: `SUM(G${firstDataRow}:G${lastDataRow})`,
      result: ledger.totalPaid,
    };
    sumR.getCell(7).font = { name: 'Calibri', size: 13, bold: true };
    sumR.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
    sumR.getCell(7).border = medBorder;

    // ── 11. Advisor Column (Col H) ──────────────────────────────────────────
    // Merged vertically from firstDataRow to sumRow, exactly matching Abhilasha's statement
    worksheet.mergeCells(`H${firstDataRow}:H${sumRow}`);
    const advCell = worksheet.getCell(`H${firstDataRow}`);
    advCell.value = advisorName;
    advCell.font = { name: 'Calibri', size: 12, bold: true };
    advCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    for (let r = firstDataRow; r <= sumRow; r++) {
      worksheet.getRow(r).getCell(8).border = medBorder;
    }

    // ── 12. Write and Trigger File Download ─────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const safeRef = ledger.displayRefId.replace(/[^a-zA-Z0-9]/g, '_');
    const safeClient = ledger.clientName.replace(/[^a-zA-Z0-9]/g, '_');
    const outFilename = filename || `Statement_${safeClient}_${safeRef}.xlsx`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Statement exported as Excel: ${outFilename}`);
  } catch (err: unknown) {
    console.error('Excel statement export failed:', err);
    toast.error('Failed to export Excel statement');
  }
}

/**
 * Exports client payment statement as PDF (.pdf) matching the exact Abhilasha statement
 * layout with official SVI corporate logo and crisp styling.
 */
export async function exportStatementPdf({
  elementId,
  filename,
}: {
  elementId: string;
  filename: string;
}): Promise<void> {
  try {
    toast.info('Generating PDF statement...');
    await exportToPDF({
      elementId,
      filename,
      padding: '24px',
      scale: 2,
      width: '1000px',
    });
    toast.success(`Statement exported as PDF: ${filename}`);
  } catch (err: unknown) {
    console.error('PDF statement export failed:', err);
    toast.error('Failed to export PDF statement');
  }
}
