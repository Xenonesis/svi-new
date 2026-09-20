'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';
import type { WorkforceTab, WorkforceTeam } from '@/src/components/admin/workforce/types';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';
import type { UseWorkforceDataReturn } from '@/src/components/admin/workforce/useWorkforceData';
import type { UseWorkforcePageModalsReturn } from './useWorkforcePageModals';

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

export interface WorkforceTabContentProps {
  activeTab: WorkforceTab;
  token: string;
  // Bundled data & modals options
  data?: UseWorkforceDataReturn;
  modals?: UseWorkforcePageModalsReturn;
  // Individual / explicit props
  employees?: Employee[];
  loadingEmployees?: boolean;
  liveStatusMap?: Map<string, EmployeeLiveStatus>;
  teams?: WorkforceTeam[];
  salaryStructures?: SalaryStructure[];
  payrollSubTab?: 'monthly' | 'structures';
  onPayrollSubTabChange?: (tab: 'monthly' | 'structures') => void;
  onRefreshEmployees?: () => void;
  onRefreshMetrics?: () => void;
  onRefreshTeams?: () => void;
  onBulkImport?: () => void;
  onEditEmployee?: (emp: Employee) => void;
  onDeleteEmployee?: (id: string) => void;
  onResetPassword?: (emp: Employee) => void;
  onViewPerformance?: (emp: Employee) => void;
  onToggleActiveEmployee?: (emp: Employee) => void;
  onAddNewStructure?: () => void;
  onEditStructure?: (struct: SalaryStructure) => void;
  onViewPayslip?: (item: PayrollItem) => void;
  showToast?: (type: 'success' | 'error', text: string) => void;
}

export function WorkforceTabContent(props: WorkforceTabContentProps) {
  const { activeTab, token } = props;

  const employees = props.data?.employees ?? props.employees ?? [];
  const loadingEmployees = props.data?.loadingEmployees ?? props.loadingEmployees ?? false;
  const liveStatusMap =
    props.data?.liveStatusMap ?? props.liveStatusMap ?? new Map<string, EmployeeLiveStatus>();
  const teams = props.data?.teams ?? props.teams ?? [];
  const salaryStructures = props.data?.salaryStructures ?? props.salaryStructures ?? [];
  const payrollSubTab = props.modals?.payrollSubTab ?? props.payrollSubTab ?? 'monthly';
  const onPayrollSubTabChange =
    props.modals?.setPayrollSubTab ?? props.onPayrollSubTabChange ?? (() => {});

  const handleRefreshDirectory = () => {
    props.data?.fetchEmployees();
    props.data?.fetchMetrics();
    props.onRefreshEmployees?.();
    props.onRefreshMetrics?.();
  };

  const handleBulkImport = () => {
    if (props.modals) {
      props.modals.setShowBulkImportModal(true);
    } else {
      props.onBulkImport?.();
    }
  };

  const handleEditEmployee = (emp: Employee) => {
    if (props.modals) {
      props.modals.setEditingEmployee(emp);
    } else {
      props.onEditEmployee?.(emp);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      if (props.modals) {
        props.modals.setEmployeeToDelete(emp);
      } else {
        props.onDeleteEmployee?.(id);
      }
    }
  };

  const handleResetPassword = (emp: Employee) => {
    if (props.modals) {
      props.modals.setResetTarget(emp);
    } else {
      props.onResetPassword?.(emp);
    }
  };

  const handleViewPerformance = (emp: Employee) => {
    if (props.modals) {
      props.modals.setPerformanceTarget(emp);
    } else {
      props.onViewPerformance?.(emp);
    }
  };

  const handleToggleActiveEmployee = (emp: Employee) => {
    if (props.modals) {
      props.modals.setToggleActiveTarget(emp);
    } else {
      props.onToggleActiveEmployee?.(emp);
    }
  };

  const handleAddNewStructure = () => {
    if (props.modals) {
      props.modals.setEditingStructure(null);
      props.modals.setIsDrawerOpen(true);
    } else {
      props.onAddNewStructure?.();
    }
  };

  const handleEditStructure = (struct: SalaryStructure) => {
    if (props.modals) {
      props.modals.setEditingStructure(struct);
      props.modals.setIsDrawerOpen(true);
    } else {
      props.onEditStructure?.(struct);
    }
  };

  const handleViewPayslip = (item: PayrollItem) => {
    if (props.modals) {
      props.modals.setPreviewPayslipItem(item);
    } else {
      props.onViewPayslip?.(item);
    }
  };

  const handleTeamsChange = () => {
    props.data?.fetchTeams();
    props.onRefreshTeams?.();
  };

  const showToast = props.modals?.showToast ?? props.showToast ?? (() => {});

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-[#111118]/90">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

      {activeTab === 'directory' && (
        <WorkforceDirectoryTab
          employees={employees}
          loadingEmployees={loadingEmployees}
          liveStatusMap={liveStatusMap}
          onRefresh={handleRefreshDirectory}
          onBulkImport={handleBulkImport}
          onEditEmployee={handleEditEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onResetPassword={handleResetPassword}
          onViewPerformance={handleViewPerformance}
          onToggleActiveEmployee={handleToggleActiveEmployee}
        />
      )}

      {activeTab === 'leads' && token && <WorkforceLeadsTab token={token} employees={employees} />}

      {activeTab === 'attendance' && token && (
        <WorkforceAttendanceTab token={token} teams={teams} showToast={showToast} />
      )}

      {activeTab === 'approvals' && token && <WorkforceApprovalsTab token={token} />}

      {activeTab === 'payroll' && token && (
        <WorkforcePayrollTab
          token={token}
          payrollSubTab={payrollSubTab}
          onPayrollSubTabChange={onPayrollSubTabChange}
          structures={salaryStructures}
          employees={employees}
          loadingStructures={loadingEmployees}
          onAddNewStructure={handleAddNewStructure}
          onEditStructure={handleEditStructure}
          onViewPayslip={handleViewPayslip}
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
          onTeamsChange={handleTeamsChange}
          showToast={showToast}
        />
      )}
    </div>
  );
}
