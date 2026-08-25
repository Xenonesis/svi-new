'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  ListTodo,
  Users,
  Compass,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { toast } from 'sonner';

interface DashboardData {
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string | null;
  };
  today: {
    date: string;
    punch_status: 'not_punched' | 'punched_in' | 'punched_out';
    punch_in_time: string | null;
    punch_out_time: string | null;
    total_hours: number | null;
    is_late: boolean;
    is_geofence_verified: boolean;
  };
  metrics: {
    pending_tasks_count: number;
    completed_tasks_today: number;
    active_site_visits_count: number;
    pending_leads_count: number;
    days_present_this_week: number;
    hours_logged_this_week: number;
  };
  urgent_tasks: Array<{
    id: string;
    title: string;
    priority: string;
    category: string;
    status: string;
    due_date?: string | null;
  }>;
  upcoming_site_visits: Array<{
    id: string;
    status: string;
    preferred_date?: string | null;
    notes?: string | null;
    contact?: {
      name?: string;
      phone?: string;
    };
  }>;
  recent_leads: Array<{
    id: string;
    name: string;
    phone?: string | null;
    lifecycle_status: string;
    temperature?: string | null;
    project_interest?: string | null;
  }>;
}

export default function EmployeeDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/employee/work/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      toast.error('Could not refresh dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Live Clock & Elapsed Shift Time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (data?.today?.punch_status === 'punched_in' && data?.today?.punch_in_time) {
        const inTime = new Date(data.today.punch_in_time);
        const diffMs = Math.max(0, now.getTime() - inTime.getTime());
        const totalSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus === 'completed' ? 'Task marked complete!' : 'Task reopened');
        fetchDashboard();
      }
    } catch {
      toast.error('Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-medium text-slate-500">Loading your workspace...</p>
      </div>
    );
  }

  const punchStatus = data?.today?.punch_status || 'not_punched';

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Welcome & Shift Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hello, {data?.employee?.name?.split(' ')[0] || 'Employee'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {format(currentTime, 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <RefreshCw className={clsx('h-4 w-4', refreshing && 'animate-spin text-blue-500')} />
        </button>
      </div>

      {/* 2. Punch Radar / Shift Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'relative flex h-3 w-3 rounded-full',
                punchStatus === 'punched_in' && 'bg-emerald-500',
                punchStatus === 'punched_out' && 'bg-amber-500',
                punchStatus === 'not_punched' && 'bg-slate-400'
              )}
            >
              {punchStatus === 'punched_in' && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
            </span>
            <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
              {punchStatus === 'punched_in'
                ? 'Active On Shift'
                : punchStatus === 'punched_out'
                  ? 'Shift Completed'
                  : 'Not Punched In'}
            </span>
          </div>

          <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
            {format(currentTime, 'hh:mm:ss a')}
          </span>
        </div>

        {/* Live Timer or Shift Hours */}
        <div className="my-4 flex items-baseline justify-between">
          {punchStatus === 'punched_in' ? (
            <div>
              <div className="font-mono text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {elapsedTime}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Clock className="h-3.5 w-3.5" />
                Checked in at{' '}
                {data?.today?.punch_in_time
                  ? format(new Date(data.today.punch_in_time), 'hh:mm a')
                  : '--:--'}
              </p>
            </div>
          ) : punchStatus === 'punched_out' ? (
            <div>
              <div className="font-mono text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {data?.today?.total_hours ? `${data.today.total_hours} hrs` : '--'}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Checked out at{' '}
                {data?.today?.punch_out_time
                  ? format(new Date(data.today.punch_out_time), 'hh:mm a')
                  : '--:--'}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Ready for Shift
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Regular Shift: 09:00 AM – 06:00 PM
              </p>
            </div>
          )}

          <Link
            href="/employee/attendance"
            className={clsx(
              'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all',
              punchStatus === 'punched_in'
                ? 'bg-amber-600 shadow-amber-600/20 hover:bg-amber-500'
                : punchStatus === 'punched_out'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-blue-600 shadow-blue-600/20 hover:bg-blue-500'
            )}
          >
            {punchStatus === 'punched_in'
              ? 'Punch Out'
              : punchStatus === 'punched_out'
                ? 'View Logs'
                : 'Punch In'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data?.today?.is_late && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Marked late for today’s shift cutoff.</span>
          </div>
        )}
      </motion.div>

      {/* 3. Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/employee/work?tab=tasks"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <ListTodo className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.metrics?.pending_tasks_count ?? 0}
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
            Active Tasks
          </p>
          <p className="text-[11px] text-slate-500">
            {data?.metrics?.completed_tasks_today ?? 0} completed today
          </p>
        </Link>

        <Link
          href="/employee/work?tab=site-visits"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-emerald-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.metrics?.active_site_visits_count ?? 0}
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
            Site Visits
          </p>
          <p className="text-[11px] text-slate-500">Scheduled tours</p>
        </Link>

        <Link
          href="/employee/work?tab=leads"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.metrics?.pending_leads_count ?? 0}
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
            Assigned Leads
          </p>
          <p className="text-[11px] text-slate-500">Follow-up inquiries</p>
        </Link>

        <Link
          href="/employee/attendance/history"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-purple-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {data?.metrics?.hours_logged_this_week ?? 0}h
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
            Weekly Hours
          </p>
          <p className="text-[11px] text-slate-500">
            {data?.metrics?.days_present_this_week ?? 0} days present
          </p>
        </Link>
      </div>

      {/* 4. Urgent Action Items / To-Dos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Priority Action Items
            </h2>
          </div>
          <Link
            href="/employee/work?tab=tasks"
            className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data?.urgent_tasks && data.urgent_tasks.length > 0 ? (
          <div className="space-y-2">
            {data.urgent_tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="mr-2 flex min-w-0 flex-1 items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id, task.status)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 text-transparent transition-colors hover:border-blue-500 hover:text-blue-500 dark:border-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <div className="truncate">
                    <p className="truncate text-xs font-medium text-slate-900 dark:text-white">
                      {task.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="capitalize">{task.category.replace('_', ' ')}</span>
                      {task.due_date && (
                        <span>• Due {format(new Date(task.due_date), 'MMM dd')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={clsx(
                    'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
                    task.priority === 'urgent'
                      ? 'border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  )}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800">
            No urgent tasks for today. You’re all caught up!
          </div>
        )}
      </div>

      {/* 5. Next Scheduled Site Visit */}
      {data?.upcoming_site_visits && data.upcoming_site_visits.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
              <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Next Scheduled Site Visit
            </h2>
            <Link
              href="/employee/work?tab=site-visits"
              className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              All Visits <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {(() => {
            const visit = data.upcoming_site_visits[0];
            return (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {visit.contact?.name || 'Customer Site Tour'}
                    </span>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {visit.preferred_date
                        ? format(new Date(visit.preferred_date), 'EEE, MMM dd • hh:mm a')
                        : 'Date to be confirmed'}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    {visit.status}
                  </span>
                </div>

                {visit.contact?.phone && (
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={`tel:${visit.contact.phone}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-500"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call Customer ({visit.contact.phone})
                    </a>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
