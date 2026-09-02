'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Inbox,
  Mail,
  MailOpen,
  Star,
  RefreshCw,
  Paperclip,
  MoreVertical,
  Archive,
  Tag,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
  Search,
  Filter,
  Check,
  Plus,
  X,
  ChevronDown,
  CheckCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { getToken } from './helpers';
import { EmailDetailSkeleton } from './Skeletons';
import type { EmailDetail, ForwardData, ReplyData, InboxEmailItem, EmailAttachment } from './types';
import { EmailDetailPanel } from './sections/EmailDetailPanel';
import { ConfirmDialog } from './ConfirmDialog';
import { COMMON_TAGS, getTagStyle } from './constants';
import { buildForwardHtml, buildReplyHtml, cleanEmailSubject } from './helpers';

interface RepliesTabProps {
  adminEmail: string;
  onForward?: (data: ForwardData) => void;
  onReply?: (data: ReplyData) => void;
}

type InboxFilterView = 'inbox' | 'unread' | 'starred' | 'archived' | 'all';

const POLL_INTERVAL = 30_000; // 30 seconds auto-refresh

export function RepliesTab({ adminEmail: propAdminEmail, onForward, onReply }: RepliesTabProps) {
  // State
  const [replies, setReplies] = useState<InboxEmailItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReply, setSelectedReply] = useState<EmailDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [adminEmail, setAdminEmail] = useState<string>(propAdminEmail || '');
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<InboxFilterView>('inbox');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);
  const tagFilterRef = useRef<HTMLDivElement>(null);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTagMenuOpen, setBulkTagMenuOpen] = useState(false);
  const [bulkCustomTag, setBulkCustomTag] = useState('');
  const bulkTagRef = useRef<HTMLDivElement>(null);

  // Delete Confirmation Dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Row Menu & Tag Menu popovers
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);
  const [activeTagMenuId, setActiveTagMenuId] = useState<string | null>(null);
  const rowTagMenuRef = useRef<HTMLDivElement>(null);
  const [rowCustomTag, setRowCustomTag] = useState('');

  // Copy dropdown
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (copyMenuRef.current && !copyMenuRef.current.contains(target)) setCopyMenuOpen(false);
      if (rowMenuRef.current && !rowMenuRef.current.contains(target)) setActiveMenuId(null);
      if (rowTagMenuRef.current && !rowTagMenuRef.current.contains(target))
        setActiveTagMenuId(null);
      if (tagFilterRef.current && !tagFilterRef.current.contains(target)) setTagFilterOpen(false);
      if (bulkTagRef.current && !bulkTagRef.current.contains(target)) setBulkTagMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch Inbox Data
  const fetchReplies = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) {
          setError('Not authenticated. Please sign in.');
          setReplies([]);
          return;
        }

        const params = new URLSearchParams({
          action: 'inbox',
          filter: activeFilter,
        });
        if (selectedTag) params.append('tag', selectedTag);
        if (search.trim()) params.append('search', search.trim());

        const res = await fetch(`/api/admin/email?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error?.message || data?.error || 'Failed to load inbox');
          setReplies([]);
          return;
        }

        const emailList: InboxEmailItem[] = data.emails || [];
        const stored = localStorage.getItem('adminEmail');
        if (stored) setAdminEmail(stored);

        // Update starred IDs set
        const starSet = new Set<string>();
        emailList.forEach((e) => {
          if (e.is_starred) {
            starSet.add(e.id);
            if (e.email_id) starSet.add(e.email_id);
          }
        });
        setStarred(starSet);

        // Unread count
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        } else {
          setUnreadCount(emailList.filter((e) => !e.is_read && !e.is_archived).length);
        }

        // Show toast if new emails arrived during background refresh
        if (isBackground && emailList.length > replies.length) {
          const diff = emailList.length - replies.length;
          toast.success(`${diff} new email${diff > 1 ? 's' : ''} received!`);
        }

        setReplies(emailList);
        setLastFetched(new Date());
      } catch (e) {
        console.error('Failed to fetch replies:', e);
        if (!isBackground) setError('Network error. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter, selectedTag, search, replies.length]
  );

  // Initial & filter change fetch
  useEffect(() => {
    fetchReplies(false);
  }, [fetchReplies]);

  // Background polling every 30s
  useEffect(() => {
    const handle = setInterval(() => {
      fetchReplies(true);
    }, POLL_INTERVAL);
    return () => {
      clearInterval(handle);
    };
  }, [fetchReplies]);

  // Fetch detail for a specific email
  const fetchDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?action=inbox_detail&id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load email');
      setSelectedReply(data.email);

      // Optimistically update read status in list
      setReplies((prev) =>
        prev.map((item) =>
          item.id === id || item.email_id === id ? { ...item, is_read: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to load email:', e);
      toast.error('Failed to load email content');
    } finally {
      setLoadingDetail(false);
    }
  };

  // ─── Single Item Actions ───────────────────────────────────

  const toggleStar = async (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlyStarred = starred.has(id);
    const newStarred = !isCurrentlyStarred;

    // Optimistic UI update
    setStarred((prev) => {
      const next = new Set(prev);
      if (newStarred) next.add(id);
      else next.delete(id);
      return next;
    });
    setReplies((prev) =>
      prev.map((item) =>
        item.id === id || item.email_id === id ? { ...item, is_starred: newStarred } : item
      )
    );
    if (selectedReply && (selectedReply.id === id || selectedReply.email_id === id)) {
      setSelectedReply({ ...selectedReply, is_starred: newStarred });
    }

    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: newStarred ? 'star' : 'unstar',
          emailId: id,
        }),
      });
      if (!res.ok) throw new Error('Failed to update star');
      toast.success(newStarred ? 'Starred' : 'Unstarred');
    } catch {
      // Rollback on error
      setStarred((prev) => {
        const next = new Set(prev);
        if (isCurrentlyStarred) next.add(id);
        else next.delete(id);
        return next;
      });
      toast.error('Failed to update star state');
    }
  };

  const handleToggleRead = async (id: string, currentReadState: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newReadState = !currentReadState;

    // Optimistic UI update
    setReplies((prev) =>
      prev.map((item) =>
        item.id === id || item.email_id === id ? { ...item, is_read: newReadState } : item
      )
    );
    setUnreadCount((prev) => (newReadState ? Math.max(0, prev - 1) : prev + 1));
    if (selectedReply && (selectedReply.id === id || selectedReply.email_id === id)) {
      setSelectedReply({ ...selectedReply, is_read: newReadState });
    }

    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: newReadState ? 'mark_read' : 'mark_unread',
          emailIds: [id],
          isRead: newReadState,
        }),
      });
      if (!res.ok) throw new Error('Failed to update read state');
      toast.success(newReadState ? 'Marked as read' : 'Marked as unread');
    } catch {
      fetchReplies(true);
      toast.error('Failed to update read state');
    }
  };

  const handleToggleArchive = async (
    id: string,
    currentArchivedState: boolean,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const newArchivedState = !currentArchivedState;

    // Optimistic UI update
    setReplies((prev) =>
      activeFilter === 'inbox' && newArchivedState
        ? prev.filter((item) => item.id !== id && item.email_id !== id)
        : activeFilter === 'archived' && !newArchivedState
          ? prev.filter((item) => item.id !== id && item.email_id !== id)
          : prev.map((item) =>
              item.id === id || item.email_id === id
                ? { ...item, is_archived: newArchivedState }
                : item
            )
    );
    if (selectedReply && (selectedReply.id === id || selectedReply.email_id === id)) {
      setSelectedReply({ ...selectedReply, is_archived: newArchivedState });
    }

    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: newArchivedState ? 'archive' : 'unarchive',
          emailIds: [id],
          isArchived: newArchivedState,
        }),
      });
      if (!res.ok) throw new Error('Failed to update archive state');
      toast.success(newArchivedState ? 'Archived' : 'Moved to Inbox');
    } catch {
      fetchReplies(true);
      toast.error('Failed to update archive state');
    }
  };

  const handleApplyTag = async (id: string, tagName: string, mode: 'add' | 'remove' = 'add') => {
    const cleanTag = tagName.trim();
    if (!cleanTag) return;

    // Optimistic UI update
    setReplies((prev) =>
      prev.map((item) => {
        if (item.id === id || item.email_id === id) {
          const currentTags = item.tags || [];
          const updatedTags =
            mode === 'add'
              ? Array.from(new Set([...currentTags, cleanTag]))
              : currentTags.filter((t) => t !== cleanTag);
          return { ...item, tags: updatedTags };
        }
        return item;
      })
    );

    if (selectedReply && (selectedReply.id === id || selectedReply.email_id === id)) {
      const currentTags = selectedReply.tags || [];
      const updatedTags =
        mode === 'add'
          ? Array.from(new Set([...currentTags, cleanTag]))
          : currentTags.filter((t) => t !== cleanTag);
      setSelectedReply({ ...selectedReply, tags: updatedTags });
    }

    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'apply_tags',
          emailIds: [id],
          tags: [cleanTag],
          mode,
        }),
      });
      if (!res.ok) throw new Error('Failed to apply tag');
      toast.success(mode === 'add' ? `Tag '${cleanTag}' added` : `Tag '${cleanTag}' removed`);
    } catch {
      fetchReplies(true);
      toast.error('Failed to update tags');
    }
  };

  const handleDeleteSingle = (id: string) => {
    setDeleteTargetIds([id]);
    setShowDeleteConfirm(true);
  };

  // ─── Bulk Actions ──────────────────────────────────────────

  const handleToggleSelect = (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === replies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(replies.map((r) => r.id)));
    }
  };

  const handleBulkMarkRead = async (isRead: boolean) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    // Optimistic UI update
    setReplies((prev) =>
      prev.map((item) => (selectedIds.has(item.id) ? { ...item, is_read: isRead } : item))
    );
    if (isRead) {
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
    } else {
      setUnreadCount((prev) => prev + ids.length);
    }

    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: isRead ? 'mark_read' : 'mark_unread',
          emailIds: ids,
          isRead,
        }),
      });
      if (!res.ok) throw new Error('Bulk update failed');
      toast.success(`${ids.length} emails marked as ${isRead ? 'read' : 'unread'}`);
      setSelectedIds(new Set());
    } catch {
      fetchReplies(true);
      toast.error('Failed to update read state for selected emails');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'mark_all_read',
        }),
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      setReplies((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      toast.success('All inbox emails marked as read');
    } catch {
      toast.error('Failed to mark all emails as read');
    }
  };

  const handleBulkArchive = async (isArchived: boolean) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    // Optimistic update
    setReplies((prev) =>
      activeFilter === 'inbox' && isArchived
        ? prev.filter((item) => !selectedIds.has(item.id))
        : activeFilter === 'archived' && !isArchived
          ? prev.filter((item) => !selectedIds.has(item.id))
          : prev.map((item) =>
              selectedIds.has(item.id) ? { ...item, is_archived: isArchived } : item
            )
    );

    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: isArchived ? 'archive' : 'unarchive',
          emailIds: ids,
          isArchived,
        }),
      });
      if (!res.ok) throw new Error('Bulk archive failed');
      toast.success(`${ids.length} emails ${isArchived ? 'archived' : 'moved to inbox'}`);
      setSelectedIds(new Set());
    } catch {
      fetchReplies(true);
      toast.error('Failed to archive selected emails');
    }
  };

  const handleBulkApplyTag = async (tagName: string) => {
    if (selectedIds.size === 0 || !tagName.trim()) return;
    const ids = Array.from(selectedIds);
    const cleanTag = tagName.trim();

    // Optimistic update
    setReplies((prev) =>
      prev.map((item) => {
        if (selectedIds.has(item.id)) {
          const currentTags = item.tags || [];
          return { ...item, tags: Array.from(new Set([...currentTags, cleanTag])) };
        }
        return item;
      })
    );

    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'apply_tags',
          emailIds: ids,
          tags: [cleanTag],
          mode: 'add',
        }),
      });
      if (!res.ok) throw new Error('Failed to apply tag');
      toast.success(`Tag '${cleanTag}' applied to ${ids.length} emails`);
      setBulkTagMenuOpen(false);
      setBulkCustomTag('');
      setSelectedIds(new Set());
    } catch {
      fetchReplies(true);
      toast.error('Failed to apply tags');
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (deleteTargetIds.length === 0) return;
    setDeleting(true);

    const emailsToDelete = replies.filter((r) => deleteTargetIds.includes(r.id));

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
          emailIds: deleteTargetIds,
          emails: emailsToDelete.map((r) => ({
            id: r.id,
            subject: r.subject,
            from: r.from,
            to: r.to,
            created_at: r.created_at,
            last_event: 'received',
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to delete emails');

      const deletedSet = new Set(deleteTargetIds);
      setReplies((prev) => prev.filter((r) => !deletedSet.has(r.id)));
      if (selectedReply && deletedSet.has(selectedReply.id)) {
        setSelectedReply(null);
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        deleteTargetIds.forEach((id) => next.delete(id));
        return next;
      });

      toast.success(
        `${deleteTargetIds.length} email${deleteTargetIds.length > 1 ? 's' : ''} moved to trash`
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteTargetIds([]);
    }
  };

  // ─── Forward & Reply Helpers ───────────────────────────────

  const handleForward = () => {
    if (!selectedReply || !onForward) return;
    onForward({
      subject: cleanEmailSubject(selectedReply.subject, 'Fwd:'),
      html: buildForwardHtml({
        from: selectedReply.from || selectedReply.from_email || '',
        to: selectedReply.to || selectedReply.to_emails || [],
        subject: selectedReply.subject,
        created_at: selectedReply.created_at,
        html: selectedReply.html,
        text: selectedReply.text,
      }),
      originalFrom: selectedReply.from || selectedReply.from_email || '',
      originalTo: selectedReply.to || selectedReply.to_emails || [],
      originalDate: selectedReply.created_at,
      originalSubject: selectedReply.subject,
      attachments: selectedReply.attachments || [],
    });
  };

  const handleReply = (suggestionHtml?: string) => {
    if (!selectedReply || !onReply) return;
    onReply({
      to: selectedReply.from || selectedReply.from_email || '',
      subject: cleanEmailSubject(selectedReply.subject, 'Re:'),
      html: suggestionHtml || '',
      quotedHtml: buildReplyHtml({
        from: selectedReply.from || selectedReply.from_email || '',
        subject: selectedReply.subject,
        created_at: selectedReply.created_at,
        html: selectedReply.html,
        text: selectedReply.text,
      }),
      originalFrom: selectedReply.from || selectedReply.from_email || '',
      originalDate: selectedReply.created_at,
      originalSubject: selectedReply.subject,
      cc: selectedReply.cc,
      originalMessageId: selectedReply.id,
      attachments: (selectedReply.attachments || []).map(
        (att: { filename?: string; name?: string; size?: number; url?: string }) => ({
          name: att.name || att.filename || 'attachment',
          size: att.size || 0,
          url: att.url,
        })
      ),
    });
  };

  const handleReplyInboxItem = async (reply: InboxEmailItem) => {
    if (!onReply) return;
    let html = `<p>${reply.snippet || ''}</p>`;
    let attachments: EmailAttachment[] = [];
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?action=inbox_detail&id=${reply.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          html = data.email.html || `<p>${data.email.text || ''}</p>`;
          attachments = (data.email.attachments || []).map(
            (att: { filename?: string; name?: string; size?: number; url?: string }) => ({
              name: att.name || att.filename || 'attachment',
              size: att.size || 0,
              url: att.url,
            })
          );
        }
      }
    } catch {
      // ignore
    }

    onReply({
      to: reply.from,
      subject: cleanEmailSubject(reply.subject, 'Re:'),
      html: '',
      quotedHtml: buildReplyHtml({
        from: reply.from,
        subject: reply.subject,
        created_at: reply.created_at,
        html,
      }),
      originalFrom: reply.from,
      originalDate: reply.created_at,
      originalSubject: reply.subject,
      originalMessageId: reply.id,
      attachments,
    });
  };

  const handleForwardInboxItem = async (reply: InboxEmailItem) => {
    if (!onForward) return;
    let html = `<p>${reply.snippet || ''}</p>`;
    let attachments: unknown[] = [];
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?action=inbox_detail&id=${reply.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          html = data.email.html || `<p>${data.email.text || ''}</p>`;
          attachments = data.email.attachments || [];
        }
      }
    } catch {
      // ignore
    }

    onForward({
      subject: cleanEmailSubject(reply.subject, 'Fwd:'),
      html: buildForwardHtml({
        from: reply.from,
        to: reply.to,
        subject: reply.subject,
        created_at: reply.created_at,
        html,
      }),
      originalFrom: reply.from,
      originalTo: reply.to || [],
      originalDate: reply.created_at,
      originalSubject: reply.subject,
      attachments,
    });
  };

  const copyText = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
    setCopyMenuOpen(false);
    toast.success('Copied to clipboard');
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    toast.success('Email ID copied');
  };

  const formatSender = (item: InboxEmailItem) => {
    if (item.from_name) return item.from_name;
    return item.from;
  };

  // Filter tab definitions
  const filterTabs: {
    id: InboxFilterView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'unread', label: 'Unread', icon: Mail },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'archived', label: 'Archived', icon: Archive },
    { id: 'all', label: 'All Messages', icon: MailOpen },
  ];

  // Available tags list
  const allUsedTags = useMemo(() => {
    const set = new Set<string>();
    replies.forEach((r) => (r.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [replies]);

  // Checkbox indeterminate state calculation
  const isAllSelected = replies.length > 0 && selectedIds.size === replies.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < replies.length;

  return (
    <div className="dark:bg-brand-dark-surface grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:grid-cols-5 dark:border-gray-700/60">
      {/* ─── Left Column: Email List & Control Suite ─── */}
      <div
        className={`flex flex-col border-r border-gray-100 transition-all duration-300 dark:border-gray-800 ${
          selectedReply ? 'hidden lg:col-span-2 lg:flex' : 'col-span-1 lg:col-span-5'
        }`}
      >
        {/* ─── Header View Filter Tabs & Main Actions ─── */}
        <div className="flex flex-col border-b border-gray-100 px-4 pt-3 pb-2 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Inbox & Replies</h3>
              {unreadCount > 0 && (
                <span className="bg-brand-gold/20 text-brand-gold rounded-full px-2 py-0.5 text-xs font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
                  title="Mark all as read"
                >
                  <CheckCheck className="text-brand-gold h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}

              <button
                onClick={() => fetchReplies(false)}
                disabled={loading || refreshing}
                title="Refresh inbox"
                className="hover:border-brand-gold/40 hover:text-brand-gold flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 transition-all disabled:opacity-50 dark:border-gray-700 dark:text-gray-400"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? 'Syncing…' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* View Filter Switcher Pills */}
          <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto py-1">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setSelectedIds(new Set());
                  }}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-navy dark:bg-brand-gold dark:text-brand-navy font-bold text-white shadow-xs'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {tab.label}
                  {tab.id === 'unread' && unreadCount > 0 && (
                    <span
                      className={`py-0.2 ml-0.5 rounded-full px-1.5 text-[10px] ${
                        isActive
                          ? 'dark:text-brand-navy bg-white/20 text-white dark:bg-black/20'
                          : 'bg-brand-gold/20 text-brand-gold'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Search & Tag Filter Bar ─── */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
          {/* Header Select All Checkbox */}
          <div
            onClick={handleSelectAll}
            role="checkbox"
            aria-checked={isAllSelected}
            tabIndex={0}
            title={isAllSelected ? 'Deselect all' : 'Select all'}
            className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-all ${
              isAllSelected || isIndeterminate
                ? 'border-brand-gold bg-brand-gold text-white'
                : 'hover:border-brand-gold/50 border-gray-300 dark:border-gray-600'
            }`}
          >
            {isAllSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            {isIndeterminate && <MinusSquare className="h-3.5 w-3.5" />}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sender, subject, content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-1.5 pr-7 pl-8 text-xs text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Tag Filter Dropdown */}
          <div ref={tagFilterRef} className="relative">
            <button
              onClick={() => setTagFilterOpen(!tagFilterOpen)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                selectedTag
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                  : 'border-gray-200 bg-gray-50/80 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span className="max-w-[80px] truncate">{selectedTag || 'Tag'}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${tagFilterOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {tagFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  className="dark:bg-brand-dark-surface absolute top-full right-0 z-40 mt-1.5 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700"
                >
                  <button
                    onClick={() => {
                      setSelectedTag(null);
                      setTagFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                      !selectedTag
                        ? 'bg-brand-gold/10 text-brand-gold font-bold'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>All Tags</span>
                    {!selectedTag && <Check className="h-3.5 w-3.5" />}
                  </button>

                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                  <div className="max-h-48 space-y-0.5 overflow-y-auto">
                    {COMMON_TAGS.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setSelectedTag(t.name);
                          setTagFilterOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                          selectedTag === t.name
                            ? 'bg-brand-gold/10 text-brand-gold font-bold'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${t.bg} border ${t.border}`} />
                          {t.name}
                        </span>
                        {selectedTag === t.name && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Floating / Top Bulk Action Bar (When Items Selected) ─── */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-gray-100 bg-amber-50/70 px-4 py-2 dark:border-gray-800 dark:bg-amber-500/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-[11px] text-gray-500 underline hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Mark as Read */}
                  <button
                    onClick={() => handleBulkMarkRead(true)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    title="Mark as Read"
                  >
                    <MailOpen className="h-3.5 w-3.5 text-blue-500" />
                    <span className="hidden sm:inline">Read</span>
                  </button>

                  {/* Mark as Unread */}
                  <button
                    onClick={() => handleBulkMarkRead(false)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    title="Mark as Unread"
                  >
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                    <span className="hidden sm:inline">Unread</span>
                  </button>

                  {/* Archive */}
                  <button
                    onClick={() => handleBulkArchive(activeFilter !== 'archived')}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    title={activeFilter === 'archived' ? 'Move to Inbox' : 'Archive'}
                  >
                    <Archive className="h-3.5 w-3.5 text-amber-500" />
                    <span className="hidden sm:inline">
                      {activeFilter === 'archived' ? 'Unarchive' : 'Archive'}
                    </span>
                  </button>

                  {/* Apply Tag Popover */}
                  <div ref={bulkTagRef} className="relative">
                    <button
                      onClick={() => setBulkTagMenuOpen(!bulkTagMenuOpen)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      title="Apply Tag"
                    >
                      <Tag className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="hidden sm:inline">Tag</span>
                    </button>

                    <AnimatePresence>
                      {bulkTagMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.96 }}
                          className="dark:bg-brand-dark-surface absolute top-full right-0 z-50 mt-1.5 w-52 rounded-xl border border-gray-200 bg-white p-2.5 shadow-xl dark:border-gray-700"
                        >
                          <p className="mb-2 text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                            Apply Tag to {selectedIds.size} emails
                          </p>
                          <div className="mb-2.5 flex flex-wrap gap-1.5">
                            {COMMON_TAGS.map((t) => (
                              <button
                                key={t.name}
                                onClick={() => handleBulkApplyTag(t.name)}
                                className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-all ${t.bg} ${t.color} ${t.border} hover:scale-105`}
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1.5 border-t border-gray-100 pt-2 dark:border-gray-800">
                            <input
                              type="text"
                              placeholder="Custom tag..."
                              value={bulkCustomTag}
                              onChange={(e) => setBulkCustomTag(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && bulkCustomTag.trim()) {
                                  e.preventDefault();
                                  handleBulkApplyTag(bulkCustomTag.trim());
                                }
                              }}
                              className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            <button
                              onClick={() => {
                                if (bulkCustomTag.trim()) {
                                  handleBulkApplyTag(bulkCustomTag.trim());
                                }
                              }}
                              className="bg-brand-gold text-brand-navy rounded-md px-2.5 py-1 text-xs font-bold"
                            >
                              Add
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Move to Trash */}
                  <button
                    onClick={() => {
                      setDeleteTargetIds(Array.from(selectedIds));
                      setShowDeleteConfirm(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 shadow-2xs hover:bg-red-50 dark:border-red-500/20 dark:bg-gray-800 dark:text-red-400"
                    title="Move to Trash"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Email List Content ─── */}
        <div className="max-h-[calc(100vh-280px)] flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-start gap-3 border-b border-gray-100 px-3 py-3 dark:border-gray-800"
                >
                  <div className="mt-1 h-4 w-4 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/20">
                <Mail className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Failed to load inbox
              </h4>
              <p className="mt-1 max-w-xs text-xs text-red-500">{error}</p>
              <button
                onClick={() => fetchReplies(false)}
                className="bg-brand-gold text-brand-navy mt-3 rounded-lg px-3 py-1.5 text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : replies.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <Inbox className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-700" />
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {activeFilter === 'unread'
                  ? 'No unread messages'
                  : activeFilter === 'starred'
                    ? 'No starred messages'
                    : activeFilter === 'archived'
                      ? 'No archived messages'
                      : 'No emails found'}
              </h4>
              <p className="mt-1 max-w-xs text-xs text-gray-400">
                {search || selectedTag
                  ? 'Try clearing the search query or tag filter.'
                  : 'New customer replies and inbound emails will appear here.'}
              </p>
            </div>
          ) : (
            <div>
              {replies.map((reply, i) => {
                const isSelected =
                  selectedReply?.id === reply.id || selectedReply?.email_id === reply.id;
                const isChecked = selectedIds.has(reply.id);
                const isItemStarred = starred.has(reply.id) || reply.is_starred;
                const isUnread = !reply.is_read;

                return (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`group relative border-b border-gray-100 transition-colors last:border-b-0 dark:border-gray-800 ${
                      isSelected
                        ? 'bg-brand-gold/[0.08] dark:bg-brand-gold/[0.06]'
                        : isUnread
                          ? 'bg-blue-50/40 dark:bg-blue-500/[0.03]'
                          : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.015]'
                    }`}
                  >
                    {/* Unread Left Border Accent */}
                    {isUnread && (
                      <div className="bg-brand-gold absolute top-0 bottom-0 left-0 w-[3px] rounded-r-full" />
                    )}

                    <div className="flex items-start gap-2.5 px-4 py-3.5">
                      {/* Multi-Select Checkbox */}
                      <div
                        onClick={(e) => handleToggleSelect(reply.id, e)}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                        className={`mt-1 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-all ${
                          isChecked
                            ? 'border-brand-gold bg-brand-gold text-white'
                            : 'border-gray-300 group-hover:border-gray-400 dark:border-gray-600'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>

                      {/* Star Button */}
                      <button
                        onClick={(e) => toggleStar(reply.id, e)}
                        className={`mt-0.5 shrink-0 transition-all ${
                          isItemStarred
                            ? 'text-amber-400 opacity-100'
                            : 'text-gray-300 opacity-40 hover:opacity-100 dark:text-gray-600'
                        }`}
                        title={isItemStarred ? 'Unstar' : 'Star'}
                      >
                        <Star
                          className={`h-4 w-4 ${isItemStarred ? 'fill-amber-400 text-amber-400' : ''}`}
                        />
                      </button>

                      {/* Clickable Area for Selecting Email */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => fetchDetail(reply.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fetchDetail(reply.id);
                          }
                        }}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        {/* Sender + Date */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            {isUnread && (
                              <span className="bg-brand-gold h-2 w-2 shrink-0 rounded-full" />
                            )}
                            <p
                              className={`truncate text-xs ${
                                isUnread
                                  ? 'font-bold text-gray-900 dark:text-white'
                                  : 'font-medium text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {formatSender(reply)}
                            </p>
                          </div>

                          <span className="shrink-0 font-mono text-[10px] text-gray-400">
                            {new Date(reply.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Subject */}
                        <p
                          className={`mt-0.5 truncate text-xs ${
                            isUnread
                              ? 'font-bold text-gray-900 dark:text-white'
                              : 'font-normal text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {reply.subject || '(no subject)'}
                        </p>

                        {/* Snippet */}
                        <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-gray-500">
                          {reply.snippet}
                        </p>

                        {/* Tags & Attachments Row */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {reply.has_attachments && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                              <Paperclip className="h-3 w-3" />
                            </span>
                          )}

                          {(reply.tags || []).map((tag) => {
                            const style = getTagStyle(tag);
                            return (
                              <span
                                key={tag}
                                className={`py-0.2 inline-flex items-center rounded-sm border px-1.5 text-[10px] font-semibold ${style.bg} ${style.color} ${style.border}`}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row Hover Quick Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        {/* Toggle Read/Unread */}
                        <button
                          onClick={(e) => handleToggleRead(reply.id, reply.is_read, e)}
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                          title={reply.is_read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {reply.is_read ? (
                            <Mail className="h-3.5 w-3.5" />
                          ) : (
                            <MailOpen className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Archive / Unarchive */}
                        <button
                          onClick={(e) => handleToggleArchive(reply.id, reply.is_archived, e)}
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-amber-600 dark:hover:bg-white/5 dark:hover:text-amber-400"
                          title={reply.is_archived ? 'Move to inbox' : 'Archive'}
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Single */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSingle(reply.id);
                          }}
                          className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          title="Move to trash"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {/* More Menu Toggle */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === reply.id ? null : reply.id);
                            }}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            title="More actions"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>

                          {/* Row 3-Dot Dropdown Menu */}
                          {activeMenuId === reply.id && (
                            <div
                              ref={rowMenuRef}
                              className="dark:bg-brand-dark-surface absolute top-6 right-0 z-40 min-w-[130px] rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleReplyInboxItem(reply);
                                }}
                                className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                              >
                                Reply
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleForwardInboxItem(reply);
                                }}
                                className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                              >
                                Forward
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleToggleRead(reply.id, reply.is_read);
                                }}
                                className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                              >
                                {reply.is_read ? 'Mark Unread' : 'Mark Read'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleToggleArchive(reply.id, reply.is_archived);
                                }}
                                className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                              >
                                {reply.is_archived ? 'Move to Inbox' : 'Archive'}
                              </button>
                              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleDeleteSingle(reply.id);
                                }}
                                className="flex w-full items-center px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Right Column: Email Detail Panel ─── */}
      {loadingDetail && !selectedReply ? (
        <EmailDetailSkeleton />
      ) : selectedReply ? (
        <EmailDetailPanel
          selected={selectedReply}
          loadingDetail={loadingDetail}
          copiedId={copiedId}
          copiedType={copiedType}
          copyMenuOpen={copyMenuOpen}
          copyMenuRef={copyMenuRef}
          starred={starred}
          onClose={() => setSelectedReply(null)}
          onReply={handleReply}
          onForward={handleForward}
          onCopyMenuToggle={() => setCopyMenuOpen(!copyMenuOpen)}
          onCopyText={copyText}
          onCopyId={copyId}
          onToggleStar={(id, e) => toggleStar(id, e)}
          onMarkUnread={(id) => handleToggleRead(id, true)}
          onArchive={(id, isArchived) => handleToggleArchive(id, !isArchived)}
          onDelete={(id) => handleDeleteSingle(id)}
          onAddTag={(id, tag) => handleApplyTag(id, tag, 'add')}
          onRemoveTag={(id, tag) => handleApplyTag(id, tag, 'remove')}
        />
      ) : (
        <div className="hidden flex-col items-center justify-center py-32 text-center lg:col-span-3 lg:flex">
          <Mail className="mb-3 h-12 w-12 text-gray-200 dark:text-gray-700" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">No email selected</h4>
          <p className="mt-1 text-xs text-gray-400">
            Select an email from the left to view details
          </p>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Move to Trash"
        message={`Are you sure you want to move ${
          deleteTargetIds.length === 1 ? 'this email' : `${deleteTargetIds.length} emails`
        } to the Recycle Bin? You can restore ${
          deleteTargetIds.length === 1 ? 'it' : 'them'
        } anytime from the Trash tab.`}
        confirmLabel={deleting ? 'Moving...' : 'Move to Trash'}
        variant="danger"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetIds([]);
        }}
      />
    </div>
  );
}
