'use client';

import { RefreshCw } from 'lucide-react';
import { usePaymentReceiptsRecords } from '@/src/components/admin/payment-receipts/usePaymentReceiptsRecords';
import { ReceiptStatsCards } from '@/src/components/admin/payment-receipts/ReceiptStatsCards';
import { ReceiptToolbar } from '@/src/components/admin/payment-receipts/ReceiptToolbar';
import { ReceiptsTable } from '@/src/components/admin/payment-receipts/ReceiptsTable';
import { ReceiptModalsContainer } from '@/src/components/admin/payment-receipts/ReceiptModalsContainer';

export default function ReceiptRecordsPage() {
  const records = usePaymentReceiptsRecords();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-4 flex items-center justify-between sm:mb-8">
        <div>
          <h1 className="text-brand-navy mb-1 font-serif text-2xl tracking-tight sm:mb-2 sm:text-3xl dark:text-white">
            Receipt <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            View, audit, search, download, and delete all generated client payment receipts.
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

      <ReceiptStatsCards
        loading={records.loading}
        totalCount={records.totalCount}
        totalAmount={records.totalAmount}
        upiCount={records.upiCount}
        cashCount={records.cashCount}
      />

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
      />

      <ReceiptModalsContainer {...records} />
    </div>
  );
}
