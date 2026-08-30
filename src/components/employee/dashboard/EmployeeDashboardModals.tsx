'use client';

import React from 'react';
import { AddTaskModal } from '@/src/components/employee/work/AddTaskModal';
import { ApplyLeaveModal } from '@/src/components/employee/attendance/history/ApplyLeaveModal';
import { SubmitShiftLogModal } from '@/src/components/employee/work/SubmitShiftLogModal';
import type { TaskItem } from '@/src/components/employee/work/types';

interface EmployeeDashboardModalsProps {
  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (open: boolean) => void;
  isApplyLeaveOpen: boolean;
  setIsApplyLeaveOpen: (open: boolean) => void;
  isSubmitLogOpen: boolean;
  setIsSubmitLogOpen: (open: boolean) => void;
  onCreateTask: (taskData: {
    title: string;
    description: string;
    priority: TaskItem['priority'];
    category: TaskItem['category'];
    due_date: string;
  }) => Promise<void>;
  onApplyLeave: (leaveData: {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
  }) => Promise<void>;
  onSubmitShiftLog: (logData: {
    summary_text: string;
    client_interactions_count: number;
    site_visits_conducted_count: number;
  }) => Promise<void>;
}

export function EmployeeDashboardModals({
  isAddTaskOpen,
  setIsAddTaskOpen,
  isApplyLeaveOpen,
  setIsApplyLeaveOpen,
  isSubmitLogOpen,
  setIsSubmitLogOpen,
  onCreateTask,
  onApplyLeave,
  onSubmitShiftLog,
}: EmployeeDashboardModalsProps) {
  return (
    <>
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={onCreateTask}
      />

      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        onSubmit={onApplyLeave}
      />

      <SubmitShiftLogModal
        isOpen={isSubmitLogOpen}
        onClose={() => setIsSubmitLogOpen(false)}
        onSubmit={onSubmitShiftLog}
      />
    </>
  );
}
