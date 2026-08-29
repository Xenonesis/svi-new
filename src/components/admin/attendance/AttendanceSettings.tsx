'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { AttendanceSettingsMap } from '@/src/lib/supabase/types';

interface AttendanceSettingsProps {
  token: string;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

export default function AttendanceSettings({ token, showToast }: AttendanceSettingsProps) {
  const [settings, setSettings] = useState<AttendanceSettingsMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/attendance/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/attendance/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }
      showToast('success', 'Attendance settings updated successfully');
    } catch (err: any) {
      showToast('error', err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"></div>;
  if (!settings) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-brand-navy font-serif text-xl font-semibold dark:text-white">
          Timing Rules & Attendance Policy
        </h2>
        <p className="text-xs text-gray-500">
          Configure global punch-in, late arrival grace windows, half-day triggers, and salary
          calculation rules.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Punch In & Late Window */}
        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <Clock size={16} className="text-emerald-500" /> Punch In & Late Rules
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Shift Start Time
              </label>
              <input
                type="time"
                value={settings.punch_in_start || '09:00'}
                onChange={(e) => setSettings({ ...settings, punch_in_start: e.target.value })}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-gray-400">Earliest allowed punch-in time.</p>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-amber-600 uppercase dark:text-amber-400">
                Late Grace Cutoff Time
              </label>
              <input
                type="time"
                value={settings.punch_in_late_after || '09:15'}
                onChange={(e) => setSettings({ ...settings, punch_in_late_after: e.target.value })}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-amber-500">
                Punches after this time are marked as <strong>Late Arrival</strong>.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-rose-600 uppercase dark:text-rose-400">
                Half-Day Arrival Cutoff Time
              </label>
              <input
                type="time"
                value={settings.punch_in_cutoff || '10:30'}
                onChange={(e) => setSettings({ ...settings, punch_in_cutoff: e.target.value })}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-rose-500">
                After this time, punch-in is recorded as <strong>Half-Day (50% Salary)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Punch Out & Work Hours */}
        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <Clock size={16} className="text-rose-500" /> Punch Out & Duty Hours
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Standard Shift End Time
              </label>
              <input
                type="time"
                value={settings.punch_out_start || '17:00'}
                onChange={(e) => setSettings({ ...settings, punch_out_start: e.target.value })}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-gray-400">
                Regular shift completion time (8 hrs).
              </p>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Max Punch-Out End Time
              </label>
              <input
                type="time"
                value={settings.punch_out_end || '21:00'}
                onChange={(e) => setSettings({ ...settings, punch_out_end: e.target.value })}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-gray-400">
                Latest allowed daily punch-out window.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  Min Half-Day Hrs
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="12"
                  value={settings.min_hours_half_day ?? 4}
                  onChange={(e) =>
                    setSettings({ ...settings, min_hours_half_day: Number(e.target.value) || 4 })
                  }
                  className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-[9px] text-gray-400">&ge; 4h gives 50% salary.</p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  Min Full-Day Hrs
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="4"
                  max="16"
                  value={settings.min_hours_full_day ?? 8}
                  onChange={(e) =>
                    setSettings({ ...settings, min_hours_full_day: Number(e.target.value) || 8 })
                  }
                  className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-[9px] text-gray-400">&ge; 8h gives 100% salary.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Policy & Salary Calculation Preview */}
      <div className="border-brand-gold/30 bg-brand-gold/5 dark:border-brand-gold/20 dark:bg-brand-gold/10 rounded-2xl border p-4">
        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase dark:text-white">
          <CheckCircle2 size={14} className="text-emerald-500" />
          Live Attendance & Salary Impact Matrix
        </h4>
        <div className="mt-3 grid gap-2.5 text-xs sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 dark:border-emerald-900/50 dark:bg-emerald-950/40">
            <span className="font-bold text-emerald-800 dark:text-emerald-300">🟢 On-Time</span>
            <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
              {settings.punch_in_start || '09:00'} – {settings.punch_in_late_after || '09:15'}
            </p>
            <span className="mt-1 block text-[10px] font-bold text-emerald-900 dark:text-emerald-200">
              100% Day Salary
            </span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/40">
            <span className="font-bold text-amber-800 dark:text-amber-300">🟡 Late Arrival</span>
            <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
              {settings.punch_in_late_after || '09:15'} – {settings.punch_in_cutoff || '10:30'}
            </p>
            <span className="mt-1 block text-[10px] font-bold text-amber-900 dark:text-amber-200">
              100% Salary + Late Flag
            </span>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-2.5 dark:border-orange-900/50 dark:bg-orange-950/40">
            <span className="font-bold text-orange-800 dark:text-orange-300">🟠 Half Day</span>
            <p className="mt-0.5 text-[11px] text-orange-700 dark:text-orange-400">
              After {settings.punch_in_cutoff || '10:30'} OR &ge; {settings.min_hours_half_day ?? 4}
              h
            </p>
            <span className="mt-1 block text-[10px] font-bold text-orange-900 dark:text-orange-200">
              50% Day Salary (0.5 LOP)
            </span>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 dark:border-rose-900/50 dark:bg-rose-950/40">
            <span className="font-bold text-rose-800 dark:text-rose-300">🔴 Absent / LOP</span>
            <p className="mt-0.5 text-[11px] text-rose-700 dark:text-rose-400">
              No Punch OR &lt; {settings.min_hours_half_day ?? 4}h worked
            </p>
            <span className="mt-1 block text-[10px] font-bold text-rose-900 dark:text-rose-200">
              0% Day Salary (1.0 LOP)
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-800">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50"
        >
          {saving ? (
            <span className="border-brand-navy h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          ) : (
            <Save size={16} />
          )}
          Save Settings
        </button>
      </div>
    </div>
  );
}
