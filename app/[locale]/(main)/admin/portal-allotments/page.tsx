'use client';

import { Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  usePortalAllotmentsAdmin,
  PortalAllotmentTableRow,
  PortalAllotmentScheduleDrawer,
  PortalAllotmentFormModal,
} from '@/src/components/admin/portal-allotments';

export default function PortalAllotmentsAdmin() {
  const t = useTranslations('pages.adminPortalAllotments');
  const {
    filteredAllotments,
    profiles,
    properties,
    loading,
    searchTerm,
    setSearchTerm,
    showModal,
    editingId,
    expandedAllotment,
    setExpandedAllotment,
    formData,
    setFormData,
    handleSave,
    handleDelete,
    togglePaymentStatus,
    openCreateModal,
    openEditModal,
    closeModal,
  } = usePortalAllotmentsAdmin();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          {t('addAllotment')}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="focus:ring-brand-gold w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="p-8 text-center text-gray-500">{t('loading')}</div>
        ) : filteredAllotments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t('noAllotmentsFound')}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredAllotments.map((allotment) => (
              <PortalAllotmentTableRow
                key={allotment.id}
                allotment={allotment}
                isExpanded={expandedAllotment === allotment.id}
                onToggleExpand={() =>
                  setExpandedAllotment(expandedAllotment === allotment.id ? null : allotment.id)
                }
                onEdit={openEditModal}
                onDelete={handleDelete}
              >
                <PortalAllotmentScheduleDrawer
                  isExpanded={expandedAllotment === allotment.id}
                  paymentSchedules={allotment.payment_schedules}
                  onToggleStatus={togglePaymentStatus}
                />
              </PortalAllotmentTableRow>
            ))}
          </div>
        )}
      </div>

      <PortalAllotmentFormModal
        isOpen={showModal}
        onClose={closeModal}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        profiles={profiles}
        properties={properties}
        onSave={handleSave}
      />
    </div>
  );
}
