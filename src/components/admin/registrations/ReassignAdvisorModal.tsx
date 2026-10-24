'use client';

import React, { useState } from 'react';
import { UserCheck, RefreshCw, X, Users } from 'lucide-react';
import { motion } from 'motion/react';
import type { Registration } from './types';

interface ReassignAdvisorModalProps {
  targets: Registration[];
  advisors: string[];
  onConfirm: (advisorName: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function ReassignAdvisorModal({
  targets,
  advisors,
  onConfirm,
  onCancel,
  loading,
}: ReassignAdvisorModalProps) {
  function normalizeAdvisor(name?: string | null): string {
    if (!name) return 'direct / svi official';
    return name
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, ' ');
  }

  function resolveInitialAdvisor(current: string | null | undefined): string {
    if (!current) return advisors[0] || 'Direct / SVI Official';
    const exact = advisors.find((a) => a === current);
    if (exact) return exact;
    const normCurrent = normalizeAdvisor(current);
    const matched = advisors.find((a) => normalizeAdvisor(a) === normCurrent);
    if (matched) return matched;
    return advisors[0] || 'Direct / SVI Official';
  }

  const isBulk = targets.length > 1;
  const single = targets[0];
  const initialAdvisor = isBulk
    ? advisors[0] || 'Direct / SVI Official'
    : resolveInitialAdvisor(single?.advisor_name);

  const [selectedAdvisor, setSelectedAdvisor] = useState(initialAdvisor);
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAdvisor || loading) return;
    await onConfirm(selectedAdvisor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111118]"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-white/10 dark:bg-[#15151c]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-brand-navy font-serif text-base font-semibold dark:text-white">
                {isBulk ? 'Bulk Reassign Advisor' : 'Reassign Advisor'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isBulk
                  ? `${targets.length} registrations selected`
                  : 'Update client assigned representative'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Client summary */}
          {!isBulk && single ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {single.name} {single.last_name || ''}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {single.phone} • {single.email}
                  </p>
                </div>
                {single.submission_id && (
                  <span className="bg-brand-gold/10 text-brand-gold rounded px-2 py-0.5 font-mono text-[10px] font-bold">
                    {single.submission_id}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 border-t border-gray-200/60 pt-2 text-[11px] dark:border-white/10">
                <span className="text-gray-500">Current Advisor:</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {resolveInitialAdvisor(single.advisor_name)}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Users className="h-4 w-4" />
                <span>Reassigning {targets.length} Clients Simultaneously</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                All selected registrations will be updated to the chosen advisor.
              </p>
            </div>
          )}

          {/* New Advisor Select */}
          <div className="space-y-1.5">
            <label
              htmlFor="reassign-advisor-select"
              className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400"
            >
              Select New Assigned Advisor
            </label>
            <select
              id="reassign-advisor-select"
              value={selectedAdvisor}
              onChange={(e) => setSelectedAdvisor(e.target.value)}
              disabled={loading}
              className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 shadow-sm transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#181824] dark:text-white"
            >
              {advisors.map((adv) => (
                <option key={adv} value={adv}>
                  {adv}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-700 uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedAdvisor}
              className="btn-tactile flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-amber-600/20 hover:bg-amber-500 disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserCheck className="h-3.5 w-3.5" />
              )}
              {isBulk ? 'Confirm Bulk Reassign' : 'Save Advisor'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
