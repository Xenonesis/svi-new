'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase/client';
import { type WorkforceTab, VALID_TABS, GRID_STYLE } from '@/src/components/admin/workforce/types';
import { useWorkforceData } from '@/src/components/admin/workforce/useWorkforceData';
import { WorkforceHeader } from '@/src/components/admin/workforce/WorkforceHeader';
import { WorkforceKpiGrid } from '@/src/components/admin/workforce/WorkforceKpiGrid';
import { WorkforceTabNav } from '@/src/components/admin/workforce/WorkforceTabNav';
import { WorkforceTabContent } from '@/src/components/admin/workforce/WorkforceTabContent';
import { WorkforceModalsContainer } from '@/src/components/admin/workforce/WorkforceModalsContainer';
import { useWorkforcePageModals } from '@/src/components/admin/workforce/useWorkforcePageModals';

export type { WorkforceTab };

function WorkforceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStoreToken = useAuthStore((s) => s.token);

  const [token, setToken] = useState(authStoreToken || '');
  const [authChecking, setAuthChecking] = useState(!authStoreToken);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const tabParam = searchParams.get('tab') as WorkforceTab | null;
  const [activeTab, setActiveTab] = useState<WorkforceTab>(() =>
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'directory'
  );

  useEffect(() => {
    const current = searchParams.get('tab') as WorkforceTab | null;
    if (current && VALID_TABS.includes(current) && current !== activeTab) setActiveTab(current);
  }, [searchParams, activeTab]);

  const data = useWorkforceData(token);
  const modals = useWorkforcePageModals(tokenRef, data.setEmployees);

  useEffect(() => {
    const employeeParam = searchParams.get('employee');
    if (employeeParam && data.employees.length > 0 && !modals.performanceTarget) {
      const target = data.employees.find((e) => e.id === employeeParam);
      if (target) modals.setPerformanceTarget(target);
    }
  }, [searchParams, data.employees, modals.performanceTarget, modals.setPerformanceTarget]);

  useEffect(() => {
    if (authStoreToken) {
      setToken(authStoreToken);
      setAuthChecking(false);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data: sess }) => {
        if (sess.session?.access_token) setToken(sess.session.access_token);
        setAuthChecking(false);
      })
      .catch(() => setAuthChecking(false));
  }, [authStoreToken]);

  const handleTabChange = (tabId: WorkforceTab) => {
    setActiveTab(tabId);
    router.replace(`/admin/workforce?tab=${tabId}`, { scroll: false });
  };

  const currentMonthName = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    []
  );
  const punchedInCount = useMemo(
    () => data.liveStatuses.filter((s) => s.status === 'punched_in').length,
    [data.liveStatuses]
  );
  const pendingApprovalsCount = data.pendingLeavesCount + data.pendingRegularizationsCount;

  if (authChecking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="text-brand-gold h-8 w-8 animate-spin" />
        <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full font-sans">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-20"
        style={GRID_STYLE}
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8">
        <WorkforceHeader
          activeTab={activeTab}
          payrollSubTab={modals.payrollSubTab}
          onAddEmployee={() => modals.setShowAddModal(true)}
          onLogAttendance={() => modals.setIsMarkModalOpen(true)}
          onSetupSalary={() => {
            modals.setEditingStructure(null);
            modals.setIsDrawerOpen(true);
          }}
        />

        <WorkforceKpiGrid
          loadingEmployees={data.loadingEmployees}
          totalEmployees={data.employees.length}
          punchedInCount={punchedInCount}
          pendingApprovalsCount={pendingApprovalsCount}
          currentMonthName={currentMonthName}
        />

        <WorkforceTabNav
          activeTab={activeTab}
          pendingApprovalsCount={pendingApprovalsCount}
          onTabChange={handleTabChange}
        />

        <WorkforceTabContent activeTab={activeTab} token={token} data={data} modals={modals} />
      </div>

      <WorkforceModalsContainer
        token={token}
        modals={modals}
        data={data}
        initialPerformanceTab={searchParams.get('tab') === 'leads' ? 'leads' : 'kpi'}
      />
    </div>
  );
}

export default function WorkforcePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <RefreshCw className="text-brand-gold h-8 w-8 animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Loading Workforce &amp; HR Hub...
          </p>
        </div>
      }
    >
      <WorkforceContent />
    </Suspense>
  );
}
