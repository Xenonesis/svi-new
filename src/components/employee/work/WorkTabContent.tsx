'use client';

import React from 'react';
import { TasksView } from './TasksView';
import { SiteVisitsView } from './SiteVisitsView';
import { LeadsView } from './LeadsView';
import { DailyLogsView } from './DailyLogsView';
import { BrandedLoadingState } from '@/src/components/employee/BrandedLoadingState';
import type { UseEmployeeWorkTrackerReturn } from './useEmployeeWorkTracker';

export interface WorkTabContentProps {
  tracker: UseEmployeeWorkTrackerReturn;
}

export function WorkTabContent({ tracker }: WorkTabContentProps) {
  if (tracker.loading) {
    return (
      <BrandedLoadingState
        message="Loading Work Assignments..."
        subMessage="Fetching tasks, customer leads, and scheduled site visits"
      />
    );
  }

  return (
    <>
      {tracker.activeTab === 'tasks' && (
        <TasksView
          tasks={tracker.tasks}
          onToggleTask={tracker.handleToggleTask}
          onDeleteTask={tracker.handleDeleteTask}
          onOpenAddModal={() => tracker.setShowAddTaskModal(true)}
        />
      )}

      {tracker.activeTab === 'site-visits' && (
        <SiteVisitsView
          siteVisits={tracker.siteVisits}
          onUpdateStatus={tracker.handleUpdateVisitStatus}
        />
      )}

      {tracker.activeTab === 'leads' && (
        <LeadsView
          leads={tracker.leads}
          onUpdateLeadStatus={tracker.handleUpdateLeadStatus}
          onSelectLead={tracker.setSelectedLeadForDrawer}
          onAddNewLead={() => tracker.setShowAddLeadModal(true)}
        />
      )}

      {tracker.activeTab === 'logs' && (
        <DailyLogsView
          workLogs={tracker.workLogs}
          onOpenSubmitModal={() => tracker.setShowAddLogModal(true)}
        />
      )}
    </>
  );
}
