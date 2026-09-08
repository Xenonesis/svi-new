import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TimesheetTable } from '@/src/components/admin/attendance/timesheet/TimesheetTable';
import { WorkforceHeader } from '@/src/components/admin/workforce/WorkforceHeader';
import { WorkforceKpiGrid } from '@/src/components/admin/workforce/WorkforceKpiGrid';

describe('Admin Workforce Motion & Table Hover Styling', () => {
  it('applies table-row-hover class to TimesheetTable rows', () => {
    const mockRecord = {
      id: 'rec-1',
      user_id: 'user-1',
      date: '2026-09-08',
      status: 'present' as const,
      check_in_time: '2026-09-08T09:00:00Z',
      check_out_time: '2026-09-08T17:00:00Z',
      work_hours: 8,
      punch_in_photo: null,
      punch_out_photo: null,
      notes: null,
      punch_in_address: 'Office',
      punch_out_address: 'Office',
      punch_in_lat: 26.8,
      punch_in_lng: 80.9,
      punch_out_lat: 26.8,
      punch_out_lng: 80.9,
      is_late: false,
      is_geofence_verified: true,
      full_name: 'Rahul Sharma',
      email: 'rahul@sviinfra.com',
      department: 'Civil Engineering',
      role: 'Site Engineer',
      employee_id: 'EMP-001',
      shift_start: '09:00',
      shift_end: '17:00',
      team_id: 'team-1',
      team_name: 'Civil',
      punch_out_geofence_verified: true,
      work_log: {
        summary: null,
        client_calls: 0,
        site_visits: 0,
      },
    };

    const { container } = render(
      <TimesheetTable
        records={[mockRecord]}
        loading={false}
        dateFilter="2026-09-08"
        todayStr="2026-09-08"
        isCurrentDateToday={true}
        hasActiveFilters={false}
        onToday={vi.fn()}
        onResetFilters={vi.fn()}
        onViewWorkLog={vi.fn()}
        onEditRecord={vi.fn()}
      />
    );

    const row = container.querySelector('tbody tr');
    expect(row?.className).toContain('table-row-hover');
  });

  it('applies btn-tactile to WorkforceHeader action buttons', () => {
    render(
      <WorkforceHeader
        activeTab="directory"
        payrollSubTab="monthly"
        onAddEmployee={vi.fn()}
        onLogAttendance={vi.fn()}
        onSetupSalary={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: /Add Employee/i });
    expect(button.className).toContain('btn-tactile');
  });

  it('applies hover-lift-sm to WorkforceKpiGrid cards', () => {
    const { container } = render(
      <WorkforceKpiGrid
        totalEmployees={42}
        presentToday={38}
        onLeaveToday={4}
        pendingApprovals={2}
        monthlyPayrollTotal={1250000}
        loading={false}
      />
    );

    const cards = container.querySelectorAll('.hover-lift-sm');
    expect(cards.length).toBeGreaterThan(0);
  });
});
