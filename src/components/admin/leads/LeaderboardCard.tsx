'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  PhoneCall,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  BarChart3,
} from 'lucide-react';
import type { AdvisorPerformanceMetric } from '@/src/lib/types/telecalling';
interface LeaderboardCardProps {
  totalCalls: number;
  answeredCalls: number;
  hotLeads: number;
}

export function LeaderboardCard({ totalCalls, answeredCalls, hotLeads }: LeaderboardCardProps) {
  const [leaderboard, setLeaderboard] = useState<AdvisorPerformanceMetric[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerformance() {
      try {
        const res = await fetch('/api/admin/leads/performance');
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    loadPerformance();
  }, []);

  const overallAnswerRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;

  return (
    <div className="border-brand-gold/20 from-brand-navy to-brand-navy relative overflow-hidden rounded-2xl border bg-linear-to-r via-[#121829] p-4 text-white shadow-xl">
      {/* Background ambient glow */}
      <div className="bg-brand-gold/10 pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full blur-2xl" />

      {/* Top Banner Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="border-brand-gold/40 bg-brand-gold/15 text-brand-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-xs">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-white">
                Telecalling & Conversion Hub
              </h3>
              <span className="bg-brand-gold/20 text-brand-gold rounded-full px-2 py-0.5 text-[10px] font-bold">
                Live Metrics
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Real estate outbound dialer performance, conversion rates & advisor rankings
            </p>
          </div>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold">
            <PhoneCall className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-gray-300">Handled:</span>
            <span className="font-bold text-white">{totalCalls.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Connected:</span>
            <span className="font-bold text-white">{overallAnswerRate}%</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400">
            <Flame className="h-3.5 w-3.5" />
            <span>Hot Leads:</span>
            <span className="font-bold text-white">{hotLeads.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="border-brand-gold/30 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 flex cursor-pointer items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Leaderboard</span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          <Link
            href="/admin/leads/dashboard"
            className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
            title="Open dedicated telecalling & conversion dashboard"
          >
            <BarChart3 className="text-brand-gold h-3.5 w-3.5" />
            <span>Full Dashboard &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Expandable Leaderboard View */}
      {expanded && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
            <span>Advisor Leaderboard & Connected Volume</span>
            <span>{leaderboard.length} Advisors Tracked</span>
          </div>

          {loading ? (
            <div className="py-4 text-center text-xs text-gray-400">
              Loading advisor performance...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-400">
              No advisor data logged yet. Upload call records to view metrics!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {leaderboard.map((item, idx) => {
                const isTop = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                return (
                  <div
                    key={item.advisor_id}
                    className={`relative flex items-center justify-between rounded-xl border p-3 ${
                      isTop
                        ? 'border-brand-gold/40 bg-brand-gold/10'
                        : isSecond
                          ? 'border-white/20 bg-white/5'
                          : isThird
                            ? 'border-amber-700/30 bg-white/5'
                            : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          isTop
                            ? 'bg-brand-gold text-brand-navy shadow-xs'
                            : isSecond
                              ? 'bg-gray-300 text-gray-900'
                              : isThird
                                ? 'bg-amber-600 text-white'
                                : 'border border-white/20 bg-white/10 text-white'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-white">
                          {item.advisor_name}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {Math.round(item.total_talk_time_sec / 60)}m talk
                          </span>
                          <span>•</span>
                          <span>{item.answer_rate}% connected</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-brand-gold text-xs font-bold">
                        {item.answered_calls}{' '}
                        <span className="text-[10px] font-normal text-gray-400">calls</span>
                      </div>
                      {item.hot_leads > 0 && (
                        <div className="flex items-center justify-end gap-1 text-[10px] font-semibold text-rose-400">
                          <Flame className="h-2.5 w-2.5" />
                          {item.hot_leads} hot
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
