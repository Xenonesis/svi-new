'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Search, Users, X, Briefcase } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';

interface AdvisorProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

interface AdvisorSettingsModalProps {
  onClose: () => void;
  token: string;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

export function AdvisorSettingsModal({ onClose, token, showToast }: AdvisorSettingsModalProps) {
  const [profiles, setProfiles] = useState<AdvisorProfile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: settingData } = await supabase
          .from('portal_settings')
          .select('value')
          .eq('key', 'active_advisors')
          .maybeSingle();

        let initialSelected: string[] = [];
        if (settingData?.value?.ids && Array.isArray(settingData.value.ids)) {
          initialSelected = settingData.value.ids;
        }
        setSelectedIds(initialSelected);

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .order('full_name', { ascending: true });

        if (profilesError) throw profilesError;
        setProfiles(profilesData || []);
      } catch (err: any) {
        console.error('Failed to load advisor configuration:', err);
        showToast('error', 'Failed to retrieve advisor configurations.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [showToast]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredProfiles.map((p) => p.id));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'active_advisors',
          value: { ids: selectedIds },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update dynamic list.');

      showToast('success', 'Public advisors and employees updated successfully!');
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'An error occurred while saving.');
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 font-sans backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative flex h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 items-center justify-center gap-2 rounded-lg border px-2.5">
              <Users className="text-brand-gold h-4 w-4" />
              <Briefcase className="text-brand-gold h-4 w-4" />
            </div>
            <div>
              <h2 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
                Manage Public Advisors & Employees
              </h2>
              <p className="text-[10px] text-gray-500">
                Select accounts to display publicly in booking and team sections.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:text-brand-gold cursor-pointer text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-100 p-4 dark:border-white/8">
          <div className="relative">
            <Search className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
            />
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <RefreshCw className="text-brand-gold mr-2 h-4 w-4 animate-spin" />
              <span>Loading profiles...</span>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">No users found.</div>
          ) : (
            filteredProfiles.map((p) => {
              const isChecked = selectedIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => handleToggle(p.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    isChecked
                      ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/2'
                      : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 dark:border-white/5 dark:bg-white/2 dark:hover:bg-white/4'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                      {p.full_name}
                    </p>
                    <p className="truncate text-[10px] text-gray-500">{p.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[8px] font-bold tracking-widest text-gray-500 uppercase dark:bg-white/5 dark:text-gray-400">
                      {p.role}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="accent-brand-gold focus:ring-brand-gold h-4 w-4 rounded border-gray-300"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-white/8">
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              disabled={loading}
              className="text-brand-gold hover:text-brand-gold/80 text-[10px] font-bold uppercase transition-colors disabled:opacity-50"
            >
              Select All
            </button>
            <span className="text-gray-300 dark:text-white/10">|</span>
            <button
              onClick={handleClearAll}
              disabled={loading}
              className="text-[10px] font-bold text-gray-500 uppercase transition-colors hover:text-gray-700 disabled:opacity-50 dark:hover:text-gray-300"
            >
              Clear All
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-[10px] font-bold text-gray-700 uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading || loading}
              className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase shadow-lg disabled:opacity-60"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
