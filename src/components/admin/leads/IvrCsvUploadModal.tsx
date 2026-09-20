'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Flame,
  Zap,
  Snowflake,
} from 'lucide-react';
import { toast } from 'sonner';
import { MODAL_OVERLAY_CLASS } from '@/src/components/admin/helpers/formStyles';

interface UploadStats {
  campaign_name: string;
  processed_calls: number;
  new_calls_inserted?: number;
  duplicate_calls_skipped?: number;
  unique_leads: number;
  answered_calls: number;
  missed_calls: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
}

interface IvrCsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export function IvrCsvUploadModal({ isOpen, onClose, onSuccess, token }: IvrCsvUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState(
    `IVR Campaign - ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please drop a valid .csv file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid .csv file.');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select or drop a CSV file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('campaign_name', campaignName.trim() || 'IVR Campaign');

      const res = await fetch('/api/admin/leads/ivr-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to process IVR CSV report');
      }

      setStats(json);
      toast.success('IVR campaign processed successfully!');
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please verify CSV format.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setStats(null);
    setError(null);
    onClose();
  };

  return (
    <div className={MODAL_OVERLAY_CLASS}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="dark:border-brand-gold/25 relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-colors duration-300 dark:bg-[#0d0d14]"
      >
        <div className="via-brand-gold/60 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="border-brand-gold/30 bg-brand-gold/10 flex h-9 w-9 items-center justify-center rounded-xl border">
              <UploadCloud className="text-brand-gold h-4 w-4" />
            </div>
            <div>
              <h2 className="text-brand-navy font-serif text-lg font-semibold tracking-tight transition-colors duration-300 dark:text-white">
                Upload IVR Campaign
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Import dialer CDR reports (Number, Agent, Duration, Key)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetModal}
            className="hover:text-brand-gold cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!stats ? (
            <>
              {/* Campaign Name Input */}
              <div>
                <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Campaign Label / Reference
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Shivani Vatika Outbound IVR 15-Sep"
                  className="focus:border-brand-gold dark:focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2 text-xs text-gray-900 transition-colors focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Drag & Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragging
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'hover:border-brand-gold/60 dark:hover:border-brand-gold/40 border-gray-200 bg-gray-50/50 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.02]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileSpreadsheet className="text-brand-gold/80 mb-3 h-10 w-10" />
                {selectedFile ? (
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </span>
                    <p className="mt-1 text-[11px] text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose another file
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Drop your IVR .csv file here or{' '}
                      <span className="text-brand-gold underline">browse</span>
                    </span>
                    <p className="mt-1 text-[10px] text-gray-400">
                      Supports dialer CSVs with Number, AgentName, Duration, Dialstatus, PressedKey
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Stats Banner after Success */
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-bold">Import Completed Successfully!</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-white/5 dark:bg-white/5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    New Calls Inserted
                  </span>
                  <div className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {(stats.new_calls_inserted ?? stats.processed_calls).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-white/5 dark:bg-white/5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Duplicates Filtered
                  </span>
                  <div className="mt-0.5 text-lg font-bold text-amber-600 dark:text-amber-400">
                    {(stats.duplicate_calls_skipped ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-white/5 dark:bg-white/5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Total in CSV
                  </span>
                  <div className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white">
                    {stats.processed_calls.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-white/5 dark:bg-white/5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Unique Leads
                  </span>
                  <div className="mt-0.5 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {stats.unique_leads.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase dark:text-emerald-400">
                    Answered
                  </span>
                  <div className="mt-0.5 text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {stats.answered_calls.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                  <span className="text-[10px] font-bold text-rose-600 uppercase dark:text-rose-400">
                    Not Answered
                  </span>
                  <div className="mt-0.5 text-lg font-bold text-rose-700 dark:text-rose-300">
                    {stats.missed_calls.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Temperature breakdown */}
              <div className="flex items-center justify-around rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-center text-xs dark:border-white/5 dark:bg-white/[0.02]">
                <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                  <Flame className="h-4 w-4" />
                  <span>{stats.hot_leads} Hot</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <Zap className="h-4 w-4" />
                  <span>{stats.warm_leads} Warm</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                  <Snowflake className="h-4 w-4" />
                  <span>{stats.cold_leads} Cold</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5 backdrop-blur-md dark:border-white/8 dark:bg-black/20">
          <button
            type="button"
            onClick={resetModal}
            className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            {stats ? 'Done' : 'Cancel'}
          </button>
          {!stats && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-bold tracking-wider uppercase shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  <span>Processing CSV...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Import Leads</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
