'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Save } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';
import { defaultAnnouncementConfig, type AnnouncementConfig } from '@/src/config/announcement';

export function AnnouncementTab() {
  const [config, setConfig] = useState<AnnouncementConfig>(defaultAnnouncementConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('portal_settings')
          .select('value')
          .eq('key', 'announcement_bar')
          .single();

        if (!error && data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setConfig({
            ...defaultAnnouncementConfig,
            ...parsed,
          });
        }
      } catch (err) {
        console.error('Error fetching announcement setting:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetting();
  }, []);

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('portal_settings').upsert(
        {
          key: 'announcement_bar',
          value: config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

      if (error) throw error;
      toast.success('Announcement Bar settings saved successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center font-sans text-sm text-gray-500">
        Loading announcement settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/5">
        <div>
          <h2 className="text-brand-navy flex items-center gap-2 font-sans font-serif text-xl font-bold dark:text-white">
            <Megaphone className="h-5 w-5 text-[#22c55e]" />
            Announcement Bar Settings
          </h2>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Control the top announcement strip visible on the customer-facing website.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#22c55e] px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#16a34a] disabled:opacity-50"
        >
          {saving ? (
            'Saving...'
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Live Preview Box */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
        <span className="mb-2 block text-[11px] font-bold tracking-wider text-gray-400 uppercase">
          Live Preview
        </span>
        {config.enabled ? (
          <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#a3e635] px-4 py-2 text-slate-950 shadow-sm">
            <div className="flex flex-1 items-center justify-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-black uppercase">
                {config.badgeText || 'NEW'}
              </span>
              <span className="truncate">{config.text}</span>
              <span className="underline decoration-slate-950/40 underline-offset-4">
                {config.actionText} →
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 py-3 text-xs text-gray-400 dark:border-white/10">
            Announcement Bar is currently disabled (Hidden on website)
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Enable / Disable Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4 sm:col-span-2 dark:border-white/5 dark:bg-white/[0.01]">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Enable Announcement Bar
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Toggle to show or hide the announcement banner on the live website.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              config.enabled ? 'bg-[#22c55e]' : 'bg-gray-200 dark:bg-white/10'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                config.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Badge Text */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
            Badge Label (e.g. NEW, LIVE, OFFER)
          </label>
          <input
            type="text"
            value={config.badgeText}
            onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
            placeholder="NEW"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#22c55e] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
          />
        </div>

        {/* Main Text / Headline */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
            Announcement Headline
          </label>
          <input
            type="text"
            value={config.text}
            onChange={(e) => setConfig({ ...config, text: e.target.value })}
            placeholder="Announcement text..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#22c55e] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
          />
        </div>

        {/* Button Action Text */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
            Call to Action (Button Text)
          </label>
          <input
            type="text"
            value={config.actionText}
            onChange={(e) => setConfig({ ...config, actionText: e.target.value })}
            placeholder="EXPLORE PROPERTIES"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#22c55e] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
          />
        </div>

        {/* Button Action URL */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
            Target URL / Route
          </label>
          <input
            type="text"
            value={config.actionUrl}
            onChange={(e) => setConfig({ ...config, actionUrl: e.target.value })}
            placeholder="/projects/current"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#22c55e] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
          />
        </div>

        {/* Dismissible Toggle */}
        <div className="flex items-center gap-2 pt-2 sm:col-span-2">
          <input
            type="checkbox"
            id="dismissible-check"
            checked={config.dismissible}
            onChange={(e) => setConfig({ ...config, dismissible: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]"
          />
          <label
            htmlFor="dismissible-check"
            className="text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            Allow users to dismiss / close the bar (✕ button)
          </label>
        </div>
      </div>
    </form>
  );
}
