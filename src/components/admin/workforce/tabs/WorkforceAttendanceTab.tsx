'use client';

import React, { useState } from 'react';
import AttendanceDashboard from '@/src/components/admin/attendance/AttendanceDashboard';
import LiveStatus from '@/src/components/admin/attendance/LiveStatus';
import MasterTimesheet from '@/src/components/admin/attendance/MasterTimesheet';
import type { WorkforceTeam } from '../types';

interface WorkforceAttendanceTabProps {
  token: string;
  teams: WorkforceTeam[];
  showToast: (type: 'success' | 'error', text: string) => void;
}

export function WorkforceAttendanceTab({ token, teams, showToast }: WorkforceAttendanceTabProps) {
  const [attendanceView, setAttendanceView] = useState<'radar' | 'timesheet'>('radar');

  return (
    <div className="space-y-6">
      {/* Attendance View Switcher */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center dark:border-white/10">
        <div>
          <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
            Attendance Control Center
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time biometric radar and comprehensive master timesheet records.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-gray-50 p-1 dark:border-white/10 dark:bg-[#181822]">
          <button
            type="button"
            onClick={() => setAttendanceView('radar')}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
              attendanceView === 'radar'
                ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Live Overview
          </button>
          <button
            type="button"
            onClick={() => setAttendanceView('timesheet')}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
              attendanceView === 'timesheet'
                ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Master Timesheet
          </button>
        </div>
      </div>

      {/* Sub-view Content */}
      {attendanceView === 'radar' ? (
        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="flex-1 xl:max-w-[65%]">
            <AttendanceDashboard token={token} showToast={showToast} />
          </div>
          <div className="w-full xl:w-[35%] xl:min-w-[400px]">
            <LiveStatus token={token} />
          </div>
        </div>
      ) : (
        <MasterTimesheet token={token} teams={teams} />
      )}
    </div>
  );
}
