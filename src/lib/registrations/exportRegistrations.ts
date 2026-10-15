import type { Registration } from '@/src/components/admin/registrations/types';
import ExcelJS from 'exceljs';
import { toast } from 'sonner';

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
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

const REGISTRATION_EXPORT_COLUMNS = [
  'S.No',
  'Submission ID',
  'Applicant Name',
  'Phone Number',
  'Email Address',
  'Relative (S/O W/O D/O)',
  'Date of Birth',
  'Aadhar Number',
  'PAN Number',
  'State',
  'City',
  'Full Address',
  'Project',
  'Assigned Advisor',
  'Property Size',
  'Property Type',
  'Plot Preference',
  'Payment Plan',
  'Payment Mode',
  'Investment Amount (INR)',
  'Status',
  'Starred Important',
  'Registration Date',
];

function buildRegistrationRow(r: Registration, index: number) {
  const fullName = `${r.name || ''} ${r.last_name || ''}`.trim() || '—';
  return [
    index + 1,
    r.submission_id || '—',
    fullName,
    r.phone || '—',
    r.email || '—',
    r.so_wo_do || '—',
    r.preferred_date || '—',
    r.aadhar_number || '—',
    r.pan_number || '—',
    r.state || '—',
    r.city || '—',
    r.address || '—',
    r.project || r.property_interest || '—',
    r.advisor_name || 'Direct',
    r.property_size || '—',
    r.property_type || '—',
    r.plot_preference || '—',
    r.payment_plan || '—',
    r.payment_mode || '—',
    r.scheme_amount ? `Rs. ${Number(r.scheme_amount).toLocaleString('en-IN')}` : '—',
    (r.status || 'pending').toUpperCase(),
    r.is_important ? 'YES' : 'NO',
    formatDate(r.created_at),
  ];
}

/**
 * Export selected registrations as formatted CSV
 */
export function exportRegistrationsToCsv(registrations: Registration[], filename?: string): void {
  if (registrations.length === 0) {
    toast.error('No registrations selected to export');
    return;
  }

  const rows = registrations.map((r, i) => buildRegistrationRow(r, i));
  const csvContent = [REGISTRATION_EXPORT_COLUMNS, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const finalFilename =
    filename || `svi-selected-registrations-${new Date().toISOString().slice(0, 10)}.csv`;

  triggerBrowserDownload(blob, finalFilename);
  toast.success(`Exported ${registrations.length} selected registrations to CSV`);
}

/**
 * Export selected registrations as executive styled Excel (.xlsx) using ExcelJS
 */
export async function exportRegistrationsToExcel(
  registrations: Registration[],
  filename?: string
): Promise<void> {
  if (registrations.length === 0) {
    toast.error('No registrations selected to export');
    return;
  }

  try {
    toast.info('Generating executive Excel export...');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SVI Infra Solutions Pvt. Ltd.';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Selected Registrations', {
      views: [{ showGridLines: true }],
    });

    // Brand Title Header Rows
    worksheet.mergeCells('A1:W1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'SVI INFRA SOLUTIONS PVT. LTD. — CUSTOMER REGISTRATIONS REPORT';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0D131F' }, // Deep Brand Navy
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 36;

    // Subtitle Row
    worksheet.mergeCells('A2:W2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `Export Date: ${new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })} | Total Selected Records: ${registrations.length}`;
    subtitleCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FFD4AF37' } }; // Gold
    subtitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF161E2E' },
    };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 22;

    // Blank row
    worksheet.addRow([]);
    worksheet.getRow(3).height = 10;

    // Table Header on Row 4
    const headerRow = worksheet.getRow(4);
    headerRow.values = REGISTRATION_EXPORT_COLUMNS;
    headerRow.height = 28;
    headerRow.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A2332' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // Column Widths
    const colWidths = [
      8, // S.No
      16, // Submission ID
      24, // Applicant Name
      16, // Phone Number
      26, // Email Address
      22, // S/O W/O D/O
      14, // DOB
      16, // Aadhar
      14, // PAN
      16, // State
      16, // City
      32, // Full Address
      24, // Project
      20, // Assigned Advisor
      16, // Property Size
      18, // Property Type
      18, // Plot Preference
      18, // Payment Plan
      16, // Payment Mode
      22, // Investment Amount
      14, // Status
      16, // Starred
      16, // Date
    ];

    colWidths.forEach((w, idx) => {
      worksheet.getColumn(idx + 1).width = w;
    });

    // Populate Data Rows starting at Row 5
    registrations.forEach((r, idx) => {
      const rowData = buildRegistrationRow(r, idx);
      const row = worksheet.addRow(rowData);
      row.height = 22;
      row.font = { name: 'Calibri', size: 10 };

      // Zebra striping
      const isEven = idx % 2 === 0;
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF9FAFC' },
      };

      // Alignment rules
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }; // S.No
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }; // ID
      row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' }; // Phone
      row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' }; // DOB
      row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' }; // Aadhar
      row.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' }; // PAN
      row.getCell(20).alignment = { horizontal: 'right', vertical: 'middle' }; // Amount
      row.getCell(21).alignment = { horizontal: 'center', vertical: 'middle' }; // Status
      row.getCell(22).alignment = { horizontal: 'center', vertical: 'middle' }; // Starred
      row.getCell(23).alignment = { horizontal: 'center', vertical: 'middle' }; // Date

      // Thin borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });

      // Status Highlights
      const statusCell = row.getCell(21);
      const statusVal = String(r.status || '').toLowerCase();
      if (statusVal === 'approved') {
        statusCell.font = { bold: true, color: { argb: 'FF059669' } };
      } else if (statusVal === 'pending') {
        statusCell.font = { bold: true, color: { argb: 'FFD97706' } };
      } else if (statusVal === 'rejected') {
        statusCell.font = { bold: true, color: { argb: 'FFDC2626' } };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const finalFilename =
      filename || `svi-selected-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`;

    triggerBrowserDownload(blob, finalFilename);
    toast.success(`Exported ${registrations.length} selected registrations to Excel (.xlsx)`);
  } catch (err: unknown) {
    console.error('Excel Export Error:', err);
    toast.error('Failed to generate Excel file.');
  }
}
