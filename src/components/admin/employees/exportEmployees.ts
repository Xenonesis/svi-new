import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { toast } from 'sonner';
import type { Employee } from './EmployeeCard';
import { getSviEmail } from './EmployeeCard';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';

function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function getStatusLabel(status?: EmployeeLiveStatus | null): string {
  if (!status || status.status === 'not_punched') return 'Not Checked In';
  if (status.status === 'punched_in') return status.is_late ? 'Punched In (Late)' : 'Punched In';
  if (status.status === 'punched_out') return 'Punched Out';
  return 'Not Checked In';
}

function getPunchInTimeFormatted(status?: EmployeeLiveStatus | null): string {
  if (!status || !status.punch_in_time) return '-';
  try {
    return format(new Date(status.punch_in_time), 'hh:mm:ss a');
  } catch {
    return status.punch_in_time;
  }
}

function getPunchOutTimeFormatted(status?: EmployeeLiveStatus | null): string {
  if (!status || !status.punch_out_time) return '-';
  try {
    return format(new Date(status.punch_out_time), 'hh:mm:ss a');
  } catch {
    return status.punch_out_time;
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export Employees to CSV (.csv)
 */
export function exportEmployeesToCSV(
  employees: Employee[],
  liveStatusMap: Map<string, EmployeeLiveStatus>
) {
  try {
    if (!employees.length) {
      toast.error('No employees found to export.');
      return;
    }

    const headers = [
      'Employee ID',
      'Full Name',
      'SVI Corporate Email',
      'Personal Email',
      'Phone Number',
      'Joining Date',
      "Today's Attendance Status",
      'Punch In Time',
      'Punch Out Time',
      'Total Hours Logged',
      'Notes & Department',
    ];

    const rows = employees.map((emp) => {
      const live = liveStatusMap.get(emp.id);
      const sviEmail = getSviEmail(emp);
      const personalEmail = emp.real_email || emp.email;
      const joinDate = emp.created_at ? format(new Date(emp.created_at), 'yyyy-MM-dd') : '-';
      const statusText = getStatusLabel(live);
      const punchIn = getPunchInTimeFormatted(live);
      const punchOut = getPunchOutTimeFormatted(live);
      const totalHours = live?.total_hours != null ? live.total_hours.toFixed(2) : '-';
      const notes = (emp.notes || '').replace(/\r?\n/g, ' ').trim();

      return [
        emp.id,
        emp.full_name,
        sviEmail,
        personalEmail,
        emp.phone || '-',
        joinDate,
        statusText,
        punchIn,
        punchOut,
        totalHours,
        notes,
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `svi-employees-directory-${getTodayDateString()}.csv`;
    triggerDownload(blob, filename);
    toast.success(`Exported ${employees.length} employees to CSV`);
  } catch (err) {
    console.error('CSV Export Error:', err);
    toast.error('Failed to export CSV file.');
  }
}

/**
 * Export Employees to Excel (.xlsx) using ExcelJS
 */
export async function exportEmployeesToExcel(
  employees: Employee[],
  liveStatusMap: Map<string, EmployeeLiveStatus>
) {
  try {
    if (!employees.length) {
      toast.error('No employees found to export.');
      return;
    }

    toast.info('Generating Excel workbook...');
    // Initialize workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SVI Infra Systems';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Employee Directory', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    worksheet.columns = [
      { header: 'Employee ID', key: 'id', width: 36 },
      { header: 'Full Name', key: 'full_name', width: 24 },
      { header: 'SVI Corporate Email', key: 'svi_email', width: 28 },
      { header: 'Personal Email', key: 'personal_email', width: 28 },
      { header: 'Phone Number', key: 'phone', width: 16 },
      { header: 'Joining Date', key: 'join_date', width: 15 },
      { header: "Today's Attendance Status", key: 'status', width: 24 },
      { header: 'Punch In Time', key: 'punch_in', width: 16 },
      { header: 'Punch Out Time', key: 'punch_out', width: 16 },
      { header: 'Total Hours', key: 'total_hours', width: 14 },
      { header: 'Notes & Department', key: 'notes', width: 35 },
    ];

    // Header styling
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' }, // Navy Slate
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFD700' }, // Gold text
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'medium', color: { argb: 'FFD4AF37' } },
        right: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });

    // Populate data rows
    employees.forEach((emp, index) => {
      const live = liveStatusMap.get(emp.id);
      const sviEmail = getSviEmail(emp);
      const personalEmail = emp.real_email || emp.email;
      const joinDate = emp.created_at ? format(new Date(emp.created_at), 'yyyy-MM-dd') : '-';
      const statusText = getStatusLabel(live);
      const punchIn = getPunchInTimeFormatted(live);
      const punchOut = getPunchOutTimeFormatted(live);
      const totalHours = live?.total_hours != null ? Number(live.total_hours.toFixed(2)) : '-';

      const row = worksheet.addRow({
        id: emp.id,
        full_name: emp.full_name,
        svi_email: sviEmail,
        personal_email: personalEmail,
        phone: emp.phone || '-',
        join_date: joinDate,
        status: statusText,
        punch_in: punchIn,
        punch_out: punchOut,
        total_hours: totalHours,
        notes: emp.notes || '',
      });

      row.height = 22;
      const isEven = index % 2 === 0;

      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 1 || colNumber === 5 || colNumber === 6 ? 'center' : 'left',
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = `svi-employees-directory-${getTodayDateString()}.xlsx`;
    triggerDownload(blob, filename);
    toast.success(`Exported ${employees.length} employees to Excel (.xlsx)`);
  } catch (err) {
    console.error('Excel Export Error:', err);
    toast.error('Failed to generate Excel file.');
  }
}
