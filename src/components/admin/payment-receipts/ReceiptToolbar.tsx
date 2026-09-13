import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  X,
  Download,
  BookOpen,
  Trash2,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
interface ReceiptToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  methodFilter: string;
  setMethodFilter: (val: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' }) => void;
  dateRange: { start: string; end: string };
  setDateRange: (
    val:
      | { start: string; end: string }
      | ((prev: { start: string; end: string }) => { start: string; end: string })
  ) => void;
  handleClearFilters: () => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  onOpenLedgers?: () => void;
  activeTab?: 'active' | 'trash';
  setActiveTab?: (tab: 'active' | 'trash') => void;
  trashedCount?: number;
}

export function ReceiptToolbar({
  searchQuery,
  setSearchQuery,
  methodFilter,
  setMethodFilter,
  sortConfig,
  setSortConfig,
  dateRange,
  setDateRange,
  handleClearFilters,
  onExportCsv,
  onExportExcel,
  onOpenLedgers,
  activeTab,
  setActiveTab,
  trashedCount,
}: ReceiptToolbarProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }
    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportOpen]);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64 sm:max-w-xs">
          <Search className="text-brand-gold absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 sm:left-3 sm:h-4 sm:w-4" />
          <input
            type="text"
            placeholder="Search by client, receipt or ref ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:border-brand-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white py-1.5 pr-3 pl-8 text-xs text-gray-900 transition-colors focus:outline-none sm:py-2 sm:pr-4 sm:pl-9 dark:border-white/8 dark:text-white"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {/* Date Range Inputs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="text-brand-gold h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              aria-label="Start date"
              className="focus:border-brand-gold dark:bg-brand-dark-surface min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[11px] text-gray-700 [color-scheme:light] outline-none sm:flex-initial sm:px-2 sm:py-1.5 sm:text-xs dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
            />
            <span className="text-xs text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              aria-label="End date"
              className="focus:border-brand-gold dark:bg-brand-dark-surface min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[11px] text-gray-700 [color-scheme:light] outline-none sm:flex-initial sm:px-2 sm:py-1.5 sm:text-xs dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
            />
          </div>

          {/* Method & Sort Dropdowns */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              aria-label="Filter by payment method"
              className="focus:border-brand-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-700 [color-scheme:light] outline-none sm:w-auto sm:px-3 sm:py-2 sm:text-xs sm:font-bold dark:border-white/10 dark:text-gray-200 dark:[color-scheme:dark]"
            >
              <option value="">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>

            <select
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction: direction as 'asc' | 'desc' });
              }}
              aria-label="Sort receipts"
              className="focus:border-brand-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-700 [color-scheme:light] outline-none sm:w-auto sm:px-3 sm:py-2 sm:text-xs sm:font-bold dark:border-white/10 dark:text-gray-200 dark:[color-scheme:dark]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Client (A-Z)</option>
              <option value="name-desc">Client (Z-A)</option>
              <option value="amount-desc">Amount (High-Low)</option>
              <option value="amount-asc">Amount (Low-High)</option>
              <option value="refId-asc">Ref ID (A-Z)</option>
              <option value="refId-desc">Ref ID (Z-A)</option>
            </select>
            {(onExportCsv || onExportExcel) && (
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsExportOpen((prev) => !prev)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 sm:px-3 sm:py-2 sm:text-xs ${
                    isExportOpen
                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold dark:border-brand-gold/60'
                      : 'hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold border-gray-200 bg-white text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200'
                  }`}
                  aria-expanded={isExportOpen}
                  title="Export options"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown
                    className={`h-3 w-3 text-gray-400 transition-transform duration-200 dark:text-gray-400 ${
                      isExportOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExportOpen && (
                  <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-40 mt-1.5 w-48 origin-top-right rounded-xl border border-gray-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-md duration-100 dark:border-white/10 dark:bg-[#0B132B]/95 dark:shadow-black/70">
                    <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-400">
                      Export Format
                    </div>
                    {onExportCsv && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportOpen(false);
                          onExportCsv();
                        }}
                        className="hover:bg-brand-gold/10 hover:text-brand-gold dark:hover:bg-brand-gold/15 dark:hover:text-brand-gold flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-gray-700 transition-colors dark:text-gray-200"
                      >
                        <div className="bg-brand-gold/10 text-brand-gold dark:bg-brand-gold/20 flex h-6 w-6 items-center justify-center rounded-md">
                          <Download className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Export CSV
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-400">
                            .csv spreadsheet
                          </span>
                        </div>
                      </button>
                    )}
                    {onExportExcel && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportOpen(false);
                          onExportExcel();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-gray-200 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-400"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Export Excel
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-400">
                            .xlsx workbook
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {onOpenLedgers && (
              <button
                type="button"
                onClick={onOpenLedgers}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-600 active:scale-95 sm:px-3 sm:py-2 sm:text-xs dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-sky-400"
                title="Customer Ledgers Overview"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ledgers</span>
              </button>
            )}
            {setActiveTab && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'trash' ? 'active' : 'trash')}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 sm:px-3 sm:py-2 sm:text-xs ${
                  activeTab === 'trash'
                    ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/20 dark:text-rose-400'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:border-rose-500/40 dark:hover:text-rose-400'
                }`}
                title={
                  activeTab === 'trash'
                    ? 'Back to Active Receipts'
                    : 'View Trash & Recover Deleted Receipts'
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {activeTab === 'trash' ? 'Active Records' : 'Trash'}
                </span>
                {typeof trashedCount === 'number' && trashedCount > 0 && (
                  <span className="py-0.2 rounded-full bg-rose-500/20 px-1.5 text-[10px] font-bold text-rose-600 dark:bg-rose-500/30 dark:text-rose-400">
                    {trashedCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {(searchQuery || methodFilter || dateRange.start || dateRange.end) && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Active Filters:</span>
          <button
            onClick={handleClearFilters}
            className="text-brand-gold hover:text-brand-navy flex items-center gap-1 font-medium transition-colors dark:hover:text-white"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
