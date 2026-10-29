'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Radio,
  Sparkles,
  Flame,
  Zap,
  Volume2,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Activity,
  Bot,
} from 'lucide-react';
import type { TriageHeartbeatData } from '@/app/api/admin/leads/triage-status/route';

interface LiveTriageRadarBannerProps {
  token: string | null;
  onFilterHotLeads?: () => void;
}

interface TriageStatusResponse {
  success: boolean;
  data: TriageHeartbeatData & {
    is_live: boolean;
    scheduled_digest_time: string;
    seconds_since_heartbeat: number;
  };
}

export function LiveTriageRadarBanner({ token, onFilterHotLeads }: LiveTriageRadarBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const { data, isLoading, refetch, isFetching } = useQuery<TriageStatusResponse | null>({
    queryKey: ['admin', 'leads', 'triage-status'],
    queryFn: async () => {
      if (!token) return null;
      const res = await fetch('/api/admin/leads/triage-status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return null;
      return (await res.json()) as TriageStatusResponse;
    },
    enabled: Boolean(token),
    refetchInterval: (query) => {
      const isLive = query.state.data?.data?.is_live;
      return isLive ? 5000 : 20000;
    },
    staleTime: 4000,
  });

  const statusInfo = data?.data;
  const isLive = Boolean(statusInfo?.is_live);
  const totalEligible = statusInfo?.total_eligible || 4425;
  const processedCount = statusInfo?.processed_count || 0;
  const hotCount = statusInfo?.hot_count || 0;
  const warmCount = statusInfo?.warm_count || 0;
  const coldCount = statusInfo?.cold_count || 0;
  const digestTime = statusInfo?.scheduled_digest_time || '19:30';
  const lastTriaged = statusInfo?.last_triaged;

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((processedCount / (totalEligible || 1)) * 1000) / 10)
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#0e1422] via-[#090d16] to-[#06080e] p-4 text-white shadow-2xl transition-all duration-300 sm:p-5">
      <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-400/20 to-amber-600/10 shadow-[0_0_15px_rgba(217,119,6,0.15)]">
              {isLive ? (
                <>
                  <Radio className="h-5 w-5 text-amber-300" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                </>
              ) : (
                <Bot className="h-5 w-5 text-amber-300/80" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold tracking-wide text-white sm:text-base">
                  Voice AI Autonomous Triage Radar
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                    isLive
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border border-white/10 bg-white/5 text-gray-400'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isLive ? 'animate-pulse bg-emerald-400' : 'bg-gray-500'
                    }`}
                  />
                  {isLive ? 'Live Triage In Progress' : 'Standby / Autonomous'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Whisper Large V3 Turbo transcription &amp; multi-model sales intelligence triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              title="Refresh radar status"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching || isLoading ? 'animate-spin text-amber-400' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              title={isExpanded ? 'Collapse Radar' : 'Expand Radar'}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-400">Batch Triage Progression</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-300">{progressPercent}%</span>
                  <span className="text-[11px] text-gray-500">
                    ({processedCount.toLocaleString('en-IN')} of{' '}
                    {totalEligible.toLocaleString('en-IN')} calls)
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <div
                onClick={onFilterHotLeads}
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-rose-500/20 bg-rose-950/20 p-2.5 transition-all hover:border-rose-500/40 hover:bg-rose-950/30 sm:p-3"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-rose-300 uppercase">
                    <Flame className="h-3 w-3 text-rose-400" />
                    <span>Hot Leads</span>
                  </div>
                  <div className="mt-0.5 font-mono text-lg font-bold text-rose-100 sm:text-xl">
                    {hotCount}
                  </div>
                </div>
                <Sparkles className="h-4 w-4 text-rose-400/40 transition-transform group-hover:scale-110" />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-950/20 p-2.5 sm:p-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-amber-300 uppercase">
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span>Warm Leads</span>
                  </div>
                  <div className="mt-0.5 font-mono text-lg font-bold text-amber-100 sm:text-xl">
                    {warmCount}
                  </div>
                </div>
                <Activity className="h-4 w-4 text-amber-400/40" />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    <Volume2 className="h-3 w-3 text-gray-400" />
                    <span>Cold / Other</span>
                  </div>
                  <div className="mt-0.5 font-mono text-lg font-bold text-gray-200 sm:text-xl">
                    {coldCount}
                  </div>
                </div>
                <Bot className="h-4 w-4 text-gray-500/40" />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2.5 sm:p-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase">
                    <Clock className="h-3 w-3 text-cyan-400" />
                    <span>Daily Digest</span>
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-cyan-100 sm:text-base">
                    {digestTime} IST
                  </div>
                </div>
                <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-medium text-cyan-300">
                  Auto
                </span>
              </div>
            </div>

            {lastTriaged && (
              <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    Latest Triaged Call:
                  </span>
                  <span className="font-mono font-semibold text-white">{lastTriaged.phone}</span>
                  {lastTriaged.duration ? (
                    <span className="py-0.2 rounded bg-white/5 px-1.5 text-[10px] text-gray-400">
                      {Math.round(lastTriaged.duration)}s
                    </span>
                  ) : null}
                  <span
                    className={`py-0.2 rounded px-1.5 text-[10px] font-bold uppercase ${
                      lastTriaged.interest_level === 'Hot'
                        ? 'border border-rose-500/30 bg-rose-500/20 text-rose-300'
                        : lastTriaged.interest_level === 'Warm'
                          ? 'border border-amber-500/30 bg-amber-500/20 text-amber-300'
                          : 'border border-white/10 bg-white/5 text-gray-400'
                    }`}
                  >
                    {lastTriaged.interest_level || 'Warm'}
                  </span>
                  {lastTriaged.intent ? (
                    <span className="text-gray-300">• {lastTriaged.intent}</span>
                  ) : null}
                  {lastTriaged.budget && lastTriaged.budget !== 'N/A' ? (
                    <span className="font-mono text-amber-300/90">({lastTriaged.budget})</span>
                  ) : null}
                </div>

                {lastTriaged.summary ? (
                  <p className="line-clamp-1 max-w-xl text-[11px] text-gray-400">
                    &ldquo;{lastTriaged.summary}&rdquo;
                  </p>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
