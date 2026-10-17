import type { Lottery, DbParticipant } from '@/src/components/admin/lottery/types';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';

export interface SingleLotteryExportData {
  lottery: Lottery;
  participants: DbParticipant[];
  winners: DbParticipant[];
  nonWinners: DbParticipant[];
}

/**
 * Fetches all participants for a specific lottery campaign.
 */
export async function fetchLotteryExportData(lottery: Lottery): Promise<SingleLotteryExportData> {
  const { data: participants, error } = await supabase
    .from('lottery_participants')
    .select('id, name, ticket_number, phone, email, is_winner, prize_rank, created_at')
    .eq('lottery_id', lottery.id)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to fetch draw participants');
  }

  const all = (participants || []) as DbParticipant[];
  const winners = all.filter((p) => p.is_winner);
  const nonWinners = all.filter((p) => !p.is_winner);

  // Distribute winners naturally throughout the list (e.g. at positions 7, 18, 31, 44, 56, etc.)
  // instead of clumping them all at the top
  const naturalList: DbParticipant[] = [];
  if (winners.length > 0 && nonWinners.length > 0) {
    // Calculate balanced spacing intervals with natural offsets
    const totalCount = all.length;
    const interval = Math.floor(totalCount / winners.length);
    const winnerPositions = new Set<number>();

    // Spread target indices (e.g., ~7, 19, 31, 42, 53, 65, 76, 84, 91, 97)
    let curOffset = Math.max(3, Math.floor(interval * 0.6));
    for (let i = 0; i < winners.length; i++) {
      winnerPositions.add(Math.min(totalCount - 1, curOffset));
      curOffset += interval;
    }

    let wIdx = 0;
    let nwIdx = 0;
    for (let pos = 0; pos < totalCount; pos++) {
      if (winnerPositions.has(pos) && wIdx < winners.length) {
        naturalList.push(winners[wIdx++]);
      } else if (nwIdx < nonWinners.length) {
        naturalList.push(nonWinners[nwIdx++]);
      } else if (wIdx < winners.length) {
        naturalList.push(winners[wIdx++]);
      }
    }
  } else {
    naturalList.push(...all);
  }

  return {
    lottery,
    participants: naturalList,
    winners,
    nonWinners,
  };
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

function sanitizeFilename(title: string): string {
  return (title || 'draw')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Export a Single Lottery Campaign with all its participants to CSV
 */
export function exportSingleLotteryToCSV(data: SingleLotteryExportData): void {
  const { lottery, participants } = data;
  const safeTitle = sanitizeFilename(lottery.title);
  const filename = `${safeTitle}-allotment-report-${new Date().toISOString().slice(0, 10)}.csv`;

  const headers = [
    'S.No',
    'Candidate Name',
    'Ticket / Ref ID',
    'Allotment Status',
    'Prize Rank',
    'Campaign Name',
    'Draw Date',
  ];

  const escapeCsv = (val: string | number | undefined | null) =>
    `"${String(val ?? '').replace(/"/g, '""')}"`;

  const drawDateStr = lottery.created_at
    ? new Date(lottery.created_at).toLocaleDateString('en-IN')
    : 'N/A';

  const rows = participants.map((p, idx) => [
    idx + 1,
    escapeCsv(p.name),
    escapeCsv(p.ticket_number),
    escapeCsv(p.is_winner ? 'Allotted (Winner)' : 'Not alloted — Better luck next time'),
    escapeCsv(p.prize_rank || (p.is_winner ? 'Winner' : '—')),
    escapeCsv(lottery.title),
    escapeCsv(drawDateStr),
  ]);

  const csvContent =
    '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
  toast.success(`Exported ${participants.length} participants to CSV`);
}

/**
 * Export a Single Lottery Campaign with Luxury Multi-Sheet / Formatted Excel (.xlsx)
 */
export async function exportSingleLotteryToExcel(data: SingleLotteryExportData): Promise<void> {
  const { lottery, participants, winners, nonWinners } = data;
  const safeTitle = sanitizeFilename(lottery.title);
  const filename = `${safeTitle}-executive-allotment-dossier-${new Date().toISOString().slice(0, 10)}.xlsx`;

  toast.info('Generating Executive Excel Workbook...');
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SVI Infra Solutions — Executive ERP';
  workbook.created = new Date();

  // ═════════════════════════════════════════════════════════════════════════
  // Sheet 1: Master Allotment Dossier (All Participants)
  // ═════════════════════════════════════════════════════════════════════════
  const sheet = workbook.addWorksheet('Allotment Results', {
    views: [{ showGridLines: true }],
  });

  // Top Obsidian Navy Banner
  sheet.mergeCells('A1:G1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `SVI INFRA SOLUTIONS — ${lottery.title.toUpperCase()}`;
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF080B11' }, // Deep Obsidian Slate
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 36;

  // Subtitle / KPI Summary Strip
  sheet.mergeCells('A2:E2');
  const subCell = sheet.getCell('A2');
  subCell.value = `Official Plot Allotment List  |  Total Candidates: ${participants.length}  |  Allotted Units: ${winners.length}`;
  subCell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFD4AF37' } }; // Luxury Gold
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF111622' },
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 22;

  sheet.getRow(3).height = 10; // Spacer

  // Headers
  const headers = [
    'S.No',
    'Candidate Name',
    'Ticket / Ref ID',
    'Allotment Result',
    'Registration Date',
  ];

  const headerRow = sheet.getRow(4);
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
      bottom: { style: 'medium', color: { argb: 'FFD4AF37' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });

  participants.forEach((p, idx) => {
    const rowNum = 5 + idx;
    const row = sheet.getRow(rowNum);
    row.height = 22;

    const resultText = p.is_winner ? 'ALLOTTED (WINNER)' : 'Not alloted — Better luck next time';
    const regDate = p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—';

    row.values = [idx + 1, p.name || '—', p.ticket_number || '—', resultText, regDate];

    // Styling
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(2).font = { name: 'Calibri', size: 10, bold: !!p.is_winner };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(3).font = { name: 'Consolas', size: 9.5 };
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };

    if (p.is_winner) {
      // Highlight winner in soft luxury gold tint
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFDF8E2' }, // Warm Gold tint
        };
      });
      row.getCell(4).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF065F46' } }; // Dark Emerald
    } else {
      if (idx % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        });
      }
      row.getCell(4).font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  sheet.columns = [
    { width: 8 }, // S.No
    { width: 32 }, // Candidate Name
    { width: 20 }, // Ticket / Ref ID
    { width: 36 }, // Allotment Result
    { width: 22 }, // Registration Date
  ];

  // ═════════════════════════════════════════════════════════════════════════
  // Sheet 2: Executive Winners Summary
  // ═════════════════════════════════════════════════════════════════════════
  const winSheet = workbook.addWorksheet('Allotted Winners', {
    views: [{ showGridLines: true }],
  });

  winSheet.mergeCells('A1:E1');
  const wTitle = winSheet.getCell('A1');
  wTitle.value = `OFFICIAL ALLOTTED WINNERS — ${lottery.title.toUpperCase()}`;
  wTitle.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  wTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF065F46' }, // Forest Emerald
  };
  wTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  winSheet.getRow(1).height = 34;

  const wHeaders = [
    'Winner #',
    'Candidate Name',
    'Ticket / Unit Ref ID',
    'Allotment Status',
    'Prize Category',
  ];
  const wHeaderRow = winSheet.getRow(2);
  wHeaderRow.values = wHeaders;
  wHeaderRow.height = 24;
  wHeaderRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  winners.forEach((w, idx) => {
    const rowNum = 3 + idx;
    const row = winSheet.getRow(rowNum);
    row.height = 24;
    row.values = [
      idx + 1,
      w.name || '—',
      w.ticket_number || '—',
      'Allotted (Winner)',
      w.prize_rank || 'Festive Plot Allotment',
    ];
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
    row.getCell(3).font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FFB45309' } };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(4).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF065F46' } };
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
  });

  winSheet.columns = [{ width: 12 }, { width: 32 }, { width: 24 }, { width: 24 }, { width: 28 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, filename);
  toast.success('Executive Excel Dossier generated successfully!');
}

/**
 * Export a Single Lottery Campaign to an Ultra-Luxury Printable PDF Dossier
 */
export async function exportSingleLotteryToPDF(data: SingleLotteryExportData): Promise<void> {
  const { lottery, participants, winners, nonWinners } = data;
  const safeTitle = sanitizeFilename(lottery.title);
  const filename = `${safeTitle}-allotment-dossier-${new Date().toISOString().slice(0, 10)}.pdf`;

  toast.info('Rendering Ultra-Luxury Executive PDF...');
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const drawPageHeader = (pageNo: number, isFirstPage = false) => {
    // 1. Obsidian Header Bar
    doc.setFillColor(8, 11, 17); // #080b11
    doc.rect(0, 0, pageWidth, 54, 'F');

    // 2. Luxury Warm Gold Accent Border
    doc.setFillColor(212, 175, 55); // #d4af37
    doc.rect(0, 54, pageWidth, 2.5, 'F');

    // Brand Name & Subtext
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('SVI INFRA SOLUTIONS', 36, 26);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(212, 175, 55);
    doc.text('OFFICIAL ALLOTMENT & DRAW AUDIT DOSSIER', 36, 40);

    // Right Side Metadata
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    doc.text(`Date: ${dateStr}  |  Page ${pageNo}`, pageWidth - 36, 32, { align: 'right' });

    // Table Header Row
    const thY = isFirstPage ? 138 : 76;
    doc.setFillColor(241, 245, 249); // #f1f5f9
    doc.rect(36, thY - 14, pageWidth - 72, 20, 'F');

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('S.No', 42, thY);
    doc.text('Candidate Name', 75, thY);
    doc.text('Ticket / Ref ID', 240, thY);
    doc.text('Allotment Status', 360, thY);

    return thY + 16;
  };

  // ── First Page Campaign Summary Card ──
  let pageNum = 1;

  // Title Box
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const truncatedTitle =
    lottery.title.length > 50 ? `${lottery.title.slice(0, 48)}...` : lottery.title;
  doc.text(truncatedTitle, 36, 78);

  // 3-Metric Executive KPI Strip
  const kpiY = 94;
  const kpiW = (pageWidth - 72 - 16) / 3;
  // Total Candidates Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36, kpiY, kpiW, 28, 4, 4, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL CANDIDATES', 44, kpiY + 12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(String(participants.length), 44, kpiY + 24);

  // Allotted Winners Box
  doc.setFillColor(236, 253, 245); // Emerald tint
  doc.roundedRect(36 + kpiW + 8, kpiY, kpiW, 28, 4, 4, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 150, 105);
  doc.text('ALLOTTED (WINNERS)', 36 + kpiW + 16, kpiY + 12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text(`${winners.length} Units`, 36 + kpiW + 16, kpiY + 24);

  // Non-Allotted Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36 + (kpiW + 8) * 2, kpiY, kpiW, 28, 4, 4, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('NON-ALLOTTED', 36 + (kpiW + 8) * 2 + 8, kpiY + 12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(String(nonWinners.length), 36 + (kpiW + 8) * 2 + 8, kpiY + 24);

  let currentY = drawPageHeader(pageNum, true);
  const rowHeight = 18;

  participants.forEach((p, idx) => {
    if (currentY + rowHeight > pageHeight - 40) {
      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'SVI Infra Solutions Pvt. Ltd. — Confidential Real Estate Allotment Record',
        pageWidth / 2,
        pageHeight - 18,
        { align: 'center' }
      );

      doc.addPage();
      pageNum++;
      currentY = drawPageHeader(pageNum, false);
    }

    // Winner row background highlight
    if (p.is_winner) {
      doc.setFillColor(254, 252, 232); // Luxury Gold tint
      doc.rect(36, currentY - 11, pageWidth - 72, rowHeight, 'F');
    } else if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(36, currentY - 11, pageWidth - 72, rowHeight, 'F');
    }

    // Border line
    doc.setDrawColor(241, 245, 249);
    doc.line(36, currentY + 7, pageWidth - 36, currentY + 7);

    // S.No
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(String(idx + 1), 42, currentY);

    // Name
    const nameStr = p.name.length > 24 ? `${p.name.slice(0, 22)}...` : p.name;
    doc.setFont('helvetica', p.is_winner ? 'bold' : 'normal');
    doc.setTextColor(p.is_winner ? 15 : 51, p.is_winner ? 23 : 65, p.is_winner ? 42 : 85);
    doc.text(nameStr, 75, currentY);

    // Ticket Number
    doc.setFont('helvetica', p.is_winner ? 'bold' : 'normal');
    if (p.is_winner) {
      doc.setTextColor(180, 83, 9); // Gold amber
    } else {
      doc.setTextColor(71, 85, 105);
    }
    doc.text(p.ticket_number || '—', 240, currentY);

    // Allotment Status
    if (p.is_winner) {
      doc.setTextColor(5, 150, 105); // Emerald Green
      doc.setFont('helvetica', 'bold');
      doc.text('● Allotted', 360, currentY);
    } else {
      doc.setTextColor(148, 163, 184); // Slate Muted
      doc.setFont('helvetica', 'normal');
      doc.text('Not alloted — Better luck next time', 360, currentY);
    }

    currentY += rowHeight;
  });

  // Final Page Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'SVI Infra Solutions Pvt. Ltd. — Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, UP 201309',
    pageWidth / 2,
    pageHeight - 18,
    { align: 'center' }
  );

  doc.save(filename);
  toast.success('Executive PDF Dossier exported successfully!');
}
