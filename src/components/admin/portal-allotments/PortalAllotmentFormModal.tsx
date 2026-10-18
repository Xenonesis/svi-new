'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  Lock,
  X,
  Building2,
  User,
  UserCheck,
  Tag,
  Calendar,
  MapPin,
  Hash,
  Sparkles,
} from 'lucide-react';
import { formatTicketId } from '@/src/lib/allotment/ticketUtils';
import type {
  AllotmentCandidate,
  AllotmentFormData,
  ProfileSummary,
  PropertySummary,
} from './types';

export interface PortalAllotmentFormModalProps {
  isOpen?: boolean;
  showModal?: boolean;
  onClose: () => void;
  editingId: string | null;
  formData: AllotmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AllotmentFormData>>;
  profiles: ProfileSummary[];
  properties: PropertySummary[];
  advisors?: string[];
  candidates?: AllotmentCandidate[];
  onSave: (e: React.FormEvent) => Promise<void> | void;
}

export function PortalAllotmentFormModal({
  isOpen,
  showModal,
  onClose,
  editingId,
  formData,
  setFormData,
  profiles,
  properties,
  advisors = [],
  candidates = [],
  onSave,
}: PortalAllotmentFormModalProps) {
  const t = useTranslations('pages.adminPortalAllotments');
  const visible = isOpen ?? showModal ?? false;

  // Find matched candidate based on current ticket/ref id
  const currentMatchedCandidate = useMemo(() => {
    const cleanTicket = formatTicketId(formData.ticket_id);
    if (!cleanTicket) return null;
    return (
      candidates.find(
        (c) =>
          formatTicketId(c.ticketId) === cleanTicket ||
          formatTicketId(c.normalizedId) === cleanTicket
      ) || null
    );
  }, [formData.ticket_id, candidates]);

  // Determine locked fields from registration / candidate form
  const isAdvisorLocked = Boolean(currentMatchedCandidate?.advisorName);
  const isPropertyLocked = Boolean(
    currentMatchedCandidate?.propertyId || currentMatchedCandidate?.projectName
  );

  // Comprehensive unique advisors list
  const allAdvisorsList = useMemo(() => {
    const set = new Set<string>();
    advisors.forEach((a) => {
      if (a && a.trim()) set.add(a.trim());
    });
    candidates.forEach((c) => {
      if (c.advisorName && c.advisorName.trim()) set.add(c.advisorName.trim());
    });
    if (formData.advisor_name && formData.advisor_name.trim()) {
      set.add(formData.advisor_name.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [advisors, candidates, formData.advisor_name]);

  const handleTicketChange = (val: string) => {
    const clean = formatTicketId(val);
    const matched = candidates.find(
      (c) => formatTicketId(c.ticketId) === clean || formatTicketId(c.normalizedId) === clean
    );
    if (matched) {
      const matchedPropId =
        matched.propertyId ||
        properties.find(
          (p) =>
            p.name.toLowerCase() === matched.projectName.toLowerCase() ||
            (Boolean(p.slug) && p.slug?.toLowerCase() === matched.projectName.toLowerCase())
        )?.id;

      setFormData((prev) => ({
        ...prev,
        ticket_id: matched.ticketId,
        unit_number: matched.unitNo || prev.unit_number,
        plot_preference: matched.plotPreference || prev.plot_preference,
        area: matched.area ? String(matched.area) : prev.area,
        total_cost: matched.totalCost ? String(matched.totalCost) : prev.total_cost,
        booking_date: matched.bookingDate || prev.booking_date,
        advisor_name: matched.advisorName || prev.advisor_name,
        property_id: matchedPropId || prev.property_id,
      }));
    } else {
      setFormData((prev) => ({ ...prev, ticket_id: val }));
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111622] dark:text-white"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4.5 dark:border-white/[0.08] dark:bg-[#161c2d]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    {editingId ? t('editAllotment') : t('newAllotment')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingId
                      ? 'Modify official allotment details'
                      : 'Create & register new customer allotment'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSave} className="space-y-4 p-6">
              {/* Client & Ticket ID Row */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {/* Ticket / Ref ID */}
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-amber-500" />
                      Ticket / Ref ID
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">
                      Auto-fills details
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="ticket-candidates-datalist"
                      placeholder="e.g. SVI2236, PL2001"
                      value={formData.ticket_id || ''}
                      onChange={(e) => handleTicketChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 font-mono text-xs tracking-wide text-slate-900 uppercase transition-all outline-none placeholder:text-slate-400 placeholder:normal-case focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#161D2C] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400 dark:focus:bg-[#161D2C]"
                    />
                    {currentMatchedCandidate && (
                      <span className="pointer-events-none absolute top-1/2 right-2.5 inline-flex -translate-y-1/2 items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <Sparkles className="h-2.5 w-2.5" /> Matched
                      </span>
                    )}
                  </div>
                  {candidates.length > 0 && (
                    <datalist id="ticket-candidates-datalist">
                      {candidates.map((c) => (
                        <option
                          key={c.normalizedId}
                          value={c.ticketId}
                          label={`${c.clientName} • Plot: ${c.unitNo || 'Unassigned'} • Advisor: ${c.advisorName || 'N/A'}`}
                        >
                          {c.clientName} ({c.phone})
                        </option>
                      ))}
                    </datalist>
                  )}
                </div>

                {/* Client Profile */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                    <User className="h-3.5 w-3.5 text-amber-500" />
                    {t('clientProfile')}
                  </label>
                  <select
                    required
                    value={formData.profile_id}
                    onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-medium text-slate-900 transition-all outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#161D2C] dark:text-white dark:focus:border-amber-400 dark:focus:bg-[#161D2C]"
                  >
                    <option value="">{t('selectClient')}</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.email || 'No email'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property & Advisor Row */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {/* Property Dropdown (Locked if chosen in Registration) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                      <Building2 className="h-3.5 w-3.5 text-amber-500" />
                      {t('property')}
                    </label>
                    {isPropertyLocked && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                        <Lock className="h-2.5 w-2.5" /> Registration Fixed
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      required
                      disabled={isPropertyLocked}
                      value={formData.property_id}
                      onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                      className={`w-full rounded-xl border p-2.5 text-xs font-medium transition-all outline-none ${
                        isPropertyLocked
                          ? 'cursor-not-allowed border-amber-300/40 bg-amber-50/50 text-slate-700 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-200'
                          : 'border-slate-200 bg-slate-50/70 text-slate-900 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#161D2C] dark:text-white dark:focus:border-amber-400 dark:focus:bg-[#161D2C]'
                      }`}
                    >
                      <option value="">{t('selectProperty')}</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advisor Dropdown (Locked if chosen in Registration) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                      <UserCheck className="h-3.5 w-3.5 text-amber-500" />
                      {t('advisor')}
                    </label>
                    {isAdvisorLocked && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                        <Lock className="h-2.5 w-2.5" /> Registration Fixed
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      disabled={isAdvisorLocked}
                      value={formData.advisor_name || ''}
                      onChange={(e) => setFormData({ ...formData, advisor_name: e.target.value })}
                      className={`w-full rounded-xl border p-2.5 text-xs font-medium transition-all outline-none ${
                        isAdvisorLocked
                          ? 'cursor-not-allowed border-amber-300/40 bg-amber-50/50 text-slate-700 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-200'
                          : 'border-slate-200 bg-slate-50/70 text-slate-900 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#161D2C] dark:text-white dark:focus:border-amber-400 dark:focus:bg-[#161D2C]'
                      }`}
                    >
                      <option value="">-- Select Assigned Advisor --</option>
                      {allAdvisorsList.map((adv) => (
                        <option key={adv} value={adv}>
                          {adv}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Plot Specs Row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    Plot Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101, 31"
                    value={formData.unit_number}
                    onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-medium text-slate-900 transition-all outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#161D2C] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400 dark:focus:bg-[#161D2C]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                    <Tag className="h-3.5 w-3.5 text-amber-500" />
                    Plot Preference
                  </label>
                  <select
                    value={formData.plot_preference || 'none'}
                    onChange={(e) => setFormData({ ...formData, plot_preference: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-medium text-slate-900 transition-all outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#161D2C] dark:text-white dark:focus:border-amber-400 dark:focus:bg-[#161D2C]"
                  >
                    <option value="none">Standard / None</option>
                    <option value="park">Park Facing</option>
                    <option value="corner">Corner Plot</option>
                    <option value="main-road">Main Road</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                    {t('area')} (Sq. Yds)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 font-mono text-xs font-medium text-slate-900 transition-all outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#161D2C] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400 dark:focus:bg-[#161D2C]"
                  />
                </div>
              </div>

              {/* Financials & Dates Row */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                    {t('totalCost')} (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 750000"
                    value={formData.total_cost}
                    onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 font-mono text-xs font-medium text-slate-900 transition-all outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#161D2C] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400 dark:focus:bg-[#161D2C]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    {t('bookingDate')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 font-mono text-xs font-medium text-slate-900 transition-all outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#161D2C] dark:text-white dark:focus:border-amber-400 dark:focus:bg-[#161D2C]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E5B842] px-5 py-2 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-[#d9ad38] active:scale-[0.98]"
                >
                  {editingId ? 'Update Allotment' : t('saveAllotment')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
