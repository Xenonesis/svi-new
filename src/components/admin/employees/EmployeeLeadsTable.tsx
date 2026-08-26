'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { LeadActivityTimelineModal } from './LeadActivityTimelineModal';

interface LeadItem {
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
}

export function EmployeeLeadsTable({ leads, loading, token }: EmployeeLeadsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [temperatureFilter, setTemperatureFilter] = useState('all');
  const [selectedLeadForTimeline, setSelectedLeadForTimeline] = useState<LeadItem | null>(null);

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

  return (
    <div className="space-y-4">
      {/* Controls / Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by client, phone, project..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-3 pl-9 text-xs text-gray-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Temperature */}
          <select
            value={temperatureFilter}
            onChange={(e) => setTemperatureFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="all">All Priorities</option>
            <option value="hot">🔥 Hot Leads</option>
            <option value="warm">⚡ Warm Leads</option>
            <option value="cold">❄️ Cold Leads</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="visit_requested">Site Visit</option>
            <option value="won">Won (Converted)</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table / Card Grid */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs text-gray-500">Loading employee's leads and activity updates...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-xs text-gray-500 dark:border-white/10">
          No leads match the selected filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Client & Contact</th>
                  <th className="px-4 py-3">Project / Requirement</th>
                  <th className="px-4 py-3">Stage & Urgency</th>
                  <th className="px-4 py-3">Follow-up Schedule</th>
                  <th className="px-4 py-3">Latest Activity Update</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredLeads.map((lead) => {
                  const isOverdue =
                    lead.follow_up_at &&
                    new Date(lead.follow_up_at) < now &&
                    lead.lifecycle_status !== 'won' &&
                    lead.lifecycle_status !== 'lost';

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
                        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                          <Phone className="h-3 w-3" />
                          <a
                            href={`tel:${lead.phone}`}
                            className="hover:text-amber-600 hover:underline"
                          >
                            {lead.phone}
                          </a>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="px-4 py-3.5">
                        {lead.project_interest ? (
                          <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                            <Building2 className="h-3 w-3" /> {lead.project_interest}
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
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : lead.lifecycle_status === 'visit_requested'
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                  : lead.lifecycle_status === 'qualified'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                            }`}
                          >
                            {lead.lifecycle_status}
                          </span>

                          {lead.temperature && (
                            <span
                              className={`py-0.2 inline-block w-fit rounded px-1.5 text-[9px] font-bold uppercase ${
                                lead.temperature === 'hot'
                                  ? 'text-red-600 dark:text-red-400'
                                  : lead.temperature === 'warm'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-blue-500 dark:text-blue-400'
                              }`}
                            >
                              {lead.temperature === 'hot'
                                ? '🔥 Hot'
                                : lead.temperature === 'warm'
                                  ? '⚡ Warm'
                                  : '❄️ Cold'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Follow-up */}
                      <td className="px-4 py-3.5">
                        {lead.follow_up_at ? (
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold ${
                              isOverdue
                                ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                : 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                            }`}
                          >
                            <Clock className="h-3 w-3" />
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

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedLeadForTimeline(lead)}
                          className="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-700 transition-all hover:bg-amber-500/20 dark:text-amber-300"
                          title="View entire activity updates timeline"
                        >
                          <History className="h-3.5 w-3.5" />
                          <span>
                            Updates {lead.activities_count ? `(${lead.activities_count})` : ''}
                          </span>
                        </button>
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
