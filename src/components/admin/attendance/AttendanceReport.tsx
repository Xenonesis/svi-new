'use client';

import { BarChart3, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import type { AttendanceReportRow, Team } from '@/src/lib/supabase/types';

interface AttendanceReportProps {
  token: string;
  showToast: (type: 'success' | 'error', msg: string) => void;
  teams: (Team & { member_count: number })[];
  teamsLoading: boolean;
}

export default function AttendanceReport({ token, showToast, teams }: AttendanceReportProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [report, setReport] = useState<AttendanceReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (selectedTeam) params.set('team_id', selectedTeam);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);

      const res = await fetch(`/api/admin/attendance/report?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      const json = await res.json();
      setReport(json.report || []);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 90) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (pct >= 75) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-brand-navy font-serif text-xl font-semibold tracking-tight dark:text-white">
          Attendance Report
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          View attendance summary by team and date range
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Team
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
          >
            <option value="">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
          />
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:opacity-60"
        >
          {loading ? (
            <span className="border-brand-navy/45 border-t-brand-navy h-4 w-4 animate-spin rounded-full border-2" />
          ) : (
            <>
              <Search className="h-4 w-4" /> Generate
            </>
          )}
        </button>
      </div>

      {!hasSearched ? (
        <div className="py-16 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Apply filters and click Generate to view the report.
          </p>
        </div>
      ) : loading ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/80 dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="dark:border-brand-gold/15 border-b border-gray-200 bg-gray-50/50 dark:bg-white/2">
                  {[
                    'Name',
                    'Email',
                    'Present',
                    'Absent',
                    'Half Day',
                    'Leave',
                    'Total Days',
                    'Attendance %',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-[9px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    className="animate-pulse border-b border-gray-100 dark:border-white/5"
                  >
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-36 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-8 rounded-full bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-8 rounded-full bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-8 rounded-full bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-8 rounded-full bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-10 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-14 rounded-full bg-gray-200 dark:bg-white/5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : report.length === 0 ? (
        <div className="py-16 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No attendance records found for the selected filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="dark:border-brand-gold/15 border-b border-gray-200 bg-gray-50/50 dark:bg-white/2">
                  {[
                    'Name',
                    'Email',
                    'Present',
                    'Absent',
                    'Half Day',
                    'Leave',
                    'Total Days',
                    'Attendance %',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-[9px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.map((row, i) => (
                  <motion.tr
                    key={row.user_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.4 }}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-[#111118]/60"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {row.full_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{row.email}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                        {row.present}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                        {row.absent}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-bold text-yellow-400">
                        {row.half_day}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                        {row.leave}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {row.total_days}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getPercentageColor(row.attendance_percentage)}`}
                      >
                        {row.attendance_percentage}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
