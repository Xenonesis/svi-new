'use client';

import React from 'react';
import { AddTaskModal } from './AddTaskModal';
import { SubmitShiftLogModal } from './SubmitShiftLogModal';
import { AddLeadModal } from './AddLeadModal';
import { LeadTrackerDrawer } from './LeadTrackerDrawer';
import type {
  UseEmployeeWorkTrackerReturn,
  CreateTaskInput,
  CreateLogInput,
} from './useEmployeeWorkTracker';
import type { LeadItem } from './types';

export interface WorkModalsContainerProps {
  tracker?: UseEmployeeWorkTrackerReturn;
  showAddTaskModal?: boolean;
  setShowAddTaskModal?: (open: boolean) => void;
  handleCreateTask?: (taskData: CreateTaskInput) => Promise<void>;
  showAddLogModal?: boolean;
  setShowAddLogModal?: (open: boolean) => void;
  handleCreateLog?: (logData: CreateLogInput) => Promise<void>;
  showAddLeadModal?: boolean;
  setShowAddLeadModal?: (open: boolean) => void;
  selectedLeadForDrawer?: LeadItem | null;
  setSelectedLeadForDrawer?: (lead: LeadItem | null) => void;
  fetchData?: () => Promise<void>;
}

export function WorkModalsContainer({
  tracker,
  showAddTaskModal = tracker?.showAddTaskModal ?? false,
  setShowAddTaskModal = tracker?.setShowAddTaskModal ?? (() => {}),
  handleCreateTask = tracker?.handleCreateTask ?? (async () => {}),
  showAddLogModal = tracker?.showAddLogModal ?? false,
  setShowAddLogModal = tracker?.setShowAddLogModal ?? (() => {}),
  handleCreateLog = tracker?.handleCreateLog ?? (async () => {}),
  showAddLeadModal = tracker?.showAddLeadModal ?? false,
  setShowAddLeadModal = tracker?.setShowAddLeadModal ?? (() => {}),
  selectedLeadForDrawer = tracker?.selectedLeadForDrawer ?? null,
  setSelectedLeadForDrawer = tracker?.setSelectedLeadForDrawer ?? (() => {}),
  fetchData = tracker?.fetchData ?? (async () => {}),
}: WorkModalsContainerProps) {
  return (
    <>
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSubmit={handleCreateTask}
      />

      <SubmitShiftLogModal
        isOpen={showAddLogModal}
        onClose={() => setShowAddLogModal(false)}
        onSubmit={handleCreateLog}
      />

      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onLeadAdded={() => {
          void fetchData();
        }}
      />

      <LeadTrackerDrawer
        lead={selectedLeadForDrawer}
        isOpen={!!selectedLeadForDrawer}
        onClose={() => setSelectedLeadForDrawer(null)}
        onLeadUpdated={() => {
          void fetchData();
        }}
      />
    </>
  );
}
