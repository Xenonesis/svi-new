'use client';

import React from 'react';
import AttendanceReport from '@/src/components/admin/attendance/AttendanceReport';
import type { WorkforceTeam } from '../types';

interface WorkforceReportsTabProps {
  token: string;
  teams: WorkforceTeam[];
  teamsLoading: boolean;
  showToast: (type: 'success' | 'error', text: string) => void;
}

export function WorkforceReportsTab({
  token,
  teams,
  teamsLoading,
  showToast,
}: WorkforceReportsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
          Attendance Reports &amp; Analytics
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Generate cross-team attendance audit logs and performance reporting spreadsheets.
        </p>
      </div>
      <AttendanceReport
        token={token}
        showToast={showToast}
        teams={teams}
        teamsLoading={teamsLoading}
      />
    </div>
  );
}
