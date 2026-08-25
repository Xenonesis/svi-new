'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Phone } from 'lucide-react';
import type { DashboardData } from './types';

interface DashboardAssignedLeadsCardProps {
  leads: DashboardData['recent_leads'] | undefined;
}

export function DashboardAssignedLeadsCard({ leads }: DashboardAssignedLeadsCardProps) {
  if (!leads || leads.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Users className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Assigned Customer Leads
          </h2>
        </div>
        <Link
          href="/employee/work?tab=leads"
          className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {leads.slice(0, 4).map((lead) => (
          <div
            key={lead.id}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{lead.name}</p>
              <p className="text-[10px] text-slate-500">{lead.lead_status}</p>
            </div>
            <a
              href={`tel:${lead.phone}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
