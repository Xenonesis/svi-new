'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Download,
  Edit2,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Navigation,
  FileText,
  User,
  ChevronDown,
  RefreshCw,
  X,
  AlertTriangle,
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

export default function MasterTimesheet({ token, teams }: MasterTimesheetProps) {
  const [records, setRecords] = useState<TimesheetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
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

  // Aggregate Metrics for Top Bar
  const metrics = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter((r) => r.status === 'present').length;
    const late = filteredRecords.filter((r) => r.is_late).length;
    const totalCalls = filteredRecords.reduce((acc, r) => acc + (r.work_log?.client_calls || 0), 0);
    const totalVisits = filteredRecords.reduce((acc, r) => acc + (r.work_log?.site_visits || 0), 0);
    const totalHours = filteredRecords.reduce((acc, r) => acc + (r.total_hours || 0), 0);

    return { total, present, late, totalCalls, totalVisits, totalHours: totalHours.toFixed(1) };
  }, [filteredRecords]);

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
      'Punch In Geofence',
      'Punch Out Time',
      'Punch Out Geofence',
      'Total Hours',
      'Late Arrival',
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
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Master Timesheet & Daily Shift Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Granular shift tracking, geofence radius verifications, client calls, and site visits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => fetchRecords(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={clsx('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-500">Total Records</span>
          <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">
            {metrics.total}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 dark:bg-emerald-500/10">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Present
          </span>
          <div className="mt-1 text-xl font-black text-emerald-700 dark:text-emerald-300">
            {metrics.present}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 dark:bg-amber-500/10">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            Late Arrivals
          </span>
          <div className="mt-1 text-xl font-black text-amber-700 dark:text-amber-300">
            {metrics.late}
          </div>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 dark:bg-blue-500/10">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
            Total Hours
          </span>
          <div className="mt-1 text-xl font-black text-blue-700 dark:text-blue-300">
            {metrics.totalHours}h
          </div>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5 dark:bg-purple-500/10">
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
            Client Calls
          </span>
          <div className="mt-1 text-xl font-black text-purple-700 dark:text-purple-300">
            {metrics.totalCalls}
          </div>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 dark:bg-rose-500/10">
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
            Site Visits
          </span>
          <div className="mt-1 text-xl font-black text-rose-700 dark:text-rose-300">
            {metrics.totalVisits}
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Team Dropdown */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
            {[
              { id: 'all', label: 'All' },
              { id: 'present', label: 'Present' },
              { id: 'late', label: 'Late' },
              { id: 'half_day', label: 'Half Day' },
              { id: 'leave', label: 'Leave' },
              { id: 'absent', label: 'Absent' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={clsx(
                  'rounded-md px-2 py-1 transition-all',
                  selectedStatus === st.id
                    ? 'bg-white font-bold text-slate-900 shadow-xs dark:bg-slate-600 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Main Timesheet Table */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-xs text-slate-400">Loading master timesheet...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <Clock className="h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            No attendance records found
          </p>
          <p className="text-xs text-slate-400">Try adjusting the date, team, or status filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Employee & Team</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Punch-In Details</th>
                  <th className="px-4 py-3">Punch-Out Details</th>
                  <th className="px-4 py-3">Hours & Punctuality</th>
                  <th className="px-4 py-3">Work Log & Field Activity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    {/* Employee & Team */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {rec.full_name || 'Staff Member'}
                      </div>
                      <div className="text-[11px] text-slate-400">{rec.email || 'employee'}</div>
                      <span className="mt-1 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {rec.team_name}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {format(new Date(rec.date), 'dd MMM yyyy')}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize',
                          rec.status === 'present' &&
                            (rec.is_late
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'),
                          rec.status === 'half_day' &&
                            'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                          rec.status === 'leave' &&
                            'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                          rec.status === 'absent' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                          rec.status === 'pending' && 'bg-slate-500/10 text-slate-500'
                        )}
                      >
                        {rec.status === 'present' && (rec.is_late ? 'Late Present' : 'Present')}
                        {rec.status !== 'present' && rec.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Punch In */}
                    <td className="px-4 py-3.5">
                      {rec.punch_in_time ? (
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
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
                            <MapPin className="h-2.5 w-2.5" />
                            {rec.is_geofence_verified
                              ? `Verified (${rec.geofence_distance_meters ?? 0}m)`
                              : 'Out of Range'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Punch Out */}
                    <td className="px-4 py-3.5">
                      {rec.punch_out_time ? (
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {format(new Date(rec.punch_out_time), 'hh:mm:ss a')}
                          </div>
                          <span
                            className={clsx(
                              'mt-0.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                              rec.punch_out_geofence_verified
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            )}
                          >
                            <MapPin className="h-2.5 w-2.5" />
                            {rec.punch_out_geofence_verified ? 'Verified' : 'Standard'}
                          </span>
                        </div>
                      ) : (
                        <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          Shift in Progress
                        </span>
                      )}
                    </td>

                    {/* Hours & Punctuality */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rec.total_hours !== null && rec.total_hours !== undefined
                          ? `${rec.total_hours} hrs`
                          : '—'}
                      </div>
                      {rec.is_late ? (
                        <span className="mt-0.5 inline-block text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          Late by cutoff rule
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
                            className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                            title="Read summary"
                          >
                            <FileText className="h-2.5 w-2.5" />
                            Summary
                          </button>
                        )}
                        {!rec.work_log.summary &&
                          rec.work_log.client_calls === 0 &&
                          rec.work_log.site_visits === 0 && (
                            <span className="text-[11px] text-slate-400">No shift log</span>
                          )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setEditingRecord(rec);
                          setEditStatus(rec.status === 'pending' ? 'present' : (rec.status as any));
                          setEditNotes(rec.notes || '');
                        }}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-xs transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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

      {/* VIEW WORK LOG MODAL */}
      {viewingWorkLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Work Summary
              </h3>
              <button
                onClick={() => setViewingWorkLog(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Submitted by {viewingWorkLog.full_name} for{' '}
              {format(new Date(viewingWorkLog.date), 'dd MMMM yyyy')}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 dark:bg-purple-500/10">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                  Client Interactions / Calls
                </span>
                <div className="text-lg font-black text-purple-700 dark:text-purple-300">
                  {viewingWorkLog.work_log.client_calls}
                </div>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 dark:bg-rose-500/10">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  Property Site Visits
                </span>
                <div className="text-lg font-black text-rose-700 dark:text-rose-300">
                  {viewingWorkLog.work_log.site_visits}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Shift Activity Summary
              </span>
              <div className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200">
                {viewingWorkLog.work_log.summary || 'No summary text provided.'}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingWorkLog(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Manual Attendance Adjustment
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Employee: {editingRecord.full_name} • Date: {editingRecord.date}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Attendance Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="present">Present</option>
                  <option value="half_day">Half Day</option>
                  <option value="leave">On Leave</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Admin Audit Remarks / Reason
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Biometric system delay, marked manually after verification."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingRecord(null)}
                disabled={submittingEdit}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={submittingEdit}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700"
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
