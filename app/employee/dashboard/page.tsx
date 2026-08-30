'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  Plus,
  CalendarDays,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DashboardPunchTerminalCard } from '@/src/components/employee/dashboard/DashboardPunchTerminalCard';
import { DashboardMetricsGrid } from '@/src/components/employee/dashboard/DashboardMetricsGrid';
import { DashboardQuickShortcuts } from '@/src/components/employee/dashboard/DashboardQuickShortcuts';
import { DashboardPriorityTasksCard } from '@/src/components/employee/dashboard/DashboardPriorityTasksCard';
import { DashboardSiteVisitsCard } from '@/src/components/employee/dashboard/DashboardSiteVisitsCard';
import { DashboardAssignedLeadsCard } from '@/src/components/employee/dashboard/DashboardAssignedLeadsCard';
import { DashboardLeaveAndStreakCard } from '@/src/components/employee/dashboard/DashboardLeaveAndStreakCard';
import { DashboardActivityFeedCard } from '@/src/components/employee/dashboard/DashboardActivityFeedCard';
import { AddTaskModal } from '@/src/components/employee/work/AddTaskModal';
import { ApplyLeaveModal } from '@/src/components/employee/attendance/history/ApplyLeaveModal';
import { SubmitShiftLogModal } from '@/src/components/employee/work/SubmitShiftLogModal';
import type { DashboardData } from '@/src/components/employee/dashboard/types';
import type { TaskItem } from '@/src/components/employee/work/types';

export default function EmployeeDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal control states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isSubmitLogOpen, setIsSubmitLogOpen] = useState(false);

  // Live time ticker
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/employee/work/dashboard', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        // Support both direct root and nested dashboard envelope
        const payload: DashboardData = json.dashboard || json;
        setData(payload);
        if (isRefresh) {
          toast.success('Dashboard synchronized with latest shift records');
        }
      } else {
        const errJson = await res.json().catch(() => null);
        const errorMsg = errJson?.message || `Server responded with status ${res.status}`;
        setFetchError(errorMsg);
        toast.error('Unable to synchronize dashboard', { description: errorMsg });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network connection failed';
      setFetchError(errorMsg);
      toast.error('Network Error', {
        description: 'Please check your internet connection and tap Refresh.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Live timer tick for active shift
  useEffect(() => {
    const punchStatus = data?.today?.punch_status;
    const punchInTime = data?.today?.punch_in_time;

    if (punchStatus === 'punched_in' && punchInTime) {
      const calculateDuration = () => {
        let startTime: number;
        if (punchInTime.includes('T') || punchInTime.includes('-')) {
          startTime = new Date(punchInTime).getTime();
        } else {
          // Format like "09:30"
          const [hours, minutes] = punchInTime.split(':').map(Number);
          const start = new Date();
          start.setHours(hours, minutes, 0, 0);
          startTime = start.getTime();
        }

        const now = Date.now();
        const diffMs = Math.max(0, now - startTime);
        const diffSec = Math.floor(diffMs / 1000);

        const h = Math.floor(diffSec / 3600);
        const m = Math.floor((diffSec % 3600) / 60);
        const s = diffSec % 60;

        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      };

      setElapsedTime(calculateDuration());
      const interval = setInterval(() => {
        setElapsedTime(calculateDuration());
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime('00:00:00');
    }
  }, [data?.today?.punch_status, data?.today?.punch_in_time]);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [currentTime]);

  const firstName = useMemo(() => {
    const rawName = data?.employee?.full_name || data?.employee?.name;
    if (!rawName) return 'Team Member';
    return rawName.split(' ')[0];
  }, [data?.employee?.full_name, data?.employee?.name]);

  // Toggle Task Handler
  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        urgent_tasks: prev.urgent_tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      };
    });

    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(
          newStatus === 'completed' ? 'Task marked as completed' : 'Task marked as pending'
        );
        fetchDashboard();
      } else {
        toast.error('Failed to update task status');
        fetchDashboard(); // Rollback
      }
    } catch {
      toast.error('Network error updating task');
      fetchDashboard();
    }
  };

  // Inline Quick Task Create
  const handleQuickCreateTask = async (title: string) => {
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          priority: 'high',
          category: 'general',
        }),
      });

      if (res.ok) {
        toast.success('Priority task created successfully');
        fetchDashboard();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || 'Failed to create task');
      }
    } catch {
      toast.error('Unable to create task. Please check connection.');
    }
  };

  // Full Task Modal Submit
  const handleCreateTaskModal = async (taskData: {
    title: string;
    description: string;
    priority: TaskItem['priority'];
    category: TaskItem['category'];
    due_date: string;
  }) => {
    const res = await fetch('/api/employee/work/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    if (res.ok) {
      toast.success('Task created successfully');
      fetchDashboard();
    } else {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to create task');
    }
  };

  // Leave Modal Submit
  const handleApplyLeaveModal = async (leaveData: {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
  }) => {
    const res = await fetch('/api/employee/attendance/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData),
    });

    if (res.ok) {
      toast.success('Leave application submitted for supervisor approval');
      fetchDashboard();
    } else {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to submit leave application');
    }
  };

  // Daily Work Log Modal Submit
  const handleSubmitDailyLogModal = async (logData: {
    summary_text: string;
    client_interactions_count: number;
    site_visits_conducted_count: number;
  }) => {
    const res = await fetch('/api/employee/work/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        summary: logData.summary_text,
        client_interactions_count: logData.client_interactions_count,
        site_visits_conducted_count: logData.site_visits_conducted_count,
      }),
    });

    if (res.ok) {
      toast.success('Daily shift work log recorded successfully');
      fetchDashboard();
    } else {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to save daily work log');
    }
  };

  // Skeleton Loading State
  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-7 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="h-72 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-44 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="space-y-6 lg:col-span-7">
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-44 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-44 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Error Fallback Banner */}
      {fetchError && (
        <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="font-bold">Sync Warning</p>
              <p className="text-[11px] opacity-90">{fetchError}</p>
            </div>
          </div>
          <button
            onClick={() => fetchDashboard(true)}
            className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 font-bold text-white shadow-sm transition-all hover:bg-red-500 active:scale-95"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {/* Executive Header Greeting & Live Status Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              {format(currentTime, 'EEEE, d MMMM yyyy')}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-mono text-[11px] font-semibold text-slate-500 tabular-nums dark:text-slate-400">
              {format(currentTime, 'hh:mm:ss a')} IST
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {greeting}, {firstName}!
            </h1>

            {/* Role / Designation Badge */}
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400">
              <Sparkles className="h-3 w-3" />
              <span>{data?.employee?.designation || data?.employee?.role || 'Staff Member'}</span>
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {data?.today?.punch_status === 'punched_in'
              ? 'Shift is actively running. Geofence attendance verified.'
              : data?.today?.punch_status === 'punched_out'
                ? 'Your daily shift has concluded. Great job today!'
                : 'Here is your daily shift overview and active work assignments.'}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              triggerHaptic();
              setIsAddTaskOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#d98b40] to-[#c67c33] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:brightness-105 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              fetchDashboard(true);
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Shift Radar, Performance Metrics, Leave Balances & Shortcuts (5 Columns) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Shift & Geofence Radar Card */}
          <DashboardPunchTerminalCard
            today={data?.today}
            elapsedTime={elapsedTime}
            onOpenLogModal={() => setIsSubmitLogOpen(true)}
          />

          {/* Performance Metrics Grid */}
          <DashboardMetricsGrid metrics={data?.metrics} />

          {/* Annual Leave Quota & Attendance Streak */}
          <DashboardLeaveAndStreakCard
            leaves={data?.leaves}
            metrics={data?.metrics}
            onOpenLeaveModal={() => setIsApplyLeaveOpen(true)}
          />

          {/* 1-Tap Quick Action Shortcuts */}
          <DashboardQuickShortcuts
            onOpenLeaveModal={() => setIsApplyLeaveOpen(true)}
            onOpenLogModal={() => setIsSubmitLogOpen(true)}
            onOpenTaskModal={() => setIsAddTaskOpen(true)}
          />
        </div>

        {/* RIGHT COLUMN: Priority Tasks, Site Visits, Leads & Timeline Feed (7 Columns) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Today's Priority Tasks */}
          <DashboardPriorityTasksCard
            tasks={data?.urgent_tasks}
            onToggleTask={toggleTask}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onQuickCreateTask={handleQuickCreateTask}
          />

          {/* Next Scheduled Site Visit with GPS Check-in */}
          <DashboardSiteVisitsCard visits={data?.upcoming_site_visits} />

          {/* Assigned Leads with 1-Tap Dialer / WhatsApp */}
          <DashboardAssignedLeadsCard leads={data?.recent_leads} />

          {/* Chronological Shift Activity Timeline */}
          <DashboardActivityFeedCard activities={data?.recent_activities} />
        </div>
      </div>

      {/* Modal Suite */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleCreateTaskModal}
      />

      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        onSubmit={handleApplyLeaveModal}
      />

      <SubmitShiftLogModal
        isOpen={isSubmitLogOpen}
        onClose={() => setIsSubmitLogOpen(false)}
        onSubmit={handleSubmitDailyLogModal}
      />
    </div>
  );
}
