'use client';

import React, { useState } from 'react';
import { Plus, Check, Clock, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import type { TaskItem } from './types';

interface TasksViewProps {
  tasks: TaskItem[];
  onToggleTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddModal: () => void;
}

export function TasksView({ tasks, onToggleTask, onDeleteTask, onOpenAddModal }: TasksViewProps) {
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (taskStatusFilter === 'pending') return t.status !== 'completed';
    if (taskStatusFilter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter and Add Action */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(['all', 'pending', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTaskStatusFilter(filter)}
              className={clsx(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors',
                taskStatusFilter === filter
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500"
        >
          <Plus className="h-3.5 w-3.5" /> Add Task
        </button>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={clsx(
                'flex items-start justify-between rounded-2xl border p-4 shadow-sm transition-all',
                task.status === 'completed'
                  ? 'border-slate-200 bg-slate-50/70 opacity-70 dark:border-slate-800/60 dark:bg-slate-900/30'
                  : 'border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/70'
              )}
            >
              <div className="mr-2 flex min-w-0 flex-1 items-start gap-3">
                <button
                  onClick={() => onToggleTask(task)}
                  className={clsx(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                    task.status === 'completed'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 text-transparent hover:border-blue-500 hover:text-blue-500 dark:border-slate-700'
                  )}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </button>

                <div className="min-w-0">
                  <p
                    className={clsx(
                      'text-xs font-semibold text-slate-900 dark:text-white',
                      task.status === 'completed' &&
                        'text-slate-500 line-through dark:text-slate-400'
                    )}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={clsx(
                        'rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase',
                        task.priority === 'urgent' &&
                          'bg-red-500/10 text-red-600 dark:text-red-400',
                        task.priority === 'high' &&
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                        task.priority === 'medium' &&
                          'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                        task.priority === 'low' &&
                          'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      {task.priority}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 capitalize dark:bg-slate-800 dark:text-slate-400">
                      {task.category.replace('_', ' ')}
                    </span>
                    {task.due_date && (
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                        <Clock className="h-2.5 w-2.5" /> Due{' '}
                        {format(parseISO(task.due_date), 'MMM dd')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                aria-label="Delete Task"
                className="p-1 text-slate-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
          No tasks found in this view.
        </div>
      )}
    </div>
  );
}
