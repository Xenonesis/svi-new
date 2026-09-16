'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ChevronDown,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  UserCheck,
  Check,
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
interface AdvisorFilterDropdownProps {
  employees: Employee[];
  selectedAdvisorId: string;
  onChange: (id: string) => void;
}

export function AdvisorFilterDropdown({
  employees,
  selectedAdvisorId,
  onChange,
}: AdvisorFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedAdvisorId);
  const selectedLabel = selectedEmployee ? selectedEmployee.full_name : 'All Advisors';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredEmployees = employees.filter((emp) =>
    emp.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
          selectedAdvisorId !== 'all'
            ? 'border-brand-gold/40 bg-brand-gold/10 text-brand-gold font-semibold shadow-sm'
            : 'border-gray-200 bg-gray-50/80 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Filter by assigned advisor"
      >
        <UserCheck
          className={`h-3.5 w-3.5 ${
            selectedAdvisorId !== 'all' ? 'text-brand-gold' : 'text-gray-400 dark:text-gray-400'
          }`}
        />
        <span className="max-w-[140px] truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-50 mt-1.5 max-w-[280px] min-w-[240px] rounded-2xl border border-gray-200/80 bg-white p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#12121a]"
            role="listbox"
          >
            {employees.length > 5 && (
              <div className="p-1 pb-1.5">
                <div className="relative">
                  <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search advisor..."
                    className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-[260px] space-y-0.5 overflow-x-hidden overflow-y-auto">
              {/* All Advisors Option */}
              <button
                type="button"
                onClick={() => {
                  onChange('all');
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                  selectedAdvisorId === 'all'
                    ? 'bg-brand-gold/15 text-brand-gold font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
                role="option"
                aria-selected={selectedAdvisorId === 'all'}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200/70 text-[10px] font-bold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                    ALL
                  </div>
                  <span>All Advisors</span>
                </div>
                {selectedAdvisorId === 'all' && <Check className="text-brand-gold h-3.5 w-3.5" />}
              </button>

              {/* Individual Advisor Options */}
              {filteredEmployees.map((emp) => {
                const isSelected = selectedAdvisorId === emp.id;
                const initials = emp.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      onChange(emp.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                      isSelected
                        ? 'bg-brand-gold/15 text-brand-gold font-semibold'
                        : 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="bg-brand-gold/15 text-brand-gold flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                        {initials}
                      </div>
                      <span className="truncate">{emp.full_name}</span>
                    </div>
                    {isSelected && <Check className="text-brand-gold h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}

              {filteredEmployees.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-400">No advisors found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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

  const handleAdvisorChange = (val: string) => {
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

          <AdvisorFilterDropdown
            employees={employees}
            selectedAdvisorId={activeAdvisor}
            onChange={handleAdvisorChange}
          />
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
                          style={{ colorScheme: 'dark light' }}
                          className="focus:border-brand-gold rounded-lg border border-transparent bg-transparent py-1 text-xs font-medium text-gray-800 transition-colors hover:border-gray-200 focus:bg-white focus:outline-none dark:text-gray-200 dark:hover:border-white/10 dark:focus:bg-[#1a1a24] [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white"
                        >
                          <option
                            value=""
                            className="bg-white text-gray-900 dark:bg-[#161622] dark:text-white"
                          >
                            {record.agent_name || 'Unassigned'}
                          </option>
                          {employees.map((emp) => (
                            <option
                              key={emp.id}
                              value={emp.id}
                              className="bg-white text-gray-900 dark:bg-[#161622] dark:text-white"
                            >
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
                          style={{ colorScheme: 'dark light' }}
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all focus:outline-none [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white ${
                            record.temperature === 'hot'
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : record.temperature === 'warm'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          <option
                            value="hot"
                            className="bg-white text-rose-600 dark:bg-[#161622] dark:text-rose-400"
                          >
                            🔥 Hot
                          </option>
                          <option
                            value="warm"
                            className="bg-white text-amber-600 dark:bg-[#161622] dark:text-amber-400"
                          >
                            ⚡ Warm
                          </option>
                          <option
                            value="cold"
                            className="bg-white text-blue-600 dark:bg-[#161622] dark:text-blue-400"
                          >
                            ❄️ Cold
                          </option>
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
