import type { RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, ChevronDown, FileSpreadsheet, FileText, X } from 'lucide-react';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';

interface IvrBulkActionDockProps {
  selectedCount: number;
  employees: Employee[];
  bulkLoading: boolean;
  handleBulkReassign: (advisorId: string) => void;
  handleBulkStage: (stage: string) => void;
  dockExportMenuRef: RefObject<HTMLDivElement | null>;
  dockExportMenuOpen: boolean;
  setDockExportMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  handleExportExcel: () => void;
  handleExportPdf: () => void;
  handleExportCsv: () => void;
  onClearSelection: () => void;
}

export function IvrBulkActionDock({
  selectedCount,
  employees,
  bulkLoading,
  handleBulkReassign,
  handleBulkStage,
  dockExportMenuRef,
  dockExportMenuOpen,
  setDockExportMenuOpen,
  handleExportExcel,
  handleExportPdf,
  handleExportCsv,
  onClearSelection,
}: IvrBulkActionDockProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="border-brand-gold/30 bg-brand-navy/95 fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-wrap items-center gap-3 rounded-2xl border px-5 py-3 text-white shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center gap-2 border-r border-white/10 pr-3">
          <span className="bg-brand-gold text-brand-navy flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
            {selectedCount}
          </span>
          <span className="text-xs font-semibold">Leads Selected</span>
        </div>

        {/* Bulk Reassign Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400">Assign:</span>
          <select
            onChange={(e) => {
              if (e.target.value) handleBulkReassign(e.target.value);
            }}
            defaultValue=""
            disabled={bulkLoading}
            style={{ colorScheme: 'dark light' }}
            className="rounded-xl border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white focus:outline-none dark:bg-[#1a1a25] [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white"
          >
            <option value="" disabled>
              Select Advisor...
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Stage Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400">Stage:</span>
          <select
            onChange={(e) => {
              if (e.target.value) handleBulkStage(e.target.value);
            }}
            defaultValue=""
            disabled={bulkLoading}
            style={{ colorScheme: 'dark light' }}
            className="rounded-xl border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white focus:outline-none dark:bg-[#1a1a25] [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white"
          >
            <option value="" disabled>
              Move Stage...
            </option>
            <option value="contacted">Contacted</option>
            <option value="visit_scheduled">Visit Scheduled</option>
            <option value="visited">Site Visited</option>
            <option value="booked">Booked</option>
            <option value="lost">Lost / Dropped</option>
          </select>
        </div>

        {/* Export Selected Dropdown */}
        <div className="relative" ref={dockExportMenuRef}>
          <button
            type="button"
            onClick={() => setDockExportMenuOpen(!dockExportMenuOpen)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20"
            title="Export selected leads"
          >
            <Download className="text-brand-gold h-3.5 w-3.5" />
            <span>Export ({selectedCount})</span>
            <ChevronDown
              className={`h-3 w-3 opacity-70 transition-transform ${
                dockExportMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {dockExportMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 bottom-full z-50 mb-2 w-44 rounded-2xl border border-white/10 bg-[#13131c] p-1.5 shadow-2xl backdrop-blur-xl"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleExportExcel();
                    setDockExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-emerald-500/10 hover:text-emerald-400"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExportPdf();
                    setDockExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-red-500/10 hover:text-red-400"
                >
                  <FileText className="h-3.5 w-3.5 text-red-400" />
                  <span>PDF Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExportCsv();
                    setDockExportMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-white/10 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5 text-amber-400" />
                  <span>CSV (.csv)</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="rounded-lg p-1 text-gray-400 hover:text-white"
          title="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
