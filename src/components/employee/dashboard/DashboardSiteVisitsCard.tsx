'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, MapPin, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import type { DashboardData } from './types';

interface DashboardSiteVisitsCardProps {
  visits: DashboardData['upcoming_site_visits'] | undefined;
}

export function DashboardSiteVisitsCard({ visits }: DashboardSiteVisitsCardProps) {
  if (!visits || visits.length === 0) return null;
  const visit = visits[0];

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent p-5 shadow-sm dark:border-purple-500/30 dark:from-purple-950/20">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <Compass className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Next Scheduled Site Visit
          </h2>
        </div>
        <Link
          href="/employee/work?tab=site-visits"
          className="text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
        >
          View All
        </Link>
      </div>

      <div className="rounded-2xl border border-purple-200/60 bg-white/90 p-4 shadow-sm dark:border-purple-900/40 dark:bg-slate-900/80">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {visit.property?.title || 'Property Site Visit'}
            </h4>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <MapPin className="h-3 w-3 text-purple-500" />
              {visit.location || visit.property?.location || 'Jaipur Site'}
            </p>
          </div>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            {visit.status}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-purple-500" />
            <span>
              {format(new Date(visit.preferred_date), 'd MMM yyyy')}
              {visit.preferred_time ? ` (${visit.preferred_time})` : ''}
            </span>
          </div>

          {visit.contact?.phone && (
            <a
              href={`tel:${visit.contact.phone}`}
              className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
            >
              <Phone className="h-3 w-3" /> Call Client
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
