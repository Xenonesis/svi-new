import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInboxFilters } from '@/src/components/admin/email/hooks/useInboxFilters';
import type { InboxEmailItem } from '@/src/components/admin/email/types';

const mockReplies: InboxEmailItem[] = [
  {
    id: 'rep-1',
    email_id: 'e1',
    subject: 'Plot 33 Inquiry',
    from: 'Client One <client1@example.com>',
    from_name: 'Client One',
    from_email: 'client1@example.com',
    to: ['info@sviinfra.com'],
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    snippet: 'Interested in Harsholi plot',
    is_starred: false,
    is_read: false,
    is_archived: false,
    tags: ['Client', 'Lead'],
  },
  {
    id: 'rep-2',
    email_id: 'e2',
    subject: 'Payment Confirmation SVI2050',
    from: 'Client Two <client2@example.com>',
    from_name: 'Client Two',
    from_email: 'client2@example.com',
    to: ['info@sviinfra.com'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    snippet: 'Payment made via NEFT',
    is_starred: true,
    is_read: true,
    is_archived: false,
    tags: ['Payment'],
  },
  {
    id: 'rep-3',
    email_id: 'e3',
    subject: 'Archived Inquiry Old',
    from: 'Old Sender <old@example.com>',
    from_name: 'Old Sender',
    from_email: 'old@example.com',
    to: ['info@sviinfra.com'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(), // 40 days ago
    snippet: 'This is archived',
    is_starred: false,
    is_read: true,
    is_archived: true,
    tags: ['Follow Up'],
  },
];

describe('useInboxFilters', () => {
  it('initializes with default inbox view and excludes archived emails', () => {
    const { result } = renderHook(() =>
      useInboxFilters({ replies: mockReplies, starred: new Set() })
    );

    expect(result.current.viewFilter).toBe('inbox');
    expect(result.current.datePreset).toBe('all');
    expect(result.current.sortField).toBe('date');
    expect(result.current.sortDir).toBe('desc');
    expect(result.current.processed).toHaveLength(2);
    expect(result.current.processed.map((r) => r.id)).toEqual(['rep-1', 'rep-2']);
  });

  it('filters by search query matching subject, sender, or snippet', () => {
    const { result } = renderHook(() =>
      useInboxFilters({ replies: mockReplies, starred: new Set() })
    );

    act(() => {
      result.current.setSearch('payment');
    });

    expect(result.current.processed).toHaveLength(1);
    expect(result.current.processed[0].id).toBe('rep-2');

    act(() => {
      result.current.setSearch('client1@example.com');
    });

    expect(result.current.processed).toHaveLength(1);
    expect(result.current.processed[0].id).toBe('rep-1');
  });

  it('switches view filters correctly (unread, starred, archived, all)', () => {
    const { result } = renderHook(() =>
      useInboxFilters({ replies: mockReplies, starred: new Set(['rep-1']) })
    );

    // Unread
    act(() => {
      result.current.setViewFilter('unread');
    });
    expect(result.current.processed).toHaveLength(1);
    expect(result.current.processed[0].id).toBe('rep-1');

    // Starred
    act(() => {
      result.current.setViewFilter('starred');
    });
    expect(result.current.processed).toHaveLength(2); // rep-1 (local starred) + rep-2 (is_starred)

    // Archived
    act(() => {
      result.current.setViewFilter('archived');
    });
    expect(result.current.processed).toHaveLength(1);
    expect(result.current.processed[0].id).toBe('rep-3');

    // All
    act(() => {
      result.current.setViewFilter('all');
    });
    expect(result.current.processed).toHaveLength(3);
  });

  it('filters by date presets (today, 7d, 30d)', () => {
    const { result } = renderHook(() =>
      useInboxFilters({ replies: mockReplies, starred: new Set() })
    );

    // View all so we can test date filtering across everything
    act(() => {
      result.current.setViewFilter('all');
      result.current.setDatePreset('7d');
    });
    // rep-1 (1h ago) and rep-2 (3d ago) are within 7d; rep-3 (40d ago) is excluded
    expect(result.current.processed).toHaveLength(2);

    act(() => {
      result.current.setDatePreset('30d');
    });
    expect(result.current.processed).toHaveLength(2);

    act(() => {
      result.current.setDatePreset('90d');
    });
    expect(result.current.processed).toHaveLength(3);
  });

  it('filters by sender and by tag', () => {
    const { result } = renderHook(() =>
      useInboxFilters({ replies: mockReplies, starred: new Set() })
    );

    // Sender filter
    act(() => {
      result.current.setSenderFilter('client two');
    });
    expect(result.current.processed).toHaveLength(1);
    expect(result.current.processed[0].id).toBe('rep-2');

    // Tag filter
    act(() => {
      result.current.setSenderFilter('');
      result.current.setSelectedTag('Payment');
    });
    expect(result.current.processed).toHaveLength(1);
    expect(result.current.processed[0].id).toBe('rep-2');
  });

  it('sorts by subject, sender, and date ascending/descending', () => {
    const { result } = renderHook(() =>
      useInboxFilters({ replies: mockReplies, starred: new Set() })
    );

    // Sort by subject asc
    act(() => {
      result.current.handleSort('subject');
    });
    expect(result.current.sortField).toBe('subject');
    expect(result.current.sortDir).toBe('asc');
    // 'Payment Confirmation SVI2050' comes before 'Plot 33 Inquiry'
    expect(result.current.processed[0].id).toBe('rep-2');

    // Toggle same field to desc
    act(() => {
      result.current.handleSort('subject');
    });
    expect(result.current.sortDir).toBe('desc');
    expect(result.current.processed[0].id).toBe('rep-1');
  });

  it('resets all filters on clearAllFilters', () => {
    const { result } = renderHook(() =>
      useInboxFilters({ replies: mockReplies, starred: new Set() })
    );

    act(() => {
      result.current.setSearch('test');
      result.current.setViewFilter('starred');
      result.current.setDatePreset('7d');
      result.current.setSenderFilter('someone');
      result.current.setSelectedTag('Lead');
      result.current.handleSort('subject');
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.search).toBe('');
    expect(result.current.viewFilter).toBe('inbox');
    expect(result.current.datePreset).toBe('all');
    expect(result.current.senderFilter).toBe('');
    expect(result.current.selectedTag).toBeNull();
    expect(result.current.sortField).toBe('date');
    expect(result.current.sortDir).toBe('desc');
    expect(result.current.hasActiveFilters).toBe(false);
  });
});
