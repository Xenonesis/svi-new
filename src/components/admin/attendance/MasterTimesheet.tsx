'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Download,
  Edit2,
  PhoneCall,
  Navigation,
  FileText,
  RefreshCw,
  X,
  AlertTriangle,
  Users,
  UserCheck,
  Hourglass,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import type { Team } from '@/src/lib/supabase/types';

export interface TimesheetRecord {
  id: string;
  team_id: string;
  team_name: string;
  user_id: string;
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'leave' | 'pending';
  notes?: string | null;
  punch_in_time?: string | null;
  punch_out_time?: string | null;
  total_hours?: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
  punch_out_geofence_verified: boolean;
  geofence_distance_meters?: number | null;
  full_name: string;
  email: string;
  work_log: {
    summary: string | null;
    client_calls: number;
    site_visits: number;
  };
}

interface MasterTimesheetProps {
  token: string;
  teams: (Team & { member_count: number })[];
}

function getInitials(name: string) {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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
          id: editingRecord.id,
          status: editStatus,
          notes: editNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Attendance record updated successfully');
        setEditingRecord(null);
        fetchRecords(true);
      } else {
        toast.error(data.error?.message || data.error || 'Failed to update record');
      }
    } catch {
      toast.error('Error saving adjustments');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'late' ? r.is_late : r.status === selectedStatus);

      const matchesSearch =
        !searchQuery ||
        r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.team_name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [records, selectedStatus, searchQuery]);

  // Status Category Counts (for status pills)
  const statusCounts = useMemo(() => {
    return {
      all: records.length,
      present: records.filter((r) => r.status === 'present').length,
      late: records.filter((r) => r.is_late).length,
      half_day: records.filter((r) => r.status === 'half_day').length,
      leave: records.filter((r) => r.status === 'leave').length,
      absent: records.filter((r) => r.status === 'absent').length,
    };
  }, [records]);

  // Aggregate Metrics for Top Bar
  const metrics = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter((r) => r.status === 'present').length;
    const late = filteredRecords.filter((r) => r.is_late).length;
    const totalCalls = filteredRecords.reduce((acc, r) => acc + (r.work_log?.client_calls || 0), 0);
    const totalVisits = filteredRecords.reduce((acc, r) => acc + (r.work_log?.site_visits || 0), 0);
    const totalHours = filteredRecords.reduce((acc, r) => acc + (r.total_hours || 0), 0);
    const presentRate = total > 0 ? Math.round((present / total) * 100) : 0;
    const lateRate = present > 0 ? Math.round((late / present) * 100) : 0;

    return {
      total,
      present,
      late,
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

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export');
      return;
    }

    const headers = [
      'Employee Name',
      'Email',
      'Team',
      'Date',
      'Status',
      'Punch In Time',
      'Punch In Verified',
      'Punch Out Time',
      'Punch Out Verified',
      'Total Hours',
      'Is Late',
      'Client Calls',
      'Site Visits',
      'Daily Work Summary',
      'Admin Notes',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.full_name}"`,
      `"${r.email}"`,
      `"${r.team_name}"`,
      r.date,
      r.status,
      r.punch_in_time ? format(new Date(r.punch_in_time), 'hh:mm:ss a') : 'N/A',
      r.is_geofence_verified ? 'Verified' : 'Unverified',
      r.punch_out_time ? format(new Date(r.punch_out_time), 'hh:mm:ss a') : 'N/A',
      r.punch_out_geofence_verified ? 'Verified' : 'Unverified',
      r.total_hours || '0',
      r.is_late ? 'Yes' : 'No',
      r.work_log?.client_calls || 0,
      r.work_log?.site_visits || 0,
      `"${(r.work_log?.summary || '').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Timesheet_${dateFilter || 'report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Timesheet CSV downloaded successfully');
  };

  return (
    <div className="space-y-6">
      {/* ──────────────── Top Header ──────────────── */}
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
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className="dark:bg-brand-dark-surface/80 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-xs transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Download className="h-3.5 w-3.5 text-gray-400 dark:text-gray-300" />
            Export CSV
          </button>
          <button
            onClick={() => fetchRecords(true)}
            disabled={refreshing || loading}
            className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all hover:shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={clsx('h-3.5 w-3.5', (refreshing || loading) && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* ──────────────── KPI Overview Cards ──────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {/* Total Records */}
        <div className="dark:bg-brand-dark-surface/70 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-slate-400/40 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Total Logs
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {metrics.total}
          </div>
          <p className="mt-0.5 text-[10px] font-medium text-gray-400">Tracked records</p>
        </div>

        {/* Present */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Present
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {metrics.present}
          </div>
          <p className="mt-0.5 text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
            {metrics.total > 0 ? `${metrics.presentRate}% on-duty` : 'No logs'}
          </p>
        </div>

        {/* Late Arrivals */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              Late Arrivals
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700 dark:text-amber-300">
            {metrics.late}
          </div>
          <p className="mt-0.5 text-[10px] font-medium text-amber-600/80 dark:text-amber-400/80">
            {metrics.present > 0 ? `${metrics.lateRate}% late rate` : 'None marked'}
          </p>
        </div>

        {/* Total Hours */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-blue-500/20 dark:bg-blue-500/10">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
              Total Hours
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Hourglass className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700 dark:text-blue-300">
            {metrics.totalHours}h
          </div>
          <p className="mt-0.5 text-[10px] font-medium text-blue-600/80 dark:text-blue-400/80">
            Cumulative work
          </p>
        </div>

        {/* Client Calls */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-purple-500/20 dark:bg-purple-500/10">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
              Client Calls
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
              <PhoneCall className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700 dark:text-purple-300">
            {metrics.totalCalls}
          </div>
          <p className="mt-0.5 text-[10px] font-medium text-purple-600/80 dark:text-purple-400/80">
            Shift calls logged
          </p>
        </div>

        {/* Site Visits */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-rose-500/20 dark:bg-rose-500/10">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
              Site Visits
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <Navigation className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">
            {metrics.totalVisits}
          </div>
          <p className="mt-0.5 text-[10px] font-medium text-rose-600/80 dark:text-rose-400/80">
            Property visits
          </p>
        </div>
      </div>

      {/* ──────────────── Advanced Filter & Navigation Toolbar ──────────────── */}
      <div className="dark:bg-brand-dark-surface/80 flex flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs backdrop-blur-md dark:border-white/10">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Left Controls: Date cluster + Team dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Date Navigator */}
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50/80 p-1 dark:border-white/10 dark:bg-[#111118]">
              <button
                type="button"
                onClick={handlePrevDay}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
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
                onClick={handleNextDay}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                title="Next Day"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              {!isCurrentDateToday && (
                <button
                  type="button"
                  onClick={handleToday}
                  className="border-brand-gold/30 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 ml-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition-all"
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
                  className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex shrink-0 items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 transition-all hover:bg-rose-500/20 dark:text-rose-400"
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
              onClick={() => setSelectedStatus(st.id)}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
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

      {/* ──────────────── Main Timesheet Table ──────────────── */}
      {loading ? (
        <div className="dark:bg-brand-dark-surface/80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3.5">Staff &amp; Team</th>
                  <th className="px-4 py-3.5">Shift Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Punch-In Details</th>
                  <th className="px-4 py-3.5">Punch-Out Details</th>
                  <th className="px-4 py-3.5">Work Duration</th>
                  <th className="px-4 py-3.5">Work Log &amp; Field Activity</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-white/10" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 rounded-md bg-gray-200 dark:bg-white/10" />
                          <div className="h-2.5 w-36 rounded-md bg-gray-100 dark:bg-white/5" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-white/10" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
                        <div className="h-3 w-24 rounded-md bg-gray-100 dark:bg-white/5" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
                        <div className="h-3 w-20 rounded-md bg-gray-100 dark:bg-white/5" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-16 rounded-md bg-gray-200 dark:bg-white/10" />
                        <div className="h-2.5 w-14 rounded-md bg-gray-100 dark:bg-white/5" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-white/10" />
                        <div className="h-5 w-16 rounded-md bg-gray-100 dark:bg-white/5" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="ml-auto h-7 w-7 rounded-lg bg-gray-200 dark:bg-white/10" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="dark:bg-brand-dark-surface/60 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center dark:border-white/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-white/5">
            <Clock className="text-brand-gold h-7 w-7" />
          </div>
          <h4 className="text-brand-navy mt-4 font-serif text-base font-bold dark:text-white">
            No Attendance Logs Found
          </h4>
          <p className="mt-1 max-w-md text-xs text-gray-500 dark:text-gray-400">
            No employee check-ins or timesheet entries match the selected date (
            {format(new Date(dateFilter || todayStr), 'dd MMM yyyy')}) and active filters.
          </p>
          <div className="mt-5 flex items-center gap-2.5">
            {!isCurrentDateToday && (
              <button
                type="button"
                onClick={handleToday}
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all"
              >
                View Today&apos;s Timesheet
              </button>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="dark:bg-brand-dark-surface rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="dark:bg-brand-dark-surface/80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3.5">Staff &amp; Team</th>
                  <th className="px-4 py-3.5">Shift Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Punch-In Details</th>
                  <th className="px-4 py-3.5">Punch-Out Details</th>
                  <th className="px-4 py-3.5">Work Duration</th>
                  <th className="px-4 py-3.5">Work Log &amp; Field Activity</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/2"
                  >
                    {/* Employee & Team */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="from-brand-gold/30 to-brand-gold/10 text-brand-navy flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-serif text-xs font-bold dark:text-white">
                          {getInitials(rec.full_name)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-gray-900 dark:text-white">
                            {rec.full_name || 'Staff Member'}
                          </div>
                          <div className="truncate text-[11px] text-gray-400">
                            {rec.email || 'employee'}
                          </div>
                          <span className="mt-0.5 inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                            {rec.team_name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                      <div>{format(new Date(rec.date), 'dd MMM yyyy')}</div>
                      <span className="text-[10px] text-gray-400">
                        {format(new Date(rec.date), 'EEEE')}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize',
                          rec.status === 'present' &&
                            (rec.is_late
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'),
                          rec.status === 'half_day' &&
                            'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                          rec.status === 'leave' &&
                            'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                          rec.status === 'absent' &&
                            'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                          rec.status === 'pending' && 'bg-gray-500/10 text-gray-500'
                        )}
                      >
                        <span
                          className={clsx(
                            'h-1.5 w-1.5 rounded-full',
                            rec.status === 'present' &&
                              (rec.is_late ? 'bg-amber-500' : 'bg-emerald-500'),
                            rec.status === 'half_day' && 'bg-purple-500',
                            rec.status === 'leave' && 'bg-blue-500',
                            rec.status === 'absent' && 'bg-rose-500',
                            rec.status === 'pending' && 'bg-gray-400'
                          )}
                        />
                        {rec.status === 'present' && (rec.is_late ? 'Late Present' : 'Present')}
                        {rec.status !== 'present' && rec.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Punch In */}
                    <td className="px-4 py-3.5">
                      {rec.punch_in_time ? (
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-200">
                            {format(new Date(rec.punch_in_time), 'hh:mm:ss a')}
                          </div>
                          <span
                            className={clsx(
                              'mt-0.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                              rec.is_geofence_verified
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {rec.is_geofence_verified ? (
                              <ShieldCheck className="h-2.5 w-2.5" />
                            ) : (
                              <ShieldAlert className="h-2.5 w-2.5" />
                            )}
                            {rec.is_geofence_verified
                              ? `Verified (${rec.geofence_distance_meters ?? 0}m)`
                              : 'Out of Range'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Punch Out */}
                    <td className="px-4 py-3.5">
                      {rec.punch_out_time ? (
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-200">
                            {format(new Date(rec.punch_out_time), 'hh:mm:ss a')}
                          </div>
                          <span
                            className={clsx(
                              'mt-0.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                              rec.punch_out_geofence_verified
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                            )}
                          >
                            <MapPin className="h-2.5 w-2.5" />
                            {rec.punch_out_geofence_verified ? 'Verified' : 'Standard'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                          Shift Active
                        </span>
                      )}
                    </td>

                    {/* Hours & Punctuality */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {rec.total_hours !== null && rec.total_hours !== undefined
                          ? `${rec.total_hours} hrs`
                          : '—'}
                      </div>
                      {rec.is_late ? (
                        <span className="mt-0.5 inline-block text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          Late Arrival
                        </span>
                      ) : rec.punch_in_time ? (
                        <span className="mt-0.5 inline-block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          On Time ✓
                        </span>
                      ) : null}
                    </td>

                    {/* Work Log & Field Activity */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {rec.work_log.client_calls > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                            <PhoneCall className="h-2.5 w-2.5" />
                            {rec.work_log.client_calls} calls
                          </span>
                        )}
                        {rec.work_log.site_visits > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            <Navigation className="h-2.5 w-2.5" />
                            {rec.work_log.site_visits} visits
                          </span>
                        )}
                        {rec.work_log.summary && (
                          <button
                            onClick={() => setViewingWorkLog(rec)}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                            title="Read work summary"
                          >
                            <FileText className="h-2.5 w-2.5" />
                            Summary
                          </button>
                        )}
                        {!rec.work_log.summary &&
                          rec.work_log.client_calls === 0 &&
                          rec.work_log.site_visits === 0 && (
                            <span className="text-[11px] text-gray-400">No shift log</span>
                          )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setEditingRecord(rec);
                          const nextStatus =
                            rec.status === 'absent' ||
                            rec.status === 'half_day' ||
                            rec.status === 'leave'
                              ? rec.status
                              : 'present';
                          setEditStatus(nextStatus);
                          setEditNotes(rec.notes || '');
                        }}
                        className="rounded-xl border border-gray-200 bg-white p-1.5 text-gray-600 shadow-xs transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-[#161622] dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                        title="Edit attendance record"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────── VIEW WORK LOG MODAL ──────────────── */}
      {viewingWorkLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="dark:bg-brand-dark-surface w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-brand-navy font-serif text-base font-bold dark:text-white">
                Daily Work Summary
              </h3>
              <button
                onClick={() => setViewingWorkLog(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Submitted by{' '}
              <strong className="text-gray-800 dark:text-gray-200">
                {viewingWorkLog.full_name}
              </strong>{' '}
              for {format(new Date(viewingWorkLog.date), 'dd MMMM yyyy')}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 dark:bg-purple-500/10">
                <span className="text-[10px] font-bold text-purple-600 uppercase dark:text-purple-400">
                  Client Calls
                </span>
                <div className="text-xl font-black text-purple-700 dark:text-purple-300">
                  {viewingWorkLog.work_log.client_calls}
                </div>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 dark:bg-rose-500/10">
                <span className="text-[10px] font-bold text-rose-600 uppercase dark:text-rose-400">
                  Site Visits
                </span>
                <div className="text-xl font-black text-rose-700 dark:text-rose-300">
                  {viewingWorkLog.work_log.site_visits}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Shift Activity Summary
              </span>
              <div className="mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-xs leading-relaxed text-gray-800 dark:border-white/10 dark:bg-[#111118] dark:text-gray-200">
                {viewingWorkLog.work_log.summary || 'No summary text provided.'}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingWorkLog(null)}
                className="bg-brand-navy hover:bg-brand-navy-light rounded-xl px-5 py-2 text-xs font-bold text-white transition-all dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── EDIT RECORD MODAL ──────────────── */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="dark:bg-brand-dark-surface w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10">
            <h3 className="text-brand-navy font-serif text-base font-bold dark:text-white">
              Manual Attendance Adjustment
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Staff:{' '}
              <strong className="text-gray-800 dark:text-gray-200">
                {editingRecord.full_name}
              </strong>{' '}
              • Date: {editingRecord.date}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Attendance Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (
                      val === 'present' ||
                      val === 'absent' ||
                      val === 'half_day' ||
                      val === 'leave'
                    ) {
                      setEditStatus(val);
                    }
                  }}
                  className="focus:border-brand-gold focus:ring-brand-gold/30 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-200"
                >
                  <option value="present">Present</option>
                  <option value="half_day">Half Day</option>
                  <option value="leave">On Leave</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Admin Audit Remarks / Reason
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Biometric system delay, marked manually after verification."
                  rows={3}
                  className="focus:border-brand-gold focus:ring-brand-gold/30 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-200"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setEditingRecord(null)}
                disabled={submittingEdit}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={submittingEdit}
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy rounded-xl px-5 py-2 text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                {submittingEdit ? 'Saving...' : 'Save Adjustments'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
