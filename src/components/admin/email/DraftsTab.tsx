'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { FileEdit, Search, X, Loader2, Clock, Trash2, Edit3 } from 'lucide-react';
import type { DraftData } from './types';
import { formatTime } from './helpers';
import { useDrafts } from './hooks/useDrafts';
import { ConfirmDialog } from './ConfirmDialog';
import { containerVariants, itemVariants } from './sections/constants';

interface DraftsTabProps {
  onOpenDraft: (draft: DraftData) => void;
}

export function DraftsTab({ onOpenDraft }: DraftsTabProps) {
  const { drafts, loading, refreshDrafts, deleteDraft } = useDrafts();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = drafts.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.subject?.toLowerCase().includes(q) ||
      d.to?.toLowerCase().includes(q) ||
      d.fromName?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      deleteDraft(id);
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpen = (draft: DraftData) => {
    onOpenDraft(draft);
  };

  return (
    <div className="dark:bg-brand-dark-surface overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/60">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <FileEdit className="text-brand-gold h-4 w-4" />
          <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Drafts
          </span>
          {!loading && (
            <span className="font-mono text-[10px] text-gray-400">
              {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={refreshDrafts}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/5"
        >
          <Loader2 className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search drafts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-1.5 pr-8 pl-10 text-sm text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="scrollbar-gold overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileEdit className="mb-3 h-7 w-7 text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-500">
              {search ? 'No drafts match your search' : 'No drafts saved'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-brand-gold mt-2 text-xs underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-gray-100 dark:divide-gray-800"
          >
            {filtered.map((draft) => (
              <motion.div key={draft.id} variants={itemVariants}>
                <div className="group relative flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                  {/* Icon */}
                  <div className="bg-brand-gold/10 text-brand-gold mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <Edit3 className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {draft.subject || '(no subject)'}
                      </p>
                      {draft.id === 'current' && (
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-500">
                      {draft.to ? `To: ${draft.to}` : '(no recipient)'}
                    </p>

                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="font-mono text-[10px] text-gray-400">
                        <Clock className="mr-1 inline h-2.5 w-2.5" />
                        {formatTime(new Date(draft.savedAt).toISOString())}
                      </span>
                      {draft.fromName && (
                        <span className="text-[10px] text-gray-400">From: {draft.fromName}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleOpen(draft)}
                      className="border-brand-gold/20 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/30 hover:bg-brand-gold/20 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all"
                    >
                      Open
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(draft.id);
                      }}
                      disabled={deleting}
                      className="rounded-lg border border-red-200/60 bg-red-50/80 px-2 py-1.5 text-[11px] font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-100 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete draft?"
        message="This draft will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete draft"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
