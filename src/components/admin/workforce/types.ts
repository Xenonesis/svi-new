import React from 'react';
import { Users, Clock, CheckCircle2, Banknote, BarChart3, Sliders } from 'lucide-react';
import type { Team } from '@/src/lib/supabase/types';

export type WorkforceTab =
  'directory' | 'attendance' | 'approvals' | 'payroll' | 'reports' | 'settings';

export type WorkforceTeam = Team & { member_count: number };

export interface TabItem {
  id: WorkforceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
}

export const TABS: TabItem[] = [
  { id: 'directory', label: 'Directory', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: true },
  { id: 'payroll', label: 'Payroll & Salary', icon: Banknote },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Policy & Settings', icon: Sliders },
];

export const VALID_TABS: WorkforceTab[] = [
  'directory',
  'attendance',
  'approvals',
  'payroll',
  'reports',
  'settings',
];

export const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};
