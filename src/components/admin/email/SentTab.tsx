'use client';

import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ChevronDown, Inbox, Loader2 } from 'lucide-react';
import type { ForwardData, ReplyData, SentEmail } from './types';
import { buildForwardHtml, buildReplyHtml, getToken } from './helpers';
import { toast } from 'sonner';
import { EmailListSkeleton, EmailDetailSkeleton } from './Skeletons';
import { useSentEmails } from './hooks/useSentEmails';
import { EmailToolbar, ActiveFilterChips } from './sections/EmailToolbar';
import { EmailListItem } from './sections/EmailListItem';
import { EmailDetailPanel } from './sections/EmailDetailPanel';
import { ConfirmDialog } from './ConfirmDialog';
import { containerVariants } from './sections/constants';
import { useState } from 'react';

interface SentTabProps {
  onForward?: (data: ForwardData) => void;
  onReply?: (data: ReplyData) => void;
}

export function SentTab({ onForward, onReply }: SentTabProps) {
  const h = useSentEmails();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<SentEmail | null>(null);

  const handleForwardEmail = (email: SentEmail) => {
    if (!onForward) return;
    onForward({
      subject: `Fwd: ${email.subject}`,
      html: buildForwardHtml(email),
      originalFrom: email.from,
      originalTo: email.to || [],
      originalDate: email.created_at,
      originalSubject: email.subject,
      attachments: email.attachments || [],
    });
  };

  const handleReplyEmail = (email: SentEmail) => {
    if (!onReply) return;
    onReply({
      to: email.from,
      subject: `Re: ${email.subject}`,
      html: buildReplyHtml(email),
      originalFrom: email.from,
      originalDate: email.created_at,
      originalSubject: email.subject,
      cc: email.cc,
      originalMessageId: email.id,
      attachments: email.attachments || [],
    });
  };

  /* ─── Forward / Reply ─── */
  const handleForward = () => {
    if (!h.selected || !onForward) return;
    onForward({
      subject: `Fwd: ${h.selected.subject}`,
      html: buildForwardHtml(h.selected),
      originalFrom: h.selected.from,
      originalTo: h.selected.to || [],
      originalDate: h.selected.created_at,
      originalSubject: h.selected.subject,
      attachments: h.selected.attachments || [],
    });
  };

  const handleReply = (suggestionHtml?: string) => {
    if (!h.selected || !onReply) return;
    onReply({
      to: h.selected.from,
      subject: `Re: ${h.selected.subject}`,
      html: suggestionHtml || buildReplyHtml(h.selected),
      originalFrom: h.selected.from,
      originalDate: h.selected.created_at,
      originalSubject: h.selected.subject,
      cc: h.selected.cc,
      originalMessageId: h.selected.id,
      attachments: h.selected.attachments || [],
    });
  };

  /* ─── Delete handlers ─── */
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteEmailClick = (email: SentEmail) => {
    setEmailToDelete(email);
  };

  const handleDeleteConfirm = async () => {
    if (emailToDelete) {
      try {
        const token = await getToken();
        const res = await fetch('/api/admin/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'delete_emails',
            emailIds: [emailToDelete.id],
            emails: [
              {
                id: emailToDelete.id,
                subject: emailToDelete.subject,
                from: emailToDelete.from,
                to: emailToDelete.to,
                created_at: emailToDelete.created_at,
                last_event: emailToDelete.last_event,
              },
            ],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete email');
        h.addToDeleted([emailToDelete.id]);
        toast.success('Email deleted');
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setEmailToDelete(null);
      }
    } else {
      await h.deleteSelectedEmails();
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setEmailToDelete(null);
  };

  return (
    <div className="dark:bg-brand-dark-surface grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:grid-cols-5 dark:border-gray-700/60">
      {/* ─── Email List ─── */}
      <div
        className={`${h.selected ? 'lg:col-span-2' : 'lg:col-span-5'} flex flex-col transition-all duration-300`}
      >
        <EmailToolbar
          search={h.search}
          onSearchChange={h.setSearch}
          sortField={h.sortField}
          sortDir={h.sortDir}
          sortLabel={h.sortLabel}
          sortOpen={h.sortOpen}
          onSortToggle={() => {
            h.setSortOpen(!h.sortOpen);
            h.setFilterOpen(false);
          }}
          onSort={h.handleSort}
          sortRef={h.sortRef as React.RefObject<HTMLDivElement | null>}
          filterOpen={h.filterOpen}
          onFilterToggle={() => {
            h.setFilterOpen(!h.filterOpen);
            h.setSortOpen(false);
          }}
          filterRef={h.filterRef as React.RefObject<HTMLDivElement | null>}
          statusFilter={h.statusFilter}
          datePreset={h.datePreset}
          fromFilter={h.fromFilter}
          showStarredOnly={h.showStarredOnly}
          hasSortChanged={h.hasSortChanged}
          activeFilterCount={h.activeFilterCount}
          loading={h.loading}
          onRefresh={() => h.fetchEmails()}
          onStatusToggle={h.toggleStatus}
          onDatePresetChange={h.setDatePreset}
          onFromFilterChange={h.setFromFilter}
          onStarToggle={() => h.setShowStarredOnly(!h.showStarredOnly)}
          onSearchClear={() => h.setSearch('')}
          // Multi-select & Delete props
          selectedCount={h.selectedIds.size}
          onSelectAll={h.selectAllEmails}
          onDeleteSelected={handleDeleteClick}
          deleting={h.deleting}
        />

        {/* Active filter chips */}
        <AnimatePresence>
          {h.hasActiveFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-gray-100 dark:border-gray-800"
            >
              <ActiveFilterChips
                search={h.search}
                statusFilter={h.statusFilter}
                datePreset={h.datePreset}
                fromFilter={h.fromFilter}
                showStarredOnly={h.showStarredOnly}
                hasSortChanged={h.hasSortChanged}
                sortLabel={h.sortLabel}
                onSearchClear={() => h.setSearch('')}
                onStatusFilterRemove={(s) => h.toggleStatus(s)}
                onDatePresetReset={() => h.setDatePreset('all')}
                onFromFilterClear={() => h.setFromFilter('')}
                onStarFilterClear={() => h.setShowStarredOnly(false)}
                onSortReset={() => {
                  h.setSortField('date');
                  h.setSortDir('desc');
                }}
                onClearAllFilters={h.clearAllFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count + selection info */}
        {!h.loading && !h.error && (
          <div className="flex items-center justify-between border-b border-gray-50 px-4 py-1.5 dark:border-gray-800/50">
            <span className="font-mono text-[10px] text-gray-400">
              {h.processed.length === h.emails.length
                ? `${h.emails.length} email${h.emails.length !== 1 ? 's' : ''}`
                : `${h.processed.length} of ${h.emails.length} email${h.emails.length !== 1 ? 's' : ''}`}
            </span>
            <div className="flex items-center gap-3">
              {h.selectedIds.size > 0 && (
                <span className="font-mono text-[10px] font-medium text-red-500">
                  {h.selectedIds.size} selected
                </span>
              )}
              {h.hasActiveFilters && (
                <span className="text-brand-gold text-[10px] font-medium">Filtered</span>
              )}
            </div>
          </div>
        )}

        {/* Email List */}
        <div
          className="scrollbar-gold flex-1 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          {h.loading ? (
            <EmailListSkeleton />
          ) : h.error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="mb-3 h-7 w-7 text-red-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{h.error}</p>
              <button
                onClick={() => h.fetchEmails()}
                className="text-brand-gold mt-3 text-xs underline"
              >
                Retry
              </button>
            </div>
          ) : h.processed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="mb-3 h-7 w-7 text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-500">
                {h.hasActiveFilters
                  ? 'No emails match your filters'
                  : h.showStarredOnly
                    ? 'No starred emails'
                    : 'No sent emails found'}
              </p>
              {h.hasActiveFilters && (
                <button
                  onClick={h.clearAllFilters}
                  className="text-brand-gold mt-2 text-xs underline"
                >
                  Clear filters
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
              {h.processed.map((email) => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  isSelected={h.selected?.id === email.id}
                  isStarred={h.starred.has(email.id)}
                  isChecked={h.selectedIds.has(email.id)}
                  onSelect={h.fetchDetail}
                  onToggleStar={h.toggleStar}
                  onToggleCheck={h.toggleSelectEmail}
                  onForward={handleForwardEmail}
                  onReply={handleReplyEmail}
                  onDelete={handleDeleteEmailClick}
                />
              ))}
            </motion.div>
          )}

          {/* Load more */}
          {h.hasMore &&
            !h.search &&
            h.activeFilterCount === 0 &&
            !h.showStarredOnly &&
            !h.loading && (
              <div className="border-t border-gray-100 p-4 text-center dark:border-gray-800">
                <button
                  onClick={() => h.loadMore()}
                  disabled={h.loadingMore}
                  className="text-brand-gold inline-flex items-center gap-2 text-xs font-medium underline transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {h.loadingMore ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  Load more
                </button>
                <span className="ml-3 font-mono text-[10px] text-gray-400">
                  Showing {h.processed.length} emails
                </span>
              </div>
            )}
        </div>
      </div>

      {/* ─── Reading Pane ─── */}
      {h.loadingDetail && !h.selected ? (
        <EmailDetailSkeleton />
      ) : (
        <EmailDetailPanel
          selected={h.selected}
          loadingDetail={h.loadingDetail}
          copiedId={h.copiedId}
          copiedType={h.copiedType}
          copyMenuOpen={h.copyMenuOpen}
          copyMenuRef={h.copyMenuRef as React.RefObject<HTMLDivElement | null>}
          starred={h.starred}
          onClose={() => h.setSelected(null)}
          onReply={handleReply}
          onForward={handleForward}
          onCopyMenuToggle={() => h.setCopyMenuOpen(!h.copyMenuOpen)}
          onCopyText={h.copyText}
          onCopyId={h.copyId}
          onToggleStar={h.toggleStar}
        />
      )}

      {/* ─── Delete Confirmation Dialog ─── */}
      <ConfirmDialog
        open={showDeleteConfirm || !!emailToDelete}
        title="Delete email?"
        message={
          emailToDelete
            ? `Are you sure you want to delete the email "${emailToDelete.subject}"? This action will hide it from your Sent tab.`
            : `Are you sure you want to delete ${h.selectedIds.size} email${h.selectedIds.size > 1 ? 's' : ''}? This action will hide ${h.selectedIds.size > 1 ? 'them' : 'it'} from your Sent tab.`
        }
        confirmLabel={
          emailToDelete
            ? 'Delete email'
            : `Delete ${h.selectedIds.size} email${h.selectedIds.size > 1 ? 's' : ''}`
        }
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
