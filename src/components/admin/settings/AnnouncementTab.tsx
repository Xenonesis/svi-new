'use client';

import { useState, useEffect, useRef } from 'react';
import { Megaphone, Save, ChevronDown, Check, Search, Globe, Link2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';
import { defaultAnnouncementConfig, type AnnouncementConfig } from '@/src/config/announcement';

const PRESET_ROUTES = [
  {
    group: 'Projects & Properties',
    routes: [
      { label: 'Current Projects', url: '/projects/current' },
      { label: 'Completed Projects', url: '/projects/completed' },
      { label: 'Exclusive Offers & Deals', url: '/exclusive-offers' },
      { label: 'Shivani Vatika 11 Brochure', url: '/brochure/shivani-vatika-11' },
    ],
  },
  {
    group: 'Main Pages',
    routes: [
      { label: 'Homepage', url: '/' },
      { label: 'About Us', url: '/about' },
      { label: 'Contact Us & Site Visit', url: '/contact' },
      { label: 'Leadership Team', url: '/leadership' },
      { label: 'Articles & Blogs', url: '/blog' },
      { label: 'Careers / Hiring', url: '/careers' },
      { label: 'Frequently Asked Questions', url: '/faq' },
    ],
  },
  {
    group: 'Portals & Utilities',
    routes: [
      { label: 'Lucky Draw (Lottery)', url: '/lottery' },
      { label: 'EMI & Investment Calculators', url: '/calculators' },
      { label: 'Online Payment Portal', url: '/payment' },
      { label: 'Client Allotment Portal', url: '/portal' },
      { label: 'Online Booking Registration', url: '/registration' },
    ],
  },
];

export function AnnouncementTab() {
  const [config, setConfig] = useState<AnnouncementConfig>(defaultAnnouncementConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const selectedPreset = PRESET_ROUTES.flatMap((g) => g.routes).find(
    (r) => r.url === config.actionUrl
  );

  const filteredGroups = PRESET_ROUTES.map((group) => ({
    ...group,
    routes: group.routes.filter(
      (r) =>
        r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.url.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.routes.length > 0);
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
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-gray-900 dark:text-white">
            <Megaphone className="h-5 w-5 text-[#d4af37]" />
            Announcement Bar Settings
          </h2>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Control the top announcement strip visible on the customer-facing website.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#c59e2b] disabled:opacity-50"
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
          <div className="relative flex items-center justify-between overflow-hidden rounded-lg border border-[#d4af37]/30 bg-[#070b14] px-4 py-2.5 text-slate-100 shadow-md">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
            <div className="flex flex-1 items-center justify-center gap-2 text-xs font-medium">
              <span className="rounded-full border border-[#d4af37]/40 bg-[#d4af37]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#f5d77f] uppercase">
                {config.badgeText || 'NEW'}
              </span>
              <span className="truncate text-slate-200">{config.text}</span>
              <span className="font-bold text-[#f5d77f] underline decoration-[#d4af37]/50 underline-offset-4">
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
              config.enabled ? 'bg-[#d4af37]' : 'bg-gray-200 dark:bg-white/10'
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
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#d4af37] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
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
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#d4af37] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
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
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#d4af37] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
          />
        </div>

        {/* Button Action URL with Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            Target URL / Route
          </label>
          {/* Custom High-Contrast Dropdown with Search */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-medium text-gray-900 shadow-xs transition-colors hover:border-[#d4af37]/60 focus:border-[#d4af37] focus:outline-none dark:border-white/10 dark:bg-[#0c1017] dark:text-white"
            >
              <div className="flex items-center gap-2 truncate">
                <Globe className="h-3.5 w-3.5 shrink-0 text-[#d4af37]" />
                <span className="truncate">
                  {selectedPreset
                    ? `${selectedPreset.label} (${selectedPreset.url})`
                    : config.actionUrl
                      ? `Custom: ${config.actionUrl}`
                      : '-- Select an existing page --'}
                </span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-[#d4af37]' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 mt-1 max-h-72 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/15 dark:bg-[#0b0f19]">
                {/* Search Filter */}
                <div className="border-b border-gray-100 p-2 dark:border-white/10">
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pages or routes..."
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-2.5 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#d4af37] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-[#111827]"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Options List */}
                <div className="max-h-52 overflow-y-auto p-1.5 text-xs">
                  {filteredGroups.length === 0 ? (
                    <div className="px-3 py-3 text-center text-xs text-gray-400">
                      No matching pages found
                    </div>
                  ) : (
                    filteredGroups.map((group) => (
                      <div key={group.group} className="mb-2 last:mb-0">
                        <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#d4af37] uppercase">
                          {group.group}
                        </div>
                        <div className="space-y-0.5">
                          {group.routes.map((r) => {
                            const isSelected = config.actionUrl === r.url;
                            return (
                              <button
                                key={r.url}
                                type="button"
                                onClick={() => {
                                  setConfig({ ...config, actionUrl: r.url });
                                  setIsDropdownOpen(false);
                                  setSearchQuery('');
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                                  isSelected
                                    ? 'bg-[#d4af37]/15 font-semibold text-[#d4af37]'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10'
                                }`}
                              >
                                <span className="truncate">{r.label}</span>
                                <div className="ml-2 flex shrink-0 items-center gap-1.5">
                                  <span className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px] text-gray-500 dark:bg-white/10 dark:text-gray-300">
                                    {r.url}
                                  </span>
                                  {isSelected && <Check className="h-3.5 w-3.5 text-[#d4af37]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Custom URL Trigger */}
                  <div className="border-t border-gray-100 pt-1 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <Link2 className="h-3.5 w-3.5 text-[#d4af37]" />
                      <span>Custom URL / External Link (enter below)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Editable text input for fine-tuning or custom URLs */}
          <input
            type="text"
            value={config.actionUrl}
            onChange={(e) => setConfig({ ...config, actionUrl: e.target.value })}
            placeholder="/projects/current or https://..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 focus:border-[#d4af37] focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
          />
          <span className="block text-[10px] text-gray-400">
            Dropdown se existing page select karein ya neeche custom link type karein.
          </span>
        </div>

        {/* Dismissible Toggle */}
        <div className="flex items-center gap-2 pt-2 sm:col-span-2">
          <input
            type="checkbox"
            id="dismissible-check"
            checked={config.dismissible}
            onChange={(e) => setConfig({ ...config, dismissible: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-[#d4af37] focus:ring-[#d4af37]"
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
