import type { Lottery } from '@/src/components/admin/lottery/types';
import { toast } from 'sonner';

export interface FlatLotteryExportRow {
  serialNo: number;
  campaignName: string;
  campaignId: string;
  date: string;
  status: string;
  winnerName: string;
  ticketNumber: string;
  winnerId: string;
}

/**
 * Normalizes lottery campaigns into a tabular row format.
 * If a campaign has multiple winners, creates a distinct row for each winner
 * while preserving the parent campaign metadata.
 */
export function flattenLotteriesForExport(lotteries: Lottery[]): FlatLotteryExportRow[] {
  const rows: FlatLotteryExportRow[] = [];
  let sNo = 1;

  for (const l of lotteries) {
    const formattedDate = l.created_at
      ? new Date(l.created_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';

    const statusUpper = (l.status || 'ACTIVE').toUpperCase();
    const winnersList = l.winners && l.winners.length > 0 ? l.winners : l.winner ? [l.winner] : [];

    if (winnersList.length === 0) {
      rows.push({
        serialNo: sNo++,
        campaignName: l.title || 'Untitled Campaign',
        campaignId: l.id || '',
        date: formattedDate,
        status: statusUpper,
        winnerName: 'Pending Draw',
        ticketNumber: '—',
        winnerId: '—',
      });
    } else {
      for (const w of winnersList) {
        rows.push({
          serialNo: sNo++,
          campaignName: l.title || 'Untitled Campaign',
          campaignId: l.id || '',
          date: formattedDate,
          status: statusUpper,
          winnerName: w.name || 'Anonymous Winner',
          ticketNumber: w.ticket_number || '—',
          winnerId: w.id || '—',
        });
      }
    }
  }

  return rows;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestampStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 1. Export Lottery Archive to CSV
 */
export function exportLotteryToCSV(
  lotteries: Lottery[],
  filename = `svi-lottery-archive-${getTimestampStr()}.csv`
): void {
  if (!lotteries || lotteries.length === 0) {
    toast.error('No lottery campaigns to export.');
    return;
  }

  try {
    const rows = flattenLotteriesForExport(lotteries);
    const headers = [
      'S.No',
      'Campaign Name',
      'Campaign ID',
      'Date',
      'Status',
      'Winner Name',
      'Ticket Number',
      'Winner ID',
    ];

    const escapeCsv = (val: string | number) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const csvLines = [
      headers.map(escapeCsv).join(','),
      ...rows.map((r) =>
        [
          r.serialNo,
          escapeCsv(r.campaignName),
          escapeCsv(r.campaignId),
          escapeCsv(r.date),
          escapeCsv(r.status),
          escapeCsv(r.winnerName),
          escapeCsv(r.ticketNumber),
          escapeCsv(r.winnerId),
        ].join(',')
      ),
    ];

    const blob = new Blob([csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, filename);
    toast.success(`Exported ${rows.length} records to CSV`);
  } catch (err: unknown) {
    console.error('CSV Export Error:', err);
    toast.error('Failed to generate CSV export.');
  }
}

/**
 * 2. Export Lottery Archive to formatted Excel (.xlsx) using ExcelJS
 */
export async function exportLotteryToExcel(
  lotteries: Lottery[],
  filename = `svi-lottery-archive-${getTimestampStr()}.xlsx`
): Promise<void> {
  if (!lotteries || lotteries.length === 0) {
    toast.error('No lottery campaigns to export.');
    return;
  }

  try {
    toast.info('Generating Excel workbook...');
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SVI Infra Solutions Corporate Portal';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Lottery Archive & Winners', {
      views: [{ showGridLines: true }],
    });

    const rows = flattenLotteriesForExport(lotteries);

    // ── 1. Top Title Banner ──
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'SVI INFRA SOLUTIONS — LOTTERY CAMPAIGNS & WINNERS ARCHIVE';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' }, // Deep Slate Navy
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 34;

    // ── 2. Subtitle / Metadata ──
    worksheet.mergeCells('A2:H2');
    const metaCell = worksheet.getCell('A2');
    metaCell.value = `Generated: ${new Date().toLocaleString('en-IN')} | Total Campaigns: ${lotteries.length} | Total Winner Records: ${rows.filter((r) => r.winnerName !== 'Pending Draw').length}`;
    metaCell.font = { name: 'Calibri', size: 9.5, italic: true, color: { argb: 'FFD4AF37' } }; // Gold
    metaCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };
    metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 20;

    // Empty separator row
    worksheet.getRow(3).height = 10;

    // ── 3. Table Column Headers ──
    const headers = [
      'S.No',
      'Campaign Name',
      'Campaign ID',
      'Date',
      'Status',
      'Winner Details / Name',
      'Ticket Number',
      'Winner ID / Reference',
    ];

    const headerRow = worksheet.getRow(4);
    headerRow.values = headers;
    headerRow.height = 26;

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF475569' } },
        bottom: { style: 'medium', color: { argb: 'FFD4AF37' } }, // Warm Gold Border
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });

    // ── 4. Data Rows ──
    rows.forEach((r, idx) => {
      const rowIdx = 5 + idx;
      const dataRow = worksheet.getRow(rowIdx);
      dataRow.height = 22;

      dataRow.values = [
        r.serialNo,
        r.campaignName,
        r.campaignId,
        r.date,
        r.status,
        r.winnerName,
        r.ticketNumber,
        r.winnerId,
      ];

      const isEven = idx % 2 === 0;
      const bgArgb = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF1E293B' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgArgb },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        // Alignments
        if (colNumber === 1 || colNumber === 4 || colNumber === 5 || colNumber === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        }

        // Status highlight
        if (colNumber === 5) {
          if (r.status === 'ACTIVE') {
            cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF16A34A' } }; // Green
          } else if (r.status === 'COMPLETED') {
            cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF2563EB' } }; // Blue
          } else {
            cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF64748B' } };
          }
        }

        // Ticket number mono-like bold
        if (colNumber === 7 && r.ticketNumber !== '—') {
          cell.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FFB45309' } }; // Amber
        }
      });
    });

    // ── 5. Column Widths ──
    worksheet.columns = [
      { width: 8 }, // S.No
      { width: 34 }, // Campaign Name
      { width: 38 }, // Campaign ID
      { width: 16 }, // Date
      { width: 14 }, // Status
      { width: 28 }, // Winner Details
      { width: 16 }, // Ticket Number
      { width: 38 }, // Winner ID
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    triggerDownload(blob, filename);
    toast.success(`Exported ${rows.length} records to Excel (.xlsx)`);
  } catch (err: unknown) {
    console.error('Excel Export Error:', err);
    toast.error('Failed to generate Excel file.');
  }
}

/**
 * 3. Export Lottery Archive to formatted PDF using jsPDF
 */
export async function exportLotteryToPDF(
  lotteries: Lottery[],
  filename = `svi-lottery-archive-${getTimestampStr()}.pdf`
): Promise<void> {
  if (!lotteries || lotteries.length === 0) {
    toast.error('No lottery campaigns to export.');
    return;
  }

  try {
    toast.info('Generating PDF report...');
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const rows = flattenLotteriesForExport(lotteries);
    const totalWinners = rows.filter((r) => r.winnerName !== 'Pending Draw').length;

    const drawHeader = (pageNo: number) => {
      // Top Obsidian Navy Banner
      doc.setFillColor(15, 23, 42); // #0f172a
      doc.rect(0, 0, pageWidth, 52, 'F');

      // Gold accent stripe under header
      doc.setFillColor(212, 175, 55); // #d4af37
      doc.rect(0, 52, pageWidth, 2.5, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('SVI INFRA SOLUTIONS — LOTTERY CAMPAIGNS & WINNERS ARCHIVE', 30, 32);

      // Meta Right
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(212, 175, 55);
      doc.text(
        `Date: ${new Date().toLocaleDateString('en-IN')} | Campaigns: ${lotteries.length} | Winners: ${totalWinners} | Page ${pageNo}`,
        pageWidth - 30,
        32,
        { align: 'right' }
      );

      // Table Header Row
      const thY = 76;
      doc.setFillColor(241, 245, 249); // #f1f5f9
      doc.rect(30, thY - 14, pageWidth - 60, 22, 'F');

      doc.setTextColor(71, 85, 105); // #475569
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');

      doc.text('S.No', 35, thY);
      doc.text('Campaign Name', 70, thY);
      doc.text('Campaign ID', 240, thY);
      doc.text('Date', 370, thY);
      doc.text('Status', 440, thY);
      doc.text('Winner Details', 505, thY);
      doc.text('Ticket No', 660, thY);
      doc.text('Winner ID', 730, thY);
    };

    let pageNum = 1;
    drawHeader(pageNum);

    let currentY = 96;
    const rowHeight = 20;

    rows.forEach((r, idx) => {
      // Page break check
      if (currentY + rowHeight > pageHeight - 35) {
        doc.addPage();
        pageNum++;
        drawHeader(pageNum);
        currentY = 96;
      }

      // Zebra striping
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252); // #f8fafc
        doc.rect(30, currentY - 12, pageWidth - 60, rowHeight, 'F');
      }

      // Subtle row bottom line
      doc.setDrawColor(226, 232, 240);
      doc.line(30, currentY + 7, pageWidth - 30, currentY + 7);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      // 1. S.No
      doc.text(String(r.serialNo), 35, currentY);

      // 2. Campaign Name (truncate if too long)
      const nameTrunc =
        r.campaignName.length > 32 ? `${r.campaignName.slice(0, 30)}…` : r.campaignName;
      doc.setFont('helvetica', 'bold');
      doc.text(nameTrunc, 70, currentY);
      doc.setFont('helvetica', 'normal');

      // 3. Campaign ID (shortened for printable width)
      const idTrunc = r.campaignId.length > 18 ? `${r.campaignId.slice(0, 16)}…` : r.campaignId;
      doc.text(idTrunc, 240, currentY);

      // 4. Date
      doc.text(r.date, 370, currentY);

      // 5. Status with color
      if (r.status === 'ACTIVE') {
        doc.setTextColor(22, 163, 74); // Green
      } else if (r.status === 'COMPLETED') {
        doc.setTextColor(37, 99, 235); // Blue
      } else {
        doc.setTextColor(100, 116, 139);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(r.status, 440, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      // 6. Winner Name
      const winnerTrunc = r.winnerName.length > 28 ? `${r.winnerName.slice(0, 26)}…` : r.winnerName;
      if (r.winnerName !== 'Pending Draw') {
        doc.setFont('helvetica', 'bold');
      }
      doc.text(winnerTrunc, 505, currentY);
      doc.setFont('helvetica', 'normal');

      // 7. Ticket No
      if (r.ticketNumber !== '—') {
        doc.setTextColor(180, 83, 9); // Amber
        doc.setFont('helvetica', 'bold');
      }
      doc.text(r.ticketNumber, 660, currentY);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');

      // 8. Winner ID (shortened)
      const widTrunc = r.winnerId.length > 14 ? `${r.winnerId.slice(0, 12)}…` : r.winnerId;
      doc.text(widTrunc, 730, currentY);

      currentY += rowHeight;
    });

    // Footer on last page
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Shivani Infra Solutions Pvt Ltd — Confidential Executive Audit Record',
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );

    doc.save(filename);
    toast.success('Exported lottery archive to PDF');
  } catch (err: unknown) {
    console.error('PDF Export Error:', err);
    toast.error('Failed to generate PDF report.');
  }
}
