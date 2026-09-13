'use client';

import { RefreshCw, Receipt, Trash2 } from 'lucide-react';
import { usePaymentReceiptsRecords } from '@/src/components/admin/payment-receipts/usePaymentReceiptsRecords';
import { ReceiptStatsCards } from '@/src/components/admin/payment-receipts/ReceiptStatsCards';
import { ReceiptToolbar } from '@/src/components/admin/payment-receipts/ReceiptToolbar';
import { ReceiptsTable } from '@/src/components/admin/payment-receipts/ReceiptsTable';
import { ReceiptModalsContainer } from '@/src/components/admin/payment-receipts/ReceiptModalsContainer';

export default function ReceiptRecordsPage() {
  const records = usePaymentReceiptsRecords();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <div>
          <h1 className="text-brand-navy mb-1 font-serif text-2xl tracking-tight sm:mb-2 sm:text-3xl dark:text-white">
            Receipt <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            View, audit, search, download, and manage client payment receipts.
          </p>
        </div>
        <button
          onClick={records.fetchReceipts}
          disabled={records.loading}
          className="dark:bg-brand-dark-surface/50 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 sm:h-10 sm:w-10 dark:border-white/10 dark:hover:bg-white/5"
          title="Refresh List"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400 ${records.loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Tab Switcher: Active Records vs Trash Bin */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => records.setActiveTab('active')}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all sm:px-5 sm:py-3 sm:text-sm ${
              records.activeTab === 'active'
                ? 'border-brand-gold text-brand-navy dark:text-brand-gold border-b-2'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Receipt className="h-4 w-4" />
            Active Records
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-white/10 dark:text-gray-300">
              {records.receipts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => records.setActiveTab('trash')}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all sm:px-5 sm:py-3 sm:text-sm ${
              records.activeTab === 'trash'
                ? 'border-b-2 border-rose-500 text-rose-600 dark:text-rose-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            Trash Bin
            {records.trashedReceipts.length > 0 && (
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-500/30 dark:text-rose-400">
                {records.trashedReceipts.length}
              </span>
            )}
          </button>
        </div>

        {records.activeTab === 'trash' && records.trashedReceipts.length > 0 && (
          <button
            type="button"
            onClick={records.handleEmptyTrash}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-500/20 active:scale-95 dark:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Empty Trash
          </button>
        )}
      </div>

      {records.activeTab === 'active' && (
        <ReceiptStatsCards
          loading={records.loading}
          totalCount={records.totalCount}
          totalAmount={records.totalAmount}
          upiCount={records.upiCount}
          cashCount={records.cashCount}
        />
      )}

      <ReceiptToolbar
        searchQuery={records.searchQuery}
        setSearchQuery={records.setSearchQuery}
        methodFilter={records.methodFilter}
        setMethodFilter={records.setMethodFilter}
        sortConfig={records.sortConfig}
        setSortConfig={records.setSortConfig}
        dateRange={records.dateRange}
        setDateRange={records.setDateRange}
        handleClearFilters={records.handleClearFilters}
        onExportCsv={records.handleExportCSV}
        onOpenLedgers={() => records.setIsLedgersModalOpen(true)}
        activeTab={records.activeTab}
        setActiveTab={records.setActiveTab}
        trashedCount={records.trashedReceipts.length}
      />

      <ReceiptsTable
        loading={records.loading}
        error={records.error}
        filteredReceipts={records.filteredReceipts}
        searchQuery={records.searchQuery}
        fetchReceipts={records.fetchReceipts}
        setSelectedReceipt={records.setSelectedReceipt}
        setDeleteTarget={records.setDeleteTarget}
        onShareWhatsApp={(r) => records.setWhatsAppReceipt(r)}
        onOpenLedger={(ref) => records.setLedgerRefId(ref)}
        activeTab={records.activeTab}
        onRestore={records.handleRestore}
        setIsPermanentDelete={records.setIsPermanentDelete}
        onEmptyTrash={records.handleEmptyTrash}
      />

      <ReceiptModalsContainer {...records} />
    </div>
  );
}
