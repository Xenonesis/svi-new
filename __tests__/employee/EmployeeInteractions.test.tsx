import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import EmployeeBottomNav from '@/src/components/employee/EmployeeBottomNav';
import { DashboardQuickShortcuts } from '@/src/components/employee/dashboard/DashboardQuickShortcuts';
import { PunchTerminalWidget } from '@/src/components/employee/attendance/PunchTerminalWidget';
import * as haptics from '@/src/lib/haptics';

vi.mock('next/navigation', () => ({
  usePathname: () => '/employee/dashboard',
}));

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  },
}));

describe('Employee Portal Interactions & Haptics', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers haptic on EmployeeBottomNav link click', () => {
    const hapticSpy = vi.spyOn(haptics, 'triggerHaptic');
    render(<EmployeeBottomNav />);

    const punchLink = screen.getByText('Punch').closest('a');
    expect(punchLink).not.toBeNull();
    if (punchLink) {
      fireEvent.click(punchLink);
      expect(hapticSpy).toHaveBeenCalledWith('light');
    }
  });

  it('triggers haptic and applies btn-tactile in DashboardQuickShortcuts', () => {
    const hapticSpy = vi.spyOn(haptics, 'triggerHaptic');
    const onLeaveMock = vi.fn();

    render(<DashboardQuickShortcuts onOpenLeaveModal={onLeaveMock} />);

    const leaveBtn = screen.getByRole('button', { name: /Apply Leave/i });
    expect(leaveBtn.className).toContain('btn-tactile');

    fireEvent.click(leaveBtn);
    expect(hapticSpy).toHaveBeenCalledWith('light');
    expect(onLeaveMock).toHaveBeenCalled();
  });

  it('applies btn-tactile and triggers medium haptic in PunchTerminalWidget', () => {
    const hapticSpy = vi.spyOn(haptics, 'triggerHaptic');
    const onPunchInMock = vi.fn();

    render(
      <PunchTerminalWidget
        statusData={{
          status: 'not_punched',
          punch_in_time: null,
          punch_out_time: null,
          total_hours: null,
          is_late: false,
          is_geofence_verified: false,
        }}
        elapsedTime="00:00:00"
        punching={false}
        onPunchIn={onPunchInMock}
        onPunchOutClick={vi.fn()}
      />
    );

    const punchInBtn = screen.getByRole('button', { name: /Punch In/i });
    expect(punchInBtn.className).toContain('btn-tactile');

    fireEvent.click(punchInBtn);
    expect(hapticSpy).toHaveBeenCalledWith('medium');
    expect(onPunchInMock).toHaveBeenCalled();
  });
});
