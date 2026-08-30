'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase/client';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';

import { type WorkforceTab, VALID_TABS, GRID_STYLE } from '@/src/components/admin/workforce/types';
import { useWorkforceData } from '@/src/components/admin/workforce/useWorkforceData';
import { WorkforceHeader } from '@/src/components/admin/workforce/WorkforceHeader';
import { WorkforceKpiGrid } from '@/src/components/admin/workforce/WorkforceKpiGrid';
import { WorkforceTabNav } from '@/src/components/admin/workforce/WorkforceTabNav';
import { WorkforceDirectoryTab } from '@/src/components/admin/workforce/tabs/WorkforceDirectoryTab';
import { WorkforceAttendanceTab } from '@/src/components/admin/workforce/tabs/WorkforceAttendanceTab';
import { WorkforceApprovalsTab } from '@/src/components/admin/workforce/tabs/WorkforceApprovalsTab';
import { WorkforcePayrollTab } from '@/src/components/admin/workforce/tabs/WorkforcePayrollTab';
import { WorkforceReportsTab } from '@/src/components/admin/workforce/tabs/WorkforceReportsTab';
import { WorkforceSettingsTab } from '@/src/components/admin/workforce/tabs/WorkforceSettingsTab';
import { WorkforceModalsContainer } from '@/src/components/admin/workforce/WorkforceModalsContainer';

export type { WorkforceTab };

function WorkforceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStoreToken = useAuthStore((s) => s.token);

  // Authentication state
  const [token, setToken] = useState<string>(authStoreToken || '');
  const [authChecking, setAuthChecking] = useState(!authStoreToken);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  // Active Tab navigation
  const tabParam = searchParams.get('tab') as WorkforceTab | null;
  const [activeTab, setActiveTab] = useState<WorkforceTab>(() => {
    return tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'directory';
  });

  // Keep state in sync if URL search param changes
  useEffect(() => {
    const current = searchParams.get('tab') as WorkforceTab | null;
    if (current && VALID_TABS.includes(current) && current !== activeTab) {
      setActiveTab(current);
    }
  }, [searchParams, activeTab]);

  // Modal / Drawer visibility & targets
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);
  const [performanceTarget, setPerformanceTarget] = useState<Employee | null>(null);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);

  // Payroll sub-tab & drawer state
  const [payrollSubTab, setPayrollSubTab] = useState<'monthly' | 'structures'>('monthly');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);
  const [previewPayslipItem, setPreviewPayslipItem] = useState<PayrollItem | null>(null);

  // Unified Data Hook
  const {
    employees,
    setEmployees,
    loadingEmployees,
    teams,
    salaryStructures,
    pendingLeavesCount,
    pendingRegularizationsCount,
    liveStatuses,
    liveStatusMap,
    fetchEmployees,
    fetchTeams,
    fetchSalaryStructures,
    fetchMetrics,
  } = useWorkforceData(token);

  // Toast Helper
  const showToast = (type: 'success' | 'error', text: string) => {
    if (type === 'success') toast.success(text);
    else toast.error(text);
  };

  // Auth bootstrap
  useEffect(() => {
    if (authStoreToken) {
      setToken(authStoreToken);
      setAuthChecking(false);
      return;
    }
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          setToken(data.session.access_token);
        }
      } catch (err) {
        console.error('Failed to get session:', err);
      } finally {
        setAuthChecking(false);
      }
    };
    initAuth();
  }, [authStoreToken]);

  // Delete Employee Handler
  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    try {
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to delete employee'));
      }
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      showToast('success', 'Employee removed successfully');
    } catch (err: unknown) {
      showToast('error', extractApiErrorMessage(err, 'Failed to delete employee'));
    }
  };

  const handleTabChange = (tabId: WorkforceTab) => {
    setActiveTab(tabId);
    router.replace(`/admin/workforce?tab=${tabId}`, { scroll: false });
  };

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  const punchedInCount = useMemo(() => {
    return liveStatuses.filter((s) => s.status === 'punched_in').length;
  }, [liveStatuses]);

  const pendingApprovalsCount = pendingLeavesCount + pendingRegularizationsCount;

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
      {/* Ambient background styling */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-20"
        style={GRID_STYLE}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8">
        {/* Page Header */}
        <WorkforceHeader
          activeTab={activeTab}
          payrollSubTab={payrollSubTab}
          onAddEmployee={() => setShowAddModal(true)}
          onLogAttendance={() => setIsMarkModalOpen(true)}
          onSetupSalary={() => {
            setEditingStructure(null);
            setIsDrawerOpen(true);
          }}
        />

        {/* Real-time KPI Metric Counters */}
        <WorkforceKpiGrid
          loadingEmployees={loadingEmployees}
          totalEmployees={employees.length}
          punchedInCount={punchedInCount}
          pendingApprovalsCount={pendingApprovalsCount}
          currentMonthName={currentMonthName}
        />

        {/* Primary Luxury Tab Navigation */}
        <WorkforceTabNav
          activeTab={activeTab}
          pendingApprovalsCount={pendingApprovalsCount}
          onTabChange={handleTabChange}
        />

        {/* Active Tab Content Container */}
        <div className="relative rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-[#111118]/90">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

          {activeTab === 'directory' && (
            <WorkforceDirectoryTab
              employees={employees}
              loadingEmployees={loadingEmployees}
              liveStatusMap={liveStatusMap}
              onRefresh={() => {
                fetchEmployees();
                fetchMetrics();
              }}
              onBulkImport={() => setShowBulkImportModal(true)}
              onEditEmployee={(emp) => setEditingEmployee(emp)}
              onDeleteEmployee={handleDeleteEmployee}
              onResetPassword={(emp) => setResetTarget(emp)}
              onViewPerformance={(emp) => setPerformanceTarget(emp)}
            />
          )}

          {activeTab === 'attendance' && token && (
            <WorkforceAttendanceTab token={token} teams={teams} showToast={showToast} />
          )}

          {activeTab === 'approvals' && token && <WorkforceApprovalsTab token={token} />}

          {activeTab === 'payroll' && token && (
            <WorkforcePayrollTab
              token={token}
              payrollSubTab={payrollSubTab}
              onPayrollSubTabChange={setPayrollSubTab}
              structures={salaryStructures}
              employees={employees}
              loadingStructures={loadingEmployees}
              onAddNewStructure={() => {
                setEditingStructure(null);
                setIsDrawerOpen(true);
              }}
              onEditStructure={(struct) => {
                setEditingStructure(struct);
                setIsDrawerOpen(true);
              }}
              onViewPayslip={(item) => setPreviewPayslipItem(item)}
            />
          )}

          {activeTab === 'reports' && token && (
            <WorkforceReportsTab
              token={token}
              teams={teams}
              teamsLoading={false}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && token && (
            <WorkforceSettingsTab
              token={token}
              teams={teams}
              teamsLoading={false}
              onTeamsChange={fetchTeams}
              showToast={showToast}
            />
          )}
        </div>
      </div>

      {/* Workforce Modals Container */}
      <WorkforceModalsContainer
        token={token}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showBulkImportModal={showBulkImportModal}
        setShowBulkImportModal={setShowBulkImportModal}
        editingEmployee={editingEmployee}
        setEditingEmployee={setEditingEmployee}
        resetTarget={resetTarget}
        setResetTarget={setResetTarget}
        performanceTarget={performanceTarget}
        setPerformanceTarget={setPerformanceTarget}
        isMarkModalOpen={isMarkModalOpen}
        setIsMarkModalOpen={setIsMarkModalOpen}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        editingStructure={editingStructure}
        setEditingStructure={setEditingStructure}
        previewPayslipItem={previewPayslipItem}
        setPreviewPayslipItem={setPreviewPayslipItem}
        employees={employees}
        setEmployees={setEmployees}
        teams={teams}
        teamsLoading={false}
        onRefreshEmployees={fetchEmployees}
        onRefreshMetrics={fetchMetrics}
        onRefreshSalaryStructures={fetchSalaryStructures}
        showToast={showToast}
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
