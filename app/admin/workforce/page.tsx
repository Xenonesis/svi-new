'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Banknote,
  BarChart3,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase/client';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import DynamicSkeleton from '@/src/components/ui/DynamicSkeleton';

// Employee Directory
import { EmployeeCard, type Employee } from '@/src/components/admin/employees/EmployeeCard';
import { AddEmployeeModal } from '@/src/components/admin/modals/AddEmployeeModal';
import { ResetPasswordModal } from '@/src/components/admin/employees/ResetPasswordModal';
import { EmployeePerformanceModal } from '@/src/components/admin/employees/EmployeePerformanceModal';

// Attendance & Approvals
import AttendanceDashboard from '@/src/components/admin/attendance/AttendanceDashboard';
import LiveStatus from '@/src/components/admin/attendance/LiveStatus';
import MasterTimesheet from '@/src/components/admin/attendance/MasterTimesheet';
import MarkAttendance from '@/src/components/admin/attendance/MarkAttendance';
import AttendanceReport from '@/src/components/admin/attendance/AttendanceReport';
import LeaveAndRegularizationCenter from '@/src/components/admin/attendance/LeaveAndRegularizationCenter';
import TeamsManager from '@/src/components/admin/attendance/TeamsManager';
import LocationManager from '@/src/components/admin/attendance/LocationManager';
import AttendanceSettings from '@/src/components/admin/attendance/AttendanceSettings';
import type { Team } from '@/src/lib/supabase/types';

// Payroll
import { MonthlyPayrollRunView } from '@/src/components/admin/payroll/MonthlyPayrollRunView';
import { SalaryStructuresTable } from '@/src/components/admin/payroll/SalaryStructuresTable';
import { EmployeeSalarySetupDrawer } from '@/src/components/admin/payroll/EmployeeSalarySetupDrawer';
import { PayslipDocument } from '@/src/components/admin/payroll/PayslipDocument';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';

export type WorkforceTab =
  'directory' | 'attendance' | 'approvals' | 'payroll' | 'reports' | 'settings';

interface TabItem {
  id: WorkforceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
}

const TABS: TabItem[] = [
  { id: 'directory', label: 'Directory', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: true },
  { id: 'payroll', label: 'Payroll & Salary', icon: Banknote },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Policy & Settings', icon: Sliders },
];

const VALID_TABS: WorkforceTab[] = [
  'directory',
  'attendance',
  'approvals',
  'payroll',
  'reports',
  'settings',
];

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

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

  // Attendance sub-view & modal
  const [attendanceView, setAttendanceView] = useState<'radar' | 'timesheet'>('radar');
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);

  // Handle URL action (e.g. ?action=mark)
  useEffect(() => {
    if (searchParams.get('action') === 'mark') {
      setActiveTab('attendance');
      setIsMarkModalOpen(true);
    }
  }, [searchParams]);

  // Payroll sub-view & drawer
  const [payrollSubTab, setPayrollSubTab] = useState<'monthly' | 'structures'>('monthly');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);
  const [previewPayslipItem, setPreviewPayslipItem] = useState<PayrollItem | null>(null);

  // Directory state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);
  const [performanceTarget, setPerformanceTarget] = useState<Employee | null>(null);

  // Attendance & Teams state
  const [teams, setTeams] = useState<(Team & { member_count: number })[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [punchedInCount, setPunchedInCount] = useState<number | null>(null);

  // Payroll structures state
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loadingStructures, setLoadingStructures] = useState(true);

  // Shared toast helper
  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  }, []);

  // Admin Auth Verification
  useEffect(() => {
    const controller = new AbortController();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (controller.signal.aborted) return;
      if (!user) {
        router.replace('/admin');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (controller.signal.aborted) return;
      if (profile?.role !== 'admin') {
        router.replace('/admin');
        return;
      }

      tokenRef.current = session.access_token;
      setToken(session.access_token);
      setAuthChecking(false);
    });
    return () => controller.abort();
  }, [router]);

  // Fetch Employees Directory
  const fetchEmployees = useCallback(async () => {
    const activeToken = tokenRef.current;
    if (!activeToken) return;
    setLoadingEmployees(true);
    try {
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to fetch employees'));
      }
      setEmployees(data.employees || []);
    } catch (err: unknown) {
      showToast('error', extractApiErrorMessage(err, 'Error loading employee directory'));
    } finally {
      setLoadingEmployees(false);
    }
  }, [showToast]);

  // Fetch Teams
  const fetchTeams = useCallback(async () => {
    const activeToken = tokenRef.current;
    if (!activeToken) return;
    setTeamsLoading(true);
    try {
      const res = await fetch('/api/admin/attendance/teams', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setTeams(json.teams || []);
      }
    } catch {
      // silent fallback
    } finally {
      setTeamsLoading(false);
    }
  }, []);

  // Fetch Salary Structures
  const fetchSalaryStructures = useCallback(async () => {
    const activeToken = tokenRef.current;
    if (!activeToken) return;
    setLoadingStructures(true);
    try {
      const res = await fetch('/api/admin/payroll/salary-structures', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.structures) {
        setStructures(data.structures);
      }
    } catch {
      // silent fallback
    } finally {
      setLoadingStructures(false);
    }
  }, []);

  // Fetch Live Status count & Pending Approvals
  const fetchMetrics = useCallback(async () => {
    const activeToken = tokenRef.current;
    if (!activeToken) return;

    try {
      const [leavesRes, regsRes, liveRes] = await Promise.all([
        fetch('/api/admin/attendance/leaves?status=pending', {
          headers: { Authorization: `Bearer ${activeToken}` },
        })
          .then((r) => r.json())
          .catch(() => ({ stats: { pending: 0 } })),
        fetch('/api/admin/attendance/regularizations?status=pending', {
          headers: { Authorization: `Bearer ${activeToken}` },
        })
          .then((r) => r.json())
          .catch(() => ({ stats: { pending: 0 } })),
        fetch('/api/admin/attendance/live', {
          headers: { Authorization: `Bearer ${activeToken}` },
        })
          .then((r) => r.json())
          .catch(() => ({ statuses: [] })),
      ]);

      const pendingTotal = (leavesRes.stats?.pending || 0) + (regsRes.stats?.pending || 0);
      setPendingApprovalsCount(pendingTotal);

      if (Array.isArray(liveRes.statuses)) {
        const punchedIn = liveRes.statuses.filter(
          (s: { status: string }) => s.status === 'punched_in'
        ).length;
        setPunchedInCount(punchedIn);
      }
    } catch {
      // ignore
    }
  }, []);

  // Initial Load once token is ready
  useEffect(() => {
    if (token) {
      fetchEmployees();
      fetchTeams();
      fetchSalaryStructures();
      fetchMetrics();
    }
  }, [token, fetchEmployees, fetchTeams, fetchSalaryStructures, fetchMetrics]);

  // Tab Switch Handler
  const handleTabChange = (tabId: WorkforceTab) => {
    setActiveTab(tabId);
    router.replace(`/admin/workforce?tab=${tabId}`, { scroll: false });
  };

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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to delete employee'));
      }
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      showToast('success', 'Employee removed successfully');
    } catch (err: unknown) {
      showToast('error', extractApiErrorMessage(err, 'Failed to delete employee'));
    }
  };

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.phone && e.phone.toLowerCase().includes(q))
    );
  }, [employees, employeeSearch]);

  // Format current month for payroll cycle KPI
  const currentMonthName = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  if (authChecking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="text-brand-gold h-8 w-8 animate-spin" />
        <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full font-sans">
      {/* Background ambient lighting effects matching SVI luxury aesthetic */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[480px] w-[480px] rounded-full blur-[130px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full blur-[110px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold tracking-widest uppercase">
              <Sparkles className="h-3 w-3" />
              SVI Workforce Console
            </div>
            <h1 className="text-brand-navy mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
              Workforce &amp; HR{' '}
              <span
                className="text-gradient-gold animate-bg-pan inline-block pr-2.5 italic"
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage:
                    'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
                }}
              >
                Management
              </span>
            </h1>
            <p className="mt-1 text-xs tracking-wide text-gray-600 sm:text-sm dark:text-gray-400">
              Consolidated personnel operations: Staff directory, live attendance radar, leave
              approvals, and automated payroll runs.
            </p>
          </div>

          {/* Contextual Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'directory' && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wider uppercase shadow-lg transition-all"
              >
                <Plus size={16} /> Add Employee
              </button>
            )}
            {activeTab === 'attendance' && (
              <button
                type="button"
                onClick={() => setIsMarkModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-400 hover:to-emerald-500"
              >
                <CalendarCheck className="h-4 w-4" />
                Log Attendance
              </button>
            )}
            {activeTab === 'payroll' && payrollSubTab === 'structures' && (
              <button
                type="button"
                onClick={() => {
                  setEditingStructure(null);
                  setIsDrawerOpen(true);
                }}
                className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wider uppercase shadow-lg transition-all"
              >
                <Plus size={16} /> Setup Salary Structure
              </button>
            )}
          </div>
        </div>

        {/* Real-time KPI Metric Counters */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Card 1: Total Personnel */}
          <div className="hover:border-brand-gold/40 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all dark:border-white/10 dark:bg-[#111118]/80">
            <div className="via-brand-gold/30 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Total Personnel
              </span>
              <div className="bg-brand-gold/10 text-brand-gold rounded-xl p-2.5">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-brand-navy font-serif text-2xl font-bold sm:text-3xl dark:text-white">
                {loadingEmployees ? '—' : employees.length}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active staff on records
              </p>
            </div>
          </div>

          {/* Card 2: Punched In Today */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all hover:border-emerald-500/40 dark:border-white/10 dark:bg-[#111118]/80">
            <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Punched In Today
              </span>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-brand-navy font-serif text-2xl font-bold sm:text-3xl dark:text-white">
                {punchedInCount !== null ? punchedInCount : '—'}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live biometric radar
              </p>
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all hover:border-amber-500/40 dark:border-white/10 dark:bg-[#111118]/80">
            <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Pending Approvals
              </span>
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-brand-navy font-serif text-2xl font-bold sm:text-3xl dark:text-white">
                {pendingApprovalsCount}
              </div>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Leaves &amp; regularizations
              </p>
            </div>
          </div>

          {/* Card 4: Payroll Cycle */}
          <div className="hover:border-brand-gold/40 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all dark:border-white/10 dark:bg-[#111118]/80">
            <div className="via-brand-gold/30 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Payroll Cycle
              </span>
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400">
                <Banknote className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-brand-navy truncate font-serif text-xl font-bold sm:text-2xl dark:text-white">
                {currentMonthName}
              </div>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Auto-calculated LOP
              </p>
            </div>
          </div>
        </div>

        {/* Primary Luxury Tab Navigation */}
        <div className="border-b border-gray-200/80 pb-px dark:border-white/10">
          <div className="flex gap-2 overflow-x-auto pb-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all ${
                    isActive
                      ? 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold border shadow-md'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge && pendingApprovalsCount > 0 && (
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab Content Container */}
        <div className="relative rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-[#111118]/90">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

          {/* TAB 1: DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* Directory Sub-Header & Search */}
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
                    Employee Directory
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Search personnel, review performance summaries, and manage system credentials.
                  </p>
                </div>

                <div className="relative w-full max-w-md">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 shadow-2xs transition-all focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white dark:placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Employee Cards Grid */}
              {loadingEmployees ? (
                <DynamicSkeleton type="property-grid" count={3} />
              ) : filteredEmployees.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
                  <UserCircle2 className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600" />
                  <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                    No employees found
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {employeeSearch
                      ? 'Try adjusting your search terms.'
                      : 'Get started by creating your first employee profile.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEmployees.map((emp) => (
                    <EmployeeCard
                      key={emp.id}
                      employee={emp}
                      onDelete={() => handleDeleteEmployee(emp.id)}
                      onResetPassword={() => setResetTarget(emp)}
                      onViewPerformance={() => setPerformanceTarget(emp)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'attendance' && token && (
            <div className="space-y-6">
              {/* Attendance View Switcher */}
              <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center dark:border-white/10">
                <div>
                  <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
                    Attendance Control Center
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Real-time biometric radar and comprehensive master timesheet records.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-gray-50 p-1 dark:border-white/10 dark:bg-[#181822]">
                  <button
                    type="button"
                    onClick={() => setAttendanceView('radar')}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
                      attendanceView === 'radar'
                        ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    Live Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceView('timesheet')}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
                      attendanceView === 'timesheet'
                        ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    Master Timesheet
                  </button>
                </div>
              </div>

              {/* Sub-view Content */}
              {attendanceView === 'radar' ? (
                <div className="flex flex-col gap-8 xl:flex-row">
                  <div className="flex-1 xl:max-w-[65%]">
                    <AttendanceDashboard token={token} showToast={showToast} />
                  </div>
                  <div className="w-full xl:w-[35%] xl:min-w-[400px]">
                    <LiveStatus token={token} />
                  </div>
                </div>
              ) : (
                <MasterTimesheet token={token} teams={teams} />
              )}
            </div>
          )}

          {/* TAB 3: APPROVALS */}
          {activeTab === 'approvals' && token && (
            <div className="space-y-6">
              <div>
                <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
                  Approvals &amp; Regularization Center
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Review and action employee leave requests and biometric attendance
                  regularizations.
                </p>
              </div>
              <LeaveAndRegularizationCenter token={token} />
            </div>
          )}

          {/* TAB 4: PAYROLL */}
          {activeTab === 'payroll' && token && (
            <div className="space-y-6">
              {/* Payroll Sub-view Switcher */}
              <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center dark:border-white/10">
                <div>
                  <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
                    Payroll &amp; Salary Administration
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Configure staff CTC breakdown, calculate attendance LOP deductions, and release
                    payslips.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-gray-50 p-1 dark:border-white/10 dark:bg-[#181822]">
                  <button
                    type="button"
                    onClick={() => setPayrollSubTab('monthly')}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
                      payrollSubTab === 'monthly'
                        ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Monthly Runs
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayrollSubTab('structures')}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
                      payrollSubTab === 'structures'
                        ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Salary Setup
                  </button>
                </div>
              </div>

              {/* Sub-view Content */}
              {payrollSubTab === 'monthly' ? (
                <MonthlyPayrollRunView
                  token={token}
                  onViewPayslip={(item) => setPreviewPayslipItem(item)}
                />
              ) : (
                <SalaryStructuresTable
                  structures={structures}
                  employees={employees}
                  loading={loadingStructures}
                  onAddNew={() => {
                    setEditingStructure(null);
                    setIsDrawerOpen(true);
                  }}
                  onEditStructure={(struct) => {
                    setEditingStructure(struct);
                    setIsDrawerOpen(true);
                  }}
                />
              )}
            </div>
          )}

          {/* TAB 5: REPORTS */}
          {activeTab === 'reports' && token && (
            <div className="space-y-6">
              <div>
                <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
                  Attendance Reports &amp; Analytics
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Generate cross-team attendance audit logs and performance reporting spreadsheets.
                </p>
              </div>
              <AttendanceReport
                token={token}
                showToast={showToast}
                teams={teams}
                teamsLoading={teamsLoading}
              />
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && token && (
            <div className="space-y-12">
              <div>
                <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
                  Workforce Policies &amp; Configuration
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage department teams, working shifts, and office geofence locations.
                </p>
              </div>

              <TeamsManager
                token={token}
                showToast={showToast}
                teams={teams}
                teamsLoading={teamsLoading}
                onTeamsChange={fetchTeams}
              />

              <AttendanceSettings token={token} showToast={showToast} />

              <LocationManager token={token} showToast={showToast} />
            </div>
          )}
        </div>
      </div>

      {/* Directory Modals */}
      <AnimatePresence>
        {showAddModal && token && (
          <AddEmployeeModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              showToast('success', 'Employee profile created successfully');
              fetchEmployees();
            }}
            token={token}
          />
        )}
        {resetTarget && token && (
          <ResetPasswordModal
            employee={resetTarget}
            onClose={() => setResetTarget(null)}
            onSuccess={() => {
              setResetTarget(null);
              showToast('success', 'Password reset successfully');
            }}
            token={token}
          />
        )}
        {performanceTarget && (
          <EmployeePerformanceModal
            employee={performanceTarget}
            isOpen={!!performanceTarget}
            onClose={() => setPerformanceTarget(null)}
            token={token || ''}
          />
        )}
      </AnimatePresence>

      {/* Attendance Mark Modal */}
      <AnimatePresence>
        {isMarkModalOpen && token && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMarkModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            >
              <button
                type="button"
                onClick={() => setIsMarkModalOpen(false)}
                className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <AlertCircle className="h-5 w-5 opacity-0" />
                <span className="sr-only">Close</span>
                <X className="absolute top-2 left-2 h-5 w-5" />
              </button>
              <div className="p-6 sm:p-8">
                <MarkAttendance
                  token={token}
                  showToast={showToast}
                  teams={teams}
                  teamsLoading={teamsLoading}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payroll Setup Drawer */}
      <EmployeeSalarySetupDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingStructure(null);
        }}
        onSaved={() => {
          fetchEmployees();
          fetchSalaryStructures();
        }}
        initialData={editingStructure}
        employees={employees}
        token={token || ''}
      />

      {/* Payslip Document Preview Modal */}
      {previewPayslipItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#111118]">
            <PayslipDocument
              item={previewPayslipItem}
              onClose={() => setPreviewPayslipItem(null)}
            />
          </div>
        </div>
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
