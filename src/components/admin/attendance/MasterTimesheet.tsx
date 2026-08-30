'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import type { Team } from '@/src/lib/supabase/types';

import { type TimesheetRecord, type TimesheetMetrics } from './timesheet/types';
import { exportTimesheetCSV } from './timesheet/exportTimesheetCSV';
import { TimesheetKpiGrid } from './timesheet/TimesheetKpiGrid';
import { TimesheetFilterBar } from './timesheet/TimesheetFilterBar';
import { TimesheetTable } from './timesheet/TimesheetTable';
import { TimesheetWorkLogModal } from './timesheet/TimesheetWorkLogModal';
import { TimesheetEditModal } from './timesheet/TimesheetEditModal';

export type { TimesheetRecord };

interface MasterTimesheetProps {
  token: string;
  teams: (Team & { member_count: number })[];
}

export default function MasterTimesheet({ token, teams }: MasterTimesheetProps) {
  const [records, setRecords] = useState<TimesheetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>(todayStr);
  const [dateTo, setDateTo] = useState<string>('');

  // Modals
  const [editingRecord, setEditingRecord] = useState<TimesheetRecord | null>(null);
  const [viewingWorkLog, setViewingWorkLog] = useState<TimesheetRecord | null>(null);
  const [editStatus, setEditStatus] = useState<'present' | 'absent' | 'half_day' | 'leave'>(
    'present'
  );
  const [editNotes, setEditNotes] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchRecords = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      try {
        const params = new URLSearchParams();
        if (selectedTeam) params.set('team_id', selectedTeam);
        if (dateFilter && !dateTo) params.set('date', dateFilter);
        if (dateFilter && dateTo) {
          params.set('from', dateFilter);
          params.set('to', dateTo);
        }

        const res = await fetch(`/api/admin/attendance/records?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setRecords(data.records || []);
        } else {
          toast.error('Failed to load timesheet records');
        }
      } catch {
        toast.error('Network error loading timesheet');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, selectedTeam, dateFilter, dateTo]
  );

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const d = new Date(dateFilter || todayStr);
    d.setDate(d.getDate() - 1);
    setDateFilter(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(dateFilter || todayStr);
    d.setDate(d.getDate() + 1);
    setDateFilter(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setDateFilter(todayStr);
  };

  const isCurrentDateToday = dateFilter === todayStr;

  // Handle Edit Submission
  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setSubmittingEdit(true);

    try {
      const res = await fetch('/api/admin/attendance/records', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          record_id: editingRecord.id,
          status: editStatus,
          notes: editNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Attendance status updated successfully');
        setRecords((prev) =>
          prev.map((r) =>
            r.id === editingRecord.id
              ? {
                  ...r,
                  status: editStatus,
                  notes: editNotes,
                }
              : r
          )
        );
        setEditingRecord(null);
      } else {
        toast.error(data.error || 'Failed to update record');
      }
    } catch {
      toast.error('Network error while saving');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Team filter
      if (selectedTeam && r.team_id !== selectedTeam) return false;

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'late') {
          if (!r.is_late || r.status !== 'present') return false;
        } else if (r.status !== selectedStatus) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.full_name?.toLowerCase().includes(q);
        const matchesEmail = r.email?.toLowerCase().includes(q);
        const matchesTeam = r.team_name?.toLowerCase().includes(q);
        const matchesNotes = r.notes?.toLowerCase().includes(q);
        const matchesSummary = r.work_log?.summary?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesTeam && !matchesNotes && !matchesSummary) {
          return false;
        }
      }

      return true;
    });
  }, [records, selectedTeam, selectedStatus, searchQuery]);

  // Status Counts for Toolbar Pills
  const statusCounts = useMemo(() => {
    let present = 0;
    let late = 0;
    let half_day = 0;
    let leave = 0;
    let absent = 0;

    for (const r of records) {
      if (r.status === 'present') {
        present++;
        if (r.is_late) late++;
      } else if (r.status === 'half_day') {
        half_day++;
      } else if (r.status === 'leave') {
        leave++;
      } else if (r.status === 'absent') {
        absent++;
      }
    }

    return {
      all: records.length,
      present,
      late,
      half_day,
      leave,
      absent,
    };
  }, [records]);

  // Overall KPI Metrics for Filtered Set
  const metrics: TimesheetMetrics = useMemo(() => {
    let present = 0;
    let late = 0;
    let halfDay = 0;
    let leave = 0;
    let absent = 0;
    let totalCalls = 0;
    let totalVisits = 0;
    let totalHours = 0;

    for (const r of filteredRecords) {
      if (r.status === 'present') {
        present++;
        if (r.is_late) late++;
      } else if (r.status === 'half_day') {
        halfDay++;
      } else if (r.status === 'leave') {
        leave++;
      } else if (r.status === 'absent') {
        absent++;
      }

      if (r.work_log) {
        totalCalls += r.work_log.client_calls || 0;
        totalVisits += r.work_log.site_visits || 0;
      }

      if (r.total_hours) {
        totalHours += Number(r.total_hours);
      }
    }

    const presentRate =
      filteredRecords.length > 0 ? Math.round((present / filteredRecords.length) * 100) : 0;
    const lateRate = present > 0 ? Math.round((late / present) * 100) : 0;

    return {
      total: filteredRecords.length,
      present,
      late,
      halfDay,
      leave,
      absent,
      totalCalls,
      totalVisits,
      totalHours: totalHours.toFixed(1),
      presentRate,
      lateRate,
    };
  }, [filteredRecords]);

  // Active filters check
  const hasActiveFilters = Boolean(
    searchQuery || selectedTeam || selectedStatus !== 'all' || dateFilter !== todayStr
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTeam('');
    setSelectedStatus('all');
    setDateFilter(todayStr);
  };

  const handleExport = () => {
    exportTimesheetCSV(filteredRecords, dateFilter);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold dark:border-brand-gold/20 dark:bg-brand-gold/15 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              <Sparkles className="h-3 w-3" />
              Timesheet Intelligence
            </span>
            {isCurrentDateToday && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live Today
              </span>
            )}
          </div>
          <h2 className="text-brand-navy mt-1.5 font-serif text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
            Master Timesheet <span className="text-brand-gold italic">&amp; Shift Logs</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Granular shift tracking, geofence radius verifications, client calls, and field activity
            records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            disabled={filteredRecords.length === 0}
            className="dark:bg-brand-dark-surface/80 flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-xs transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Download className="h-3.5 w-3.5 text-gray-400 dark:text-gray-300" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => fetchRecords(true)}
            disabled={refreshing || loading}
            className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all hover:shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={clsx('h-3.5 w-3.5', (refreshing || loading) && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <TimesheetKpiGrid metrics={metrics} />

      {/* Advanced Filter & Navigation Toolbar */}
      <TimesheetFilterBar
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        isCurrentDateToday={isCurrentDateToday}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        teams={teams}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        statusCounts={statusCounts}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Main Timesheet Table */}
      <TimesheetTable
        records={filteredRecords}
        loading={loading}
        dateFilter={dateFilter}
        todayStr={todayStr}
        isCurrentDateToday={isCurrentDateToday}
        hasActiveFilters={hasActiveFilters}
        onToday={handleToday}
        onResetFilters={handleResetFilters}
        onViewWorkLog={(rec) => setViewingWorkLog(rec)}
        onEditRecord={(rec) => {
          setEditingRecord(rec);
          const nextStatus =
            rec.status === 'absent' || rec.status === 'half_day' || rec.status === 'leave'
              ? rec.status
              : 'present';
          setEditStatus(nextStatus);
          setEditNotes(rec.notes || '');
        }}
      />

      {/* View Work Log Modal */}
      <TimesheetWorkLogModal record={viewingWorkLog} onClose={() => setViewingWorkLog(null)} />

      {/* Edit Record Modal */}
      <TimesheetEditModal
        editingRecord={editingRecord}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        submittingEdit={submittingEdit}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
