'use client';

import React from 'react';
import { Sparkles, Plus, CalendarCheck } from 'lucide-react';
import type { WorkforceTab } from './types';

interface WorkforceHeaderProps {
  activeTab: WorkforceTab;
  payrollSubTab: 'monthly' | 'structures';
  onAddEmployee: () => void;
  onLogAttendance: () => void;
  onSetupSalary: () => void;
}

export function WorkforceHeader({
  activeTab,
  payrollSubTab,
  onAddEmployee,
  onLogAttendance,
  onSetupSalary,
}: WorkforceHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold tracking-widest uppercase">
          <Sparkles className="h-3 w-3" />
          SVI Workforce Console
        </div>
        <h1 className="text-brand-navy mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
          Workforce &amp; HR{' '}
          <span
            className="text-gradient-gold animate-bg-pan inline-block pr-2.5 italic"
            style={{
              backgroundSize: '200% 200%',
              backgroundImage:
                'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
            }}
          >
            Management
          </span>
        </h1>
        <p className="mt-1 text-xs tracking-wide text-gray-600 sm:text-sm dark:text-gray-400">
          Consolidated personnel operations: Staff directory, live attendance radar, leave
          approvals, and automated payroll runs.
        </p>
      </div>

      {/* Contextual Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {activeTab === 'directory' && (
          <button
            type="button"
            onClick={onAddEmployee}
            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wider uppercase shadow-lg transition-all"
          >
            <Plus size={16} /> Add Employee
          </button>
        )}
        {activeTab === 'attendance' && (
          <button
            type="button"
            onClick={onLogAttendance}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-400 hover:to-emerald-500"
          >
            <CalendarCheck className="h-4 w-4" />
            Log Attendance
          </button>
        )}
        {activeTab === 'payroll' && payrollSubTab === 'structures' && (
          <button
            type="button"
            onClick={onSetupSalary}
            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wider uppercase shadow-lg transition-all"
          >
            <Plus size={16} /> Setup Salary Structure
          </button>
        )}
      </div>
    </div>
  );
}
