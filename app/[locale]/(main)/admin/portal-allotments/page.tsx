'use client';

import { CheckCircle2, Clock, Loader2, Plus, Search, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  usePortalAllotmentsAdmin,
  PortalAllotmentTableRow,
  PortalAllotmentScheduleDrawer,
  PortalAllotmentFormModal,
  PortalAllotmentPendingCard,
} from '@/src/components/admin/portal-allotments';

export default function PortalAllotmentsAdmin() {
  const t = useTranslations('pages.adminPortalAllotments');
  const {
    activeTab,
    setActiveTab,
    allotments,
    filteredAllotments,
    candidates,
    filteredCandidates,
    profiles,
    properties,
    loading,
    loadingCandidates,
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
    handleApproveCandidate,
    handleApproveAll,
    approvingTicketId,
    isApprovingAll,
  } = usePortalAllotmentsAdmin();

  return (
    <div className="mx-auto w-full max-w-7xl pb-12 font-sans">
      {/* Header Section */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-brand-navy mb-1.5 font-serif text-3xl font-bold tracking-tight dark:text-white">
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'pending' && candidates.length > 0 && (
            <button
              onClick={handleApproveAll}
              disabled={isApprovingAll}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            >
              {isApprovingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approving All...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Approve All ({candidates.length})
                </>
              )}
            </button>
          )}

          <button
            onClick={openCreateModal}
            aria-label="Create Allotment"
            className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            {t('addAllotment')}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all ${
            activeTab === 'pending'
              ? 'border-brand-gold dark:text-brand-gold border-b-2 text-[#0f2942]'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          Pending Approvals
          {candidates.length > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
              {candidates.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all ${
            activeTab === 'active'
              ? 'border-brand-gold dark:text-brand-gold border-b-2 text-[#0f2942]'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Active Allotments
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-gray-700 dark:text-gray-300">
            {allotments.length}
          </span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative mb-6">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={
            activeTab === 'pending'
              ? 'Search pending client tickets by name, ID, phone, project...'
              : t('searchPlaceholder')
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="focus:ring-brand-gold w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Tab 1: Pending Approvals (Approval Requests) */}
      {activeTab === 'pending' && (
        <div>
          {loadingCandidates ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs dark:border-gray-700 dark:bg-gray-800">
              <Loader2 className="text-brand-gold mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium text-gray-500">Checking unique ticket clients...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {candidates.length === 0
                  ? 'All Unique Tickets Approved'
                  : 'No matching pending tickets found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {candidates.length === 0
                  ? 'Every unique client Ticket / Ref ID has already received its one-time approval.'
                  : 'Try searching with a different client name or ticket ID.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredCandidates.map((c) => (
                <PortalAllotmentPendingCard
                  key={c.normalizedId}
                  candidate={c}
                  onApprove={handleApproveCandidate}
                  isApproving={approvingTicketId === c.ticketId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Active Allotments */}
      {activeTab === 'active' && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="p-12 text-center text-gray-500">{t('loading')}</div>
          ) : filteredAllotments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">{t('noAllotmentsFound')}</div>
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
      )}

      {/* Manual Allotment Modal */}
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
