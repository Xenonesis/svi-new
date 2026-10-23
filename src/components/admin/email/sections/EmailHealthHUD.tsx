'use client';

import { useMemo } from 'react';
import {
  Send,
  CheckCircle2,
  Eye,
  MousePointerClick,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import type { SentEmail } from '../types';

export interface EmailHealthMetrics {
  total: number;
  deliveredCount: number;
  deliveredRate: string;
  openedCount: number;
  openedRate: string;
  clickedCount: number;
  clickedRate: string;
  bouncedCount: number;
  bouncedRate: string;
}

export function computeEmailHealthMetrics(
  emails: Array<{
    id?: string;
    status?: string | null;
    first_opened_at?: string | null;
    first_clicked_at?: string | null;
    bounced_at?: string | null;
    complained_at?: string | null;
  }>
): EmailHealthMetrics {
  const total = emails.length;
  if (total === 0) {
    return {
      total: 0,
      deliveredCount: 0,
      deliveredRate: '0.0%',
      openedCount: 0,
      openedRate: '0.0%',
      clickedCount: 0,
      clickedRate: '0.0%',
      bouncedCount: 0,
      bouncedRate: '0.0%',
    };
  }

  let delivered = 0;
  let opened = 0;
  let clicked = 0;
  let bounced = 0;

  for (const email of emails) {
    const isDelivered =
      email.status === 'delivered' ||
      email.status === 'opened' ||
      email.status === 'clicked' ||
      Boolean(email.first_opened_at) ||
      Boolean(email.first_clicked_at);

    if (isDelivered) delivered++;
    if (email.first_opened_at || email.status === 'opened' || email.status === 'clicked') opened++;
    if (email.first_clicked_at || email.status === 'clicked') clicked++;
    if (email.status === 'bounced' || email.bounced_at || email.complained_at) bounced++;
  }

  const deliveredRate = `${((delivered / total) * 100).toFixed(1)}%`;
  const openedRate = delivered > 0 ? `${((opened / delivered) * 100).toFixed(1)}%` : '0.0%';
  const clickedRate = opened > 0 ? `${((clicked / opened) * 100).toFixed(1)}%` : '0.0%';
  const bouncedRate = `${((bounced / total) * 100).toFixed(1)}%`;

  return {
    total,
    deliveredCount: delivered,
    deliveredRate,
    openedCount: opened,
    openedRate,
    clickedCount: clicked,
    clickedRate,
    bouncedCount: bounced,
    bouncedRate,
  };
}

interface EmailHealthHUDProps {
  emails: SentEmail[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function EmailHealthHUD({ emails, activeFilter, onFilterChange }: EmailHealthHUDProps) {
  const metrics = useMemo(() => computeEmailHealthMetrics(emails), [emails]);

  return (
    <div className="mb-6 rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50 p-4 shadow-sm backdrop-blur-sm sm:p-5 dark:border-white/10 dark:from-[#0d111a] dark:to-[#080b11]">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-brand-gold/15 text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-white">
              SVI Resend Delivery & Engagement HUD
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Live deliverability metrics from Resend API & Supabase ledger
            </p>
          </div>
        </div>

        {onFilterChange && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => onFilterChange(null)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                !activeFilter
                  ? 'bg-brand-gold text-brand-dark shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
              }`}
            >
              All ({metrics.total})
            </button>
            <button
              onClick={() => onFilterChange('delivered')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                activeFilter === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
              }`}
            >
              Delivered ({metrics.deliveredCount})
            </button>
            <button
              onClick={() => onFilterChange('opened')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                activeFilter === 'opened'
                  ? 'bg-brand-gold text-brand-dark shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300'
              }`}
            >
              Opened ({metrics.openedCount})
            </button>
            <button
              onClick={() => onFilterChange('clicked')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                activeFilter === 'clicked'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400'
              }`}
            >
              Clicked ({metrics.clickedCount})
            </button>
            <button
              onClick={() => onFilterChange('bounced')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                activeFilter === 'bounced'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400'
              }`}
            >
              Bounced ({metrics.bouncedCount})
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {/* Total Sent */}
        <div className="rounded-xl border border-gray-100 bg-white/70 p-3 shadow-xs dark:border-white/5 dark:bg-[#111622]/80">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Dispatched</span>
            <Send className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{metrics.total}</p>
          <span className="text-[10px] text-gray-400">Outbox transmissions</span>
        </div>

        {/* Delivered Rate */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/30 p-3 shadow-xs dark:border-emerald-500/15 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Delivered</span>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.deliveredRate}
            </p>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              ({metrics.deliveredCount})
            </span>
          </div>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
            Mailbox handoff rate
          </span>
        </div>

        {/* Open Rate */}
        <div className="rounded-xl border border-amber-500/25 bg-amber-50/30 p-3 shadow-xs dark:border-amber-500/20 dark:bg-amber-950/10">
          <div className="dark:text-brand-gold flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Open Rate</span>
            <Eye className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className="dark:text-brand-gold text-xl font-bold text-amber-600">
              {metrics.openedRate}
            </p>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              ({metrics.openedCount})
            </span>
          </div>
          <span className="dark:text-brand-gold/80 text-[10px] text-amber-600/80">
            Unique recipient reads
          </span>
        </div>

        {/* Click Rate */}
        <div className="rounded-xl border border-sky-500/20 bg-sky-50/30 p-3 shadow-xs dark:border-sky-500/15 dark:bg-sky-950/10">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Click Rate</span>
            <MousePointerClick className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className="text-xl font-bold text-sky-600 dark:text-sky-400">
              {metrics.clickedRate}
            </p>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              ({metrics.clickedCount})
            </span>
          </div>
          <span className="text-[10px] text-sky-600/80 dark:text-sky-400/80">Link engagement</span>
        </div>

        {/* Bounce / Issues */}
        <div
          className={`col-span-2 rounded-xl border p-3 shadow-xs sm:col-span-1 ${
            metrics.bouncedCount > 0
              ? 'border-rose-500/30 bg-rose-50/40 text-rose-600 dark:border-rose-500/20 dark:bg-rose-950/20 dark:text-rose-400'
              : 'border-gray-100 bg-white/70 text-gray-600 dark:border-white/5 dark:bg-[#111622]/80 dark:text-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Bounces</span>
            <AlertTriangle
              className={`h-3.5 w-3.5 ${metrics.bouncedCount > 0 ? 'text-rose-500' : 'text-gray-400'}`}
            />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p
              className={`text-xl font-bold ${
                metrics.bouncedCount > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {metrics.bouncedRate}
            </p>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              ({metrics.bouncedCount})
            </span>
          </div>
          <span
            className={`text-[10px] ${
              metrics.bouncedCount > 0 ? 'font-semibold text-rose-500' : 'text-gray-400'
            }`}
          >
            {metrics.bouncedCount > 0 ? 'Action required' : 'Optimal inbox health'}
          </span>
        </div>
      </div>
    </div>
  );
}
