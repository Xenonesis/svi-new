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
  Plus,
  FileText,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { toast } from 'sonner';

interface DashboardData {
  employee: {
    id: string;
    full_name: string;
    email: string;
    department?: string | null;
    role: string;
  };
  today: {
    date: string;
    punch_status: 'punched_in' | 'punched_out' | 'not_punched';
    punch_in_time: string | null;
    punch_out_time: string | null;
    total_hours: number | null;
    is_late: boolean;
  };
  metrics: {
    weekly_hours: number;
    pending_tasks: number;
    completed_tasks_today: number;
    assigned_leads: number;
    upcoming_site_visits: number;
  };
  urgent_tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date?: string | null;
  }>;
  upcoming_site_visits: Array<{
    id: string;
    preferred_date: string;
    preferred_time?: string | null;
    status: string;
    location?: string | null;
    property?: { title: string; location?: string } | null;
    contact?: { full_name?: string; phone?: string } | null;
  }>;
  recent_leads: Array<{
    id: string;
    name: string;
    phone: string;
    lead_temperature: string;
    lead_status: string;
    created_at: string;
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
      if (res.ok) {
        const json = await res.json();
        setData(json.dashboard);
      }
    } catch {
      toast.error('Failed to load dashboard data');
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

      if (data?.today?.punch_status === 'punched_in' && data.today.punch_in_time) {
        const start = new Date(data.today.punch_in_time);
        const diffSec = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));
        const hours = Math.floor(diffSec / 3600);
        const minutes = Math.floor((diffSec % 3600) / 60);
        const seconds = diffSec % 60;
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
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
        toast.success(newStatus === 'completed' ? 'Task marked completed' : 'Task marked pending');
        fetchDashboard(true);
      }
    } catch {
      toast.error('Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-medium text-slate-500">Loading your workspace...</p>
      </div>
    );
  }

  const punchStatus = data?.today?.punch_status || 'not_punched';

  return (
    <div className="space-y-6 pb-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-transparent p-5 backdrop-blur-sm sm:flex-row sm:items-center dark:border-slate-800 dark:from-blue-950/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              Welcome back, {data?.employee?.full_name?.split(' ')[0] || 'Staff'} 👋
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
            {format(currentTime, 'EEEE, d MMMM yyyy')} •{' '}
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
              {format(currentTime, 'hh:mm:ss a')}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={clsx('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/employee/attendance"
            className={clsx(
              'flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-md transition-all',
              punchStatus === 'punched_in'
                ? 'bg-amber-600 text-white shadow-amber-600/20 hover:bg-amber-500'
                : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-500'
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>
              {punchStatus === 'punched_in' ? 'Shift Active (Punch Out)' : 'Punch In Now'}
            </span>
          </Link>
        </div>
      </div>

      {/* Main 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN (5 Columns on Desktop) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Live Radar Punch Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              'relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all',
              punchStatus === 'punched_in'
                ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:border-emerald-500/20 dark:from-emerald-950/30'
                : punchStatus === 'punched_out'
                  ? 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:border-blue-500/20 dark:from-blue-950/30'
                  : 'border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/70'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    'h-2.5 w-2.5 animate-pulse rounded-full',
                    punchStatus === 'punched_in'
                      ? 'bg-emerald-500'
                      : punchStatus === 'punched_out'
                        ? 'bg-blue-500'
                        : 'bg-slate-400'
                  )}
                />
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  {punchStatus === 'punched_in'
                    ? 'Shift In Progress'
                    : punchStatus === 'punched_out'
                      ? 'Shift Completed'
                      : 'Shift Not Started'}
                </span>
              </div>

              {data?.today?.is_late && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Late Arrival
                </span>
              )}
            </div>

            {/* Radar Center Dial */}
            <div className="my-6 flex flex-col items-center justify-center text-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-100 bg-slate-50 shadow-inner dark:border-slate-800 dark:bg-slate-950/80">
                {punchStatus === 'punched_in' && (
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                )}
                <div className="flex flex-col items-center">
                  <Clock
                    className={clsx(
                      'h-6 w-6',
                      punchStatus === 'punched_in'
                        ? 'text-emerald-500'
                        : punchStatus === 'punched_out'
                          ? 'text-blue-500'
                          : 'text-slate-400'
                    )}
                  />
                  <span className="mt-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {punchStatus === 'punched_in'
                      ? elapsedTime
                      : punchStatus === 'punched_out'
                        ? `${(data?.today?.total_hours || 0).toFixed(1)} hrs`
                        : '00:00:00'}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {punchStatus === 'punched_in' ? 'Active' : 'Duration'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex w-full items-center justify-around border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400">Punch In</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {data?.today?.punch_in_time
                      ? format(new Date(data.today.punch_in_time), 'hh:mm a')
                      : '--:--'}
                  </p>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                <div>
                  <p className="text-[10px] text-slate-400">Punch Out</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {data?.today?.punch_out_time
                      ? format(new Date(data.today.punch_out_time), 'hh:mm a')
                      : '--:--'}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/employee/attendance"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-lg transition-all hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Open GPS Attendance Terminal <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* 4 Stat Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Weekly Hours
                </span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {data?.metrics?.weekly_hours || 0}{' '}
                <span className="text-xs font-normal text-slate-400">hrs</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Pending Tasks
                </span>
                <ListTodo className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {data?.metrics?.pending_tasks || 0}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Assigned Leads
                </span>
                <Users className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {data?.metrics?.assigned_leads || 0}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Site Visits
                </span>
                <Compass className="h-4 w-4 text-purple-500" />
              </div>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {data?.metrics?.upcoming_site_visits || 0}
              </p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <Link
                href="/employee/attendance/history"
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <CalendarDays className="h-4 w-4 text-blue-500" />
                <span className="text-[11px]">Apply Leave</span>
              </Link>
              <Link
                href="/employee/work?tab=logs"
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4 text-emerald-500" />
                <span className="text-[11px]">Daily Log</span>
              </Link>
              <Link
                href="/employee/work?tab=tasks"
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Plus className="h-4 w-4 text-purple-500" />
                <span className="text-[11px]">New Task</span>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Columns on Desktop) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Urgent & Priority Tasks */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <ListTodo className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Today&apos;s Priority Tasks
                </h2>
              </div>
              <Link
                href="/employee/work?tab=tasks"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                All Tasks <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {!data?.urgent_tasks || data.urgent_tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  All caught up! No urgent tasks pending.
                </p>
                <Link
                  href="/employee/work?tab=tasks"
                  className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400"
                >
                  + Add a new task
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.urgent_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id, task.status)}
                        className={clsx(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                          task.status === 'completed'
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 hover:border-slate-500 dark:border-slate-700'
                        )}
                      >
                        {task.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                      </button>
                      <div>
                        <p
                          className={clsx(
                            'text-xs font-semibold',
                            task.status === 'completed'
                              ? 'text-slate-400 line-through dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          )}
                        >
                          {task.title}
                        </p>
                        {task.due_date && (
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Due: {format(new Date(task.due_date), 'd MMM, hh:mm a')}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase',
                        task.priority === 'urgent'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : task.priority === 'high'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Scheduled Property Site Visit */}
          {data?.upcoming_site_visits && data.upcoming_site_visits.length > 0 && (
            <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent p-5 shadow-sm dark:border-purple-500/30 dark:from-purple-950/20">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                    <Compass className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Next Scheduled Site Visit
                  </h2>
                </div>
                <Link
                  href="/employee/work?tab=visits"
                  className="text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                >
                  View All
                </Link>
              </div>

              {(() => {
                const visit = data.upcoming_site_visits[0];
                return (
                  <div className="rounded-2xl border border-purple-200/60 bg-white/90 p-4 shadow-sm dark:border-purple-900/40 dark:bg-slate-900/80">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {visit.property?.title || 'Property Site Visit'}
                        </h4>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3 w-3 text-purple-500" />
                          {visit.location || visit.property?.location || 'Jaipur Site'}
                        </p>
                      </div>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {visit.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-purple-500" />
                        <span>
                          {format(new Date(visit.preferred_date), 'd MMM yyyy')}
                          {visit.preferred_time ? ` (${visit.preferred_time})` : ''}
                        </span>
                      </div>

                      {visit.contact?.phone && (
                        <a
                          href={`tel:${visit.contact.phone}`}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
                        >
                          <Phone className="h-3 w-3" /> Call Client
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Assigned Leads Preview */}
          {data?.recent_leads && data.recent_leads.length > 0 && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Assigned Customer Leads
                  </h2>
                </div>
                <Link
                  href="/employee/work?tab=leads"
                  className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.recent_leads.slice(0, 4).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {lead.name}
                      </p>
                      <p className="text-[10px] text-slate-500">{lead.lead_status}</p>
                    </div>
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
