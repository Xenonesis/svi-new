'use client';
import { toast } from 'sonner';

import {
  AlertCircle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  LayoutDashboard,
  Sliders,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import AttendanceDashboard from '@/src/components/admin/attendance/AttendanceDashboard';
import AttendanceReport from '@/src/components/admin/attendance/AttendanceReport';
import MarkAttendance from '@/src/components/admin/attendance/MarkAttendance';
import TeamsManager from '@/src/components/admin/attendance/TeamsManager';
import LiveStatus from '@/src/components/admin/attendance/LiveStatus';
import AttendanceSettings from '@/src/components/admin/attendance/AttendanceSettings';
import LocationManager from '@/src/components/admin/attendance/LocationManager';
import MasterTimesheet from '@/src/components/admin/attendance/MasterTimesheet';
import LeaveAndRegularizationCenter from '@/src/components/admin/attendance/LeaveAndRegularizationCenter';
import { supabase } from '@/src/lib/supabase/client';
import type { Team } from '@/src/lib/supabase/types';

type Tab = 'overview' | 'timesheet' | 'approvals' | 'report' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof Users; badge?: boolean }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'timesheet', label: 'Master Timesheet', icon: Clock },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: true },
  { id: 'report', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Configuration', icon: Sliders },
];

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

function AttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const tab = searchParams.get('tab') as Tab | null;
    return tab && ['overview', 'timesheet', 'approvals', 'report', 'settings'].includes(tab)
      ? tab
      : 'overview';
  });
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  // Shared teams state — fetched once at page level
  const [teams, setTeams] = useState<(Team & { member_count: number })[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const fetchingRef = useRef(false);
  const tokenRef = useRef('');

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  }, []);

  // Auth check
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
      if (!session) return;

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
    });
    return () => controller.abort();
  }, [router]);

  // Fetch teams once when token is available
  const fetchTeams = useCallback(async () => {
    if (!tokenRef.current || fetchingRef.current) return;
    fetchingRef.current = true;
    setTeamsLoading(true);
    try {
      const res = await fetch('/api/admin/attendance/teams', {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      if (res.ok) {
        const json = await res.json();
        setTeams(json.teams || []);
      }
    } catch {
      // silent fail, user can retry
    } finally {
      setTeamsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (token) fetchTeams();
  }, [token, fetchTeams]);

  // Fetch pending approvals count for tab badge
  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('/api/admin/attendance/leaves?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .catch(() => ({ stats: { pending: 0 } })),
      fetch('/api/admin/attendance/regularizations?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .catch(() => ({ stats: { pending: 0 } })),
    ]).then(([leavesData, regsData]) => {
      const total = (leavesData.stats?.pending || 0) + (regsData.stats?.pending || 0);
      setPendingApprovalsCount(total);
    });
  }, [token, activeTab]);

  // Allow children to trigger a teams refresh (e.g. after create/delete)
  const refreshTeams = useCallback(() => {
    fetchingRef.current = false;
    fetchTeams();
  }, [fetchTeams]);

  return (
    <div className="relative w-full font-sans">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight dark:text-white">
            Attendance{' '}
            <span
              className="text-gradient-gold animate-bg-pan inline-block italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
              }}
            >
              Management
            </span>
          </h1>
          <p className="text-xs tracking-wide text-gray-600 dark:text-gray-400">
            Create teams, assign members, and track daily attendance records.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all ${
                    isActive
                      ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/25 border shadow-lg'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.badge && pendingApprovalsCount > 0 && (
                    <span className="py-0.2 rounded-full bg-amber-500 px-1.5 text-[10px] font-black text-white">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setIsMarkModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-400 hover:to-emerald-500"
          >
            <CalendarCheck className="h-4 w-4" />
            Log Attendance
          </button>
        </div>

        {/* Tab Content */}
        <div className="dark:bg-brand-dark-surface/65 relative rounded-xl border border-gray-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
          {activeTab === 'overview' && token && (
            <div className="flex flex-col gap-8 xl:flex-row">
              <div className="flex-1 xl:max-w-[65%]">
                <AttendanceDashboard token={token} showToast={showToast} />
              </div>
              <div className="w-full xl:w-[35%] xl:min-w-[400px]">
                <LiveStatus token={token} />
              </div>
            </div>
          )}
          {activeTab === 'timesheet' && token && <MasterTimesheet token={token} teams={teams} />}
          {activeTab === 'approvals' && token && <LeaveAndRegularizationCenter token={token} />}
          {activeTab === 'report' && token && (
            <AttendanceReport
              token={token}
              showToast={showToast}
              teams={teams}
              teamsLoading={teamsLoading}
            />
          )}
          {activeTab === 'settings' && token && (
            <div className="space-y-12">
              <TeamsManager
                token={token}
                showToast={showToast}
                teams={teams}
                teamsLoading={teamsLoading}
                onTeamsChange={refreshTeams}
              />
              <AttendanceSettings token={token} showToast={showToast} />
              <LocationManager token={token} showToast={showToast} />
            </div>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
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
                onClick={() => setIsMarkModalOpen(false)}
                className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <AlertCircle className="h-5 w-5 opacity-0" /> {/* Spacer */}
                <span className="sr-only">Close</span>
                <svg
                  className="absolute top-2 left-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense>
      <AttendanceContent />
    </Suspense>
  );
}
