'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import { RefreshCw, UploadCloud } from 'lucide-react';
import { IvrLeadsTable } from '@/src/components/admin/leads/IvrLeadsTable';
import { IvrCsvUploadModal } from '@/src/components/admin/leads/IvrCsvUploadModal';
import { TelecallingDashboard } from '@/src/components/admin/leads/TelecallingDashboard';
import { useIvrLeadsManagement } from '@/src/components/admin/leads/useIvrLeadsManagement';
import { IvrStatsKpiGrid } from '@/src/components/admin/leads/IvrStatsKpiGrid';
import { AdvisorLeaderboardGrid } from '@/src/components/admin/leads/AdvisorLeaderboardGrid';
import { LeadsTabNav } from '@/src/components/admin/leads/LeadsTabNav';
import type { LeadsTabType } from '@/src/components/admin/leads/LeadsTabNav';
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

  const [activeTab, setActiveTab] = useState<LeadsTabType>('ivr');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Detect ?tab= in URL on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (
        tabParam === 'dashboard' ||
        tabParam === 'ivr' ||
        tabParam === 'chatbot' ||
        tabParam === 'all'
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, authLoading, router]);

  const {
    ivrRecords,
    ivrTotalCount,
    ivrPage,
    setIvrPage,
    ivrLimit,
    ivrLoading,
    ivrFilters,
    setIvrFilters,
    summary,
    employees,
    fetchIvrRecords,
    handleFilterChange,
    handleTemperatureChange,
    handleReassignAdvisor,
  } = useIvrLeadsManagement(token, activeTab);

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
      <IvrStatsKpiGrid summary={summary} />

      {/* Main Tabs Navigation */}
      <LeadsTabNav activeTab={activeTab} onTabChange={setActiveTab} ivrTotalCount={ivrTotalCount} />

      {/* Tab Panels */}
      {activeTab === 'dashboard' && (
        <TelecallingDashboard
          token={token || undefined}
          onNavigateToLeads={(advisorId) => {
            if (advisorId) {
              setIvrFilters((prev) => ({ ...prev, advisor_id: advisorId }));
              fetchIvrRecords(1, { ...ivrFilters, advisor_id: advisorId });
            }
            setActiveTab('ivr');
          }}
        />
      )}

      {activeTab === 'ivr' && (
        <div className="space-y-4">
          <AdvisorLeaderboardGrid
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
