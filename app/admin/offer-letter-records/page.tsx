'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOfferLetterRecords } from '@/src/components/admin/offer-letter-records/useOfferLetterRecords';
import { OfferLetterRecordsHeader } from '@/src/components/admin/offer-letter-records/OfferLetterRecordsHeader';
import { OfferLetterStatsCards } from '@/src/components/admin/offer-letter-records/OfferLetterStatsCards';
import { OfferLetterTable } from '@/src/components/admin/offer-letter-records/OfferLetterTable';
import { OfferLetterPreviewModal } from '@/src/components/admin/offer-letter-records/OfferLetterPreviewModal';
import { DeleteConfirm } from '@/src/components/admin/modals/DeleteConfirm';

function OfferLetterRecordsContent() {
  const searchParams = useSearchParams();
  const targetId =
    searchParams?.get('id') || searchParams?.get('documentId') || searchParams?.get('offerId');
  const targetSearch =
    searchParams?.get('search') || searchParams?.get('name') || searchParams?.get('q');
  const options = useMemo(() => ({ targetId, targetSearch }), [targetId, targetSearch]);
  const {
    offers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    dateRange,
    setDateRange,
    selectedOffer,
    setSelectedOffer,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    pdfLoading,
    imageLoading,
    companyInfo,
    stats,
    fetchOffers,
    handleDelete,
    handleDownloadPDF,
    handleDownloadImage,
    handleClearFilters,
    highlightedId,
  } = useOfferLetterRecords(options);

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <OfferLetterRecordsHeader loading={loading} onRefresh={fetchOffers} />

      <OfferLetterStatsCards
        loading={loading}
        totalCount={stats.totalCount}
        totalCtc={stats.totalCtc}
        uniqueDesignations={stats.uniqueDesignations}
        completedCount={stats.completedCount}
      />

      <OfferLetterTable
        offers={offers}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        onClearFilters={handleClearFilters}
        onView={setSelectedOffer}
        onDelete={setDeleteTarget}
        onRetry={fetchOffers}
        highlightedId={highlightedId}
      />

      <OfferLetterPreviewModal
        offer={selectedOffer}
        companyInfo={companyInfo}
        onClose={() => setSelectedOffer(null)}
        onDownloadPDF={handleDownloadPDF}
        onDownloadImage={handleDownloadImage}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
      />

      {deleteTarget && (
        <DeleteConfirm
          title="Delete Offer Letter Record?"
          itemName={
            deleteTarget.form_data?.name
              ? `${deleteTarget.form_data.name}${deleteTarget.form_data.designation ? ` (${deleteTarget.form_data.designation})` : ''}`
              : 'Offer Letter Record'
          }
          itemType="offer letter record"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

export default function OfferLetterRecordsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl p-6 font-sans">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      }
    >
      <OfferLetterRecordsContent />
    </Suspense>
  );
}
