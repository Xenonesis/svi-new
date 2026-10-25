'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ExportLeadsModal } from '@/src/components/admin/leads/ExportLeadsModal';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  exportIvrLeadsToExcel,
  exportIvrLeadsToPdf,
  exportIvrLeadsToCsv,
} from '@/src/lib/leads/exportIvrLeads';
import { LeadDrawer } from './LeadDrawer';
import { IvrAudioPlayerDock } from './IvrAudioPlayerDock';
import { AiCallSummaryModal } from './AiCallSummaryModal';
import type { CallIntelligence } from '@/src/lib/leads/callIntelligence';
import { IvrLeadsFilterToolbar } from './table/IvrLeadsFilterToolbar';
import { IvrLeadMobileCard } from './table/IvrLeadMobileCard';
import { IvrLeadDesktopRow } from './table/IvrLeadDesktopRow';
import { IvrLeadsPagination } from './table/IvrLeadsPagination';
import { IvrBulkActionDock } from './table/IvrBulkActionDock';
import { IvrTableSkeletonRows } from './table/IvrTableSkeletonRows';

export { IvrTableSkeletonRows };

export interface IvrFilterState {
  dial_status: 'all' | 'ANSWER' | 'NOANSWER';
  temperature: 'all' | 'hot' | 'warm' | 'cold' | 'ai';
  advisor_id: string;
  q: string;
  pressed_key?: 'all' | '1' | 'none';
  date?: string;
  duration_filter?: 'all' | 'lt_30' | '30_60' | 'gt_60';
  sort_by?: 'dial_time' | 'call_duration' | 'customer_phone' | 'agent_name';
  sort_order?: 'asc' | 'desc';
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
  const [activeTemp, setActiveTemp] = useState<'all' | 'hot' | 'warm' | 'cold' | 'ai'>('all');
  const [activeAdvisor, setActiveAdvisor] = useState<string>('all');
  const [activePressedKey, setActivePressedKey] = useState<'all' | '1' | 'none'>('all');
  const [activeDurationFilter, setActiveDurationFilter] = useState<
    'all' | 'lt_30' | '30_60' | 'gt_60'
  >('all');
  const [activeDate, setActiveDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'dial_time' | 'call_duration' | 'customer_phone' | 'agent_name'
  >('dial_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [drawerLead, setDrawerLead] = useState<{
    phone: string;
    clientName?: string;
    advisorId?: string | null;
    advisorName?: string | null;
    temperature?: 'hot' | 'warm' | 'cold';
    recordingUrl?: string | null;
  } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [aiSummaryModalRecordId, setAiSummaryModalRecordId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleOpenAiSummary = useCallback((id: string) => {
    setAiSummaryModalRecordId(id);
    setIsAiModalOpen(true);
  }, []);

  const selectedAiRecord = records.find((r) => r.id === aiSummaryModalRecordId) || null;
  const selectedAiRecordingUrl =
    selectedAiRecord?.recording_url ??
    (selectedAiRecord?.raw_payload?.recording_url as string | undefined) ??
    null;
  const selectedAiIntelligence = (selectedAiRecord?.raw_payload?.ai_intelligence ??
    selectedAiRecord?.ai_intelligence) as unknown as CallIntelligence | undefined;
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
        const phonesToRevert = Array.from(selectedPhones);
        setSelectedPhones(new Set());
        onFilterChange({});
        toast.success(`Reassigned ${count} leads to ${advisorName}`, {
          description: 'Changed in Supabase & local cache.',
          action: {
            label: 'Undo',
            onClick: async () => {
              try {
                const revertRes = await fetch('/api/admin/leads/bulk', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({
                    phone_numbers: phonesToRevert,
                    action: 'reassign',
                    advisor_id: null,
                    advisor_name: null,
                  }),
                });
                if (revertRes.ok) {
                  toast.success('Assignment reverted.');
                  onFilterChange({});
                } else {
                  toast.error('Could not revert assignment.');
                }
              } catch {
                toast.error('Revert failed.');
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ q: searchTerm.trim() });
  };

  const handleDialStatusClick = (status: 'all' | 'ANSWER' | 'NOANSWER') => {
    setActiveDialStatus(status);
    onFilterChange({ dial_status: status });
  };
  const handleTempClick = (temp: 'all' | 'hot' | 'warm' | 'cold' | 'ai') => {
    setActiveTemp(temp);
    onFilterChange({ temperature: temp });
  };

  const handleAdvisorChange = (val: string) => {
    setActiveAdvisor(val);
    onFilterChange({ advisor_id: val });
  };

  const handleSortToggle = (
    column: 'dial_time' | 'call_duration' | 'customer_phone' | 'agent_name'
  ) => {
    const nextOrder: 'asc' | 'desc' =
      sortBy === column
        ? sortOrder === 'asc'
          ? 'desc'
          : 'asc'
        : column === 'customer_phone' || column === 'agent_name'
          ? 'asc'
          : 'desc';
    setSortBy(column);
    setSortOrder(nextOrder);
    onFilterChange({ sort_by: column, sort_order: nextOrder });
  };

  const handlePressedKeyChange = (val: 'all' | '1' | 'none') => {
    setActivePressedKey(val);
    onFilterChange({ pressed_key: val });
  };

  const handleDurationFilterChange = (val: 'all' | 'lt_30' | '30_60' | 'gt_60') => {
    setActiveDurationFilter(val);
    onFilterChange({ duration_filter: val });
  };

  const handleDateChange = (val: string) => {
    setActiveDate(val);
    onFilterChange({ date: val });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveDialStatus('all');
    setActiveTemp('all');
    setActiveAdvisor('all');
    setActivePressedKey('all');
    setActiveDurationFilter('all');
    setActiveDate('');
    setSortBy('dial_time');
    setSortOrder('desc');
    onFilterChange({
      q: '',
      dial_status: 'all',
      temperature: 'all',
      advisor_id: 'all',
      pressed_key: 'all',
      duration_filter: 'all',
      date: '',
      sort_by: 'dial_time',
      sort_order: 'desc',
    });
  };

  const hasActiveAdvancedFilters =
    activePressedKey !== 'all' || activeDurationFilter !== 'all' || activeDate !== '';

  return (
    <div className="space-y-4">
      {/* Filter Toolbar Subcomponent */}
      <IvrLeadsFilterToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearchSubmit={handleSearchSubmit}
        employees={employees}
        activeAdvisor={activeAdvisor}
        handleAdvisorChange={handleAdvisorChange}
        activeDialStatus={activeDialStatus}
        handleDialStatusClick={handleDialStatusClick}
        activeTemp={activeTemp}
        handleTempClick={handleTempClick}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        hasActiveAdvancedFilters={hasActiveAdvancedFilters}
        setIsExportModalOpen={setIsExportModalOpen}
        activeDate={activeDate}
        handleDateChange={handleDateChange}
        activePressedKey={activePressedKey}
        handlePressedKeyChange={handlePressedKeyChange}
        activeDuration={activeDurationFilter}
        handleDurationFilterChange={handleDurationFilterChange}
        handleResetFilters={handleResetFilters}
        exportMenuRef={exportMenuRef}
        exportMenuOpen={exportMenuOpen}
        setExportMenuOpen={setExportMenuOpen}
        handleExportExcel={handleExportExcel}
        handleExportPdf={handleExportPdf}
        handleExportCsv={handleExportCsv}
        selectedCount={selectedPhones.size}
        summary={summary}
      />

      {/* Main Table Container: Mobile Cards (<md) + Full Desktop Table (md+) */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-white/8 dark:bg-[#0d0d14]">
        {/* Mobile Lead Cards View (<md) */}
        <div className="block divide-y divide-gray-100 md:hidden dark:divide-white/5">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between pb-3">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10" />
                    <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
                  </div>
                  <div className="h-3 w-48 rounded bg-gray-200/70 dark:bg-white/5" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-6 w-20 rounded bg-gray-200 dark:bg-white/10" />
                    <div className="h-6 w-20 rounded bg-gray-200 dark:bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              No IVR call records found matching current filters.
            </div>
          ) : (
            records.map((record) => (
              <IvrLeadMobileCard
                key={`card-${record.id}`}
                record={record}
                isSelected={selectedPhones.has(record.customer_phone)}
                toggleSelectPhone={toggleSelectPhone}
                setDrawerLead={setDrawerLead}
                onTemperatureChange={onTemperatureChange}
                employees={employees}
                onReassignAdvisor={onReassignAdvisor}
                formatDuration={formatDuration}
                onOpenAiSummary={handleOpenAiSummary}
              />
            ))
          )}
        </div>

        {/* Desktop View Table (Hidden on mobile <md) */}
        <div className="hidden overflow-x-auto md:block">
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
                <th className="px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('customer_phone')}
                    className="flex cursor-pointer items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Customer Contact</span>
                    {sortBy === 'customer_phone' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="text-brand-gold h-3 w-3" />
                      ) : (
                        <ArrowDown className="text-brand-gold h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('agent_name')}
                    className="flex cursor-pointer items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Attended By</span>
                    {sortBy === 'agent_name' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="text-brand-gold h-3 w-3" />
                      ) : (
                        <ArrowDown className="text-brand-gold h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">Follow-up Advisor</th>
                <th className="px-4 py-3.5">Dial Status</th>
                <th className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('call_duration')}
                    className="flex cursor-pointer items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Call Duration</span>
                    {sortBy === 'call_duration' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="text-brand-gold h-3 w-3" />
                      ) : (
                        <ArrowDown className="text-brand-gold h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">Pressed Key</th>
                <th className="px-4 py-3.5">Lead Intent</th>
                <th className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('dial_time')}
                    className="ml-auto flex cursor-pointer items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Dialed At</span>
                    {sortBy === 'dial_time' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="text-brand-gold h-3 w-3" />
                      ) : (
                        <ArrowDown className="text-brand-gold h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
                    )}
                  </button>
                </th>
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
                records.map((record) => (
                  <IvrLeadDesktopRow
                    key={record.id}
                    record={record}
                    isSelected={selectedPhones.has(record.customer_phone)}
                    toggleSelectPhone={toggleSelectPhone}
                    setDrawerLead={setDrawerLead}
                    employees={employees}
                    onReassignAdvisor={onReassignAdvisor}
                    onTemperatureChange={onTemperatureChange}
                    formatDuration={formatDuration}
                    onOpenAiSummary={handleOpenAiSummary}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Subcomponent */}
        <IvrLeadsPagination
          currentCount={records.length}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          loading={loading}
          onPageChange={onPageChange}
        />
      </div>

      {/* Floating Bulk Action Dock Subcomponent */}
      <IvrBulkActionDock
        selectedCount={selectedPhones.size}
        employees={employees}
        bulkLoading={bulkLoading}
        handleBulkReassign={handleBulkReassign}
        handleBulkStage={handleBulkStage}
        dockExportMenuRef={dockExportMenuRef}
        dockExportMenuOpen={dockExportMenuOpen}
        setDockExportMenuOpen={setDockExportMenuOpen}
        handleExportExcel={handleExportExcel}
        handleExportPdf={handleExportPdf}
        handleExportCsv={handleExportCsv}
        onClearSelection={() => setSelectedPhones(new Set())}
      />

      {/* Slide-over Lead Timeline & Notes Drawer */}
      {drawerLead && (
        <LeadDrawer
          phone={drawerLead.phone}
          clientName={drawerLead.clientName}
          assignedAdvisorId={drawerLead.advisorId}
          assignedAdvisorName={drawerLead.advisorName}
          temperature={drawerLead.temperature}
          recordingUrl={drawerLead.recordingUrl}
          employees={employees}
          isOpen={!!drawerLead}
          onClose={() => setDrawerLead(null)}
          onLeadUpdated={() => {
            onFilterChange({});
          }}
          token={token}
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
          dial_status: activeDialStatus !== 'all' ? activeDialStatus : undefined,
          temperature: activeTemp !== 'all' ? activeTemp : undefined,
          advisor_id: activeAdvisor !== 'all' ? activeAdvisor : undefined,
        }}
      />

      {/* AI Call Intelligence Modal */}
      <AiCallSummaryModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setAiSummaryModalRecordId(null);
        }}
        recordingUrl={selectedAiRecordingUrl}
        customerPhone={selectedAiRecord?.customer_phone}
        agentName={selectedAiRecord?.agent_name}
        callRecordId={selectedAiRecord?.id ?? aiSummaryModalRecordId ?? undefined}
        initialIntelligence={selectedAiIntelligence}
      />

      {/* Persistent Floating Audio Player Dock */}
      <IvrAudioPlayerDock />
    </div>
  );
}
