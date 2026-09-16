'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import {
  PhoneCall,
  Bot,
  Users,
  UploadCloud,
  RefreshCw,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { IvrLeadsTable, type IvrFilterState } from '@/src/components/admin/leads/IvrLeadsTable';
import { IvrCsvUploadModal } from '@/src/components/admin/leads/IvrCsvUploadModal';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import { LeaderboardCard } from '@/src/components/admin/leads/LeaderboardCard';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import dynamic from 'next/dynamic';

const WorkforceLeadsTab = dynamic(
  () =>
    import('@/src/components/admin/workforce/tabs/WorkforceLeadsTab').then(
      (m) => m.WorkforceLeadsTab
    ),
  { ssr: false }
);

export default function AdminLeadsPage() {
  const router = useRouter();
  const { token, isAdmin, loading: authLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'ivr' | 'chatbot' | 'all'>('ivr');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // IVR records state
  const [ivrRecords, setIvrRecords] = useState<IvrRecordItem[]>([]);
  const [ivrTotalCount, setIvrTotalCount] = useState(0);
  const [ivrPage, setIvrPage] = useState(1);
  const [ivrLimit] = useState(25);
  const [ivrLoading, setIvrLoading] = useState(false);
  const [ivrFilters, setIvrFilters] = useState<IvrFilterState>({
    dial_status: 'all',
    temperature: 'all',
    advisor_id: 'all',
    q: '',
  });

  const [summary, setSummary] = useState({
    total_calls: 0,
    answered_calls: 0,
    missed_calls: 0,
    hot_count: 0,
    warm_count: 0,
    cold_count: 0,
  });

  // Employees for advisor dropdowns
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, authLoading, router]);

  // Fetch employees
  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/employees', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.employees) {
          setEmployees(data.employees);
        }
      })
      .catch(() => {});
  }, [token]);

  // Fetch IVR records
  const fetchIvrRecords = useCallback(
    async (targetPage = ivrPage, filters = ivrFilters) => {
      if (!token) return;
      setIvrLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(ivrLimit),
          dial_status: filters.dial_status,
          temperature: filters.temperature,
          advisor_id: filters.advisor_id,
        });
        if (filters.q) params.set('q', filters.q);

        const res = await fetch(`/api/admin/leads/ivr-records?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (res.ok) {
          setIvrRecords(json.records || []);
          setIvrTotalCount(json.total_count || 0);
          if (json.summary) {
            setSummary(json.summary);
          }
        } else {
          toast.error(json.message || 'Failed to fetch IVR records');
        }
      } catch (err: unknown) {
        console.error('Fetch IVR records error:', err);
      } finally {
        setIvrLoading(false);
      }
    },
    [token, ivrPage, ivrLimit, ivrFilters]
  );

  useEffect(() => {
    if (activeTab === 'ivr') {
      fetchIvrRecords(ivrPage, ivrFilters);
    }
  }, [activeTab, ivrPage, ivrFilters, fetchIvrRecords]);

  const handleFilterChange = (newFilters: Partial<IvrFilterState>) => {
    const updated = { ...ivrFilters, ...newFilters };
    setIvrFilters(updated);
    setIvrPage(1);
  };

  const handleTemperatureChange = async (
    recordId: string,
    phone: string,
    temp: 'hot' | 'warm' | 'cold'
  ) => {
    // Optimistic update
    setIvrRecords((prev) => prev.map((r) => (r.id === recordId ? { ...r, temperature: temp } : r)));

    try {
      const res = await fetch('/api/admin/leads/ivr-records', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: recordId,
          customer_phone: phone,
          temperature: temp,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update lead temperature');
      }
      toast.success(`Temperature updated to ${temp.toUpperCase()}`);
    } catch {
      toast.error('Could not save temperature update');
      fetchIvrRecords(ivrPage, ivrFilters);
    }
  };

  const handleReassignAdvisor = async (recordId: string, phone: string, advisorId: string) => {
    const matchedEmployee = employees.find((e) => e.id === advisorId);
    const newName = matchedEmployee?.full_name || 'Unassigned';

    // Optimistic update
    setIvrRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              assigned_agent_id: advisorId || null,
              agent_name: newName,
              assigned_agent: matchedEmployee ? { id: advisorId, full_name: newName } : null,
            }
          : r
      )
    );

    try {
      const res = await fetch('/api/admin/leads/ivr-records', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: recordId,
          customer_phone: phone,
          assigned_agent_id: advisorId || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reassign advisor');
      }
      toast.success(`Advisor reassigned to ${newName}`);
    } catch {
      toast.error('Could not save advisor reassignment');
      fetchIvrRecords(ivrPage, ivrFilters);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="text-brand-gold h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase">
              Sales Command Center
            </span>
          </div>
          <h1 className="text-brand-navy mt-1 font-serif text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
            Leads Hub
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Multi-channel lead intelligence, IVR dialer campaign imports, and automated triage
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchIvrRecords(ivrPage, ivrFilters)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${ivrLoading ? 'text-brand-gold animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase shadow-md transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload IVR CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Calls */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-white/5 dark:bg-[#0f0f16]">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold tracking-wider uppercase">Total Calls</span>
            <Clock className="text-brand-gold h-4 w-4" />
          </div>
          <div className="text-brand-navy mt-2 text-2xl font-bold dark:text-white">
            {summary.total_calls.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400">All campaign logs</span>
        </div>

        {/* Answered */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors duration-300">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[10px] font-bold tracking-wider uppercase">Answered</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {summary.answered_calls.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
            {summary.total_calls > 0
              ? `${Math.round((summary.answered_calls / summary.total_calls) * 100)}% connection rate`
              : 'Connected calls'}
          </span>
        </div>

        {/* Not Answered */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 transition-colors duration-300">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-[10px] font-bold tracking-wider uppercase">Not Answered</span>
            <XCircle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-300">
            {summary.missed_calls.toLocaleString()}
          </div>
          <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">
            Missed / Unanswered
          </span>
        </div>

        {/* Hot Leads */}
        <div className="border-brand-gold/30 bg-brand-gold/10 rounded-2xl border p-4 transition-colors duration-300">
          <div className="text-brand-gold flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase">Hot Intent</span>
            <Flame className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-brand-navy mt-2 text-2xl font-bold dark:text-white">
            {summary.hot_count.toLocaleString()}
          </div>
          <span className="text-brand-gold-dark dark:text-brand-gold-light text-[10px]">
            $\ge 60$s talk or Key 1 pressed
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-white/5">
        <button
          type="button"
          onClick={() => setActiveTab('ivr')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'ivr'
              ? 'bg-brand-navy dark:text-brand-navy text-white shadow-md dark:bg-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
          }`}
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span>IVR Campaign Leads</span>
          <span className="bg-brand-gold/20 py-0.2 text-brand-gold rounded-full px-1.5 text-[10px] font-bold">
            {ivrTotalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chatbot')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'chatbot'
              ? 'bg-brand-navy dark:text-brand-navy text-white shadow-md dark:bg-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
          }`}
        >
          <Bot className="h-3.5 w-3.5" />
          <span>AI Chatbot Leads</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-brand-navy dark:text-brand-navy text-white shadow-md dark:bg-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>All Consolidated Pipeline</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'ivr' && (
        <div className="space-y-4">
          <LeaderboardCard
            totalCalls={summary?.total_calls || ivrTotalCount}
            answeredCalls={summary?.answered_calls || 0}
            hotLeads={summary?.hot_count || 0}
          />
          <IvrLeadsTable
            records={ivrRecords}
            totalCount={ivrTotalCount}
            page={ivrPage}
            limit={ivrLimit}
            loading={ivrLoading}
            onPageChange={(p) => setIvrPage(p)}
            onFilterChange={handleFilterChange}
            onTemperatureChange={handleTemperatureChange}
            onReassignAdvisor={handleReassignAdvisor}
            employees={employees}
            summary={summary}
            token={token || undefined}
          />
        </div>
      )}

      {activeTab === 'chatbot' && token && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-white/5 dark:bg-[#0f0f16]">
          <WorkforceLeadsTab token={token} employees={employees} />
        </div>
      )}

      {activeTab === 'all' && token && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-white/5 dark:bg-[#0f0f16]">
          <WorkforceLeadsTab token={token} employees={employees} />
        </div>
      )}

      {/* CSV Upload Modal */}
      {token && (
        <IvrCsvUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            fetchIvrRecords(1, ivrFilters);
          }}
          token={token}
        />
      )}
    </div>
  );
}
