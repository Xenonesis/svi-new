'use client';

import { useState, useMemo } from 'react';
import {
  PhoneCall,
  Flame,
  Clock,
  RotateCcw,
  Sparkles,
  PhoneForwarded,
  Filter,
  Search,
  CheckCircle2,
} from 'lucide-react';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import { WhatsAppTemplateDropdown } from './WhatsAppTemplateDropdown';
import { IvrRecordingButton } from './table/IvrRecordingButton';
import { AiCallSummaryModal } from './AiCallSummaryModal';
import { LeadDrawer } from './LeadDrawer';

export interface SmartRedialQueueProps {
  records: IvrRecordItem[];
  employees: Employee[];
  loading?: boolean;
  token?: string;
  onFilterChange: (filters: {
    advisor_id?: string;
    dial_status?: 'all' | 'ANSWER' | 'NOANSWER';
  }) => void;
  onRefresh?: () => void;
}

export function SmartRedialQueue({
  records,
  employees,
  loading = false,
  token,
  onFilterChange,
  onRefresh,
}: SmartRedialQueueProps) {
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('all');
  const [queueCategory, setQueueCategory] = useState<'all' | 'missed' | 'hot' | 'short_calls'>(
    'missed'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAiModal, setActiveAiModal] = useState<{
    url: string | null;
    phone: string;
    agentName: string;
    id: string;
  } | null>(null);

  const [drawerLead, setDrawerLead] = useState<{
    phone: string;
    clientName?: string;
    advisorId?: string | null;
    advisorName?: string | null;
    temperature?: 'hot' | 'warm' | 'cold';
    recordingUrl?: string | null;
  } | null>(null);

  // Compute Queue Counts
  const counts = useMemo(() => {
    let missed = 0;
    let hot = 0;
    let shortCalls = 0;

    for (const r of records) {
      if (r.dial_status === 'NOANSWER') missed++;
      if (r.temperature === 'hot') hot++;
      if (r.dial_status === 'ANSWER' && r.call_duration > 0 && r.call_duration < 25) shortCalls++;
    }

    return { missed, hot, shortCalls, total: records.length };
  }, [records]);

  // Filter queue records
  const filteredQueue = useMemo(() => {
    return records.filter((r) => {
      // 1. Advisor filter
      if (selectedAdvisor !== 'all' && r.assigned_agent_id !== selectedAdvisor) {
        return false;
      }

      // 2. Queue Category filter
      if (queueCategory === 'missed' && r.dial_status !== 'NOANSWER') return false;
      if (queueCategory === 'hot' && r.temperature !== 'hot') return false;
      if (
        queueCategory === 'short_calls' &&
        (r.dial_status !== 'ANSWER' || r.call_duration <= 0 || r.call_duration >= 25)
      ) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPhone = r.customer_phone?.toLowerCase().includes(q);
        const matchAgent = r.agent_name?.toLowerCase().includes(q);
        if (!matchPhone && !matchAgent) return false;
      }

      return true;
    });
  }, [records, selectedAdvisor, queueCategory, searchQuery]);

  const handleAdvisorSelect = (advId: string) => {
    setSelectedAdvisor(advId);
    onFilterChange({ advisor_id: advId });
  };

  return (
    <div className="space-y-4">
      {/* KPI Command Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Missed / No-Answer Calls (Priority 1) */}
        <button
          type="button"
          onClick={() => setQueueCategory('missed')}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            queueCategory === 'missed'
              ? 'border-rose-500/50 bg-rose-500/10 shadow-lg shadow-rose-950/20'
              : 'border-gray-200 bg-white hover:border-rose-500/30 dark:border-white/10 dark:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              No-Answer Re-Dial
            </span>
            <PhoneForwarded className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {counts.missed}
          </div>
          <span className="mt-1 text-[10px] text-gray-500">Unconnected IVR leads</span>
        </button>

        {/* Hot Leads Follow-up */}
        <button
          type="button"
          onClick={() => setQueueCategory('hot')}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            queueCategory === 'hot'
              ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-950/20'
              : 'border-gray-200 bg-white hover:border-amber-500/30 dark:border-white/10 dark:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Hot Priority Leads
            </span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {counts.hot}
          </div>
          <span className="mt-1 text-[10px] text-gray-500">High intent / Keypad 1</span>
        </button>

        {/* Short Calls (<25s) */}
        <button
          type="button"
          onClick={() => setQueueCategory('short_calls')}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            queueCategory === 'short_calls'
              ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-950/20'
              : 'border-gray-200 bg-white hover:border-blue-500/30 dark:border-white/10 dark:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Short Calls (&lt;25s)
            </span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
            {counts.shortCalls}
          </div>
          <span className="mt-1 text-[10px] text-gray-500">Need pitch follow-up</span>
        </button>

        {/* All Queue Records */}
        <button
          type="button"
          onClick={() => setQueueCategory('all')}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            queueCategory === 'all'
              ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-950/20'
              : 'border-gray-200 bg-white hover:border-purple-500/30 dark:border-white/10 dark:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Entire Queue
            </span>
            <PhoneCall className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            {counts.total}
          </div>
          <span className="mt-1 text-[10px] text-gray-500">Total assigned leads</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Advisor Selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            <Filter className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-semibold">Advisor:</span>
            <select
              value={selectedAdvisor}
              onChange={(e) => handleAdvisorSelect(e.target.value)}
              className="bg-transparent font-medium focus:outline-none dark:text-white"
            >
              <option value="all" className="dark:bg-gray-900">
                All Advisors
              </option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id} className="dark:bg-gray-900">
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search phone or advisor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <RotateCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        )}
      </div>

      {/* Queue Leads List */}
      <div className="space-y-2.5">
        {filteredQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-12 text-center dark:border-white/10">
            <CheckCircle2 className="mb-2 h-10 w-10 text-emerald-500/80" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Queue Clear!</h4>
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              No pending leads matching the current filter. Great job following up!
            </p>
          </div>
        ) : (
          filteredQueue.map((lead) => {
            const isMissed = lead.dial_status === 'NOANSWER';
            const isHot = lead.temperature === 'hot';
            const cleanPhone = (lead.customer_phone || '').replace(/\D/g, '').slice(-10);

            return (
              <div
                key={lead.id}
                className="group relative flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-amber-500/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.02]"
              >
                {/* Left Info: Priority Indicator + Phone + Telecaller */}
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                      isHot
                        ? 'border border-amber-500/40 bg-amber-500/10 text-amber-500'
                        : isMissed
                          ? 'border border-rose-500/40 bg-rose-500/10 text-rose-500'
                          : 'border border-blue-500/40 bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {isHot ? <Flame className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                        +91 {cleanPhone}
                      </span>

                      {/* Status Badges */}
                      {isHot && (
                        <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          🔥 Hot Lead
                        </span>
                      )}
                      {isMissed && (
                        <span className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          Missed Call
                        </span>
                      )}
                      {lead.pressed_key && (
                        <span className="rounded-md border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                          Key {lead.pressed_key}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Advisor:{' '}
                        <strong className="text-gray-700 dark:text-gray-200">
                          {lead.agent_name || 'Unassigned'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="h-3 w-3" />
                        {lead.dial_time
                          ? new Date(lead.dial_time).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '-'}
                      </span>
                      {lead.call_duration > 0 && (
                        <>
                          <span>•</span>
                          <span>Duration: {lead.call_duration}s</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Cluster */}
                <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 sm:border-0 sm:pt-0 dark:border-white/5">
                  {/* Quick Dial Button */}
                  <a
                    href={`tel:+91${cleanPhone}`}
                    title="Direct Call Lead"
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Call Now</span>
                  </a>

                  {/* 1-Click WhatsApp Dropdown */}
                  <WhatsAppTemplateDropdown
                    phone={cleanPhone}
                    advisorName={lead.agent_name || undefined}
                  />

                  {/* Audio Recording Play button if URL exists */}
                  {lead.recording_url && (
                    <IvrRecordingButton
                      recordingUrl={lead.recording_url}
                      variant="icon"
                      meta={{
                        customerPhone: cleanPhone,
                        agentName: lead.agent_name,
                        callRecordId: lead.id,
                      }}
                    />
                  )}

                  {/* 1-Click AI Summary Modal */}
                  {lead.recording_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveAiModal({
                          url: lead.recording_url || null,
                          phone: cleanPhone,
                          agentName: lead.agent_name || 'Telecaller',
                          id: lead.id,
                        })
                      }
                      title="AI Call Summary"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-500 transition-colors hover:bg-amber-500/20"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  )}

                  {/* Open Lead Drawer */}
                  <button
                    type="button"
                    onClick={() =>
                      setDrawerLead({
                        phone: cleanPhone,
                        advisorId: lead.assigned_agent_id,
                        advisorName: lead.agent_name,
                        temperature: lead.temperature,
                        recordingUrl: lead.recording_url,
                      })
                    }
                    className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Summary Modal Popup */}
      {activeAiModal && (
        <AiCallSummaryModal
          isOpen={true}
          onClose={() => setActiveAiModal(null)}
          recordingUrl={activeAiModal.url}
          customerPhone={activeAiModal.phone}
          agentName={activeAiModal.agentName}
          callRecordId={activeAiModal.id}
        />
      )}

      {/* Lead Interaction Drawer */}
      {drawerLead && (
        <LeadDrawer
          isOpen={true}
          onClose={() => setDrawerLead(null)}
          phone={drawerLead.phone}
          clientName={drawerLead.clientName}
          assignedAdvisorId={drawerLead.advisorId}
          assignedAdvisorName={drawerLead.advisorName}
          temperature={drawerLead.temperature}
          recordingUrl={drawerLead.recordingUrl}
          token={token}
          employees={employees}
        />
      )}
    </div>
  );
}
