'use client';

import React from 'react';
import {
  MessageSquare,
  Download,
  X,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
export interface PortalAllotmentsFloatingDockProps {
  selectedCount: number;
  selectedTotalBalance: number;
  onOpenBulkWhatsApp: () => void;
  onExportSelected: (format: 'csv' | 'excel' | 'pdf') => void | Promise<void>;
  isExporting?: boolean;
  onClearSelection: () => void;
}

export function PortalAllotmentsFloatingDock({
  selectedCount,
  selectedTotalBalance,
  onOpenBulkWhatsApp,
  onExportSelected,
  isExporting = false,
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
      <div className="bg-brand-gold/20 border-brand-gold/40 text-brand-gold rounded-lg border px-2.5 py-1 text-xs font-bold">
        {selectedCount} Selected
      </div>

      <div className="text-xs font-medium text-gray-300">Pending Balance: ₹{formattedBalance}</div>

      <div className="hidden h-4 w-px bg-white/20 sm:block" />

      <button
        type="button"
        onClick={onOpenBulkWhatsApp}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-500 active:scale-95"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>WhatsApp Reminders</span>
      </button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            onClick={() => onExportSelected('csv')}
            disabled={isExporting}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-white/20 active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Export Selected</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="center"
            sideOffset={8}
            className="animate-in fade-in zoom-in-95 z-50 min-w-[240px] rounded-xl border border-white/10 bg-[#0c1626]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl"
          >
            <DropdownMenu.Label className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Export Format ({selectedCount} Selected)
            </DropdownMenu.Label>
            <DropdownMenu.Item
              onClick={() => onExportSelected('excel')}
              className="group flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs outline-none select-none hover:bg-white/10"
            >
              <div className="mt-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-1 text-emerald-400">
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-100">Official Excel (.xlsx)</span>
                <span className="text-[10px] text-gray-400">
                  SVI logo, formulas & payment ledgers
                </span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => onExportSelected('pdf')}
              className="group flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs outline-none select-none hover:bg-white/10"
            >
              <div className="mt-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-1 text-amber-400">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-100">Official PDF Dossier</span>
                <span className="text-[10px] text-gray-400">
                  Printable statement with corporate logo
                </span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => onExportSelected('csv')}
              className="group flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs outline-none select-none hover:bg-white/10"
            >
              <div className="mt-0.5 rounded-md border border-blue-500/30 bg-blue-500/10 p-1 text-blue-400">
                <Download className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-100">Data CSV (.csv)</span>
                <span className="text-[10px] text-gray-400">Raw table data for spreadsheets</span>
              </div>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

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
