'use client';

import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { DashboardPunchTerminalCard } from '@/src/components/employee/dashboard/DashboardPunchTerminalCard';
import { DashboardMetricsGrid } from '@/src/components/employee/dashboard/DashboardMetricsGrid';
import { DashboardQuickShortcuts } from '@/src/components/employee/dashboard/DashboardQuickShortcuts';
import { DashboardPriorityTasksCard } from '@/src/components/employee/dashboard/DashboardPriorityTasksCard';
import { DashboardSiteVisitsCard } from '@/src/components/employee/dashboard/DashboardSiteVisitsCard';
import { DashboardAssignedLeadsCard } from '@/src/components/employee/dashboard/DashboardAssignedLeadsCard';
import { DashboardLeaveAndStreakCard } from '@/src/components/employee/dashboard/DashboardLeaveAndStreakCard';
import { DashboardActivityFeedCard } from '@/src/components/employee/dashboard/DashboardActivityFeedCard';
import { useEmployeeDashboard } from '@/src/components/employee/dashboard/useEmployeeDashboard';
import { EmployeeDashboardHeader } from '@/src/components/employee/dashboard/EmployeeDashboardHeader';
import { EmployeeDashboardModals } from '@/src/components/employee/dashboard/EmployeeDashboardModals';

export default function EmployeeDashboardPage() {
  const {
    data,
    refreshing,
    elapsedTime,
    fetchError,
    currentTime,
    greeting,
    firstName,
    fetchDashboard,
    toggleTask,
    handleQuickCreateTask,
    handleCreateTaskModal,
    handleApplyLeaveModal,
    handleSubmitShiftLogModal,
  } = useEmployeeDashboard();

  // Modal control states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isSubmitLogOpen, setIsSubmitLogOpen] = useState(false);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Dynamic Time-Contextual Header */}
      <EmployeeDashboardHeader
        greeting={greeting}
        firstName={firstName}
        currentTime={currentTime}
        refreshing={refreshing}
        onRefresh={() => fetchDashboard(true)}
        onOpenSubmitLog={() => setIsSubmitLogOpen(true)}
        onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
      />

      {/* Connectivity Error Banner */}
      {fetchError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-400">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="shrink-0 text-rose-500" />
            <p className="text-xs font-semibold">{fetchError}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            className="flex cursor-pointer items-center gap-1 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-600"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Primary Row: Punch Terminal + KPI Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Biometric & Geofence Shift Radar Terminal */}
        <div className="lg:col-span-6 xl:col-span-5">
          <DashboardPunchTerminalCard
            today={data?.today}
            elapsedTime={elapsedTime}
            onOpenLogModal={() => setIsSubmitLogOpen(true)}
          />
        </div>

        {/* 4-Stat Core Operational Metrics Grid */}
        <div className="lg:col-span-6 xl:col-span-7">
          <DashboardMetricsGrid metrics={data?.metrics} />
        </div>
      </div>

      {/* Leave Balances & On-Time Performance Streak Strip */}
      <DashboardLeaveAndStreakCard
        leaves={data?.leaves}
        metrics={data?.metrics}
        onOpenLeaveModal={() => setIsApplyLeaveOpen(true)}
      />

      {/* Two-Column Middle Grid: Priority Tasks & Assigned Leads */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Priority Tasks */}
        <div className="lg:col-span-7">
          <DashboardPriorityTasksCard
            tasks={data?.urgent_tasks || []}
            onToggleTask={(id, st) => {
              triggerHaptic();
              toggleTask(id, st);
            }}
            onQuickCreateTask={handleQuickCreateTask}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
          />
        </div>

        {/* High-Value Customer Pipeline */}
        <div className="lg:col-span-5">
          <DashboardAssignedLeadsCard leads={data?.recent_leads} />
        </div>
      </div>

      {/* Bottom Grid: Site Visits Radar & Shift Activity Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Scheduled Site Visits */}
        <div className="lg:col-span-6">
          <DashboardSiteVisitsCard visits={data?.upcoming_site_visits} />
        </div>

        {/* Today's Operational Activity Timeline */}
        <div className="lg:col-span-6">
          <DashboardActivityFeedCard activities={data?.recent_activities} />
        </div>
      </div>

      {/* Workspace Quick Jump Shortcuts */}
      <div className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
            <Sparkles size={12} className="text-amber-500" />
            Quick Workspace Navigation
          </h3>
        </div>
        <DashboardQuickShortcuts
          onOpenLeaveModal={() => setIsApplyLeaveOpen(true)}
          onOpenLogModal={() => setIsSubmitLogOpen(true)}
          onOpenTaskModal={() => setIsAddTaskOpen(true)}
        />
      </div>

      {/* Modals Container */}
      <EmployeeDashboardModals
        isAddTaskOpen={isAddTaskOpen}
        setIsAddTaskOpen={setIsAddTaskOpen}
        isApplyLeaveOpen={isApplyLeaveOpen}
        setIsApplyLeaveOpen={setIsApplyLeaveOpen}
        isSubmitLogOpen={isSubmitLogOpen}
        setIsSubmitLogOpen={setIsSubmitLogOpen}
        onCreateTask={handleCreateTaskModal}
        onApplyLeave={handleApplyLeaveModal}
        onSubmitShiftLog={handleSubmitShiftLogModal}
      />
    </div>
  );
}
