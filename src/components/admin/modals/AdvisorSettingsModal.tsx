'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  Check,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

interface AdvisorProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
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
  const [showDisabled, setShowDisabled] = useState(false);

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
          .select('id, full_name, email, role, is_active')
          .in('role', ['employee', 'admin'])
          .order('full_name', { ascending: true });

        if (profilesError) throw profilesError;
        setProfiles(profilesData || []);
      } catch (err: unknown) {
        console.error('Failed to load advisor configuration:', err);
        showToast('error', 'Failed to retrieve advisor configurations.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [showToast]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const activeCount = useMemo(
    () => profiles.filter((p) => p.is_active !== false).length,
    [profiles]
  );
  const disabledCount = useMemo(
    () => profiles.filter((p) => p.is_active === false).length,
    [profiles]
  );

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Hide disabled accounts by default unless explicitly toggled
      if (!showDisabled && p.is_active === false) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.full_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q)
      );
    });
  }, [profiles, search, showDisabled]);

  const selectedActiveCount = useMemo(() => {
    return selectedIds.filter((id) => profiles.some((p) => p.id === id && p.is_active !== false))
      .length;
  }, [selectedIds, profiles]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    // Select only visible active accounts so disabled accounts are not accidentally activated
    const activeVisibleIds = filteredProfiles.filter((p) => p.is_active !== false).map((p) => p.id);
    const nextSet = new Set([...selectedIds, ...activeVisibleIds]);
    setSelectedIds(Array.from(nextSet));
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

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(json, 'Failed to update dynamic list.'));
      }

      showToast('success', 'Public advisors and booking roster updated successfully!');
      onClose();
    } catch (err: unknown) {
      console.error(err);
      showToast('error', extractApiErrorMessage(err, 'An error occurred while saving.'));
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 font-sans backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative flex h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
              <UserCheck className="text-brand-gold h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
                Active Booking & Lead Advisors
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Configure team members available for customer registrations & allotments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="hover:text-brand-gold flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Explanatory Purpose Banner */}
        <div className="bg-brand-gold/[0.04] dark:bg-brand-gold/[0.025] border-b border-gray-100 px-6 py-3.5 dark:border-white/8">
          <div className="flex items-start gap-2.5">
            <div className="bg-brand-gold/20 text-brand-gold mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
              <Info className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-semibold text-gray-900 dark:text-white">
                Yeh List Kis Liye Hai? (Purpose of this setting)
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                Yahan select kiye gaye active advisors hi{' '}
                <strong>Customer Registration Form</strong>, <strong>Plot Allotments</strong>, aur{' '}
                <strong>Lead Assignment</strong> ke advisor dropdown options me dikhenge. Disabled
                ya unselected accounts booking form me show nahi honge.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active selected:{' '}
                  <strong className="text-gray-800 dark:text-gray-200">
                    {selectedActiveCount} / {activeCount}
                  </strong>
                </span>
                <span className="text-gray-300 dark:text-white/10">•</span>
                <span className="flex items-center gap-1">
                  <UserX className="h-3 w-3 text-rose-400" />
                  Disabled accounts:{' '}
                  <strong>
                    {showDisabled ? 'Visible' : 'Hidden by default'} ({disabledCount})
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Active Filter Controls */}
        <div className="space-y-2.5 border-b border-gray-100 p-4 dark:border-white/8">
          <div className="relative">
            <Search className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search advisors by name or email..."
              className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
            />
          </div>

          {/* Active vs Disabled Roster Filter Bar */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Accounts Only ({activeCount})
              </span>
            </div>

            {disabledCount > 0 && (
              <button
                type="button"
                onClick={() => setShowDisabled((prev) => !prev)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  showDisabled
                    ? 'border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                }`}
                title={showDisabled ? 'Hide disabled accounts' : 'Show disabled accounts'}
              >
                {showDisabled ? (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Hide Disabled ({disabledCount})</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Show Disabled ({disabledCount})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Profiles List */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <RefreshCw className="text-brand-gold mr-2 h-4 w-4 animate-spin" />
              <span>Loading profiles...</span>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400">
              {search ? 'No matching advisors found.' : 'No active advisors available.'}
            </div>
          ) : (
            filteredProfiles.map((p) => {
              const isChecked = selectedSet.has(p.id);
              const isInactive = p.is_active === false;

              return (
                <div
                  key={p.id}
                  onClick={() => handleToggle(p.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                    isChecked
                      ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/[0.04]'
                      : isInactive
                        ? 'border-dashed border-gray-200 bg-gray-50/40 opacity-75 hover:opacity-100 dark:border-white/10 dark:bg-white/[0.01]'
                        : 'hover:border-brand-gold/30 border-gray-100 bg-gray-50/50 hover:bg-gray-50 dark:border-white/5 dark:bg-white/2 dark:hover:bg-white/4'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                        {p.full_name || 'Unnamed Advisor'}
                      </p>
                      {isInactive ? (
                        <span className="inline-flex items-center gap-1 rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                          <UserX className="h-2.5 w-2.5" />
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-gray-500 dark:text-gray-400">
                      {p.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[8px] font-bold tracking-widest text-gray-500 uppercase dark:bg-white/5 dark:text-gray-400">
                      {p.role}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      aria-label={`Select ${p.full_name}`}
                      className="accent-brand-gold focus:ring-brand-gold h-4 w-4 cursor-pointer rounded border-gray-300"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-white/8">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={loading}
              className="text-brand-gold hover:text-brand-gold/80 cursor-pointer text-[10px] font-bold uppercase transition-colors disabled:opacity-50"
            >
              Select All Active
            </button>
            <span className="text-gray-300 dark:text-white/10">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={loading}
              className="cursor-pointer text-[10px] font-bold text-gray-500 uppercase transition-colors hover:text-gray-700 disabled:opacity-50 dark:hover:text-gray-300"
            >
              Clear All
            </button>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-[10px] font-bold text-gray-700 uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveLoading || loading}
              className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase shadow-lg disabled:opacity-60"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
