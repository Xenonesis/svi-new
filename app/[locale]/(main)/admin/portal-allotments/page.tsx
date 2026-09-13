'use client';

import {
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  BookOpen,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  usePortalAllotmentsAdmin,
  PortalAllotmentTableRow,
  PortalAllotmentScheduleDrawer,
  PortalAllotmentFormModal,
  PortalAllotmentPendingCard,
} from '@/src/components/admin/portal-allotments';
import { ReceiptViewModal } from '@/src/components/admin/payment-receipts/ReceiptViewModal';
import { ReceiptWhatsAppModal } from '@/src/components/admin/payment-receipts/ReceiptWhatsAppModal';
import { ReceiptLedgerDrawer } from '@/src/components/admin/payment-receipts/ReceiptLedgerDrawer';
import { ReceiptLedgersModal } from '@/src/components/admin/payment-receipts/ReceiptLedgersModal';

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
    advisors,
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
    selectedReceipt,
    setSelectedReceipt,
    whatsAppReceipt,
    setWhatsAppReceipt,
    pdfLoading,
    imageLoading,
    handleDownloadPDF,
    handleDownloadImage,
    // Ledger & Sales Revenue states
    allLedgerReceipts,
    dealValuesMap,
    handleSaveDealValue,
    isLedgersModalOpen,
    setIsLedgersModalOpen,
    activeLedgerRefId,
    setActiveLedgerRefId,
    openClientLedger,
    getDealValueForRef,
    salesRevenueStats,
    getAllotmentFinancials,
  } = usePortalAllotmentsAdmin();

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: val % 1 === 0 ? 0 : 2,
    });

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

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsLedgersModalOpen(true)}
            aria-label="Open Overall Ledger"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <BookOpen className="text-brand-gold h-4 w-4" />
            <span>Overall Ledger</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-gray-700 dark:text-gray-300">
              {salesRevenueStats.activeAccountsCount}
            </span>
          </button>

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

      {/* Overall Sales Revenue & Financial Dashboard */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Booked Sales Revenue */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Total Sales Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {formatCurrency(salesRevenueStats.totalSalesRevenue)}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {salesRevenueStats.activeAccountsCount} Active Plot / Villa Allotments
          </p>
        </div>

        {/* Realized / Collected Revenue */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Collected Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(salesRevenueStats.totalRevenueCollected)}
          </div>
          <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
            Verified received milestone receipts
          </p>
        </div>

        {/* Outstanding Balance */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              Pending Receivables
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {formatCurrency(salesRevenueStats.totalBalanceDue)}
          </div>
          <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
            Remaining uncollected deal balances
          </p>
        </div>

        {/* Realization Rate & Quick Master Ledger */}
        <div className="border-brand-gold/30 from-brand-gold/10 dark:border-brand-gold/20 dark:from-brand-gold/5 flex flex-col justify-between rounded-2xl border bg-gradient-to-br via-amber-500/5 to-transparent p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-brand-gold text-xs font-bold tracking-wider uppercase">
                Realization Rate
              </span>
              <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
                {salesRevenueStats.realizationRate}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
              <div
                className="bg-brand-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, salesRevenueStats.realizationRate)}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLedgersModalOpen(true)}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#0f2942] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#163b5f] active:scale-[0.98] dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <BookOpen className="text-brand-gold h-3.5 w-3.5" />
            <span>Master Ledger Overview</span>
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
                  financials={getAllotmentFinancials(allotment)}
                  isExpanded={expandedAllotment === allotment.id}
                  onToggleExpand={() =>
                    setExpandedAllotment(expandedAllotment === allotment.id ? null : allotment.id)
                  }
                  onOpenLedger={openClientLedger}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                >
                  <PortalAllotmentScheduleDrawer
                    isExpanded={expandedAllotment === allotment.id}
                    allotment={allotment}
                    paymentSchedules={allotment.payment_schedules}
                    receipts={allotment.receipts}
                    onOpenLedger={openClientLedger}
                    onToggleStatus={togglePaymentStatus}
                    onSelectReceipt={setSelectedReceipt}
                    onShareWhatsApp={setWhatsAppReceipt}
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
        advisors={advisors}
        onSave={handleSave}
      />

      {/* View & Print Receipt Modal */}
      <ReceiptViewModal
        selectedReceipt={selectedReceipt}
        setSelectedReceipt={setSelectedReceipt}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
        handleDownloadPDF={handleDownloadPDF}
        handleDownloadImage={handleDownloadImage}
      />

      {/* WhatsApp Share Receipt Modal */}
      <ReceiptWhatsAppModal receipt={whatsAppReceipt} onClose={() => setWhatsAppReceipt(null)} />

      {/* Master Customer Ledgers Modal (Overall Ledger) */}
      {isLedgersModalOpen && (
        <ReceiptLedgersModal
          receipts={allLedgerReceipts}
          dealValuesMap={dealValuesMap}
          onSelectLedger={(refId) => {
            setIsLedgersModalOpen(false);
            openClientLedger(refId);
          }}
          onClose={() => setIsLedgersModalOpen(false)}
        />
      )}

      {/* Per-Client Ledger Statement Drawer */}
      <ReceiptLedgerDrawer
        refId={activeLedgerRefId}
        allReceipts={allLedgerReceipts}
        dealValue={getDealValueForRef(activeLedgerRefId)}
        onSaveDealValue={handleSaveDealValue}
        onClose={() => setActiveLedgerRefId(null)}
        onSelectReceipt={setSelectedReceipt}
      />
    </div>
  );
}
