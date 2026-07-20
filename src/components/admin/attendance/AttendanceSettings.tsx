'use client';

import { useState, useEffect } from 'react';
import { Save, Clock } from 'lucide-react';
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
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-brand-navy font-serif text-xl font-semibold dark:text-white">
          Timing Rules
        </h2>
        <p className="text-xs text-gray-500">
          Configure global punch-in and punch-out timing windows.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <Clock size={16} className="text-emerald-500" /> Punch In Window
          </h3>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Start Time
              </label>
              <input
                type="time"
                value={settings.punch_in_start}
                onChange={(e) => setSettings({ ...settings, punch_in_start: e.target.value })}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-gray-400">Earliest allowed punch-in time.</p>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Cutoff Time (Late)
              </label>
              <input
                type="time"
                value={settings.punch_in_cutoff}
                onChange={(e) => setSettings({ ...settings, punch_in_cutoff: e.target.value })}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-amber-500">
                After this time, punch-in is blocked.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <Clock size={16} className="text-rose-500" /> Punch Out Window
          </h3>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Start Time
              </label>
              <input
                type="time"
                value={settings.punch_out_start}
                onChange={(e) => setSettings({ ...settings, punch_out_start: e.target.value })}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                End Time
              </label>
              <input
                type="time"
                value={settings.punch_out_end}
                onChange={(e) => setSettings({ ...settings, punch_out_end: e.target.value })}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
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
