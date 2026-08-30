import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TimesheetRecord } from './types';

export function exportTimesheetCSV(records: TimesheetRecord[], dateFilter?: string) {
  if (records.length === 0) {
    toast.error('No records to export');
    return;
  }

  const headers = [
    'Employee Name',
    'Email',
    'Team',
    'Date',
    'Status',
    'Punch In Time',
    'Punch In Verified',
    'Punch Out Time',
    'Punch Out Verified',
    'Total Hours',
    'Is Late',
    'Client Calls',
    'Site Visits',
    'Daily Work Summary',
    'Admin Notes',
  ];

  const rows = records.map((r) => [
    `"${r.full_name}"`,
    `"${r.email}"`,
    `"${r.team_name}"`,
    r.date,
    r.status,
    r.punch_in_time ? format(new Date(r.punch_in_time), 'hh:mm:ss a') : 'N/A',
    r.is_geofence_verified ? 'Verified' : 'Unverified',
    r.punch_out_time ? format(new Date(r.punch_out_time), 'hh:mm:ss a') : 'N/A',
    r.punch_out_geofence_verified ? 'Verified' : 'Unverified',
    r.total_hours || '0',
    r.is_late ? 'Yes' : 'No',
    r.work_log?.client_calls || 0,
    r.work_log?.site_visits || 0,
    `"${(r.work_log?.summary || '').replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Attendance_Timesheet_${dateFilter || 'report'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success('Timesheet CSV downloaded successfully');
}
