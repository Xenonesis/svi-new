import { Download, RefreshCw, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { SavedBba } from '@/src/types/bba';
import BbaPreviewContent from '@/src/components/admin/DocumentGenerator/BbaPreviewContent';
import BbaPreviewContentHindi from '@/src/components/admin/DocumentGenerator/BbaPreviewContentHindi';

interface DeleteModalProps {
  deleteTarget: SavedBba | null;
  deleteLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BbaDeleteModal({
  deleteTarget,
  deleteLoading,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <div className="dark:bg-brand-dark-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10">
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Delete BBA Record</h3>
        <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
          Are you sure you want to permanently delete the BBA record generated for{' '}
          <strong>{deleteTarget.form_data?.clientName}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleteLoading}
            className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleteLoading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white uppercase hover:bg-red-700 disabled:opacity-60"
          >
            {deleteLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface PreviewModalProps {
  selectedBba: SavedBba | null;
  pdfLoading: boolean;
  imageLoading: boolean;
  companyInfo: any;
  onClose: () => void;
  onDownloadPDF: () => void;
  onDownloadImage: () => void;
}

export function BbaPreviewModal({
  selectedBba,
  pdfLoading,
  imageLoading,
  companyInfo,
  onClose,
  onDownloadPDF,
  onDownloadImage,
}: PreviewModalProps) {
  if (!selectedBba) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md dark:bg-black/90">
      <div className="dark:bg-brand-dark-surface relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              BBA - {selectedBba.form_data?.clientName}
            </h3>
            <p className="text-[10px] text-gray-500">
              Generated on {new Date(selectedBba.created_at).toLocaleDateString('en-GB')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onDownloadPDF}
              disabled={pdfLoading}
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase shadow-md transition-all disabled:opacity-50"
            >
              {pdfLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download PDF
            </button>
            <button
              onClick={onDownloadImage}
              disabled={imageLoading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white uppercase shadow-md transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              {imageLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              Save as PNG
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-6 dark:bg-zinc-900/30">
          <div
            id="modalBbaPreview"
            className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 font-sans text-[13px] leading-relaxed text-black shadow-sm"
          >
            {selectedBba.form_data?.language === 'hi' ? (
              <BbaPreviewContentHindi formData={selectedBba.form_data} companyInfo={companyInfo} />
            ) : (
              <BbaPreviewContent formData={selectedBba.form_data} companyInfo={companyInfo} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
