'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import type { AllotmentFormData, ProfileSummary, PropertySummary } from './types';

export interface PortalAllotmentFormModalProps {
  isOpen?: boolean;
  showModal?: boolean;
  onClose: () => void;
  editingId: string | null;
  formData: AllotmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AllotmentFormData>>;
  profiles: ProfileSummary[];
  properties: PropertySummary[];
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
  onSave,
}: PortalAllotmentFormModalProps) {
  const t = useTranslations('pages.adminPortalAllotments');
  const visible = isOpen ?? showModal ?? false;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white">
                {editingId ? t('editAllotment') : t('newAllotment')}
              </h2>
            </div>

            <form onSubmit={onSave} className="space-y-4 p-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('clientProfile')}
                </label>
                <select
                  required
                  value={formData.profile_id}
                  onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
                  className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">{t('selectClient')}</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('property')}
                </label>
                <select
                  required
                  value={formData.property_id}
                  onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                  className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">{t('selectProperty')}</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('unitNumber')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit_number}
                    onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                    className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('area')}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('totalCost')}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.total_cost}
                    onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })}
                    className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('bookingDate')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0256B4] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#02428A] dark:bg-[#E8D17A] dark:text-gray-900 dark:hover:bg-[#d4be66]"
                >
                  {t('saveAllotment')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
