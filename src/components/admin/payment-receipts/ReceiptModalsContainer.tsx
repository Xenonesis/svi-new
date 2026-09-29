'use client';

import dynamic from 'next/dynamic';
import type { SavedReceipt } from './ReceiptTypes';
import { normalizeRefId } from '@/src/lib/receipt/receiptLedger';

const ReceiptDeleteModal = dynamic(
  () => import('./ReceiptDeleteModal').then((m) => m.ReceiptDeleteModal),
  { ssr: false }
);
const ReceiptViewModal = dynamic(
  () => import('./ReceiptViewModal').then((m) => m.ReceiptViewModal),
  { ssr: false }
);
const ReceiptWhatsAppModal = dynamic(
  () => import('./ReceiptWhatsAppModal').then((m) => m.ReceiptWhatsAppModal),
  { ssr: false }
);
const ReceiptLedgerDrawer = dynamic(
  () => import('./ReceiptLedgerDrawer').then((m) => m.ReceiptLedgerDrawer),
  { ssr: false }
);
const ReceiptLedgersModal = dynamic(
  () => import('./ReceiptLedgersModal').then((m) => m.ReceiptLedgersModal),
  { ssr: false }
);

export interface ReceiptModalsContainerProps {
  receipts: SavedReceipt[];
  dealValuesMap: Record<string, number>;
  handleSaveDealValue: (
    normalizedRefId: string,
    newDealValue: number,
    extra?: { area?: number; ratePerSqYd?: number }
  ) => Promise<void> | void;
  selectedReceipt: SavedReceipt | null;
  setSelectedReceipt: (r: SavedReceipt | null) => void;
  pdfLoading: boolean;
  imageLoading: boolean;
  handleDownloadPDF: (receipt?: SavedReceipt | null) => void | Promise<void>;
  handleDownloadImage: (receipt?: SavedReceipt | null) => void | Promise<void>;
  deleteTarget: SavedReceipt | null;
  setDeleteTarget: (r: SavedReceipt | null) => void;
  deleteLoading: boolean;
  handleDelete?: () => void | Promise<void>;
  handleDeleteConfirm?: () => void | Promise<void>;
  whatsAppReceipt: SavedReceipt | null;
  setWhatsAppReceipt: (r: SavedReceipt | null) => void;
  ledgerRefId: string | null;
  setLedgerRefId: (ref: string | null) => void;
  isLedgersModalOpen: boolean;
  setIsLedgersModalOpen: (open: boolean) => void;
  isPermanentDelete?: boolean;
}

export function ReceiptModalsContainer({
  receipts,
  dealValuesMap,
  handleSaveDealValue,
  selectedReceipt,
  setSelectedReceipt,
  pdfLoading,
  imageLoading,
  handleDownloadPDF,
  handleDownloadImage,
  deleteTarget,
  setDeleteTarget,
  deleteLoading,
  handleDelete,
  handleDeleteConfirm,
  whatsAppReceipt,
  setWhatsAppReceipt,
  ledgerRefId,
  setLedgerRefId,
  isLedgersModalOpen,
  setIsLedgersModalOpen,
  isPermanentDelete = false,
}: ReceiptModalsContainerProps) {
  const resolvedDelete = () => {
    if (handleDelete) {
      void handleDelete();
    } else if (handleDeleteConfirm) {
      void handleDeleteConfirm();
    }
  };

  const resolvedDownloadPDF = () => {
    void handleDownloadPDF(selectedReceipt);
  };

  const resolvedDownloadImage = () => {
    void handleDownloadImage(selectedReceipt);
  };

  return (
    <>
      <ReceiptDeleteModal
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        deleteLoading={deleteLoading}
        handleDelete={resolvedDelete}
        isPermanent={isPermanentDelete}
      />

      <ReceiptViewModal
        selectedReceipt={selectedReceipt}
        setSelectedReceipt={setSelectedReceipt}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
        handleDownloadPDF={resolvedDownloadPDF}
        handleDownloadImage={resolvedDownloadImage}
      />

      <ReceiptWhatsAppModal receipt={whatsAppReceipt} onClose={() => setWhatsAppReceipt(null)} />

      <ReceiptLedgerDrawer
        refId={ledgerRefId}
        allReceipts={receipts}
        dealValue={ledgerRefId ? dealValuesMap[normalizeRefId(ledgerRefId)] || 0 : 0}
        onSaveDealValue={handleSaveDealValue}
        onClose={() => setLedgerRefId(null)}
        onSelectReceipt={(r) => setSelectedReceipt(r)}
      />

      {isLedgersModalOpen && (
        <ReceiptLedgersModal
          receipts={receipts}
          dealValuesMap={dealValuesMap}
          onSelectLedger={(ref) => {
            setIsLedgersModalOpen(false);
            setLedgerRefId(ref);
          }}
          onClose={() => setIsLedgersModalOpen(false)}
        />
      )}
    </>
  );
}
