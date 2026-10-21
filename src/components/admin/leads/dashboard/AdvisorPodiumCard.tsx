import React from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Medal,
  Flame,
  ExternalLink,
  Download,
  MessageCircle,
  Phone,
} from 'lucide-react';
import type { AdvisorPerformanceMetric } from '@/src/lib/types/telecalling';
import { formatSeconds } from '@/src/lib/types/telecalling';

interface AdvisorPodiumCardProps {
  advisor: AdvisorPerformanceMetric;
  index: number;
  handleAdvisorLeadsClick: (advisorId: string) => void;
  setSelectedExportAdvisor: (advisorId: string) => void;
  setIsExportModalOpen: (open: boolean) => void;
}

export function AdvisorPodiumCard({
  advisor,
  index,
  handleAdvisorLeadsClick,
  setSelectedExportAdvisor,
  setIsExportModalOpen,
}: AdvisorPodiumCardProps) {
  const rank = index + 1;
  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`group relative flex flex-col justify-between rounded-2xl border p-4.5 shadow-sm transition-all duration-200 hover:shadow-md ${
        isGold
          ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.02] to-transparent dark:border-amber-400/40 dark:from-amber-500/[0.08] dark:to-[#13131c]'
          : isSilver
            ? 'border-slate-300/50 bg-gradient-to-br from-slate-400/[0.07] via-slate-400/[0.02] to-transparent dark:border-slate-400/30 dark:from-slate-400/[0.06] dark:to-[#13131c]'
            : isBronze
              ? 'border-amber-700/50 bg-gradient-to-br from-amber-700/[0.07] via-amber-700/[0.02] to-transparent dark:border-amber-700/30 dark:from-amber-700/[0.06] dark:to-[#13131c]'
              : 'border-gray-200 bg-white dark:border-white/5 dark:bg-[#13131c]'
      }`}
    >
      <div>
        {/* Header: Rank Medal, Name, Role */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {isGold ? (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-900 shadow-md ring-1 ring-amber-400/40"
                title="Rank 1 - Top Telecaller"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-950" />
              </span>
            ) : isSilver ? (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-800 shadow-md ring-1 ring-slate-300"
                title="Rank 2"
              >
                <Medal className="h-3.5 w-3.5 text-slate-700" />
              </span>
            ) : (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white shadow-md ring-1 ring-amber-600"
                title="Rank 3"
              >
                <Medal className="h-3.5 w-3.5 text-amber-100" />
              </span>
            )}
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {advisor.advisor_name}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="capitalize">{advisor.role || 'Advisor'}</span>
                {advisor.is_active === false && (
                  <span className="py-0.2 rounded-md border border-red-500/20 bg-red-50 px-1 text-[9px] font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-400">
                    Disabled
                  </span>
                )}
                {advisor.phone && (
                  <>
                    <span>&bull;</span>
                    <span className="font-mono">{advisor.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Answer Rate Status Capsule */}
          <div className="flex flex-col items-end gap-1">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-2xs transition-colors ${
                advisor.answer_rate >= 50
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : advisor.answer_rate >= 30
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                    : 'border-gray-200 bg-gray-100 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  advisor.answer_rate >= 50
                    ? 'animate-pulse bg-emerald-500'
                    : advisor.answer_rate >= 30
                      ? 'bg-amber-500'
                      : 'bg-gray-400'
                }`}
              />
              <span>{advisor.answer_rate}% Ans</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="font-bold text-gray-900 dark:text-white">
                {advisor.answered_calls}
              </span>
              <span className="text-gray-400 dark:text-gray-600">/</span>
              <span>{advisor.total_calls} calls</span>
            </div>
          </div>
        </div>

        {/* Connection Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
          <div
            className="from-brand-gold h-full rounded-full bg-gradient-to-r to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(advisor.answer_rate, 100)}%` }}
          />
        </div>

        {/* Key Telemetry Grid */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl bg-gray-50/80 p-2.5 text-center text-xs dark:bg-white/[0.03]">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase">
              Talk Time
            </span>
            <p className="font-mono font-bold text-gray-800 tabular-nums dark:text-gray-200">
              {formatSeconds(advisor.total_talk_time_sec)}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase">
              Avg / Call
            </span>
            <p className="font-mono font-bold text-gray-800 tabular-nums dark:text-gray-200">
              {formatSeconds(advisor.avg_talk_time_sec)}
            </p>
          </div>
          <div>
            <span className="text-brand-gold text-[10px] font-semibold uppercase">
              Hot Leads
            </span>
            <p className="text-brand-gold flex items-center justify-center gap-0.5 font-mono font-bold tabular-nums">
              <Flame className="h-3 w-3 fill-current" />
              {advisor.hot_leads}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/5">
        <button
          type="button"
          onClick={() => handleAdvisorLeadsClick(advisor.advisor_id)}
          className="text-brand-navy dark:text-brand-gold flex cursor-pointer items-center gap-1.5 text-xs font-bold hover:underline"
          title="Open filtered IVR leads table for this advisor"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>View Leads ({advisor.total_calls})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedExportAdvisor(advisor.advisor_id);
            setIsExportModalOpen(true);
          }}
          className="hover:bg-brand-gold/10 hover:text-brand-gold rounded-lg p-1.5 text-gray-400 transition-colors"
          title={`Export ${advisor.advisor_name}'s leads`}
        >
          <Download className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-1">
          {advisor.phone && (
            <>
              <a
                href={`https://wa.me/91${advisor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${advisor.advisor_name}, congratulations on your telecalling ranking! You have ${advisor.answered_calls} answered calls and ${advisor.hot_leads} hot leads.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                title="Message on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={`tel:${advisor.phone}`}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                title="Direct Call"
              >
                <Phone className="h-4 w-4" />
              </a>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
