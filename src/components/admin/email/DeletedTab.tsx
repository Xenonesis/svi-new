'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash2,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Check,
  Search,
  X,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import type { DeletedEmail } from './types';
import { getToken, formatTime } from './helpers';
import { DeletedEmailListSkeleton } from './Skeletons';
import {
  getInitials,
  getAvatarColor,
  StatusDot,
  containerVariants,
  itemVariants,
} from './sections/constants';
import { ConfirmDialog } from './ConfirmDialog';

/* ─── Hook ─── */
function useDeletedEmails() {
  const [emails, setEmails] = useState<DeletedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get_deleted_list' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch deleted emails');
      setEmails(data.emails || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeleted();
  }, [fetchDeleted]);

  const restoreEmails = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    setRestoring(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'restore_emails', emailIds: ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restore emails');
      setEmails((prev) => prev.filter((e) => !ids.includes(e.email_id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      toast.success(`${ids.length} email${ids.length > 1 ? 's' : ''} restored`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRestoring(false);
    }
  }, []);

  const permanentlyDeleteEmails = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'permanently_delete', emailIds: ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete emails');
      setEmails((prev) => prev.filter((e) => !ids.includes(e.email_id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      toast.success(`${ids.length} email${ids.length > 1 ? 's' : ''} permanently deleted`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }, []);

  const emptyTrash = useCallback(async () => {
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'permanently_delete', all: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to empty trash');
      setEmails([]);
      setSelectedIds(new Set());
      toast.success('Recycle bin emptied');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return emails;
    const q = search.toLowerCase();
    return emails.filter(
      (e) =>
        e.subject?.toLowerCase().includes(q) ||
        e.from?.toLowerCase().includes(q) ||
        e.to?.some((t) => t.toLowerCase().includes(q))
    );
  }, [emails, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (filtered.length > 0 && filtered.every((e) => selectedIds.has(e.email_id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.email_id)));
    }
  };

  const isAllSelected = filtered.length > 0 && filtered.every((e) => selectedIds.has(e.email_id));

  return {
    emails,
    filtered,
    loading,
    error,
    selectedIds,
    isAllSelected,
    search,
    setSearch,
    restoring,
    deleting,
    toggleSelect,
    selectAll,
    clearSelection: () => setSelectedIds(new Set()),
    restoreEmails,
    permanentlyDeleteEmails,
    emptyTrash,
    fetchDeleted,
  };
}

/* ─── Component ─── */
export function DeletedTab() {
  const h = useDeletedEmails();
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete-selected' | 'delete-all';
  } | null>(null);

  /* ─── Confirmation handlers ─── */
  const handleDeleteSelected = () => {
    if (h.selectedIds.size === 0) return;
    h.permanentlyDeleteEmails([...h.selectedIds]);
    setConfirmAction(null);
  };

  const handleDeleteAll = () => {
    h.emptyTrash();
    setConfirmAction(null);
  };

  const busy = h.restoring || h.deleting;

  return (
    <div className="dark:bg-brand-dark-surface overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/60">
      {/* ─── Header ─── */}
      <div className="h-[2px] w-full bg-gradient-to-r from-red-500/60 via-red-500 to-red-500/60" />

      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <Trash2 className="h-4 w-4 text-red-400" />
          <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Recycle Bin
          </span>
          {!h.loading && !h.error && (
            <span className="font-mono text-[10px] text-gray-400">
              {h.emails.length} email{h.emails.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Delete All button (only when there are items) */}
          {h.emails.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setConfirmAction({ type: 'delete-all' })}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200/60 bg-red-50/80 px-3 py-1.5 text-[11px] font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-100 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              {h.deleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Delete All
            </motion.button>
          )}

          <button
            onClick={h.fetchDeleted}
            disabled={h.loading}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${h.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Selection bar ─── */}
      <AnimatePresence>
        {h.selectedIds.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-3 flex items-center justify-between rounded-lg bg-gray-100/80 px-3 py-2 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {h.selectedIds.size} selected
                </span>
                <button
                  onClick={h.selectAll}
                  className="text-[11px] font-medium text-gray-500 underline transition-colors hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {h.isAllSelected ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Restore button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => h.restoreEmails([...h.selectedIds])}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
                >
                  {h.restoring ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Restore
                </motion.button>

                {/* Delete button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmAction({ type: 'delete-selected' })}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
                >
                  {h.deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Search + Select all ─── */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
        <button
          onClick={h.selectAll}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
          title="Toggle select all"
        >
          {h.isAllSelected ? (
            <Check className="text-brand-gold h-4 w-4" />
          ) : (
            <div className="h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-600" />
          )}
        </button>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search deleted emails..."
            value={h.search}
            onChange={(e) => h.setSearch(e.target.value)}
            className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-1.5 pr-8 pl-10 text-sm text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
          />
          {h.search && (
            <button
              onClick={() => h.setSearch('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── List ─── */}
      <div className="scrollbar-gold overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {h.loading ? (
          <DeletedEmailListSkeleton />
        ) : h.error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle className="mb-3 h-7 w-7 text-red-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{h.error}</p>
            <button onClick={h.fetchDeleted} className="text-brand-gold mt-3 text-xs underline">
              Retry
            </button>
          </div>
        ) : h.filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trash2 className="mb-3 h-7 w-7 text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-500">
              {h.search ? 'No deleted emails match your search' : 'Recycle Bin is empty'}
            </p>
            {h.search && (
              <button
                onClick={() => h.setSearch('')}
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
            {h.filtered.map((email) => {
              const isChecked = h.selectedIds.has(email.email_id);
              const firstTo = email.to?.[0] || '';
              const initials = getInitials(firstTo);
              const avatarColor = getAvatarColor(firstTo);

              return (
                <motion.div variants={itemVariants} key={email.email_id}>
                  <div className="group relative">
                    <div className="flex items-start gap-2.5 px-4 py-3.5">
                      {/* Checkbox */}
                      <div
                        onClick={() => h.toggleSelect(email.email_id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            h.toggleSelect(email.email_id);
                          }
                        }}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                        className={`relative z-10 mt-1 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-all ${
                          isChecked
                            ? 'border-brand-gold bg-brand-gold text-white'
                            : 'hover:border-brand-gold/50 dark:hover:border-brand-gold/50 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>

                      {/* Avatar */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold opacity-60 ${avatarColor}`}
                      >
                        {initials}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusDot status={email.last_event} />
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {email.subject || '(no subject)'}
                          </p>
                        </div>

                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-500">
                          {email.to && email.to.length > 0
                            ? `To: ${email.to.join(', ')}`
                            : '(no recipients)'}
                        </p>

                        <div className="mt-1.5 flex items-center gap-3">
                          <span className="font-mono text-[10px] text-gray-400">
                            {formatTime(email.created_at)}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-red-400">
                            <Clock className="h-2.5 w-2.5" />
                            Deleted {formatTime(email.deleted_at)}
                          </span>
                        </div>
                      </div>

                      {/* Hover actions */}
                      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => h.restoreEmails([email.email_id])}
                          disabled={busy}
                          className="rounded-lg border border-emerald-200/60 bg-emerald-50/80 px-2 py-1.5 text-[11px] font-medium text-emerald-600 transition-all hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        >
                          <RotateCcw className="mr-0.5 inline h-3 w-3" />
                          Restore
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            h.permanentlyDeleteEmails([email.email_id]);
                          }}
                          disabled={busy}
                          className="rounded-lg border border-red-200/60 bg-red-50/80 px-2 py-1.5 text-[11px] font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                        >
                          <Trash2 className="mr-0.5 inline h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ─── Confirm Delete Selected ─── */}
      <ConfirmDialog
        open={confirmAction?.type === 'delete-selected'}
        title="Permanently delete emails?"
        message={`This will permanently remove ${h.selectedIds.size} email${h.selectedIds.size > 1 ? 's' : ''} from the Recycle Bin. ${h.selectedIds.size > 1 ? 'They' : 'It'} cannot be restored.`}
        confirmLabel={`Delete ${h.selectedIds.size} email${h.selectedIds.size > 1 ? 's' : ''}`}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteSelected}
        onCancel={() => setConfirmAction(null)}
      />

      {/* ─── Confirm Delete All ─── */}
      <ConfirmDialog
        open={confirmAction?.type === 'delete-all'}
        title="Empty Recycle Bin?"
        message={`This will permanently delete all ${h.emails.length} email${h.emails.length !== 1 ? 's' : ''} in the Recycle Bin. This action cannot be undone.`}
        confirmLabel={`Delete all ${h.emails.length} email${h.emails.length !== 1 ? 's' : ''}`}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
