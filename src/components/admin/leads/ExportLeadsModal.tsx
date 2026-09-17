import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  X,
  FileSpreadsheet,
  FileText,
  FileCode,
  Calendar,
  User,
  Filter,
  Layers,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import {
  exportIvrLeadsToExcel,
  exportIvrLeadsToPdf,
  exportIvrLeadsToCsv,
} from '@/src/lib/leads/exportIvrLeads';

export type ExportFormat = 'excel' | 'pdf' | 'csv';
export type ExportDateScope = 'all' | 'today' | 'yesterday' | 'custom';
export type ExportRecordScope = 'all_matching' | 'current_page';

export interface ExportAdvisorOption {
  id: string;
  name: string;
}

export interface ExportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  employees: Array<{ id: string; full_name: string }>;
  currentRecords: IvrRecordItem[];
  totalRecordsCount: number;
  currentFilters?: {
    advisor_id?: string;
    dial_status?: string;
    temperature?: string;
  };
}

export function ExportLeadsModal({
  isOpen,
  onClose,
  token,
  employees,
  currentRecords,
  totalRecordsCount,
  currentFilters,
}: ExportLeadsModalProps) {
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [advisorId, setAdvisorId] = useState<string>(currentFilters?.advisor_id || 'all');

  useEffect(() => {
    if (currentFilters?.advisor_id) {
      setAdvisorId(currentFilters.advisor_id);
    }
  }, [currentFilters?.advisor_id]);
  const [dateScope, setDateScope] = useState<ExportDateScope>('all');
  const [customDate, setCustomDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [dialStatus, setDialStatus] = useState<string>(currentFilters?.dial_status || 'all');
  const [recordScope, setRecordScope] = useState<ExportRecordScope>('all_matching');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let recordsToExport: IvrRecordItem[] = [];

      if (recordScope === 'current_page') {
        recordsToExport = currentRecords;
      } else {
        // Build query params to fetch all matching records
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('limit', '5000'); // Fetch full dataset for export

        if (advisorId !== 'all') {
          params.set('advisor_id', advisorId);
        }
        if (dialStatus !== 'all') {
          params.set('dial_status', dialStatus);
        }

        if (dateScope === 'today') {
          const todayStr = new Date().toISOString().slice(0, 10);
          params.set('date', todayStr);
        } else if (dateScope === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          params.set('date', yesterday.toISOString().slice(0, 10));
        } else if (dateScope === 'custom' && customDate) {
          params.set('date', customDate);
        }

        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`/api/admin/leads/ivr-records?${params.toString()}`, {
          credentials: 'omit',
          headers,
        });
        if (!res.ok) {
          throw new Error('Failed to fetch records for export');
        }
        const data = await res.json();
        recordsToExport = (data.records || []) as IvrRecordItem[];
      }

      if (recordsToExport.length === 0) {
        toast.error('No matching records found to export');
        setIsExporting(false);
        return;
      }

      // Generate clear dynamic filename
      const matchedAdvisor = employees.find((e) => e.id === advisorId);
      const advisorSlug = matchedAdvisor
        ? matchedAdvisor.full_name.replace(/\s+/g, '_')
        : advisorId !== 'all'
          ? 'Selected_Advisor'
          : 'All_Advisors';

      const dateSlug =
        dateScope === 'today'
          ? 'Today'
          : dateScope === 'yesterday'
            ? 'Yesterday'
            : dateScope === 'custom'
              ? customDate
              : 'All_Time';

      const baseName = `svi-leads-${advisorSlug}-${dateSlug}`;

      if (format === 'excel') {
        await exportIvrLeadsToExcel(recordsToExport, `${baseName}.xlsx`);
      } else if (format === 'pdf') {
        await exportIvrLeadsToPdf(recordsToExport, `${baseName}.pdf`);
      } else {
        exportIvrLeadsToCsv(recordsToExport, `${baseName}.csv`);
      }

      toast.success(
        `Successfully exported ${recordsToExport.length} leads in ${format.toUpperCase()} format!`
      );
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export leads. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl transition-colors dark:border-white/10 dark:bg-[#11111a]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 text-brand-gold flex h-10 w-10 items-center justify-center rounded-xl">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="export-modal-title"
                className="text-base font-bold text-gray-900 dark:text-white"
              >
                Export Telecalling Leads Studio
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate tailored Excel, PDF, or CSV reports by advisor and date.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-200"
            aria-label="Close export modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-5">
          {/* 1. Format Selection */}
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              1. Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all ${
                  format === 'excel'
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20'
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all ${
                  format === 'pdf'
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20'
                }`}
              >
                <FileText className="h-5 w-5 text-rose-500" />
                <span>PDF Document</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all ${
                  format === 'csv'
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20'
                }`}
              >
                <FileCode className="h-5 w-5 text-blue-500" />
                <span>Raw CSV</span>
              </button>
            </div>
          </div>

          {/* 2. Advisor Selection */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              <User className="text-brand-gold h-3.5 w-3.5" />
              2. Attended / Follow-Up Advisor
            </label>
            <select
              value={advisorId}
              onChange={(e) => setAdvisorId(e.target.value)}
              className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 shadow-sm transition-colors focus:outline-none dark:border-white/10 dark:bg-[#161622] dark:text-gray-200"
            >
              <option value="all">🌐 All Advisors (Full Team)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  👤 {emp.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Date Range Filter */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              <Calendar className="text-brand-gold h-3.5 w-3.5" />
              3. Date Scope
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['all', 'today', 'yesterday', 'custom'] as ExportDateScope[]).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setDateScope(scope)}
                  className={`rounded-lg py-1.5 text-[11px] font-medium capitalize transition-all ${
                    dateScope === scope
                      ? 'bg-brand-gold font-semibold text-black shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                  }`}
                >
                  {scope === 'all'
                    ? 'All Time'
                    : scope === 'today'
                      ? 'Today'
                      : scope === 'yesterday'
                        ? 'Yesterday'
                        : 'Specific Day'}
                </button>
              ))}
            </div>

            {dateScope === 'custom' && (
              <div className="mt-2.5">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 shadow-sm transition-colors focus:outline-none dark:border-white/10 dark:bg-[#161622] dark:text-gray-200"
                />
              </div>
            )}
          </div>

          {/* 4. Dial Status Filter */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              <Filter className="text-brand-gold h-3.5 w-3.5" />
              4. Call Dial Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Calls' },
                { id: 'ANSWER', label: 'Answered Only' },
                { id: 'NOANSWER', label: 'Missed Only' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDialStatus(item.id)}
                  className={`rounded-xl border py-1.5 text-xs font-medium transition-all ${
                    dialStatus === item.id
                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-white/10 dark:text-gray-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              <Layers className="text-brand-gold h-3.5 w-3.5" />
              5. Records Scope
            </label>
            <div
              className={`grid gap-2 ${currentRecords.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}
            >
              <button
                type="button"
                onClick={() => setRecordScope('all_matching')}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                  recordScope === 'all_matching'
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold font-medium'
                    : 'border-gray-200 text-gray-600 dark:border-white/10 dark:text-gray-400'
                }`}
              >
                <div
                  className={`h-3 w-3 rounded-full border ${
                    recordScope === 'all_matching'
                      ? 'border-brand-gold bg-brand-gold'
                      : 'border-gray-400'
                  }`}
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    All Matching Records
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Full dataset {totalRecordsCount > 0 ? `(Total: ${totalRecordsCount})` : ''}
                  </p>
                </div>
              </button>
              {currentRecords.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRecordScope('current_page')}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                    recordScope === 'current_page'
                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold font-medium'
                      : 'border-gray-200 text-gray-600 dark:border-white/10 dark:text-gray-400'
                  }`}
                >
                  <div
                    className={`h-3 w-3 rounded-full border ${
                      recordScope === 'current_page'
                        ? 'border-brand-gold bg-brand-gold'
                        : 'border-gray-400'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Current Page Only</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Visible table ({currentRecords.length} records)
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-brand-gold hover:bg-brand-gold/90 flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-black shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Export {format.toUpperCase()} (
                  {recordScope === 'current_page' ? currentRecords.length : 'All Matching'})
                </span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
