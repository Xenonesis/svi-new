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
import dynamic from 'next/dynamic';
import { WorkforceTabNav } from '@/src/components/admin/workforce/WorkforceTabNav';

const TabLoadingFallback = () => (
  <div className="flex min-h-[300px] items-center justify-center">
    <RefreshCw className="text-brand-gold h-6 w-6 animate-spin" />
  </div>
);

const WorkforceDirectoryTab = dynamic(
  () =>
    import('@/src/components/admin/workforce/tabs/WorkforceDirectoryTab').then(
      (m) => m.WorkforceDirectoryTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);
const WorkforceAttendanceTab = dynamic(
  () =>
    import('@/src/components/admin/workforce/tabs/WorkforceAttendanceTab').then(
      (m) => m.WorkforceAttendanceTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);
const WorkforceApprovalsTab = dynamic(
  () =>
    import('@/src/components/admin/workforce/tabs/WorkforceApprovalsTab').then(
      (m) => m.WorkforceApprovalsTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);
const WorkforcePayrollTab = dynamic(
  () =>
    import('@/src/components/admin/workforce/tabs/WorkforcePayrollTab').then(
      (m) => m.WorkforcePayrollTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);
const WorkforceLeadsTab = dynamic(
  () =>
    import('@/src/components/admin/workforce/tabs/WorkforceLeadsTab').then(
      (m) => m.WorkforceLeadsTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);
const WorkforceReportsTab = dynamic(
  () =>
    import('@/src/components/admin/workforce/tabs/WorkforceReportsTab').then(
      (m) => m.WorkforceReportsTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);
const WorkforceSettingsTab = dynamic(
  () =>
    import('@/src/components/admin/workforce/tabs/WorkforceSettingsTab').then(
      (m) => m.WorkforceSettingsTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);
import { WorkforceModalsContainer } from '@/src/components/admin/workforce/WorkforceModalsContainer';
import { DeleteConfirm } from '@/src/components/admin/modals/DeleteConfirm';

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

  // UI Confirmation Modal targets
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState(false);
  const [toggleActiveTarget, setToggleActiveTarget] = useState<Employee | null>(null);
  const [togglingActive, setTogglingActive] = useState(false);

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

  // Deep link support: auto-open performance/leads modal when employee query param is present
  useEffect(() => {
    const employeeParam = searchParams.get('employee');
    if (employeeParam && employees.length > 0 && !performanceTarget) {
      const target = employees.find((e) => e.id === employeeParam);
      if (target) {
        setPerformanceTarget(target);
      }
    }
  }, [searchParams, employees, performanceTarget]);

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

  // Delete Employee Handler (triggered from UI modal)
  const handleConfirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      setDeletingEmployee(true);
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/admin/employees/${employeeToDelete.id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to delete employee'));
      }
      setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
      showToast('success', 'Employee removed successfully');
      setEmployeeToDelete(null);
    } catch (err: unknown) {
      showToast('error', extractApiErrorMessage(err, 'Failed to delete employee'));
    } finally {
      setDeletingEmployee(false);
    }
  };

  // Toggle Employee Enable / Disable (triggered from UI modal)
  const handleConfirmToggleActive = async () => {
    if (!toggleActiveTarget) return;
    const currentActive = toggleActiveTarget.is_active ?? true;
    const nextStatus = !currentActive;
    const actionLabel = nextStatus ? 'enabled' : 'disabled';

    try {
      setTogglingActive(true);
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/admin/employees/${toggleActiveTarget.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          extractApiErrorMessage(data, `Failed to ${nextStatus ? 'enable' : 'disable'} employee`)
        );
      }

      setEmployees((prev) =>
        prev.map((e) => (e.id === toggleActiveTarget.id ? { ...e, is_active: nextStatus } : e))
      );
      showToast('success', `${toggleActiveTarget.full_name} has been ${actionLabel}`);
      setToggleActiveTarget(null);
    } catch (err: unknown) {
      showToast(
        'error',
        extractApiErrorMessage(err, `Failed to ${nextStatus ? 'enable' : 'disable'} employee`)
      );
    } finally {
      setTogglingActive(false);
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
              onDeleteEmployee={(id) => {
                const emp = employees.find((e) => e.id === id);
                if (emp) setEmployeeToDelete(emp);
              }}
              onResetPassword={(emp) => setResetTarget(emp)}
              onViewPerformance={(emp) => setPerformanceTarget(emp)}
              onToggleActiveEmployee={(emp) => setToggleActiveTarget(emp)}
            />
          )}

          {activeTab === 'leads' && token && (
            <WorkforceLeadsTab token={token} employees={employees} />
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
        initialPerformanceTab={searchParams.get('tab') === 'leads' ? 'leads' : 'kpi'}
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

      {/* UI Confirmation: Delete Employee Modal */}
      {employeeToDelete && (
        <DeleteConfirm
          title="Remove Employee?"
          itemName={employeeToDelete.full_name}
          itemType="employee"
          description={`Are you sure you want to remove ${employeeToDelete.full_name}? They will lose access to the workforce portal.`}
          confirmLabel="Remove"
          loading={deletingEmployee}
          onConfirm={handleConfirmDeleteEmployee}
          onClose={() => setEmployeeToDelete(null)}
        />
      )}

      {/* UI Confirmation: Toggle Active Status Modal */}
      {toggleActiveTarget && (
        <DeleteConfirm
          title={
            toggleActiveTarget.is_active ? 'Disable Employee Account?' : 'Enable Employee Account?'
          }
          itemName={toggleActiveTarget.full_name}
          itemType="employee"
          description={`Are you sure you want to ${toggleActiveTarget.is_active ? 'disable' : 'enable'} ${toggleActiveTarget.full_name}'s account?`}
          confirmLabel={toggleActiveTarget.is_active ? 'Disable' : 'Enable'}
          loading={togglingActive}
          onConfirm={handleConfirmToggleActive}
          onClose={() => setToggleActiveTarget(null)}
        />
      )}
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
