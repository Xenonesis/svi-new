'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { RefreshCw } from 'lucide-react';
import { useBbaRecords } from '@/src/hooks/useBbaRecords';
import BbaStatsCards from '@/src/components/admin/bba/BbaStatsCards';
import BbaFilters from '@/src/components/admin/bba/BbaFilters';
import BbaTable from '@/src/components/admin/bba/BbaTable';
import { BbaDeleteModal, BbaPreviewModal } from '@/src/components/admin/bba/BbaModals';

export default function BbaRecordsPage() {
  const { token } = useAuthStore();

  const {
    loading,
    searchQuery,
    setSearchQuery,
    projectFilter,
    setProjectFilter,
    sortConfig,
    setSortConfig,
    dateRange,
    setDateRange,
    selectedBba,
    setSelectedBba,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    pdfLoading,
    imageLoading,
    projects,
    companyInfo,
    fetchBbas,
    totalCount,
    totalValue,
    avgArea,
    shyamAanganCount,
    handleDelete,
    handleDownloadPDF,
    handleDownloadImage,
    filteredBbas,
    handleClearFilters,
  } = useBbaRecords(token);

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-4 flex items-center justify-between sm:mb-8">
        <div>
          <h1 className="text-brand-navy mb-1 font-serif text-2xl tracking-tight sm:mb-2 sm:text-3xl dark:text-white">
            BBA <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            View, search, audit, download, and delete all generated Builder Buyer Agreements.
          </p>
        </div>
        <button
          onClick={fetchBbas}
          className="dark:bg-brand-dark-surface/50 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 sm:h-10 sm:w-10 dark:border-white/10 dark:hover:bg-white/5"
          title="Refresh List"
        >
          <RefreshCw className="h-3.5 w-3.5 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400" />
        </button>
      </div>

      <BbaStatsCards
        totalCount={totalCount}
        totalValue={totalValue}
        avgArea={avgArea}
        shyamAanganCount={shyamAanganCount}
      />

      <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-3.5 shadow-xl backdrop-blur-xl sm:rounded-2xl sm:p-6 dark:border-white/8">
        <BbaFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          projects={projects}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onClearFilters={handleClearFilters}
        />

        <div className="overflow-x-auto">
          <BbaTable
            loading={loading}
            filteredBbas={filteredBbas}
            onClearFilters={handleClearFilters}
            onSelectBba={setSelectedBba}
            onDeleteBba={setDeleteTarget}
          />
        </div>
      </div>

      <BbaDeleteModal
        deleteTarget={deleteTarget}
        deleteLoading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <BbaPreviewModal
        selectedBba={selectedBba}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
        companyInfo={companyInfo}
        onClose={() => setSelectedBba(null)}
        onDownloadPDF={handleDownloadPDF}
        onDownloadImage={handleDownloadImage}
      />
    </div>
  );
}
