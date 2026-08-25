'use client';

import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import type { LeadItem } from './types';

interface LeadsViewProps {
  leads: LeadItem[];
  onUpdateLeadStatus: (leadId: string, status: string) => void;
}

export function LeadsView({ leads, onUpdateLeadStatus }: LeadsViewProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
        No leads currently assigned to you.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {lead.name}
                </span>
                {lead.lead_temperature && (
                  <span
                    className={clsx(
                      'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
                      lead.lead_temperature === 'hot' &&
                        'bg-red-500/10 text-red-600 dark:text-red-400',
                      lead.lead_temperature === 'warm' &&
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                      lead.lead_temperature === 'cold' &&
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    )}
                  >
                    {lead.lead_temperature === 'hot'
                      ? '🔥 Hot'
                      : lead.lead_temperature === 'warm'
                        ? '⚡ Warm'
                        : '❄️ Cold'}
                  </span>
                )}
              </div>
              {lead.project_interest && (
                <p className="mt-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  Project: {lead.project_interest}
                </p>
              )}
            </div>

            <select
              value={lead.lifecycle_status}
              onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="visit_requested">Visit Scheduled</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {lead.summary && (
            <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
              {lead.summary}
            </p>
          )}

          {lead.phone && (
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <a
                href={`tel:${lead.phone}`}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <a
                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
