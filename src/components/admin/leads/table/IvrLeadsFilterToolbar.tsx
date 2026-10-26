import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
  Snowflake,
  Sparkles,
  SlidersHorizontal,
  Download,
  Calendar,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  X,
} from 'lucide-react';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { IvrFilterState } from '../IvrLeadsTable';
import { AdvisorFilterDropdown } from './AdvisorFilterDropdown';

interface IvrLeadsFilterToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  employees: Employee[];
  activeAdvisor: string;
  handleAdvisorChange: (id: string) => void;
  activeDialStatus: 'all' | 'ANSWER' | 'NOANSWER';
  handleDialStatusClick: (status: 'all' | 'ANSWER' | 'NOANSWER') => void;
  activeTemp: 'all' | 'hot' | 'warm' | 'cold' | 'ai';
  handleTempClick: (temp: 'all' | 'hot' | 'warm' | 'cold' | 'ai') => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean | ((prev: boolean) => boolean)) => void;
  hasActiveAdvancedFilters: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  activeDate: string;
  handleDateChange: (date: string) => void;
  activePressedKey: 'all' | '1' | 'none';
  handlePressedKeyChange: (key: 'all' | '1' | 'none') => void;
  activeDuration: 'all' | 'lt_30' | '30_60' | 'gt_60';
  handleDurationFilterChange: (dur: 'all' | 'lt_30' | '30_60' | 'gt_60') => void;
  handleResetFilters: () => void;
  exportMenuRef: React.RefObject<HTMLDivElement | null>;
  exportMenuOpen: boolean;
  setExportMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  handleExportExcel: () => void;
  handleExportPdf: () => void;
  handleExportCsv: () => void;
  selectedCount: number;
  summary?: {
    total_calls: number;
    answered_calls: number;
    missed_calls: number;
    hot_count: number;
    warm_count: number;
    cold_count: number;
  };
}

export function IvrLeadsFilterToolbar({
  searchTerm,
  setSearchTerm,
  handleSearchSubmit,
  employees,
  activeAdvisor,
  handleAdvisorChange,
  activeDialStatus,
  handleDialStatusClick,
  activeTemp,
  handleTempClick,
  showAdvancedFilters,
  setShowAdvancedFilters,
  hasActiveAdvancedFilters,
  setIsExportModalOpen,
  activeDate,
  handleDateChange,
  activePressedKey,
  handlePressedKeyChange,
  activeDuration,
  handleDurationFilterChange,
  handleResetFilters,
  exportMenuRef,
  exportMenuOpen,
  setExportMenuOpen,
  handleExportExcel,
  handleExportPdf,
  handleExportCsv,
  selectedCount,
  summary,
}: IvrLeadsFilterToolbarProps) {
  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors duration-300 lg:flex-row lg:items-center lg:justify-between dark:border-white/5 dark:bg-[#0f0f16]">
        {/* Left: Search & Advisor Dropdown */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search phone or advisor..."
              className="focus:border-brand-gold focus:ring-brand-gold/30 dark:focus:border-brand-gold dark:focus:ring-brand-gold/30 w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2 pr-4 pl-9 text-xs text-gray-900 transition-all focus:bg-white focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-[#161D2C]"
            />
          </form>

          <AdvisorFilterDropdown
            employees={employees}
            selectedAdvisorId={activeAdvisor}
            onChange={handleAdvisorChange}
          />
        </div>

        {/* Right: Dial Status & Temperature Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dial Status Filter Group */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/80 p-0.5 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => handleDialStatusClick('all')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeDialStatus === 'all'
                  ? 'text-brand-navy bg-white shadow-sm dark:bg-white/15 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              All Calls
            </button>
            <button
              type="button"
              onClick={() => handleDialStatusClick('ANSWER')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeDialStatus === 'ANSWER'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              Answered {summary?.answered_calls ? `(${summary.answered_calls})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleDialStatusClick('NOANSWER')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeDialStatus === 'NOANSWER'
                  ? 'bg-rose-50 text-rose-700 shadow-sm dark:bg-rose-500/20 dark:text-rose-300'
                  : 'text-rose-600 hover:text-rose-700 dark:text-rose-400'
              }`}
            >
              <XCircle className="h-3 w-3" />
              Not Answered {summary?.missed_calls ? `(${summary.missed_calls})` : ''}
            </button>
          </div>

          {/* Temperature Filter Group */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/80 p-0.5 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => handleTempClick('all')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTemp === 'all'
                  ? 'text-brand-navy bg-white shadow-sm dark:bg-white/15 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleTempClick('hot')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTemp === 'hot'
                  ? 'bg-rose-50 text-rose-700 shadow-sm dark:bg-rose-500/20 dark:text-rose-300'
                  : 'text-rose-600 hover:text-rose-700 dark:text-rose-400'
              }`}
            >
              <Flame className="h-3 w-3" /> Hot
            </button>
            <button
              type="button"
              onClick={() => handleTempClick('warm')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTemp === 'warm'
                  ? 'bg-amber-50 text-amber-700 shadow-sm dark:bg-amber-500/20 dark:text-amber-300'
                  : 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
              }`}
            >
              <Zap className="h-3 w-3" /> Warm
            </button>
            <button
              type="button"
              onClick={() => handleTempClick('cold')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTemp === 'cold'
                  ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-500/20 dark:text-blue-300'
                  : 'text-blue-600 hover:text-blue-700 dark:text-blue-400'
              }`}
            >
              <Snowflake className="h-3 w-3" /> Cold
            </button>
            <button
              type="button"
              onClick={() => handleTempClick('ai')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTemp === 'ai'
                  ? 'bg-amber-100 font-bold text-amber-800 shadow-sm dark:bg-amber-500/20 dark:text-amber-300'
                  : 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
              }`}
            >
              <Sparkles className="h-3 w-3 animate-pulse text-amber-500" /> AI Insights
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              showAdvancedFilters ||
              activePressedKey !== 'all' ||
              activeDuration !== 'all' ||
              activeDate
                ? 'border-brand-gold bg-brand-gold/15 text-brand-gold font-bold shadow-xs'
                : 'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-950 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
            title="Toggle more filters (Date, DTMF Key, Duration)"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>More Filters</span>
            {(activePressedKey !== 'all' || activeDuration !== 'all' || activeDate) && (
              <span className="bg-brand-gold text-brand-navy flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold">
                {
                  [
                    activePressedKey !== 'all',
                    activeDuration !== 'all',
                    Boolean(activeDate),
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>

          {/* Quick Export Suite Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 shadow-2xs dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
                title="Open Export Studio to customize advisor and date range"
              >
                <Download className="text-brand-gold h-3.5 w-3.5" />
                <span>Export</span>
              </button>
              <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="cursor-pointer px-2 py-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                title="More export formats (Excel, PDF)"
                aria-label="Export format options"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    exportMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

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
                    Export {selectedCount > 0 ? `${selectedCount} Selected` : 'Page Leads'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
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
                      <p className="leading-tight">Excel Spreadsheet</p>
                      <span className="text-[10px] font-normal text-gray-400">
                        Formatted .xlsx file
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
                        Printable branded report
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
                      <span className="text-[10px] font-normal text-gray-400">
                        Standard .csv format
                      </span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Expandable Advanced Filters Panel */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/80 p-4 shadow-xs dark:border-white/5 dark:bg-[#13131c]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Specific Day Filter */}
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      <Calendar className="text-brand-gold h-3 w-3" />
                      <span>Specific Date</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={activeDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="focus:border-brand-gold rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                      />
                      {activeDate && (
                        <button
                          type="button"
                          onClick={() => handleDateChange('')}
                          className="rounded-lg p-1 text-gray-400 hover:text-rose-500"
                          title="Clear date"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DTMF Key Pressed Filter */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      DTMF Pressed Key
                    </label>
                    <div className="flex items-center rounded-xl border border-gray-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/5">
                      <button
                        type="button"
                        onClick={() => handlePressedKeyChange('all')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          activePressedKey === 'all'
                            ? 'bg-brand-gold/15 text-brand-gold'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        All Keys
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePressedKeyChange('1')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          activePressedKey === '1'
                            ? 'bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-500 hover:text-emerald-600 dark:text-gray-400'
                        }`}
                      >
                        Key 1 (Interested)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePressedKeyChange('none')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          activePressedKey === 'none'
                            ? 'bg-rose-500/15 font-bold text-rose-600 dark:text-rose-400'
                            : 'text-gray-500 hover:text-rose-600 dark:text-gray-400'
                        }`}
                      >
                        No Key
                      </button>
                    </div>
                  </div>

                  {/* Call Duration Filter */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      Call Duration
                    </label>
                    <div className="flex items-center rounded-xl border border-gray-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/5">
                      <button
                        type="button"
                        onClick={() => handleDurationFilterChange('all')}
                        className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                          activeDuration === 'all'
                            ? 'bg-brand-gold/15 text-brand-gold'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        Any
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDurationFilterChange('lt_30')}
                        className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                          activeDuration === 'lt_30'
                            ? 'bg-rose-500/15 font-bold text-rose-600 dark:text-rose-400'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        &lt; 30s
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDurationFilterChange('30_60')}
                        className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                          activeDuration === '30_60'
                            ? 'bg-amber-500/15 font-bold text-amber-600 dark:text-amber-400'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        30s - 60s
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDurationFilterChange('gt_60')}
                        className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                          activeDuration === 'gt_60'
                            ? 'bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        &gt; 60s
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reset all button */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
