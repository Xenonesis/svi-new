'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExportLeadsModal } from '@/src/components/admin/leads/ExportLeadsModal';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import {
  Phone,
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
  UserCheck,
  Check,
  Download,
  FileText,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  exportIvrLeadsToExcel,
  exportIvrLeadsToPdf,
  exportIvrLeadsToCsv,
} from '@/src/lib/leads/exportIvrLeads';
import { WhatsAppTemplateDropdown } from './WhatsAppTemplateDropdown';
import { LeadDrawer } from './LeadDrawer';
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
  token?: string;
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
export function IvrTableSkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <tr
          key={idx}
          data-testid="ivr-table-skeleton-row"
          className="animate-pulse transition-colors"
          style={{ animationDelay: `${idx * 75}ms` }}
        >
          {/* Checkbox */}
          <td className="px-4 py-3.5">
            <div className="h-4 w-4 rounded-md bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Customer Contact */}
          <td className="px-5 py-3.5">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-28 rounded-md bg-gray-200 dark:bg-white/10" />
              <div className="h-3 w-16 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </td>

          {/* Attended By */}
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="flex flex-col gap-1">
                <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
                <div className="h-2.5 w-14 rounded bg-gray-100 dark:bg-white/5" />
              </div>
            </div>
          </td>

          {/* Follow-up Advisor */}
          <td className="px-4 py-3.5">
            <div className="h-7 w-28 rounded-lg bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Dial Status */}
          <td className="px-4 py-3.5">
            <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Call Duration */}
          <td className="px-4 py-3.5">
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-12 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-1.5 w-20 rounded-full bg-gray-100 dark:bg-white/5" />
            </div>
          </td>

          {/* Pressed Key */}
          <td className="px-4 py-3.5">
            <div className="h-6 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Lead Intent */}
          <td className="px-4 py-3.5">
            <div className="h-6 w-16 rounded-xl bg-gray-200 dark:bg-white/10" />
          </td>

          {/* Dialed At */}
          <td className="px-5 py-3.5 text-right">
            <div className="ml-auto flex flex-col items-end gap-1">
              <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-2.5 w-14 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
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
  token,
}: IvrLeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDialStatus, setActiveDialStatus] = useState<'all' | 'ANSWER' | 'NOANSWER'>('all');
  const [activeTemp, setActiveTemp] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [activeAdvisor, setActiveAdvisor] = useState<string>('all');
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [drawerLead, setDrawerLead] = useState<{
    phone: string;
    clientName?: string;
    advisorId?: string | null;
    advisorName?: string | null;
    temperature?: 'hot' | 'warm' | 'cold';
  } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const toggleSelectPhone = (phone: string) => {
    setSelectedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPhones.size === records.length) {
      setSelectedPhones(new Set());
    } else {
      setSelectedPhones(new Set(records.map((r) => r.customer_phone)));
    }
  };

  const handleBulkReassign = async (advisorId: string) => {
    if (selectedPhones.size === 0) return;
    const emp = employees.find((e) => e.id === advisorId);
    const advisorName = emp?.full_name || 'Unassigned';
    const count = selectedPhones.size;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone_numbers: Array.from(selectedPhones),
          action: 'reassign',
          advisor_id: advisorId || null,
          advisor_name: advisorName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedPhones(new Set());
        onFilterChange({});
        toast.success(`Reassigned ${count} leads to ${advisorName}`, {
          description: 'Option to revert is saved in Notifications.',
          action: {
            label: 'Undo',
            onClick: async () => {
              try {
                const revRes = await fetch('/api/admin/leads/bulk', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({
                    action: 'revert',
                    notification_id: data.notification_id,
                    previous_assignments: data.previous_assignments,
                  }),
                });
                const revData = await revRes.json();
                if (revRes.ok && revData.success) {
                  toast.success(
                    `Successfully reverted assignment for ${revData.restored_count} leads`
                  );
                  onFilterChange({});
                } else {
                  toast.error(revData.message || 'Failed to revert assignment');
                }
              } catch {
                toast.error('Failed to revert assignment');
              }
            },
          },
          duration: 10000,
        });
      } else {
        toast.error(data.message || 'Bulk reassign failed');
      }
    } catch {
      toast.error('Bulk reassign failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStage = async (stage: string) => {
    if (selectedPhones.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone_numbers: Array.from(selectedPhones),
          action: 'stage',
          stage,
        }),
      });
      if (res.ok) {
        toast.success(`Moved ${selectedPhones.size} leads to stage: ${stage}`);
        setSelectedPhones(new Set());
        onFilterChange({});
      }
    } catch {
      toast.error('Bulk stage change failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [dockExportMenuOpen, setDockExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const dockExportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
      if (dockExportMenuRef.current && !dockExportMenuRef.current.contains(event.target as Node)) {
        setDockExportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTargetRecords = useCallback(() => {
    return selectedPhones.size > 0
      ? records.filter((r) => selectedPhones.has(r.customer_phone))
      : records;
  }, [records, selectedPhones]);

  const handleExportExcel = useCallback(() => {
    const targets = getTargetRecords();
    exportIvrLeadsToExcel(targets);
  }, [getTargetRecords]);

  const handleExportPdf = useCallback(() => {
    const targets = getTargetRecords();
    exportIvrLeadsToPdf(targets);
  }, [getTargetRecords]);

  const handleExportCsv = useCallback(() => {
    const targets = getTargetRecords();
    exportIvrLeadsToCsv(targets);
  }, [getTargetRecords]);

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

          {/* Quick Export Suite Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 shadow-2xs dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
                title="Open Export Studio to customize advisor and date range"
              >
                <Download className="text-brand-gold h-3.5 w-3.5" />
                <span>Export</span>
              </button>
              <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="cursor-pointer px-2 py-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                title="More export formats (Excel, PDF)"
                aria-label="Export format options"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    exportMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            <AnimatePresence>
              {exportMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 z-40 mt-1.5 w-48 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#13131c]"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Export{' '}
                    {selectedPhones.size > 0 ? `${selectedPhones.size} Selected` : 'Page Leads'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportModalOpen(true);
                      setExportMenuOpen(false);
                    }}
                    className="bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <div className="text-left">
                      <p className="leading-tight">Custom Export Studio...</p>
                      <span className="text-[10px] font-normal opacity-80">
                        By Advisor, Date & Status
                      </span>
                    </div>
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-white/5" />
                  <button
                    type="button"
                    onClick={() => {
                      handleExportExcel();
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-left">
                      <p className="leading-tight">Excel Spreadsheet</p>
                      <span className="text-[10px] font-normal text-gray-400">
                        Formatted .xlsx file
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportPdf();
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-gray-200 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <FileText className="h-4 w-4 text-red-500" />
                    <div className="text-left">
                      <p className="leading-tight">PDF Document</p>
                      <span className="text-[10px] font-normal text-gray-400">
                        Printable branded report
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportCsv();
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-gray-200 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                  >
                    <Download className="h-4 w-4 text-amber-500" />
                    <div className="text-left">
                      <p className="leading-tight">CSV Spreadsheet</p>
                      <span className="text-[10px] font-normal text-gray-400">
                        Standard .csv format
                      </span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-white/8 dark:bg-[#0d0d14]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:border-white/5 dark:bg-white/[0.02] dark:text-gray-400">
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={records.length > 0 && selectedPhones.size === records.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all leads"
                    className="accent-brand-gold h-3.5 w-3.5 rounded border-gray-300 transition-colors"
                  />
                </th>
                <th className="px-5 py-3.5">Customer Contact</th>
                <th className="px-4 py-3.5">Attended By</th>
                <th className="px-4 py-3.5">Follow-up Advisor</th>
                <th className="px-4 py-3.5">Dial Status</th>
                <th className="px-4 py-3.5">Call Duration</th>
                <th className="px-4 py-3.5">Pressed Key</th>
                <th className="px-4 py-3.5">Lead Intent</th>
                <th className="px-5 py-3.5 text-right">Dialed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <IvrTableSkeletonRows count={8} />
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
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
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedPhones.has(record.customer_phone)}
                          onChange={() => toggleSelectPhone(record.customer_phone)}
                          aria-label={`Select lead ${record.customer_phone}`}
                          className="accent-brand-gold h-3.5 w-3.5 rounded border-gray-300 transition-colors"
                        />
                      </td>

                      {/* Customer Phone & Quick Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setDrawerLead({
                                phone: record.customer_phone,
                                clientName: `Lead ${record.customer_phone}`,
                                advisorId: record.assigned_agent_id,
                                advisorName: record.agent_name,
                                temperature: record.temperature,
                              })
                            }
                            className="hover:text-brand-gold dark:hover:text-brand-gold font-semibold text-gray-900 transition-colors dark:text-white"
                            title="Open Lead Timeline & Notes"
                          >
                            {record.customer_phone}
                          </button>

                          <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                            <a
                              href={`tel:${record.customer_phone}`}
                              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-white/5"
                              title="Click to Call"
                            >
                              <Phone className="h-3 w-3" />
                            </a>

                            <WhatsAppTemplateDropdown
                              phone={record.customer_phone}
                              clientName={`Lead ${record.customer_phone}`}
                              advisorName={record.agent_name}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setDrawerLead({
                                  phone: record.customer_phone,
                                  clientName: `Lead ${record.customer_phone}`,
                                  advisorId: record.assigned_agent_id,
                                  advisorName: record.agent_name,
                                  temperature: record.temperature,
                                })
                              }
                              className="hover:text-brand-gold rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                              title="Lead Notes & Timeline"
                            >
                              <FileText className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 1. Attended By (Original Telecaller - Permanent / Read-Only) */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                            {record.agent_name ? record.agent_name.slice(0, 1).toUpperCase() : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                              {record.agent_name || 'Telecaller'}
                            </p>
                            {record.agent_phone && (
                              <p className="font-mono text-[10px] text-gray-400">
                                {record.agent_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Follow-up Advisor (Assignable Lead Closer - Dropdown) */}
                      <td className="px-4 py-3.5">
                        <select
                          value={record.assigned_agent_id || ''}
                          onChange={(e) =>
                            onReassignAdvisor(record.id, record.customer_phone, e.target.value)
                          }
                          aria-label={`Follow-up advisor for ${record.customer_phone}`}
                          style={{ colorScheme: 'dark light' }}
                          className="focus:border-brand-gold rounded-lg border border-transparent bg-transparent py-1 text-xs font-medium text-gray-800 transition-colors hover:border-gray-200 focus:bg-white focus:outline-none dark:text-gray-200 dark:hover:border-white/10 dark:focus:bg-[#1a1a24] [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white"
                        >
                          <option
                            value=""
                            className="bg-white text-gray-900 dark:bg-[#161622] dark:text-white"
                          >
                            {record.agent_name ? `${record.agent_name} (Attended)` : 'Unassigned'}
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
      {/* Floating Bulk Action Dock */}
      <AnimatePresence>
        {selectedPhones.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="border-brand-gold/30 bg-brand-navy/95 fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-wrap items-center gap-3 rounded-2xl border px-5 py-3 text-white shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 border-r border-white/10 pr-3">
              <span className="bg-brand-gold text-brand-navy flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                {selectedPhones.size}
              </span>
              <span className="text-xs font-semibold">Leads Selected</span>
            </div>

            {/* Bulk Reassign Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400">Assign:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkReassign(e.target.value);
                }}
                defaultValue=""
                disabled={bulkLoading}
                style={{ colorScheme: 'dark light' }}
                className="rounded-xl border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white focus:outline-none dark:bg-[#1a1a25] [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white"
              >
                <option value="" disabled>
                  Select Advisor...
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Stage Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400">Stage:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkStage(e.target.value);
                }}
                defaultValue=""
                disabled={bulkLoading}
                style={{ colorScheme: 'dark light' }}
                className="rounded-xl border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white focus:outline-none dark:bg-[#1a1a25] [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white"
              >
                <option value="" disabled>
                  Move Stage...
                </option>
                <option value="contacted">Contacted</option>
                <option value="visit_scheduled">Visit Scheduled</option>
                <option value="visited">Site Visited</option>
                <option value="booked">Booked</option>
                <option value="lost">Lost / Dropped</option>
              </select>
            </div>

            {/* Export Selected Dropdown */}
            <div className="relative" ref={dockExportMenuRef}>
              <button
                type="button"
                onClick={() => setDockExportMenuOpen(!dockExportMenuOpen)}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                title="Export selected leads"
              >
                <Download className="text-brand-gold h-3.5 w-3.5" />
                <span>Export ({selectedPhones.size})</span>
                <ChevronDown
                  className={`h-3 w-3 opacity-70 transition-transform ${
                    dockExportMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {dockExportMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 bottom-full z-50 mb-2 w-44 rounded-2xl border border-white/10 bg-[#13131c] p-1.5 shadow-2xl backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleExportExcel();
                        setDockExportMenuOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleExportPdf();
                        setDockExportMenuOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <FileText className="h-3.5 w-3.5 text-red-400" />
                      <span>PDF Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleExportCsv();
                        setDockExportMenuOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-white/10 hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5 text-amber-400" />
                      <span>CSV (.csv)</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Clear Selection */}
            <button
              type="button"
              onClick={() => setSelectedPhones(new Set())}
              className="rounded-lg p-1 text-gray-400 hover:text-white"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Lead Timeline & Notes Drawer */}
      {drawerLead && (
        <LeadDrawer
          isOpen={Boolean(drawerLead)}
          phone={drawerLead.phone}
          clientName={drawerLead.clientName}
          assignedAdvisorId={drawerLead.advisorId}
          assignedAdvisorName={drawerLead.advisorName}
          temperature={drawerLead.temperature}
          employees={employees}
          onClose={() => setDrawerLead(null)}
          onLeadUpdated={() => onFilterChange({})}
        />
      )}

      {/* Export Studio Modal */}
      <ExportLeadsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        token={token}
        employees={employees}
        currentRecords={records}
        totalRecordsCount={totalCount}
        currentFilters={{
          advisor_id: activeAdvisor,
          dial_status: activeDialStatus,
          temperature: activeTemp,
        }}
      />
    </div>
  );
}
