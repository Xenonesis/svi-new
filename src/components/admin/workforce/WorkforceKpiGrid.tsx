'use client';

import React from 'react';
import { Users, Clock, CheckCircle2, Banknote } from 'lucide-react';

interface WorkforceKpiGridProps {
  loadingEmployees: boolean;
  totalEmployees: number;
  punchedInCount: number | null;
  pendingApprovalsCount: number;
  currentMonthName: string;
}

export function WorkforceKpiGrid({
  loadingEmployees,
  totalEmployees,
  punchedInCount,
  pendingApprovalsCount,
  currentMonthName,
}: WorkforceKpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Card 1: Total Personnel */}
      <div className="hover:border-brand-gold/40 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all dark:border-white/10 dark:bg-[#111118]/80">
        <div className="via-brand-gold/30 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Total Personnel
          </span>
          <div className="bg-brand-gold/10 text-brand-gold rounded-xl p-2.5">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-brand-navy font-serif text-2xl font-bold sm:text-3xl dark:text-white">
            {loadingEmployees ? '—' : totalEmployees}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active staff on records
          </p>
        </div>
      </div>

      {/* Card 2: Punched In Today */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all hover:border-emerald-500/40 dark:border-white/10 dark:bg-[#111118]/80">
        <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Punched In Today
          </span>
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-brand-navy font-serif text-2xl font-bold sm:text-3xl dark:text-white">
            {punchedInCount !== null ? punchedInCount : '—'}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live biometric radar
          </p>
        </div>
      </div>

      {/* Card 3: Pending Approvals */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all hover:border-amber-500/40 dark:border-white/10 dark:bg-[#111118]/80">
        <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Pending Approvals
          </span>
          <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-brand-navy font-serif text-2xl font-bold sm:text-3xl dark:text-white">
            {pendingApprovalsCount}
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Leaves &amp; regularizations
          </p>
        </div>
      </div>

      {/* Card 4: Payroll Cycle */}
      <div className="hover:border-brand-gold/40 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all dark:border-white/10 dark:bg-[#111118]/80">
        <div className="via-brand-gold/30 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Payroll Cycle
          </span>
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400">
            <Banknote className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-brand-navy truncate font-serif text-xl font-bold sm:text-2xl dark:text-white">
            {currentMonthName}
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Auto-calculated LOP</p>
        </div>
      </div>
    </div>
  );
}
