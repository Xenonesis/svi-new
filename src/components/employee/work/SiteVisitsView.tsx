'use client';

import React from 'react';
import { Calendar, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import type { SiteVisitItem } from './types';

interface SiteVisitsViewProps {
  siteVisits: SiteVisitItem[];
  onUpdateStatus: (visitId: string, status: 'confirmed' | 'completed') => void;
}

export function SiteVisitsView({ siteVisits, onUpdateStatus }: SiteVisitsViewProps) {
  if (siteVisits.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
        No site visits currently assigned to you.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {siteVisits.map((visit) => (
        <div
          key={visit.id}
          className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {visit.contact?.name || 'Customer Site Visit'}
              </span>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                <Calendar className="h-3 w-3" />
                {visit.preferred_date
                  ? format(parseISO(visit.preferred_date), 'EEEE, MMM dd • hh:mm a')
                  : 'Date pending'}
              </p>
            </div>
            <span
              className={clsx(
                'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                visit.status === 'confirmed'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : visit.status === 'requested'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : visit.status === 'completed'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-500'
              )}
            >
              {visit.status}
            </span>
          </div>

          {visit.notes && (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{visit.notes}</p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            {visit.contact?.phone && (
              <a
                href={`tel:${visit.contact.phone}`}
                className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                <Phone className="h-3 w-3" /> Call Client
              </a>
            )}

            {visit.status === 'requested' && (
              <button
                onClick={() => onUpdateStatus(visit.id, 'confirmed')}
                className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Confirm Visit
              </button>
            )}

            {visit.status === 'confirmed' && (
              <button
                onClick={() => onUpdateStatus(visit.id, 'completed')}
                className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
