'use client';

import React from 'react';
import TeamsManager from '@/src/components/admin/attendance/TeamsManager';
import AttendanceSettings from '@/src/components/admin/attendance/AttendanceSettings';
import LocationManager from '@/src/components/admin/attendance/LocationManager';
import type { WorkforceTeam } from '../types';

interface WorkforceSettingsTabProps {
  token: string;
  teams: WorkforceTeam[];
  teamsLoading: boolean;
  onTeamsChange: () => void;
  showToast: (type: 'success' | 'error', text: string) => void;
}

export function WorkforceSettingsTab({
  token,
  teams,
  teamsLoading,
  onTeamsChange,
  showToast,
}: WorkforceSettingsTabProps) {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
          Workforce Policies &amp; Configuration
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Manage department teams, working shifts, and office geofence locations.
        </p>
      </div>

      <TeamsManager
        token={token}
        showToast={showToast}
        teams={teams}
        teamsLoading={teamsLoading}
        onTeamsChange={onTeamsChange}
      />

      <AttendanceSettings token={token} showToast={showToast} />

      <LocationManager token={token} showToast={showToast} />
    </div>
  );
}
