'use client';

import { Calendar, CheckCircle2, Save, UserCheck, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import type { AttendanceStatus, Team, TeamMember } from '@/src/lib/supabase/types';

interface MarkAttendanceProps {
  token: string;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    color: string;
    hoverColor: string;
    activeColor: string;
    icon: typeof CheckCircle2;
  }
> = {
  present: {
    label: 'Present',
    color: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    hoverColor: 'hover:bg-emerald-500/20',
    activeColor: 'border-emerald-500 bg-emerald-500 text-white',
    icon: CheckCircle2,
  },
  absent: {
    label: 'Absent',
    color: 'border-red-500/20 bg-red-500/10 text-red-400',
    hoverColor: 'hover:bg-red-500/20',
    activeColor: 'border-red-500 bg-red-500 text-white',
    icon: XCircle,
  },
  half_day: {
    label: 'Half Day',
    color: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
    hoverColor: 'hover:bg-yellow-500/20',
    activeColor: 'border-yellow-500 bg-yellow-500 text-white',
    icon: Calendar,
  },
  leave: {
    label: 'Leave',
    color: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    hoverColor: 'hover:bg-blue-500/20',
    activeColor: 'border-blue-500 bg-blue-500 text-white',
    icon: UserCheck,
  },
};

export default function MarkAttendance({ token, showToast }: MarkAttendanceProps) {
  const [teams, setTeams] = useState<(Team & { member_count: number })[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [membersLoaded, setMembersLoaded] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('/api/admin/attendance/teams', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setTeams(data.teams || []))
        .catch(console.error);
    }
  }, [token]);

  const loadAttendance = async () => {
    if (!selectedTeam || !selectedDate) return;
    setLoading(true);
    setMembersLoaded(false);

    try {
      // Fetch team members
      const membersRes = await fetch(`/api/admin/attendance/teams/${selectedTeam}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const membersData = await membersRes.json();
      setMembers(membersData.members || []);

      // Fetch existing attendance for this date
      const recordsRes = await fetch(
        `/api/admin/attendance/records?team_id=${selectedTeam}&date=${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const recordsData = await recordsRes.json();

      // Populate attendance state
      const existingAttendance: Record<string, { status: AttendanceStatus; notes: string }> = {};
      for (const r of recordsData.records || []) {
        existingAttendance[r.user_id] = { status: r.status, notes: r.notes || '' };
      }
      setAttendance(existingAttendance);
      setMembersLoaded(true);
    } catch {
      showToast('error', 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeam && selectedDate) {
      loadAttendance();
    } else {
      setMembersLoaded(false);
      setMembers([]);
      setAttendance({});
    }
  }, [selectedTeam, selectedDate]);

  const setStatus = (userId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [userId]: { status, notes: prev[userId]?.notes || '' },
    }));
  };

  const setNotes = (userId: string, notes: string) => {
    setAttendance((prev) => ({
      ...prev,
      [userId]: { status: prev[userId]?.status || 'present', notes },
    }));
  };

  const handleSave = async () => {
    if (!selectedTeam || !selectedDate || Object.keys(attendance).length === 0) return;
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([userId, entry]) => ({
        team_id: selectedTeam,
        user_id: userId,
        date: selectedDate,
        status: entry.status,
        notes: entry.notes || undefined,
      }));

      const res = await fetch('/api/admin/attendance/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ records }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast('success', `Attendance saved for ${records.length} member(s).`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-brand-navy font-serif text-xl font-semibold tracking-tight dark:text-white">
          Mark Attendance
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select a team and date to mark daily attendance
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Select Team
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
          >
            <option value="">Choose a team...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.member_count} members)
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 bg-white/80 px-5 py-4 dark:border-white/8 dark:bg-[#0e0e14]/65"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/5" />
                  <div className="h-3 w-40 rounded bg-gray-200 dark:bg-white/5" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-white/5" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : membersLoaded && members.length === 0 ? (
        <div className="py-16 text-center">
          <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            This team has no members yet.
          </p>
        </div>
      ) : membersLoaded && members.length > 0 ? (
        <>
          <div className="space-y-3">
            {members.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65"
              >
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {m.full_name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{m.email}</span>
                </div>
                <div className="flex gap-2">
                  {(
                    Object.entries(STATUS_CONFIG) as [
                      AttendanceStatus,
                      (typeof STATUS_CONFIG)['present'],
                    ][]
                  ).map(([status, config]) => {
                    const Icon = config.icon;
                    const isActive = attendance[m.user_id]?.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setStatus(m.user_id, status)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold tracking-wider uppercase transition-all ${
                          isActive
                            ? `${config.activeColor} shadow-lg`
                            : `${config.color} ${config.hoverColor}`
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
                {attendance[m.user_id]?.status && (
                  <input
                    type="text"
                    value={attendance[m.user_id]?.notes || ''}
                    onChange={(e) => setNotes(m.user_id, e.target.value)}
                    placeholder="Optional notes..."
                    className="focus:border-brand-gold mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 transition-all focus:outline-none sm:mt-0 sm:ml-4 sm:w-48 dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
                  />
                )}
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(attendance).length === 0}
              className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center gap-2 rounded-lg px-8 py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:opacity-60"
            >
              {saving ? (
                <span className="border-brand-navy/45 border-t-brand-navy h-4 w-4 animate-spin rounded-full border-2" />
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Attendance
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="py-16 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Select a team and date to mark attendance.
          </p>
        </div>
      )}
    </div>
  );
}
