import React from 'react';
import {
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Clock,
  Flame,
  Trophy,
} from 'lucide-react';
import type {
  DashboardSummary,
  CampaignPerformanceMetric,
} from '@/src/lib/types/telecalling';
import { formatSeconds } from '@/src/lib/types/telecalling';

interface TelecallingCockpitHeroProps {
  summary: DashboardSummary | null;
  campaigns: CampaignPerformanceMetric[];
  lastUpdated: string;
  handleAdvisorLeadsClick: (advisorId: string) => void;
}

export function TelecallingCockpitHero({
  summary,
  campaigns,
  lastUpdated,
  handleAdvisorLeadsClick,
}: TelecallingCockpitHeroProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-white/5 dark:bg-[#0c0f18]">
      {/* 6 High-Density Metric Columns */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* 1. Total Calls Handled */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 transition-colors dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-[10px] font-bold tracking-wider uppercase">Total Calls</span>
            <div className="rounded-lg bg-blue-500/10 p-1 text-blue-500">
              <PhoneCall className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-gray-900 tabular-nums dark:text-white">
            {summary?.total_calls.toLocaleString() || '0'}
          </div>
          <div className="mt-1 text-[10px] text-gray-500">
            <span>Volume Handled</span>
          </div>
        </div>

        {/* 2. Connected / Answered */}
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-3.5 transition-colors dark:border-emerald-500/20 dark:bg-emerald-500/[0.04]">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[10px] font-bold tracking-wider uppercase">Answered Calls</span>
            <div className="rounded-lg bg-emerald-500/15 p-1 text-emerald-500">
              <PhoneForwarded className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400">
            {summary?.answered_calls.toLocaleString() || '0'}
          </div>
          <div className="mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            {summary?.answer_rate || 0}% Connection Rate
          </div>
        </div>

        {/* 3. Missed Calls */}
        <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.03] p-3.5 transition-colors dark:border-rose-500/20 dark:bg-rose-500/[0.04]">
          <div className="flex items-center justify-between text-rose-500 dark:text-rose-400">
            <span className="text-[10px] font-bold tracking-wider uppercase">Missed Calls</span>
            <div className="rounded-lg bg-rose-500/15 p-1 text-rose-500">
              <PhoneOff className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-rose-600 tabular-nums dark:text-rose-400">
            {summary?.missed_calls.toLocaleString() || '0'}
          </div>
          <div className="mt-1 text-[10px] text-gray-500">
            {summary && summary.total_calls > 0
              ? Math.round((summary.missed_calls / summary.total_calls) * 100)
              : 0}
            % Unanswered
          </div>
        </div>

        {/* 4. Total Talk Time */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 transition-colors dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-[10px] font-bold tracking-wider uppercase">
              Total Talk Time
            </span>
            <div className="rounded-lg bg-amber-500/10 p-1 text-amber-500">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="dark:text-brand-gold mt-1.5 font-mono text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
            {formatSeconds(summary?.total_talk_time_sec || 0)}
          </div>
          <div className="mt-1 text-[10px] text-gray-500">
            Avg {formatSeconds(summary?.avg_talk_time_sec || 0)}/call
          </div>
        </div>

        {/* 5. Hot Leads Yield */}
        <div className="border-brand-gold/30 bg-brand-gold/[0.04] dark:border-brand-gold/25 dark:bg-brand-gold/[0.04] rounded-2xl border p-3.5 transition-colors">
          <div className="text-brand-gold flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase">Hot Leads</span>
            <div className="bg-brand-gold/20 text-brand-gold rounded-lg p-1">
              <Flame className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-brand-navy dark:text-brand-gold mt-1.5 font-mono text-2xl font-bold tracking-tight tabular-nums">
            {summary?.hot_leads.toLocaleString() || '0'}
          </div>
          <div className="text-brand-gold mt-1 text-[10px] font-medium">
            {summary?.key1_count?.toLocaleString() || 0} Key 1 Pressed
          </div>
        </div>

        {/* 6. Active Advisors */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 transition-colors dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-[10px] font-bold tracking-wider uppercase">Active Roster</span>
            <div className="rounded-lg bg-indigo-500/10 p-1 text-indigo-500">
              <Trophy className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-gray-900 tabular-nums dark:text-white">
            {summary?.active_advisors || 0}
            <span className="text-xs font-normal text-gray-400">
              /{summary?.total_roster_count || 0}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
            100% Tracking Active
          </div>
        </div>
      </div>

      {/* Integrated Dial Momentum Strip */}
      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3.5 lg:flex-row lg:items-center lg:justify-between dark:border-white/5">
        {/* Dual Segmented Progress Bar */}
        <div className="flex flex-1 items-center gap-3">
          <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Dial Pulse
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
            <div className="flex h-full w-full">
              <div
                className="bg-emerald-500 transition-all duration-700"
                style={{ width: `${summary?.answer_rate || 0}%` }}
                title={`${summary?.answer_rate || 0}% Connected`}
              />
              <div
                className="bg-rose-500/60 transition-all duration-700"
                style={{ width: `${100 - (summary?.answer_rate || 0)}%` }}
                title={`${100 - (summary?.answer_rate || 0)}% Missed/Unanswered`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {summary?.answer_rate || 0}% Connected
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-500">
              <Flame className="h-3 w-3 fill-current" />
              {summary && summary.total_calls > 0
                ? Math.round((summary.hot_leads / summary.total_calls) * 100)
                : 0}
              % High Intent
            </span>
          </div>
        </div>

        {/* Active Campaign & Direct Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs lg:justify-end">
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            {campaigns[0]?.name || 'IVR Campaign'} &bull;{' '}
            {campaigns[0]?.total_calls.toLocaleString() || summary?.total_calls.toLocaleString()}{' '}
            calls
            {lastUpdated && <span className="text-gray-400"> &bull; Sync {lastUpdated}</span>}
          </span>
          <button
            type="button"
            onClick={() => handleAdvisorLeadsClick('')}
            className="text-brand-gold hover:text-brand-gold-light flex cursor-pointer items-center gap-1 font-bold"
          >
            <span>View All Leads &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
