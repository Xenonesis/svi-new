'use client';

import React from 'react';
import { Calendar, Search, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import type { Team } from '@/src/lib/supabase/types';

interface TimesheetFilterBarProps {
  dateFilter: string;
  setDateFilter: (date: string) => void;
  isCurrentDateToday: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  selectedTeam: string;
  setSelectedTeam: (teamId: string) => void;
  teams: (Team & { member_count: number })[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  statusCounts: {
    all: number;
    present: number;
    late: number;
    half_day: number;
    leave: number;
    absent: number;
  };
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function TimesheetFilterBar({
  dateFilter,
  setDateFilter,
  isCurrentDateToday,
  onPrevDay,
  onNextDay,
  onToday,
  selectedTeam,
  setSelectedTeam,
  teams,
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  statusCounts,
  hasActiveFilters,
  onResetFilters,
}: TimesheetFilterBarProps) {
  return (
    <div className="dark:bg-brand-dark-surface/80 flex flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs backdrop-blur-md dark:border-white/10">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Left Controls: Date cluster + Team dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Date Navigator */}
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50/80 p-1 dark:border-white/10 dark:bg-[#111118]">
            <button
              type="button"
              onClick={onPrevDay}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              title="Previous Day"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="relative flex items-center gap-1.5 px-2">
              <Calendar className="text-brand-gold h-3.5 w-3.5 shrink-0" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="cursor-pointer bg-transparent text-xs font-bold text-gray-800 focus:outline-none dark:text-gray-200"
              />
            </div>

            <button
              type="button"
              onClick={onNextDay}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              title="Next Day"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {!isCurrentDateToday && (
              <button
                type="button"
                onClick={onToday}
                className="border-brand-gold/30 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 ml-1 cursor-pointer rounded-lg border px-2 py-1 text-[11px] font-bold transition-all"
              >
                Today
              </button>
            )}
          </div>

          {/* Team Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="focus:border-brand-gold focus:ring-brand-gold/30 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/80 py-2 pr-8 pl-3 text-xs font-semibold text-gray-800 transition-all focus:bg-white focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-200 dark:focus:bg-[#181824]"
            >
              <option value="">All Teams ({teams.length})</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Controls: Search bar + Filter reset */}
        <div className="flex flex-1 items-center gap-2 xl:max-w-md xl:justify-end">
          <div className="relative w-full">
            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff, email, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:border-brand-gold focus:ring-brand-gold/30 w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2 pr-8 pl-9 text-xs text-gray-800 placeholder-gray-400 transition-all focus:bg-white focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-200 dark:placeholder-gray-500 dark:focus:bg-[#181824]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute top-2.5 right-2.5 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 transition-all hover:bg-rose-500/20 dark:text-rose-400"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Status Segmented Pills with Live Counts */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3 dark:border-white/5">
        <span className="mr-1 text-[11px] font-bold text-gray-400 uppercase">Filter:</span>
        {[
          { id: 'all', label: 'All', count: statusCounts.all },
          { id: 'present', label: 'Present', count: statusCounts.present },
          { id: 'late', label: 'Late', count: statusCounts.late },
          { id: 'half_day', label: 'Half Day', count: statusCounts.half_day },
          { id: 'leave', label: 'Leave', count: statusCounts.leave },
          { id: 'absent', label: 'Absent', count: statusCounts.absent },
        ].map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setSelectedStatus(st.id)}
            className={clsx(
              'flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
              selectedStatus === st.id
                ? 'border-brand-gold/40 bg-brand-gold/15 text-brand-gold dark:bg-brand-gold/20 border shadow-xs'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
            )}
          >
            <span>{st.label}</span>
            <span
              className={clsx(
                'py-0.2 rounded-full px-1.5 text-[10px] font-bold',
                selectedStatus === st.id
                  ? 'bg-brand-gold/30 text-brand-navy dark:text-brand-gold'
                  : 'bg-gray-200/70 text-gray-600 dark:bg-white/10 dark:text-gray-400'
              )}
            >
              {st.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
