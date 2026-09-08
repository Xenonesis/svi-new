'use client';

import React from 'react';
import { UserPlus } from 'lucide-react';
import { WorkStatsSummary } from '@/src/components/employee/work/WorkStatsSummary';
import { WorkTabNavigation } from '@/src/components/employee/work/WorkTabNavigation';
import { FollowUpReminderBanner } from '@/src/components/employee/work/FollowUpReminderBanner';
import { useEmployeeWorkTracker } from '@/src/components/employee/work/useEmployeeWorkTracker';
import { WorkModalsContainer } from '@/src/components/employee/work/WorkModalsContainer';
import { WorkTabContent } from '@/src/components/employee/work/WorkTabContent';

export default function EmployeeWorkTrackerPage() {
  const tracker = useEmployeeWorkTracker();

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Daily Work & Lead Tracker
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Manage your daily tasks, customer site visits, assigned leads, and shift reports
          </p>
        </div>

        <button
          onClick={() => tracker.setShowAddLeadModal(true)}
          className="flex items-center gap-1.5 self-start rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-102 hover:from-blue-500 hover:to-indigo-500 sm:self-auto"
        >
          <UserPlus className="h-4 w-4" /> Add Lead
        </button>
      </div>

      <FollowUpReminderBanner
        leads={tracker.leads}
        onSelectLead={tracker.setSelectedLeadForDrawer}
      />

      <WorkStatsSummary
        pendingTasksCount={tracker.pendingTasksCount}
        upcomingVisitsCount={tracker.upcomingVisitsCount}
        assignedLeadsCount={tracker.leads.length}
        logsSubmittedCount={tracker.workLogs.length}
      />

      <WorkTabNavigation
        activeTab={tracker.activeTab}
        onTabChange={tracker.setActiveTab}
        counts={{
          tasks: tracker.pendingTasksCount,
          siteVisits: tracker.upcomingVisitsCount,
          leads: tracker.leads.length,
          logs: tracker.workLogs.length,
        }}
      />

      <WorkTabContent tracker={tracker} />
      <WorkModalsContainer tracker={tracker} />
    </div>
  );
}
