'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DashboardPunchTerminalCard } from '@/src/components/employee/dashboard/DashboardPunchTerminalCard';
import { DashboardMetricsGrid } from '@/src/components/employee/dashboard/DashboardMetricsGrid';
import { DashboardQuickShortcuts } from '@/src/components/employee/dashboard/DashboardQuickShortcuts';
import { DashboardPriorityTasksCard } from '@/src/components/employee/dashboard/DashboardPriorityTasksCard';
import { DashboardSiteVisitsCard } from '@/src/components/employee/dashboard/DashboardSiteVisitsCard';
import { DashboardAssignedLeadsCard } from '@/src/components/employee/dashboard/DashboardAssignedLeadsCard';
import type { DashboardData } from '@/src/components/employee/dashboard/types';

export default function EmployeeDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      toast.error('Failed to load dashboard');
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
      const updateElapsed = () => {
        const start = new Date(punchInTime).getTime();
        const now = new Date().getTime();
        const diffMs = Math.max(0, now - start);

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [data?.today?.punch_status, data?.today?.punch_in_time]);

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus === 'completed' ? 'Task completed' : 'Task reopened');
        fetchDashboard();
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

  return (
    <div className="space-y-6 pb-6">
      {/* Header Greeting & Refresh */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Welcome back, {data?.employee?.full_name?.split(' ')[0] || 'Employee'}! 👋
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Here is your daily shift overview and active work assignments.
          </p>
        </div>

        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 sm:self-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Punch Radar, Metrics & Shortcuts (5 Columns) */}
        <div className="space-y-6 lg:col-span-5">
          <DashboardPunchTerminalCard today={data?.today} elapsedTime={elapsedTime} />

          <DashboardMetricsGrid metrics={data?.metrics} />

          <DashboardQuickShortcuts />
        </div>

        {/* RIGHT COLUMN: Priority Tasks, Site Visits & Leads (7 Columns) */}
        <div className="space-y-6 lg:col-span-7">
          <DashboardPriorityTasksCard tasks={data?.urgent_tasks} onToggleTask={toggleTask} />

          <DashboardSiteVisitsCard visits={data?.upcoming_site_visits} />

          <DashboardAssignedLeadsCard leads={data?.recent_leads} />
        </div>
      </div>
    </div>
  );
}
