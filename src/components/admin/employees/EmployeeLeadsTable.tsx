'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Phone,
  Building2,
  Calendar,
  Clock,
  Flame,
  Zap,
  Snowflake,
  History,
  AlertCircle,
  CheckCircle2,
  Filter,
  PhoneCall,
  MessageSquare,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { LeadActivityTimelineModal } from './LeadActivityTimelineModal';

export interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  project_interest?: string | null;
  lifecycle_status: string;
  temperature?: 'hot' | 'warm' | 'cold' | null;
  follow_up_at?: string | null;
  notes?: string | null;
  summary?: string | null;
  created_at: string;
  activities_count?: number;
  latest_activity?: {
    title: string;
    notes?: string | null;
    created_at: string;
  } | null;
}

interface EmployeeLeadsTableProps {
  leads: LeadItem[];
  loading?: boolean;
  token?: string;
  initialTemperature?: 'all' | 'hot' | 'warm' | 'cold';
  initialStatus?: string;
}

export function EmployeeLeadsTable({
  leads,
  loading,
  token,
  initialTemperature = 'all',
  initialStatus = 'all',
}: EmployeeLeadsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [temperatureFilter, setTemperatureFilter] = useState<string>(initialTemperature);
  const [selectedLeadForTimeline, setSelectedLeadForTimeline] = useState<LeadItem | null>(null);

  useEffect(() => {
    if (initialTemperature) setTemperatureFilter(initialTemperature);
  }, [initialTemperature]);

  useEffect(() => {
    if (initialStatus) setStatusFilter(initialStatus);
  }, [initialStatus]);

  const now = new Date();

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = lead.name?.toLowerCase().includes(q);
        const matchesPhone = lead.phone?.toLowerCase().includes(q);
        const matchesProject = lead.project_interest?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesProject) return false;
      }
      // Status
      if (statusFilter !== 'all' && lead.lifecycle_status !== statusFilter) {
        return false;
      }
      // Temperature
      if (temperatureFilter !== 'all' && lead.temperature !== temperatureFilter) {
        return false;
      }
      return true;
    });
  }, [leads, search, statusFilter, temperatureFilter]);

  const counts = useMemo(() => {
    return {
      all: leads.length,
      hot: leads.filter((l) => l.temperature === 'hot').length,
      warm: leads.filter((l) => l.temperature === 'warm').length,
      cold: leads.filter((l) => l.temperature === 'cold').length,
    };
  }, [leads]);

  return (
    <div className="space-y-4">
      {/* Controls / Filter Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, phone, project..."
            className="focus:border-brand-gold dark:focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2 pr-3 pl-9 text-xs text-gray-900 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#161622] dark:text-white dark:focus:bg-[#1a1a28]"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Temperature Segmented Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50/80 p-1 dark:border-white/10 dark:bg-[#161622]">
            <button
              type="button"
              onClick={() => setTemperatureFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                temperatureFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-xs dark:bg-white/15 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setTemperatureFilter('hot')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                temperatureFilter === 'hot'
                  ? 'bg-red-500/15 text-red-600 shadow-xs dark:bg-red-500/20 dark:text-red-400'
                  : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
              }`}
            >
              <Flame className="h-3 w-3 text-red-500" />
              <span>Hot ({counts.hot})</span>
            </button>
            <button
              type="button"
              onClick={() => setTemperatureFilter('warm')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                temperatureFilter === 'warm'
                  ? 'bg-amber-500/15 text-amber-600 shadow-xs dark:bg-amber-500/20 dark:text-amber-400'
                  : 'text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400'
              }`}
            >
              <Zap className="h-3 w-3 text-amber-500" />
              <span>Warm ({counts.warm})</span>
            </button>
            <button
              type="button"
              onClick={() => setTemperatureFilter('cold')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                temperatureFilter === 'cold'
                  ? 'bg-blue-500/15 text-blue-600 shadow-xs dark:bg-blue-500/20 dark:text-blue-400'
                  : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
              }`}
            >
              <Snowflake className="h-3 w-3 text-blue-500" />
              <span>Cold ({counts.cold})</span>
            </button>
          </div>

          {/* Stage Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="focus:border-brand-gold rounded-xl border border-gray-200 bg-white py-1.5 pr-8 pl-3 text-xs font-semibold text-gray-700 focus:outline-none dark:border-white/10 dark:bg-[#161622] dark:text-gray-200"
            >
              <option value="all">All Stages</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="visit_requested">Site Visit Requested</option>
              <option value="won">Won (Converted)</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table / Card Grid */}
      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-[#161622]">
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 dark:border-white/5 dark:bg-white/5"
              >
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-white/10" />
                  <div className="h-3 w-24 rounded-md bg-gray-100 dark:bg-white/5" />
                </div>
                <div className="h-4 w-28 rounded-md bg-gray-100 dark:bg-white/5" />
                <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="h-4 w-24 rounded-md bg-gray-100 dark:bg-white/5" />
                <div className="h-8 w-20 rounded-xl bg-gray-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center dark:border-white/10 dark:bg-[#161622]/50">
          <div className="bg-brand-gold/10 text-brand-gold mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Filter className="h-6 w-6" />
          </div>
          <h4 className="font-serif text-sm font-bold text-gray-900 dark:text-white">
            No Leads Match Selected Filters
          </h4>
          <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
            Try adjusting search terms or clearing the temperature/stage filters to see other
            records.
          </p>
          {(search || statusFilter !== 'all' || temperatureFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setTemperatureFilter('all');
              }}
              className="border-brand-gold/40 text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 mt-4 rounded-xl border px-4 py-1.5 text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-[#161622]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3.5">Client & Contact</th>
                  <th className="px-4 py-3.5">Project / Requirement</th>
                  <th className="px-4 py-3.5">Stage & Priority</th>
                  <th className="px-4 py-3.5">Follow-up Schedule</th>
                  <th className="px-4 py-3.5">Latest Activity Update</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredLeads.map((lead) => {
                  const isOverdue =
                    lead.follow_up_at &&
                    new Date(lead.follow_up_at) < now &&
                    lead.lifecycle_status !== 'won' &&
                    lead.lifecycle_status !== 'lost';

                  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
                  const waUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`
                    : null;

                  return (
                    <tr
                      key={lead.id}
                      className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/5"
                    >
                      {/* Client */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {lead.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-500 transition-colors hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="px-4 py-3.5">
                        {lead.project_interest ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{lead.project_interest}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">General Property</span>
                        )}
                      </td>

                      {/* Stage & Urgency */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              lead.lifecycle_status === 'won'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : lead.lifecycle_status === 'visit_requested'
                                  ? 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                                  : lead.lifecycle_status === 'qualified'
                                    ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                    : lead.lifecycle_status === 'lost'
                                      ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                                      : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                            }`}
                          >
                            {lead.lifecycle_status.replace('_', ' ')}
                          </span>

                          {lead.temperature && (
                            <span
                              className={`inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                lead.temperature === 'hot'
                                  ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                  : lead.temperature === 'warm'
                                    ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                    : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                              }`}
                            >
                              {lead.temperature === 'hot' ? (
                                <>
                                  <Flame className="h-2.5 w-2.5 text-red-500" /> Hot
                                </>
                              ) : lead.temperature === 'warm' ? (
                                <>
                                  <Zap className="h-2.5 w-2.5 text-amber-500" /> Warm
                                </>
                              ) : (
                                <>
                                  <Snowflake className="h-2.5 w-2.5 text-blue-500" /> Cold
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Follow-up */}
                      <td className="px-4 py-3.5">
                        {lead.follow_up_at ? (
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                              isOverdue
                                ? 'border border-red-500/30 bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-300'
                                : 'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                            }`}
                          >
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>
                              {isOverdue ? 'Overdue: ' : ''}
                              {new Date(lead.follow_up_at).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">No follow-up set</span>
                        )}
                      </td>

                      {/* Latest Activity */}
                      <td className="max-w-[220px] px-4 py-3.5">
                        {lead.latest_activity ? (
                          <div>
                            <p className="truncate font-semibold text-gray-800 dark:text-gray-200">
                              {lead.latest_activity.title}
                            </p>
                            {lead.latest_activity.notes && (
                              <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                                "{lead.latest_activity.notes}"
                              </p>
                            )}
                            <span className="text-[9px] text-gray-400">
                              {new Date(lead.latest_activity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <p className="line-clamp-1 text-[11px] text-gray-500">
                            {lead.notes || lead.summary || 'Lead registered'}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="rounded-lg border border-gray-200 bg-gray-50 p-1.5 text-gray-600 transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/20 dark:hover:text-amber-300"
                              title={`Call ${lead.name}`}
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-gray-200 bg-gray-50 p-1.5 text-emerald-600 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-emerald-400 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/20"
                              title={`WhatsApp ${lead.name}`}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedLeadForTimeline(lead)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-700 transition-all hover:bg-amber-500/20 active:scale-95 dark:border-amber-500/20 dark:text-amber-300"
                            title="View entire activity updates timeline"
                          >
                            <History className="h-3.5 w-3.5" />
                            <span>
                              Updates {lead.activities_count ? `(${lead.activities_count})` : ''}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Timeline Modal */}
      <LeadActivityTimelineModal
        lead={selectedLeadForTimeline}
        isOpen={!!selectedLeadForTimeline}
        onClose={() => setSelectedLeadForTimeline(null)}
        token={token}
      />
    </div>
  );
}
