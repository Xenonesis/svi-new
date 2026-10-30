'use client';

import type { ReactElement } from 'react';
import { UserCheck, FileSpreadsheet, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Registration } from './types';

interface RegistrationsFloatingDockProps {
  selectedCount: number;
  selectedRegistrations: Registration[];
  onReassign: (regs: Registration[]) => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onClearSelection: () => void;
}

export function RegistrationsFloatingDock({
  selectedCount,
  selectedRegistrations,
  onReassign,
  onExportExcel,
  onExportCsv,
  onClearSelection,
}: RegistrationsFloatingDockProps): ReactElement {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
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
            <span className="text-xs font-semibold">Registrations Selected</span>
          </div>

          <button
            type="button"
            onClick={() => onReassign(selectedRegistrations)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-600/30 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-all hover:bg-amber-600/40 hover:text-white"
            title="Reassign selected registrations to advisor"
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Reassign Advisor</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-600/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-600/40 hover:text-white"
            title="Export selected registrations to Excel"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-all hover:bg-white/20 hover:text-white"
            title="Export selected registrations to CSV"
          >
            <Download className="text-brand-gold h-3.5 w-3.5" />
            <span>CSV (.csv)</span>
          </button>

          <button
            type="button"
            onClick={onClearSelection}
            className="flex cursor-pointer items-center gap-1 rounded-xl px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            title="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
            <span className="text-[11px]">Clear</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
