'use client';

import React from 'react';
import { SavedReceipt } from './ReceiptTypes';
import { ReceiptDeleteModal } from './ReceiptDeleteModal';
import { ReceiptViewModal } from './ReceiptViewModal';
import { ReceiptWhatsAppModal } from './ReceiptWhatsAppModal';
import { ReceiptLedgerDrawer } from './ReceiptLedgerDrawer';
import { ReceiptLedgersModal } from './ReceiptLedgersModal';
import { normalizeRefId } from '@/src/lib/receipt/receiptLedger';

export interface ReceiptModalsContainerProps {
  receipts: SavedReceipt[];
  dealValuesMap: Record<string, number>;
  handleSaveDealValue: (normalizedRefId: string, newDealValue: number) => Promise<void> | void;
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
