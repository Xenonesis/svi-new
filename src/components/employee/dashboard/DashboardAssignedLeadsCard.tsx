'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Phone,
  MessageSquare,
  ArrowRight,
  UserCheck,
  Flame,
  Zap,
  Snowflake,
} from 'lucide-react';
import { formatTelLink, formatWhatsAppLink } from '@/src/components/employee/work/LeadsView';
import { clsx } from 'clsx';
import type { DashboardData } from './types';

interface DashboardAssignedLeadsCardProps {
  leads: DashboardData['recent_leads'] | undefined;
}

export function DashboardAssignedLeadsCard({ leads }: DashboardAssignedLeadsCardProps) {
  // Zero-State: Render a clean compact card instead of null to maintain layout balance
  if (!leads || leads.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all sm:p-6 dark:border-white/10 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Assigned Customer Leads
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Active inquiries and follow-ups
              </p>
            </div>
          </div>
          <Link
            href="/employee/work?tab=leads"
            className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            <span>View Pipeline</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                No pending lead follow-ups
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                New customer inquiries from WhatsApp and web chat will appear here.
              </p>
            </div>
          </div>
          <Link
            href="/employee/work?tab=leads"
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Open Leads Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all sm:p-6 dark:border-white/10 dark:bg-slate-900/80">
      {/* Card Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Assigned Customer Leads
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Recent buyer prospects & direct follow-ups
            </p>
          </div>
        </div>
        <Link
          href="/employee/work?tab=leads"
          className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
        >
          <span>View All ({leads.length})</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {leads.slice(0, 4).map((lead) => {
          const temp = (lead.lead_temperature || '').toLowerCase();
          return (
            <div
              key={lead.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all hover:border-slate-300 dark:border-white/5 dark:bg-slate-950/40 dark:hover:border-white/15"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {lead.name || 'Anonymous Prospect'}
                  </p>
                  {temp === 'hot' ? (
                    <span className="py-0.2 flex items-center gap-0.5 rounded-full border border-red-500/20 bg-red-500/10 px-1.5 text-[9px] font-bold text-red-600 dark:text-red-400">
                      <Flame className="h-2.5 w-2.5" /> Hot
                    </span>
                  ) : temp === 'warm' ? (
                    <span className="py-0.2 flex items-center gap-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                      <Zap className="h-2.5 w-2.5" /> Warm
                    </span>
                  ) : (
                    <span className="py-0.2 rounded-full border border-slate-200 bg-slate-100 px-1.5 text-[9px] font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400">
                      {lead.lead_status || 'New'}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {lead.phone || 'No phone'}
                </p>
              </div>

              {/* Quick Contact Actions */}
              {lead.phone && (
                <div className="flex shrink-0 items-center gap-1">
                  <a
                    href={formatTelLink(lead.phone)}
                    className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    title="Call customer"
                  >
                    <Phone className="h-3 w-3 text-blue-500" />
                  </a>
                  <a
                    href={formatWhatsAppLink(
                      lead.phone,
                      `Hello ${lead.name || 'Sir/Madam'}, I am contacting you from SVI Infra regarding your property inquiry.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95"
                    title="WhatsApp chat"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
