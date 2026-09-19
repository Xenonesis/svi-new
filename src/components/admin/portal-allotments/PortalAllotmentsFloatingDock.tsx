'use client';

import React from 'react';
import { MessageSquare, Download, X } from 'lucide-react';

export interface PortalAllotmentsFloatingDockProps {
  selectedCount: number;
  selectedTotalBalance: number;
  onOpenBulkWhatsApp: () => void;
  onExportSelected: () => void;
  onClearSelection: () => void;
}

export function PortalAllotmentsFloatingDock({
  selectedCount,
  selectedTotalBalance,
  onOpenBulkWhatsApp,
  onExportSelected,
  onClearSelection,
}: PortalAllotmentsFloatingDockProps): React.JSX.Element | null {
  if (selectedCount <= 0) {
    return null;
  }

  const formattedBalance = selectedTotalBalance.toLocaleString('en-IN');

  return (
    <div
      data-testid="portal-allotments-floating-dock"
      className="border-brand-gold/30 animate-in fade-in slide-in-from-bottom-4 fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-wrap items-center gap-4 rounded-2xl border bg-[#0f2942]/95 px-5 py-3 text-white shadow-2xl backdrop-blur-md duration-200 dark:bg-gray-900/95"
    >
      {/* Selection Indicator */}
      <div className="bg-brand-gold/20 border-brand-gold/40 text-brand-gold rounded-lg border px-2.5 py-1 text-xs font-bold">
        {selectedCount} Selected
      </div>

      {/* Financial Indicator */}
      <div className="text-xs font-medium text-gray-300">Pending Balance: ₹{formattedBalance}</div>

      <div className="hidden h-4 w-px bg-white/20 sm:block" />

      {/* Action Button 1: WhatsApp Reminders */}
      <button
        type="button"
        onClick={onOpenBulkWhatsApp}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-500 active:scale-95"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>WhatsApp Reminders</span>
      </button>

      {/* Action Button 2: Export Selected */}
      <button
        type="button"
        onClick={onExportSelected}
        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-white/20 active:scale-95"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Export Selected</span>
      </button>

      {/* Action Button 3: Clear */}
      <button
        type="button"
        onClick={onClearSelection}
        aria-label="Deselect All"
        title="Deselect All"
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
