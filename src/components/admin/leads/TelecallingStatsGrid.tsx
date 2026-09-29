import { PhoneCall, PhoneForwarded, PhoneOff, Flame, Clock } from 'lucide-react';
import type { DashboardSummary } from './telecallingTypes';
import { formatSeconds } from './telecallingTypes';

interface TelecallingStatsGridProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

export function TelecallingStatsGrid({ summary, loading }: TelecallingStatsGridProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
      {/* Total Calls */}
      <div className="dark:bg-brand-dark-surface/50 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm backdrop-blur-md sm:p-5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
            Total Calls
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <PhoneCall className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          ) : (
            <span className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
              {(summary?.total_calls || 0).toLocaleString()}
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-gray-400">Total IVR interactions logged</p>
      </div>

      {/* Answered Calls */}
      <div className="dark:bg-brand-dark-surface/50 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm backdrop-blur-md sm:p-5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
            Answered
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <PhoneForwarded className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {(summary?.answered_calls || 0).toLocaleString()}
              </span>
              <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">
                ({summary?.answer_rate || 0}%)
              </span>
            </div>
          )}
        </div>
        <p className="mt-1 text-[11px] text-gray-400">Answer conversion rate</p>
      </div>

      {/* Missed Calls */}
      <div className="dark:bg-brand-dark-surface/50 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm backdrop-blur-md sm:p-5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
            Missed / Unanswered
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            <PhoneOff className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          ) : (
            <span className="font-serif text-2xl font-bold text-rose-600 dark:text-rose-400">
              {(summary?.missed_calls || 0).toLocaleString()}
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-gray-400">Requires follow-up</p>
      </div>

      {/* Hot Leads */}
      <div className="dark:bg-brand-dark-surface/50 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm backdrop-blur-md sm:p-5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
            Hot Leads
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-brand-gold font-serif text-2xl font-bold">
                {(summary?.hot_leads || 0).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">({summary?.key1_count || 0} Key-1)</span>
            </div>
          )}
        </div>
        <p className="mt-1 text-[11px] text-gray-400">Key-1 & high-intent leads</p>
      </div>

      {/* Avg Talk Time */}
      <div className="dark:bg-brand-dark-surface/50 col-span-2 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm backdrop-blur-md sm:p-5 lg:col-span-1 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
            Avg Talk Time
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          ) : (
            <span className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
              {formatSeconds(summary?.avg_talk_time_sec || 0)}
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-gray-400">Per answered call</p>
      </div>
    </div>
  );
}
