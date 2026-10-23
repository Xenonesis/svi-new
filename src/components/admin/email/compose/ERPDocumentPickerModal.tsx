'use client';

import { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Search,
  Building2,
  Receipt,
  FileSignature,
  FileText,
  Loader2,
  Plus,
  Paperclip,
} from 'lucide-react';
import { getToken } from '../helpers';
import type { ERPDocumentItem } from '@/app/api/admin/email/erp-documents/route';

interface ERPDocumentPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectDocument: (doc: ERPDocumentItem) => void;
}

type DocFilterTab = 'all' | 'allotment' | 'receipt' | 'offer_letter' | 'registration';

export function ERPDocumentPickerModal({
  open,
  onClose,
  onSelectDocument,
}: ERPDocumentPickerModalProps) {
  const [documents, setDocuments] = useState<ERPDocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<DocFilterTab>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      getToken()
        .then((token) => {
          const params = new URLSearchParams();
          if (activeTab !== 'all') params.set('type', activeTab);
          if (search.trim()) params.set('search', search.trim());
          return fetch(`/api/admin/email/erp-documents?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load documents');
          return res.json();
        })
        .then((data: { documents: ERPDocumentItem[] }) => {
          if (cancelled) return;
          setDocuments(data.documents || []);
          setLoading(false);
        })
        .catch((err: Error) => {
          if (cancelled) return;
          setError(err.message);
          setLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, activeTab, search]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearch('');
      setActiveTab('all');
    }
  }, [open]);

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'allotment':
        return Building2;
      case 'receipt':
        return Receipt;
      case 'offer_letter':
        return FileSignature;
      default:
        return FileText;
    }
  };

  const getDocBadge = (type: string) => {
    switch (type) {
      case 'allotment':
        return {
          label: 'ALLOTMENT',
          color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        };
      case 'receipt':
        return {
          label: 'RECEIPT',
          color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        };
      case 'offer_letter':
        return {
          label: 'OFFER LETTER',
          color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        };
      default:
        return {
          label: 'REGISTRATION',
          color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
        };
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md transition-opacity" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[70] flex max-h-[85vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl transition-all dark:border-white/10 dark:bg-[#111622]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-gold/15 text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg">
                <Paperclip className="h-4 w-4" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-bold text-gray-900 dark:text-white">
                  Attach SVI System Document
                </Dialog.Title>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Select official Allotment Letter, Payment Receipt, or Offer Letter from database
                </p>
              </div>
            </div>
            <Dialog.Close className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Search Bar */}
          <div className="border-b border-gray-100 px-5 py-3 dark:border-white/10">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name, unit no, receipt #, or email..."
                className="focus:border-brand-gold/60 dark:focus:border-brand-gold/60 w-full rounded-xl border border-gray-200/80 bg-gray-50/70 py-2 pr-9 pl-9 text-xs text-gray-900 placeholder-gray-400 outline-none focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {(
                [
                  { id: 'all', label: 'All Records' },
                  { id: 'allotment', label: 'Allotments' },
                  { id: 'receipt', label: 'Receipts' },
                  { id: 'offer_letter', label: 'Offer Letters' },
                  { id: 'registration', label: 'Registrations' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-gold text-brand-dark shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="text-brand-gold h-5 w-5 animate-spin" />
                <span className="text-xs">Loading database records...</span>
              </div>
            ) : error ? (
              <div className="flex h-48 flex-col items-center justify-center p-4 text-center">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center p-4 text-center text-gray-400">
                <p className="text-xs">No matching system documents found.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {documents.map((doc) => {
                  const Icon = getDocIcon(doc.documentType);
                  const badge = getDocBadge(doc.documentType);
                  return (
                    <div
                      key={`${doc.documentType}-${doc.id}`}
                      className="group hover:border-brand-gold/40 hover:bg-brand-gold/[0.02] dark:hover:border-brand-gold/40 flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 transition-all dark:border-white/5 dark:bg-[#0d111a]"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3 pr-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-xs font-bold text-gray-900 dark:text-white">
                              {doc.title}
                            </span>
                            <span
                              className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                            {doc.subtitle}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectDocument(doc);
                          onClose();
                        }}
                        className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-brand-dark flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all"
                      >
                        <Plus className="h-3 w-3" />
                        Attach
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
