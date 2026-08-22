'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type { ScheduledEmail } from '../types';
import { getToken } from '../helpers';
import { SORT_OPTIONS, type SortField, type SortDir } from '../sections/constants';

interface UseScheduledEmailsReturn {
  emails: ScheduledEmail[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: 'all' | 'pending' | 'failed' | 'sent';
  setStatusFilter: (v: 'all' | 'pending' | 'failed' | 'sent') => void;
  sortField: SortField;
  setSortField: (f: SortField) => void;
  sortDir: SortDir;
  setSortDir: (d: SortDir | ((prev: SortDir) => SortDir)) => void;
  processed: ScheduledEmail[];
  sortLabel: string;
  fetchEmails: () => Promise<void>;
  cancelScheduledEmail: (id: string) => Promise<boolean>;
  retryScheduledEmail: (id: string) => Promise<boolean>;
  cancelling: string | null;
  retrying: string | null;
  failedCount: number;
}
export function useScheduledEmails(): UseScheduledEmailsReturn {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'failed' | 'sent'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?action=scheduled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch scheduled emails');

      setEmails(data.emails || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const cancelScheduledEmail = async (id: string) => {
    setCancelling(id);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'cancel_scheduled',
          id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel email');

      setEmails((prev) => prev.filter((e) => e.id !== id));
      toast.success('Scheduled email cancelled');
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    } finally {
      setCancelling(null);
    }
  };
  const retryScheduledEmail = async (id: string) => {
    setRetrying(id);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'retry_scheduled',
          id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retry scheduled email');

      setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'sent' } : e)));
      toast.success('Scheduled email resent successfully');
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    } finally {
      setRetrying(null);
    }
  };

  const processed = useMemo(() => {
    let list = [...emails];

    if (statusFilter !== 'all') {
      list = list.filter((e) => e.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.subject?.toLowerCase().includes(q) ||
          e.metadata?.from?.toLowerCase().includes(q) ||
          e.to_emails?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
          break;
        case 'subject':
          cmp = (a.subject || '').localeCompare(b.subject || '');
          break;
        case 'recipient':
          cmp = (a.to_emails?.[0] || '').localeCompare(b.to_emails?.[0] || '');
          break;
        case 'status':
          cmp = (a.status || '').localeCompare(b.status || '');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [emails, statusFilter, search, sortField, sortDir]);

  const failedCount = useMemo(() => emails.filter((e) => e.status === 'failed').length, [emails]);
  const sortLabel = useMemo(() => {
    const opt = SORT_OPTIONS.find((o) => o.field === sortField);
    return `${opt?.label || 'Date'} ${sortDir === 'asc' ? '↑' : '↓'}`;
  }, [sortField, sortDir]);

  return {
    emails,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDir,
    setSortDir,
    processed,
    sortLabel,
    fetchEmails,
    cancelScheduledEmail,
    retryScheduledEmail,
    cancelling,
    retrying,
    failedCount,
  };
}
