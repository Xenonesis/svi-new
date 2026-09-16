'use client';

import React, { useState } from 'react';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import {
  Phone,
  MessageCircle,
  Clock,
  Flame,
  Zap,
  Snowflake,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

export interface IvrFilterState {
  dial_status: 'all' | 'ANSWER' | 'NOANSWER';
  temperature: 'all' | 'hot' | 'warm' | 'cold';
  advisor_id: string;
  q: string;
}

interface IvrLeadsTableProps {
  records: IvrRecordItem[];
  totalCount: number;
  page: number;
  limit: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: Partial<IvrFilterState>) => void;
  onTemperatureChange: (recordId: string, phone: string, temp: 'hot' | 'warm' | 'cold') => void;
  onReassignAdvisor: (recordId: string, phone: string, advisorId: string) => void;
  employees: Employee[];
  summary?: {
    total_calls: number;
    answered_calls: number;
    missed_calls: number;
    hot_count: number;
    warm_count: number;
    cold_count: number;
  };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function IvrLeadsTable({
  records,
  totalCount,
  page,
  limit,
  loading,
  onPageChange,
  onFilterChange,
  onTemperatureChange,
  onReassignAdvisor,
  employees,
  summary,
}: IvrLeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDialStatus, setActiveDialStatus] = useState<'all' | 'ANSWER' | 'NOANSWER'>('all');
  const [activeTemp, setActiveTemp] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [activeAdvisor, setActiveAdvisor] = useState<string>('all');

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFilterChange({ q: searchTerm.trim() });
  };

  const handleDialStatusClick = (status: 'all' | 'ANSWER' | 'NOANSWER') => {
    setActiveDialStatus(status);
    onFilterChange({ dial_status: status });
  };

  const handleTempClick = (temp: 'all' | 'hot' | 'warm' | 'cold') => {
    setActiveTemp(temp);
    onFilterChange({ temperature: temp });
  };

  const handleAdvisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActiveAdvisor(val);
    onFilterChange({ advisor_id: val });
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors duration-300 lg:flex-row lg:items-center lg:justify-between dark:border-white/5 dark:bg-[#0f0f16]">
        {/* Left: Search & Advisor Dropdown */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search phone or advisor..."
              className="focus:border-brand-gold dark:focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2 pr-4 pl-9 text-xs text-gray-900 transition-colors focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </form>

          <select
            value={activeAdvisor}
            onChange={handleAdvisorChange}
            aria-label="Filter by assigned advisor"
            className="focus:border-brand-gold rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-xs font-medium text-gray-700 transition-colors focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
          >
            <option value="all">All Advisors</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Dial Status & Temperature Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dial Status Filter Group */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/80 p-0.5 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => handleDialStatusClick('all')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeDialStatus === 'all'
                  ? 'text-brand-navy bg-white shadow-sm dark:bg-white/15 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              All Calls
            </button>
            <button
              type="button"
              onClick={() => handleDialStatusClick('ANSWER')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeDialStatus === 'ANSWER'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              Answered {summary?.answered_calls ? `(${summary.answered_calls})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleDialStatusClick('NOANSWER')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeDialStatus === 'NOANSWER'
                  ? 'bg-rose-50 text-rose-700 shadow-sm dark:bg-rose-500/20 dark:text-rose-300'
                  : 'text-rose-600 hover:text-rose-700 dark:text-rose-400'
              }`}
            >
              <XCircle className="h-3 w-3" />
              Not Answered {summary?.missed_calls ? `(${summary.missed_calls})` : ''}
            </button>
          </div>

          {/* Temperature Filter Group */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/80 p-0.5 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => handleTempClick('all')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTemp === 'all'
                  ? 'text-brand-navy bg-white shadow-sm dark:bg-white/15 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleTempClick('hot')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTemp === 'hot'
                  ? 'bg-rose-50 text-rose-700 shadow-sm dark:bg-rose-500/20 dark:text-rose-300'
                  : 'text-rose-600 hover:text-rose-700 dark:text-rose-400'
              }`}
            >
              <Flame className="h-3 w-3" /> Hot
            </button>
            <button
              type="button"
              onClick={() => handleTempClick('warm')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTemp === 'warm'
                  ? 'bg-amber-50 text-amber-700 shadow-sm dark:bg-amber-500/20 dark:text-amber-300'
                  : 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
              }`}
            >
              <Zap className="h-3 w-3" /> Warm
            </button>
            <button
              type="button"
              onClick={() => handleTempClick('cold')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTemp === 'cold'
                  ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-500/20 dark:text-blue-300'
                  : 'text-blue-600 hover:text-blue-700 dark:text-blue-400'
              }`}
            >
              <Snowflake className="h-3 w-3" /> Cold
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-white/8 dark:bg-[#0d0d14]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:border-white/5 dark:bg-white/[0.02] dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5">Customer Contact</th>
                <th className="px-4 py-3.5">Assigned Advisor</th>
                <th className="px-4 py-3.5">Dial Status</th>
                <th className="px-4 py-3.5">Call Duration</th>
                <th className="px-4 py-3.5">Pressed Key</th>
                <th className="px-4 py-3.5">Lead Intent</th>
                <th className="px-5 py-3.5 text-right">Dialed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="text-brand-gold h-4 w-4 animate-spin" />
                      <span>Loading IVR call records...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No IVR call records found matching current filters.
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const isAnswered = record.dial_status === 'ANSWER';
                  const durationPercent = Math.min(
                    100,
                    Math.round((record.call_duration / 120) * 100)
                  );

                  return (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                    >
                      {/* Customer Phone & Quick Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {record.customer_phone}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                            <a
                              href={`tel:${record.customer_phone}`}
                              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-white/5"
                              title="Click to Call"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                            <a
                              href={`https://wa.me/91${record.customer_phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-white/5"
                              title="Open WhatsApp"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Advisor & Reassignment Dropdown */}
                      <td className="px-4 py-3.5">
                        <select
                          value={record.assigned_agent_id || ''}
                          onChange={(e) =>
                            onReassignAdvisor(record.id, record.customer_phone, e.target.value)
                          }
                          aria-label={`Assigned advisor for ${record.customer_phone}`}
                          className="focus:border-brand-gold rounded-lg border border-transparent bg-transparent py-1 text-xs font-medium text-gray-800 transition-colors hover:border-gray-200 focus:bg-white focus:outline-none dark:text-gray-200 dark:hover:border-white/10 dark:focus:bg-[#1a1a24]"
                        >
                          <option value="">{record.agent_name || 'Unassigned'}</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.full_name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Prominent Dial Status Badge */}
                      <td className="px-4 py-3.5">
                        {isAnswered ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                            Answered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <XCircle className="h-3 w-3 shrink-0" />
                            Not Answered
                          </span>
                        )}
                      </td>

                      {/* Call Duration with Visual Meter */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>{formatDuration(record.call_duration)}</span>
                            <span className="text-[10px] text-gray-400">
                              ({record.call_duration}s)
                            </span>
                          </div>
                          <div className="h-1 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                            <div
                              className={`h-full rounded-full transition-all ${
                                record.call_duration >= 60
                                  ? 'bg-rose-500'
                                  : record.call_duration >= 20
                                    ? 'bg-amber-500'
                                    : 'bg-gray-400'
                              }`}
                              style={{ width: `${durationPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Pressed Key */}
                      <td className="px-4 py-3.5">
                        {record.pressed_key ? (
                          <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold">
                            Key {record.pressed_key}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Temperature with 1-Click Interactive Selector */}
                      <td className="px-4 py-3.5">
                        <select
                          value={record.temperature}
                          onChange={(e) =>
                            onTemperatureChange(
                              record.id,
                              record.customer_phone,
                              e.target.value as 'hot' | 'warm' | 'cold'
                            )
                          }
                          aria-label={`Lead temperature for ${record.customer_phone}`}
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all focus:outline-none ${
                            record.temperature === 'hot'
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : record.temperature === 'warm'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          <option value="hot">🔥 Hot</option>
                          <option value="warm">⚡ Warm</option>
                          <option value="cold">❄️ Cold</option>
                        </select>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-3.5 text-right font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {new Date(record.dial_time).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs text-gray-500 dark:border-white/5 dark:text-gray-400">
          <div>
            Showing{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{records.length}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span>{' '}
            records
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium transition-colors hover:bg-gray-100 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="px-2 font-medium">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium transition-colors hover:bg-gray-100 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
