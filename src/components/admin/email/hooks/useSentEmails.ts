'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import type { SentEmail, EmailDetail } from '../types';
import { getToken } from '../helpers';
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  type SortField,
  type SortDir,
  type DatePreset,
} from '../sections/constants';

interface UseSentEmailsReturn {
  emails: SentEmail[];
  loading: boolean;
  error: string | null;
  selected: EmailDetail | null;
  setSelected: (v: EmailDetail | null) => void;
  loadingDetail: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  search: string;
  setSearch: (v: string) => void;
  sortField: SortField;
  setSortField: (f: SortField) => void;
  sortDir: SortDir;
  setSortDir: (d: SortDir | ((prev: SortDir) => SortDir)) => void;
  sortOpen: boolean;
  setSortOpen: (v: boolean) => void;
  sortRef: React.RefObject<HTMLDivElement | null>;
  filterOpen: boolean;
  setFilterOpen: (v: boolean) => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  statusFilter: Set<string>;
  datePreset: DatePreset;
  fromFilter: string;
  starred: Set<string>;
  showStarredOnly: boolean;
  setShowStarredOnly: (v: boolean) => void;
  copiedId: string | null;
  copiedType: string | null;
  copyMenuOpen: boolean;
  setCopyMenuOpen: (v: boolean) => void;
  copyMenuRef: React.RefObject<HTMLDivElement | null>;
  processed: SentEmail[];
  sortLabel: string;
  hasSortChanged: boolean;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  fetchEmails: (after?: string) => Promise<void>;
  loadMore: () => void;
  fetchDetail: (id: string) => Promise<void>;
  toggleStar: (id: string, e: React.MouseEvent | React.KeyboardEvent) => void;
  handleSort: (field: SortField) => void;
  toggleStatus: (s: string) => void;
  clearAllFilters: () => void;
  setDatePreset: (v: DatePreset) => void;
  setFromFilter: (v: string) => void;
  setStatusFilter: React.Dispatch<React.SetStateAction<Set<string>>>;
  copyText: (text: string, type: string) => Promise<void>;
  copyId: (id: string) => void;
  // ─── Multi-select & Delete ───
  selectedIds: Set<string>;
  isAllSelected: boolean;
  toggleSelectEmail: (id: string) => void;
  selectAllEmails: () => void;
  clearSelection: () => void;
  deleting: boolean;
  deleteSelectedEmails: () => Promise<number>;
  addToDeleted: (ids: string[]) => void;
}

export function useSentEmails(): UseSentEmailsReturn {
  /* ─── Data state ─── */
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EmailDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ─── Search ─── */
  const [search, setSearch] = useState('');

  /* ─── Sort state ─── */
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  /* ─── Filter state ─── */
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [fromFilter, setFromFilter] = useState('');

  /* ─── Star ─── */
  const [starred, setStarred] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('svi-starred-emails');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  /* ─── Multi-select & Delete ─── */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const toggleSelectEmail = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const addToDeleted = (ids: string[]) => {
    setEmails((prev) => prev.filter((e) => !ids.includes(e.id)));
    setSelectedIds(new Set());
    if (selected && ids.includes(selected.id)) {
      setSelected(null);
    }
  };

  const deleteSelectedEmails = async (): Promise<number> => {
    const ids = [...selectedIds];
    if (ids.length === 0) return 0;
    setDeleting(true);
    try {
      const token = await getToken();
      // Include full email data so the Recycle Bin can display it
      const emailData = processed
        .filter((e) => selectedIds.has(e.id))
        .map((e) => ({
          id: e.id,
          subject: e.subject,
          from: e.from,
          to: e.to,
          created_at: e.created_at,
          last_event: e.last_event,
        }));
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'delete_emails',
          emailIds: ids,
          emails: emailData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete emails');
      addToDeleted(ids);
      toast.success(`${ids.length} email${ids.length > 1 ? 's' : ''} deleted`);
      return ids.length;
    } catch (e) {
      toast.error((e as Error).message);
      return 0;
    } finally {
      setDeleting(false);
    }
  };

  /* ─── Copy / Detail ─── */
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  /* ─── Close dropdowns on outside click ─── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (copyMenuRef.current && !copyMenuRef.current.contains(target)) setCopyMenuOpen(false);
      if (sortRef.current && !sortRef.current.contains(target)) setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Cursor-based pagination ─── */
  // Resend uses the last email's ID as the 'after' cursor for the next page
  const [afterCursor, setAfterCursor] = useState<string | null>(null);

  const fetchEmails = useCallback(async (after?: string) => {
    const isInitial = after === undefined;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (!isInitial && after) params.set('after', after);
      const res = await fetch(`/api/admin/email?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      const newEmails = data.emails || [];
      if (isInitial) {
        setEmails(newEmails);
      } else {
        setEmails((prev) => [...prev, ...newEmails]);
      }
      // Store the last email's ID as cursor for the next page
      if (newEmails.length > 0) {
        setAfterCursor(newEmails[newEmails.length - 1].id);
      }
      setHasMore(data.hasMore && newEmails.length > 0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Load more using stored cursor (last email ID)
  const loadMore = useCallback(() => {
    if (afterCursor) fetchEmails(afterCursor);
  }, [afterCursor, fetchEmails]);

  useEffect(() => {
    localStorage.setItem('svi-starred-emails', JSON.stringify([...starred]));
  }, [starred]);

  /* ─── Detail fetch ─── */
  const fetchDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?action=email&id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load email');
      setSelected(data.email);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingDetail(false);
    }
  };

  /* ─── Star toggle ─── */
  const toggleStar = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ─── Copy helpers ─── */
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

  /* ─── Sort handler ─── */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'date' ? 'desc' : 'asc');
    }
    setSortOpen(false);
  };

  /* ─── Filter handlers ─── */
  const toggleStatus = (s: string) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter(new Set());
    setDatePreset('all');
    setFromFilter('');
    setShowStarredOnly(false);
    setSortField('date');
    setSortDir('desc');
  };

  /* ─── Derived values ─── */
  const hasSortChanged = sortField !== 'date' || sortDir !== 'desc';

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter.size > 0) count += statusFilter.size;
    if (datePreset !== 'all') count++;
    if (fromFilter.trim()) count++;
    if (showStarredOnly) count++;
    return count;
  }, [statusFilter, datePreset, fromFilter, showStarredOnly]);

  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0 || hasSortChanged;

  const dateCutoff = useMemo(() => {
    if (datePreset === 'all') return null;
    const now = new Date();
    switch (datePreset) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case '7d':
        return new Date(now.getTime() - 7 * 86400000);
      case '30d':
        return new Date(now.getTime() - 30 * 86400000);
      case '90d':
        return new Date(now.getTime() - 90 * 86400000);
      default:
        return null;
    }
  }, [datePreset]);

  /* ─── Processed list: filter → sort ─── */
  const processed = useMemo(() => {
    let list = [...emails];

    // Search (subject, from, to)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.subject?.toLowerCase().includes(q) ||
          e.from?.toLowerCase().includes(q) ||
          e.to?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    // Star filter
    if (showStarredOnly) list = list.filter((e) => starred.has(e.id));

    // Status filter (multi)
    if (statusFilter.size > 0) {
      list = list.filter((e) => statusFilter.has(e.last_event?.toLowerCase() || ''));
    }

    // Date range
    if (dateCutoff) {
      console.log('[DEBUG] Date filter active:', {
        datePreset,
        dateCutoff: dateCutoff.toISOString(),
        emailsCount: list.length,
        sampleDates: list.slice(0, 3).map((e) => e.created_at),
      });
      list = list.filter((e) => {
        const emailDate = new Date(e.created_at);
        const isValid = !isNaN(emailDate.getTime());
        const passes = isValid && emailDate >= dateCutoff;
        if (!isValid) console.log('[DEBUG] Invalid date:', e.created_at);
        return passes;
      });
      console.log('[DEBUG] After date filter:', list.length);
    }

    // From filter
    if (fromFilter.trim()) {
      const f = fromFilter.toLowerCase();
      list = list.filter((e) => e.from?.toLowerCase().includes(f));
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'subject':
          cmp = (a.subject || '').localeCompare(b.subject || '');
          break;
        case 'recipient':
          cmp = (a.to?.[0] || '').localeCompare(b.to?.[0] || '');
          break;
        case 'status':
          cmp = (a.last_event || '').localeCompare(b.last_event || '');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [
    emails,
    search,
    showStarredOnly,
    starred,
    statusFilter,
    dateCutoff,
    fromFilter,
    sortField,
    sortDir,
  ]);

  const isAllSelected = useMemo(
    () => processed.length > 0 && processed.every((e) => selectedIds.has(e.id)),
    [processed, selectedIds]
  );

  const selectAllEmails = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processed.map((e) => e.id)));
    }
  };

  const sortLabel = useMemo(() => {
    const opt = SORT_OPTIONS.find((o) => o.field === sortField);
    return `${opt?.label || 'Date'} ${sortDir === 'asc' ? '↑' : '↓'}`;
  }, [sortField, sortDir]);

  return {
    emails,
    loading,
    error,
    selected,
    setSelected,
    loadingDetail,
    hasMore,
    loadingMore,
    search,
    setSearch,
    sortField,
    setSortField,
    sortDir,
    setSortDir,
    sortOpen,
    setSortOpen,
    sortRef,
    filterOpen,
    setFilterOpen,
    filterRef,
    statusFilter,
    datePreset,
    fromFilter,
    starred,
    showStarredOnly,
    setShowStarredOnly,
    copiedId,
    copiedType,
    copyMenuOpen,
    setCopyMenuOpen,
    copyMenuRef,
    processed,
    sortLabel,
    hasSortChanged,
    activeFilterCount,
    hasActiveFilters,
    fetchEmails,
    loadMore,
    fetchDetail,
    toggleStar,
    handleSort,
    toggleStatus,
    clearAllFilters,
    setDatePreset,
    setFromFilter,
    setStatusFilter,
    copyText,
    copyId,
    // ─── Multi-select & Delete ───
    selectedIds,
    isAllSelected,
    toggleSelectEmail,
    selectAllEmails,
    clearSelection,
    deleting,
    deleteSelectedEmails,
    addToDeleted,
  };
}
