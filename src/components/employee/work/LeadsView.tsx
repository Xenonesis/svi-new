'use client';

import React from 'react';
import { Phone, MessageSquare, Plus, Clock, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { LeadItem } from './types';

interface LeadsViewProps {
  leads: LeadItem[];
  onUpdateLeadStatus: (leadId: string, status: string) => void;
  onSelectLead?: (lead: LeadItem) => void;
  onAddNewLead?: () => void;
}

export function LeadsView({
  leads,
  onUpdateLeadStatus,
  onSelectLead,
  onAddNewLead,
}: LeadsViewProps) {
  const now = new Date();

  return (
    <div className="space-y-4">
      {/* Top action row */}
      {onAddNewLead && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Assigned & Created Leads ({leads.length})
          </span>
          <button
            onClick={onAddNewLead}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> Add Lead
          </button>
        </div>
      )}

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
          <p className="mb-3">No leads currently assigned or created.</p>
          {onAddNewLead && (
            <button
              onClick={onAddNewLead}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" /> Add Your First Lead
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => {
            const isFollowUpOverdue = lead.follow_up_at
              ? new Date(lead.follow_up_at) < now &&
                lead.lifecycle_status !== 'won' &&
                lead.lifecycle_status !== 'lost'
              : false;

            return (
              <div
                key={lead.id}
                className="relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
              >
                <div>
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
                      <option value="won">Won / Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  {/* Follow-up reminder pill */}
                  {lead.follow_up_at && (
                    <div
                      className={`mt-2.5 flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-semibold ${
                        isFollowUpOverdue
                          ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          : 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {isFollowUpOverdue ? 'Overdue: ' : 'Follow-up: '}
                        {new Date(lead.follow_up_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  {(lead.notes || lead.summary) && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                      {lead.notes || lead.summary}
                    </p>
                  )}
                </div>

                {/* Bottom actions */}
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {lead.phone && (
                      <>
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          <Phone className="h-3 w-3" /> Call
                        </a>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                        >
                          <MessageSquare className="h-3 w-3" /> WhatsApp
                        </a>
                      </>
                    )}

                    {onSelectLead && (
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        title="Track lead details & notes"
                      >
                        Track <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
