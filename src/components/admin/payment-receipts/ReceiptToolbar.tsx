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

export interface ReceiptToolbarProps {
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
  pageSize?: number;
  setPageSize?: (size: number) => void;
  totalCount?: number;
  totalFiltered?: number;
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
  pageSize,
  setPageSize,
}: ReceiptToolbarProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsExportOpen(false);
      }
    }

    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExportOpen]);

  const hasActiveFilters = Boolean(searchQuery || methodFilter || dateRange.start || dateRange.end);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4">
      {/* 2-Zone Executive Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Zone 1: Primary Search & Filter Bar */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="text-brand-gold pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client, receipt or ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:border-brand-gold w-full rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-9 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:outline-none dark:border-white/[0.08] dark:bg-[#111622] dark:text-white dark:placeholder-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Date Range Controls */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs transition-colors dark:border-white/[0.08] dark:bg-[#111622]">
            <Calendar className="text-brand-gold h-4 w-4 shrink-0" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              aria-label="Start date"
              className="bg-transparent text-xs text-slate-700 [color-scheme:light] outline-none dark:text-slate-200 dark:[color-scheme:dark]"
            />
            <span className="text-slate-300 dark:text-slate-600">&ndash;</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              aria-label="End date"
              className="bg-transparent text-xs text-slate-700 [color-scheme:light] outline-none dark:text-slate-200 dark:[color-scheme:dark]"
            />
          </div>

          {/* Payment Method Dropdown */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            aria-label="Filter by payment method"
            className="focus:border-brand-gold rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 [color-scheme:light] transition-colors outline-none dark:border-white/[0.08] dark:bg-[#111622] dark:text-slate-200 dark:[color-scheme:dark]"
          >
            <option value="">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          {/* Sort Config Dropdown */}
          <select
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-');
              setSortConfig({ key, direction: direction as 'asc' | 'desc' });
            }}
            aria-label="Sort receipts"
            className="focus:border-brand-gold rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 [color-scheme:light] transition-colors outline-none dark:border-white/[0.08] dark:bg-[#111622] dark:text-slate-200 dark:[color-scheme:dark]"
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
        </div>

        {/* Zone 2: Action & Density Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Page Size Selector */}
          {setPageSize && (
            <select
              value={pageSize ?? 25}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Page size"
              className="focus:border-brand-gold rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 [color-scheme:light] transition-colors outline-none dark:border-white/[0.08] dark:bg-[#111622] dark:text-slate-200 dark:[color-scheme:dark]"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={0}>Show All</option>
            </select>
          )}

          {/* Customer Ledgers Trigger */}
          {onOpenLedgers && (
            <button
              type="button"
              onClick={onOpenLedgers}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-600 active:scale-95 dark:border-white/[0.08] dark:bg-[#111622] dark:text-slate-200 dark:hover:text-sky-400"
              title="Customer Ledgers Overview"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Ledgers</span>
            </button>
          )}

          {/* Export Dropdown */}
          {(onExportCsv || onExportExcel) && (
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setIsExportOpen((prev) => !prev)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                  isExportOpen
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold dark:border-brand-gold/60'
                    : 'hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold border-slate-200 bg-white text-slate-700 dark:border-white/[0.08] dark:bg-[#111622] dark:text-slate-200'
                }`}
                aria-expanded={isExportOpen}
                aria-label="Export options"
                title="Export options"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
                <ChevronDown
                  className={`h-3 w-3 text-slate-400 transition-transform duration-200 dark:text-slate-400 ${
                    isExportOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isExportOpen && (
                <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-40 mt-1.5 w-48 origin-top-right rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-md duration-100 dark:border-white/[0.08] dark:bg-[#111622]/95 dark:shadow-black/70">
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-400">
                    Export Format
                  </div>
                  {onExportCsv && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportOpen(false);
                        onExportCsv();
                      }}
                      className="hover:bg-brand-gold/10 hover:text-brand-gold dark:hover:bg-brand-gold/15 dark:hover:text-brand-gold flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition-colors dark:text-slate-200"
                    >
                      <div className="bg-brand-gold/10 text-brand-gold dark:bg-brand-gold/20 flex h-6 w-6 items-center justify-center rounded-md">
                        <Download className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Export CSV
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400">
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
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-slate-200 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-400"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Export Excel
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400">
                          .xlsx workbook
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Trash / Active Toggle */}
          {setActiveTab && (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'trash' ? 'active' : 'trash')}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                activeTab === 'trash'
                  ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/20 dark:text-rose-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-600 dark:border-white/[0.08] dark:bg-[#111622] dark:text-slate-200 dark:hover:border-rose-500/40 dark:hover:text-rose-400'
              }`}
              title={
                activeTab === 'trash'
                  ? 'Back to Active Receipts'
                  : 'View Trash & Recover Deleted Receipts'
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{activeTab === 'trash' ? 'Active Records' : 'Trash'}</span>
              {typeof trashedCount === 'number' && trashedCount > 0 && (
                <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-500/30 dark:text-rose-400">
                  {trashedCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Badge & Reset Pill */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#111622]/80">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Active Filters:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <span>
                Query:{' '}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  &quot;{searchQuery}&quot;
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-white"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {methodFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <span>
                Method:{' '}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {methodFilter}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setMethodFilter('')}
                className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-white"
                aria-label="Remove method filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {(dateRange.start || dateRange.end) && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <span>
                Date:{' '}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {dateRange.start || 'Any'} &rarr; {dateRange.end || 'Any'}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setDateRange({ start: '', end: '' })}
                className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-white"
                aria-label="Remove date filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearFilters}
            className="text-brand-gold ml-auto inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-amber-500 dark:hover:text-amber-300"
          >
            <X className="h-3.5 w-3.5" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
