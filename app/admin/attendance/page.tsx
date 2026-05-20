'use client';

import {
  AlertCircle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import AttendanceDashboard from '@/src/components/admin/attendance/AttendanceDashboard';
import AttendanceReport from '@/src/components/admin/attendance/AttendanceReport';
import MarkAttendance from '@/src/components/admin/attendance/MarkAttendance';
import TeamsManager from '@/src/components/admin/attendance/TeamsManager';
import { supabase } from '@/src/lib/supabase/client';
import type { Team } from '@/src/lib/supabase/types';

type Tab = 'dashboard' | 'teams' | 'mark' | 'report';

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'mark', label: 'Mark Attendance', icon: CalendarCheck },
  { id: 'report', label: 'Reports', icon: BarChart3 },
];

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(201, 168, 76, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

function AttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const tab = searchParams.get('tab') as Tab | null;
    return tab && ['dashboard', 'teams', 'mark', 'report'].includes(tab) ? tab : 'dashboard';
  });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Shared teams state — fetched once at page level
  const [teams, setTeams] = useState<(Team & { member_count: number })[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const fetchingRef = useRef(false);
  const tokenRef = useRef('');

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Auth check
  useEffect(() => {
    const controller = new AbortController();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (controller.signal.aborted) return;
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
                  'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)',
              }}
            >
              Management
            </span>
          </h1>
          <p className="text-xs tracking-wide text-gray-600 dark:text-gray-400">
            Create teams, assign members, and track daily attendance records.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold tracking-widest uppercase transition-all ${
                  isActive
                    ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/25 border shadow-lg'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="relative rounded-xl border border-gray-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
          {activeTab === 'dashboard' && token && (
            <AttendanceDashboard token={token} showToast={showToast} />
          )}
          {activeTab === 'teams' && token && (
            <TeamsManager
              token={token}
              showToast={showToast}
              teams={teams}
              teamsLoading={teamsLoading}
              onTeamsChange={refreshTeams}
            />
          )}
          {activeTab === 'mark' && token && (
            <MarkAttendance
              token={token}
              showToast={showToast}
              teams={teams}
              teamsLoading={teamsLoading}
            />
          )}
          {activeTab === 'report' && token && (
            <AttendanceReport
              token={token}
              showToast={showToast}
              teams={teams}
              teamsLoading={teamsLoading}
            />
          )}
        </div>
      </div>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 font-sans text-sm font-semibold shadow-2xl ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/95 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-950/95 dark:text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            {toast.msg}
          </motion.div>
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
