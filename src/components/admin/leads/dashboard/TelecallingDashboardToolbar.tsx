import type { RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  RefreshCw,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import type { TimeRange } from '@/src/lib/types/telecalling';

interface TelecallingDashboardToolbarProps {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  fetchDashboardData: (isManualRefresh?: boolean) => void;
  isRefreshing: boolean;
  exportMenuRef: RefObject<HTMLDivElement | null>;
  exportMenuOpen: boolean;
  setExportMenuOpen: (open: boolean) => void;
  setSelectedExportAdvisor: (advisorId: string) => void;
  setIsExportModalOpen: (open: boolean) => void;
  handleExportExcel: () => void;
  handleExportPdf: () => void;
  handleExportCsv: () => void;
}

export function TelecallingDashboardToolbar({
  timeRange,
  setTimeRange,
  fetchDashboardData,
  isRefreshing,
  exportMenuRef,
  exportMenuOpen,
  setExportMenuOpen,
  setSelectedExportAdvisor,
  setIsExportModalOpen,
  handleExportExcel,
  handleExportPdf,
  handleExportCsv,
}: TelecallingDashboardToolbarProps) {
  return (
    <div className="dark:to-brand-gold/[0.03] flex flex-col gap-4 rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-gray-50/50 to-amber-500/[0.03] p-6 shadow-sm transition-colors duration-300 lg:flex-row lg:items-center lg:justify-between dark:border-white/5 dark:from-[#0d0d14] dark:via-[#0a0a10]">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
                Telecalling &amp; Conversion Command Center
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Real-time telecaller productivity, connected rates, hot lead generation &amp;
              advisor conversion rankings
            </p>
          </div>
        </div>
      </div>

      {/* Global Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Time Filter Pills */}
        <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-white/10 dark:bg-[#13131c]">
          {(
            [
              { key: 'all', label: 'All Time' },
              { key: 'today', label: 'Today' },
              { key: 'week', label: '7 Days' },
              { key: 'month', label: '30 Days' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTimeRange(item.key)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 transition-all ${
                timeRange === item.key
                  ? 'bg-brand-navy dark:bg-brand-gold dark:text-brand-navy font-bold text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#13131c] dark:text-gray-300 dark:hover:bg-white/5"
          title="Refresh live metrics"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? 'text-brand-gold animate-spin' : ''}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Export Dropdown Suite */}
        <div className="relative" ref={exportMenuRef}>
          <button
            type="button"
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold shadow-2xs transition-colors"
            title="Export advisor report (Excel, PDF, CSV)"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report</span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {exportMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 z-40 mt-1.5 w-48 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#13131c]"
              >
                <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Advisor Leaderboard
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExportAdvisor('all');
                    setIsExportModalOpen(true);
                    setExportMenuOpen(false);
                  }}
                  className="bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <div className="text-left">
                    <p className="leading-tight">Custom Export Studio...</p>
                    <span className="text-[10px] font-normal opacity-80">
                      By Advisor, Date & Status
                    </span>
                  </div>
                </button>
                <div className="my-1 border-t border-gray-100 dark:border-white/5" />
                <button
                  type="button"
                  onClick={() => {
                    handleExportExcel();
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-left">
                    <p className="leading-tight">Excel (.xlsx)</p>
                    <span className="text-[10px] font-normal text-gray-400">
                      Formatted spreadsheet
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleExportPdf();
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-gray-200 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <FileText className="h-4 w-4 text-red-500" />
                  <div className="text-left">
                    <p className="leading-tight">PDF Document</p>
                    <span className="text-[10px] font-normal text-gray-400">
                      Printable report
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleExportCsv();
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-gray-200 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                >
                  <Download className="h-4 w-4 text-amber-500" />
                  <div className="text-left">
                    <p className="leading-tight">CSV Spreadsheet</p>
                    <span className="text-[10px] font-normal text-gray-400">Universal .csv</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
