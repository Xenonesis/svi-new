import type ExcelJS from 'exceljs';
import type { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * 1. Export IVR Leads to formatted Excel (.xlsx) using ExcelJS
 */
export async function exportIvrLeadsToExcel(
  records: IvrRecordItem[],
  filename = `svi-telecalling-leads-${new Date().toISOString().slice(0, 10)}.xlsx`
): Promise<void> {
  if (records.length === 0) {
    toast.error('No records to export');
    return;
  }

  try {
    toast.info('Generating Excel file...');
    const ExcelJSModule = (await import('exceljs')).default;
    const workbook = new ExcelJSModule.Workbook();
    workbook.creator = 'SVI Infra Solutions Pvt. Ltd.';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('IVR Telecalling Leads', {
      views: [{ showGridLines: true }],
    });

    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'Customer Phone', key: 'phone', width: 18 },
      { header: 'Attended By', key: 'telecaller', width: 20 },
      { header: 'Follow-up Advisor', key: 'advisor', width: 22 },
      { header: 'Dial Status', key: 'dial_status', width: 15 },
      { header: 'Call Duration (Sec)', key: 'duration', width: 18 },
      { header: 'Duration Formatted', key: 'duration_fmt', width: 18 },
      { header: 'DTMF Key Pressed', key: 'key', width: 16 },
      { header: 'Lead Temperature', key: 'temperature', width: 16 },
      { header: 'Dialed Timestamp', key: 'dial_time', width: 22 },
      { header: 'Campaign Name', key: 'campaign', width: 25 },
    ];

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A2E' }, // Brand Navy
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add Data Rows
    records.forEach((rec, idx) => {
      const isAnswered = rec.dial_status === 'ANSWER';
      const duration = Number(rec.call_duration) || 0;
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const durationFmt = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

      const isHot = (duration >= 60 && isAnswered) || rec.pressed_key === '1';
      const isWarm = !isHot && isAnswered;
      const tempLabel = isHot ? 'Hot' : isWarm ? 'Warm' : 'Cold';

      const row = worksheet.addRow({
        sno: idx + 1,
        phone: rec.customer_phone,
        telecaller: rec.agent_name || 'Telecaller',
        advisor: rec.assigned_agent?.full_name || rec.agent_name || 'Unassigned',
        dial_status: rec.dial_status,
        duration: duration,
        duration_fmt: durationFmt,
        key: rec.pressed_key ? `Key ${rec.pressed_key}` : 'None',
        temperature: tempLabel,
        dial_time: formatDate(rec.dial_time),
        campaign: rec.campaign_name || 'General IVR',
      });

      row.height = 20;
      row.alignment = { vertical: 'middle' };

      // Zebra striping on even rows
      if (idx % 2 === 1) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      }

      // Colorize Dial Status Cell
      const statusCell = row.getCell('dial_status');
      if (isAnswered) {
        statusCell.font = { color: { argb: 'FF059669' }, bold: true };
      } else {
        statusCell.font = { color: { argb: 'FFDC2626' } };
      }

      // Colorize Temperature Cell
      const tempCell = row.getCell('temperature');
      if (isHot) {
        tempCell.font = { color: { argb: 'FFB45309' }, bold: true };
      } else if (isWarm) {
        tempCell.font = { color: { argb: 'FFD97706' } };
      } else {
        tempCell.font = { color: { argb: 'FF2563EB' } };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    triggerBrowserDownload(blob, filename);
    toast.success(`Exported ${records.length} leads to Excel (${filename})`);
  } catch (err) {
    console.error('Failed to export to Excel:', err);
    toast.error('Failed to export Excel file');
  }
}

/**
 * 2. Export IVR Leads to professional branded PDF document (.pdf) using jsPDF
 */
export async function exportIvrLeadsToPdf(
  records: IvrRecordItem[],
  filename = `svi-telecalling-leads-${new Date().toISOString().slice(0, 10)}.pdf`
): Promise<void> {
  if (records.length === 0) {
    toast.error('No records to export');
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

    // Summary calculation
    let answered = 0;
    let hotCount = 0;
    for (const r of records) {
      if (r.dial_status === 'ANSWER') answered++;
      if ((Number(r.call_duration) >= 60 && r.dial_status === 'ANSWER') || r.pressed_key === '1') {
        hotCount++;
      }
    }
    const total = records.length;
    const ansRate = total > 0 ? Math.round((answered / total) * 100) : 0;

    const drawHeader = (pageNo?: number) => {
      // Top Navy Banner
      doc.setFillColor(26, 26, 46); // Brand Navy
      doc.rect(0, 0, pageWidth, 54, 'F');

      // Corporate Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SVI INFRA SOLUTIONS - IVR TELECALLING LEADS REPORT', 30, 34);

      // Top Right Meta
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Date: ${new Date().toLocaleDateString('en-IN')} | Total: ${total} Leads | Connected: ${ansRate}% | Hot: ${hotCount}`,
        pageWidth - 30,
        34,
        { align: 'right' }
      );

      // Table Header Row
      const thY = 76;
      doc.setFillColor(243, 244, 246);
      doc.rect(30, thY - 14, pageWidth - 60, 22, 'F');

      doc.setTextColor(55, 65, 81);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');

      doc.text('S.No', 30, thY);
      doc.text('Customer Phone', 65, thY);
      doc.text('Attended By', 170, thY);
      doc.text('Follow-up Advisor', 280, thY);
      doc.text('Dial Status', 410, thY);
      doc.text('Duration', 485, thY);
      doc.text('Key', 545, thY);
      doc.text('Temperature', 595, thY);
      doc.text('Dialed Timestamp', 675, thY);
    };

    let pageNum = 1;
    drawHeader(pageNum);

    let currentY = 100;
    const rowHeight = 18;

    records.forEach((rec, idx) => {
      // Page Break Check
      if (currentY + rowHeight > pageHeight - 40) {
        // Footer on previous page
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(156, 163, 175);
        doc.text(
          `Page ${pageNum} | Confidential - SVI Infra Solutions Pvt. Ltd.`,
          pageWidth / 2,
          pageHeight - 15,
          { align: 'center' }
        );

        doc.addPage();
        pageNum++;
        drawHeader(pageNum);
        currentY = 100;
      }

      // Zebra striping
      if (idx % 2 === 1) {
        doc.setFillColor(249, 250, 251);
        doc.rect(30, currentY - 12, pageWidth - 60, rowHeight, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(31, 41, 55);

      // Columns
      doc.text(String(idx + 1), 30, currentY);
      doc.text(rec.customer_phone, 65, currentY);
      doc.text((rec.agent_name || 'Telecaller').slice(0, 18), 170, currentY);
      doc.text(
        (rec.assigned_agent?.full_name || rec.agent_name || 'Unassigned').slice(0, 20),
        280,
        currentY
      );

      // Dial Status with Color
      if (rec.dial_status === 'ANSWER') {
        doc.setTextColor(5, 150, 105);
        doc.setFont('helvetica', 'bold');
        doc.text('ANSWER', 360, currentY);
      } else {
        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'normal');
        doc.text('NOANSWER', 360, currentY);
      }

      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(`${rec.call_duration || 0}s`, 440, currentY);
      doc.text(rec.pressed_key ? `Key ${rec.pressed_key}` : '—', 515, currentY);

      // Temperature
      const isHot =
        (Number(rec.call_duration) >= 60 && rec.dial_status === 'ANSWER') ||
        rec.pressed_key === '1';
      if (isHot) {
        doc.setTextColor(180, 83, 9);
        doc.setFont('helvetica', 'bold');
        doc.text('Hot', 585, currentY);
      } else if (rec.dial_status === 'ANSWER') {
        doc.setTextColor(217, 119, 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Warm', 585, currentY);
      } else {
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'normal');
        doc.text('Cold', 585, currentY);
      }

      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(rec.dial_time), 675, currentY);

      currentY += rowHeight;
    });

    // Final page footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${pageNum} | Confidential - SVI Infra Solutions Pvt. Ltd.`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );

    doc.save(filename);
    toast.success(`Exported ${records.length} leads to PDF (${filename})`);
  } catch (err) {
    console.error('Failed to export to PDF:', err);
    toast.error('Failed to export PDF file');
  }
}

/**
 * 3. Export IVR Leads to Standard CSV (.csv) with UTF-8 BOM
 */
export function exportIvrLeadsToCsv(
  records: IvrRecordItem[],
  filename = `svi-telecalling-leads-${new Date().toISOString().slice(0, 10)}.csv`
): void {
  if (records.length === 0) {
    toast.error('No records to export');
    return;
  }

  const headers = [
    'Customer Phone',
    'Attended By',
    'Follow-up Advisor',
    'Dial Status',
    'Call Duration (sec)',
    'Pressed Key',
    'Temperature',
    'Dialed At',
    'Campaign Name',
  ];

  const rows = records.map((r) => {
    const isAnswered = r.dial_status === 'ANSWER';
    const isHot = (Number(r.call_duration) >= 60 && isAnswered) || r.pressed_key === '1';
    const temp = isHot ? 'hot' : isAnswered ? 'warm' : 'cold';

    return [
      `"${r.customer_phone}"`,
      `"${r.agent_name || 'Telecaller'}"`,
      `"${r.assigned_agent?.full_name || r.agent_name || 'Unassigned'}"`,
      `"${r.dial_status}"`,
      r.call_duration,
      `"${r.pressed_key || ''}"`,
      `"${temp}"`,
      `"${r.dial_time}"`,
      `"${r.campaign_name || ''}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBrowserDownload(blob, filename);
  toast.success(`Exported ${records.length} leads to CSV (${filename})`);
}
