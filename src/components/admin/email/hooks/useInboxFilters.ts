'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { InboxEmailItem } from '../types';
import type { DatePreset, SortDir } from '../sections/constants';

export type InboxViewFilter = 'inbox' | 'unread' | 'starred' | 'archived' | 'all';
export type InboxSortField = 'date' | 'subject' | 'sender' | 'status';

export interface InboxSortOption {
  field: InboxSortField;
  label: string;
}

export const INBOX_SORT_OPTIONS: InboxSortOption[] = [
  { field: 'date', label: 'Date' },
  { field: 'subject', label: 'Subject' },
  { field: 'sender', label: 'Sender' },
  { field: 'status', label: 'Status' },
];

export interface UseInboxFiltersOptions {
  replies: InboxEmailItem[];
  starred: Set<string>;
}

export interface UseInboxFiltersReturn {
  // Filter states
  search: string;
  setSearch: (s: string) => void;
  viewFilter: InboxViewFilter;
  setViewFilter: (v: InboxViewFilter) => void;
  datePreset: DatePreset;
  setDatePreset: (p: DatePreset) => void;
  senderFilter: string;
  setSenderFilter: (s: string) => void;
  selectedTag: string | null;
  setSelectedTag: (t: string | null) => void;
  showStarredOnly: boolean;
  setShowStarredOnly: (v: boolean) => void;

  // Sort states
  sortField: InboxSortField;
  setSortField: (f: InboxSortField) => void;
  sortDir: SortDir;
  setSortDir: React.Dispatch<React.SetStateAction<SortDir>>;
  sortOpen: boolean;
  setSortOpen: (o: boolean) => void;
  sortRef: React.RefObject<HTMLDivElement | null>;
  sortLabel: string;
  hasSortChanged: boolean;
  handleSort: (field: InboxSortField) => void;

  // Filter panel state
  filterOpen: boolean;
  setFilterOpen: (o: boolean) => void;
  filterRef: React.RefObject<HTMLDivElement | null>;

  // Computed lists and metrics
  processed: InboxEmailItem[];
  activeFilterCount: number;
  hasActiveFilters: boolean;

  // Actions
  clearAllFilters: () => void;
}

export function useInboxFilters({
  replies,
  starred,
}: UseInboxFiltersOptions): UseInboxFiltersReturn {
  // Search
  const [search, setSearch] = useState('');

  // View Filter: inbox, unread, starred, archived, all
  const [viewFilter, setViewFilter] = useState<InboxViewFilter>('inbox');

  // Date range preset
  const [datePreset, setDatePreset] = useState<DatePreset>('all');

  // Sender text filter
  const [senderFilter, setSenderFilter] = useState('');

  // Tag filter
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Starred only toggle
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Sort states
  const [sortField, setSortField] = useState<InboxSortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Filter panel open state
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sortRef.current && !sortRef.current.contains(target)) setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sort handler
  const handleSort = useCallback(
    (field: InboxSortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir(field === 'date' ? 'desc' : 'asc');
      }
      setSortOpen(false);
    },
    [sortField]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearch('');
    setViewFilter('inbox');
    setDatePreset('all');
    setSenderFilter('');
    setSelectedTag(null);
    setShowStarredOnly(false);
    setSortField('date');
    setSortDir('desc');
  }, []);

  // Has sort changed from default (date desc)
  const hasSortChanged = sortField !== 'date' || sortDir !== 'desc';

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (viewFilter !== 'inbox') count++;
    if (datePreset !== 'all') count++;
    if (senderFilter.trim()) count++;
    if (selectedTag) count++;
    if (showStarredOnly) count++;
    return count;
  }, [viewFilter, datePreset, senderFilter, selectedTag, showStarredOnly]);

  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0 || hasSortChanged;

  // Date cutoff
  const dateCutoff = useMemo(() => {
    if (datePreset === 'all') return null;
    const now = new Date();
    switch (datePreset) {
      case 'today':
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      case '7d':
        return new Date(Date.now() - 7 * 86400000);
      case '30d':
        return new Date(Date.now() - 30 * 86400000);
      case '90d':
        return new Date(Date.now() - 90 * 86400000);
      default:
        return null;
    }
  }, [datePreset]);

  // Sort label
  const sortLabel = useMemo(() => {
    const opt = INBOX_SORT_OPTIONS.find((o) => o.field === sortField);
    return `${opt?.label || 'Date'} ${sortDir === 'asc' ? '↑' : '↓'}`;
  }, [sortField, sortDir]);

  // Processed list: filter -> sort
  const processed = useMemo(() => {
    let list = [...replies];

    // 1. View filter
    if (viewFilter === 'inbox') {
      list = list.filter((item) => !item.is_archived);
    } else if (viewFilter === 'unread') {
      list = list.filter((item) => !item.is_read && !item.is_archived);
    } else if (viewFilter === 'starred') {
      list = list.filter((item) => item.is_starred || starred.has(item.id));
    } else if (viewFilter === 'archived') {
      list = list.filter((item) => item.is_archived);
    } // 'all' keeps everything

    // 2. Search query (subject, sender name, sender email, snippet, text)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.subject?.toLowerCase().includes(q) ||
          item.from?.toLowerCase().includes(q) ||
          item.from_name?.toLowerCase().includes(q) ||
          item.from_email?.toLowerCase().includes(q) ||
          item.snippet?.toLowerCase().includes(q) ||
          item.text?.toLowerCase().includes(q)
      );
    }

    // 3. Starred only filter
    if (showStarredOnly) {
      list = list.filter((item) => item.is_starred || starred.has(item.id));
    }

    // 4. Tag filter
    if (selectedTag) {
      list = list.filter((item) => item.tags?.includes(selectedTag));
    }

    // 5. Date range cutoff
    if (dateCutoff) {
      list = list.filter((item) => {
        const itemDate = new Date(item.created_at);
        return !isNaN(itemDate.getTime()) && itemDate >= dateCutoff;
      });
    }

    // 6. Sender filter
    if (senderFilter.trim()) {
      const sf = senderFilter.toLowerCase();
      list = list.filter(
        (item) =>
          item.from?.toLowerCase().includes(sf) ||
          item.from_name?.toLowerCase().includes(sf) ||
          item.from_email?.toLowerCase().includes(sf)
      );
    }

    // 7. Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date': {
          const tA = new Date(a.created_at).getTime();
          const tB = new Date(b.created_at).getTime();
          cmp = tA - tB;
          break;
        }
        case 'subject':
          cmp = (a.subject || '').localeCompare(b.subject || '');
          break;
        case 'sender': {
          const sA = a.from_name || a.from_email || a.from || '';
          const sB = b.from_name || b.from_email || b.from || '';
          cmp = sA.localeCompare(sB);
          break;
        }
        case 'status': {
          // Unread first if asc, read first if desc
          const readA = a.is_read ? 1 : 0;
          const readB = b.is_read ? 1 : 0;
          cmp = readA - readB;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [
    replies,
    viewFilter,
    starred,
    search,
    showStarredOnly,
    selectedTag,
    dateCutoff,
    senderFilter,
    sortField,
    sortDir,
  ]);

  return {
    search,
    setSearch,
    viewFilter,
    setViewFilter,
    datePreset,
    setDatePreset,
    senderFilter,
    setSenderFilter,
    selectedTag,
    setSelectedTag,
    showStarredOnly,
    setShowStarredOnly,
    sortField,
    setSortField,
    sortDir,
    setSortDir,
    sortOpen,
    setSortOpen,
    sortRef,
    sortLabel,
    hasSortChanged,
    handleSort,
    filterOpen,
    setFilterOpen,
    filterRef,
    processed,
    activeFilterCount,
    hasActiveFilters,
    clearAllFilters,
  };
}
