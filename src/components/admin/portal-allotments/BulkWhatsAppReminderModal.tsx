'use client';

import React, { useState } from 'react';
import { MessageSquare, MessageCircle, Copy, Check, X, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AllotmentRecord, AllotmentFinancials } from './types';

export interface BulkWhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAllotments: AllotmentRecord[];
  getAllotmentFinancials: (allotment: AllotmentRecord) => AllotmentFinancials;
}

export function BulkWhatsAppReminderModal({
  isOpen,
  onClose,
  selectedAllotments,
  getAllotmentFinancials,
}: BulkWhatsAppReminderModalProps): React.JSX.Element | null {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const totalBalance = selectedAllotments.reduce(
    (sum, a) => sum + getAllotmentFinancials(a).balanceDue,
    0
  );

  const getReminderMessage = (
    clientName: string,
    unitNumber: string,
    propertyName: string,
    formattedBalance: string
  ): string => {
    return `Namaste ${clientName} ji,\nRegarding your Unit ${unitNumber} at ${propertyName}.\nYour outstanding balance is ₹${formattedBalance}.\nPlease check your payment statement and schedule.\nRegards,\nShri Vrindavan Imperial`;
  };

  const handleCopy = async (allotmentId: string, message: string, clientName: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(allotmentId);
      toast.success(`Copied reminder for ${clientName}`);
      setTimeout(() => {
        setCopiedId((prev) => (prev === allotmentId ? null : prev));
      }, 2000);
    } catch {
      toast.error('Failed to copy message');
    }
  };

  const handleOpenWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Bulk WhatsApp Reminders
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedAllotments.length} Clients • Total Outstanding: ₹
                {totalBalance.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {selectedAllotments.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No allotments selected.
            </div>
          ) : (
            selectedAllotments.map((allotment) => {
              const fin = getAllotmentFinancials(allotment);
              const clientName = allotment.profiles?.full_name || 'Client';
              const unitNumber = allotment.unit_no || allotment.unit_number || 'N/A';
              const propertyName = allotment.properties?.name || 'Assigned Property';
              const phone = allotment.profiles?.phone || '';
              const formattedBalance = fin.balanceDue.toLocaleString('en-IN');
              const message = getReminderMessage(
                clientName,
                unitNumber,
                propertyName,
                formattedBalance
              );
              const isCopied = copiedId === allotment.id;

              return (
                <div
                  key={allotment.id}
                  className="rounded-xl border border-gray-200/80 bg-slate-50/50 p-4 transition-all dark:border-white/10 dark:bg-white/[0.02]"
                >
                  {/* Top row: Client info & Balance badge */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {clientName}
                        </span>
                        <span className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold">
                          Unit {unitNumber}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {propertyName}
                        </span>
                        {phone && (
                          <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                            <Phone className="h-3 w-3" />
                            {phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300">
                        Pending: ₹{formattedBalance}
                      </span>
                    </div>
                  </div>

                  {/* Message Preview Box */}
                  <div className="mt-3 rounded-lg border border-gray-200/60 bg-white p-3 font-sans text-xs whitespace-pre-line text-gray-700 select-all dark:border-white/5 dark:bg-gray-800 dark:text-gray-300">
                    {message}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(allotment.id, message, clientName)}
                      className="dark:hover:bg-gray-750 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(phone, message)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-2xs transition-colors hover:bg-emerald-500 active:scale-95"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Open WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-gray-100 px-6 py-3.5 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="dark:hover:bg-gray-750 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
