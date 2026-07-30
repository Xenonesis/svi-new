/**
 * Typed admin email client for UI code.
 *
 * Wraps `/api/admin/email` so hooks stop using raw action strings.
 * Each method keeps the request payload shape identical to the old
 * `fetch('/api/admin/email', { body: { action: 'send', ... } })` pattern
 * but exposes it as a typed function for better autocomplete and refactoring.
 */
import { getToken } from './helpers';
import type { EmailDetail, DeletedEmail, ScheduledEmail, SentEmail } from './types';

export interface SendEmailPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  inReplyTo?: string;
  attachments?: Array<{ filename: string; content: string; size?: number }>;
  scheduledAt?: string;
}

export interface SendEmailResponse {
  success: true;
  id?: string;
  batches?: number;
  scheduled?: boolean;
  errors?: { error: string; batch: number }[];
}

export interface SentListResponse {
  emails: SentEmail[];
  hasMore: boolean;
}

export interface InboxListResponse {
  emails: EmailDetail[];
}

export interface DeletedListResponse {
  success: true;
  emails: DeletedEmail[];
}

export interface StarredIdsResponse {
  success: true;
  starredIds: string[];
}

export interface DeletedIdsResponse {
  success: true;
  deletedIds: string[];
}

export interface SimpleOk {
  success: true;
  [key: string]: unknown;
}

async function post<T>(body: Record<string, unknown>): Promise<T> {
  const token = await getToken();
  const res = await fetch('/api/admin/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || 'Request failed');
  }
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  const token = await getToken();
  const res = await fetch(`/api/admin/email${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || 'Request failed');
  }
  return data as T;
}

export const adminEmailApi = {
  send: (payload: SendEmailPayload) => post<SendEmailResponse>({ action: 'send', ...payload }),

  cancel: (id: string) => post<{ success: true; data: unknown }>({ action: 'cancel', id }),

  cancelScheduled: (id: string) => post<SimpleOk>({ action: 'cancel_scheduled', id }),

  star: (emailId: string) => post<{ success: true; starred: true }>({ action: 'star', emailId }),
  unstar: (emailId: string) =>
    post<{ success: true; starred: false }>({ action: 'unstar', emailId }),
  getStarredIds: () => post<StarredIdsResponse>({ action: 'get_starred' }),

  getDeletedIds: () => post<DeletedIdsResponse>({ action: 'get_deleted' }),
  getDeletedList: () => post<DeletedListResponse>({ action: 'get_deleted_list' }),
  deleteEmails: (emailIds: string[], emails?: any[]) =>
    post<{ success: true; deleted: number }>({ action: 'delete_emails', emailIds, emails }),
  restoreEmails: (emailIds: string[]) =>
    post<{ success: true; restored: number }>({ action: 'restore_emails', emailIds }),
  permanentlyDelete: (input: { emailIds?: string[]; all?: boolean } = {}) =>
    post<SimpleOk>({ action: 'permanently_delete', ...input }),

  listDomains: () => get<{ domains: any[] }>('?action=domains'),
  inboundStatus: () =>
    get<{ configured: boolean; inboundDomain: string | null; webhookUrl: string }>(
      '?action=inbound_status'
    ),
  usage: () =>
    get<{
      period: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      bounces: number;
      spamComplaints: number;
      dailyStats: Array<{ date: string; sent: number; delivered: number; opened: number }>;
    }>('?action=usage'),

  inbox: () => get<InboxListResponse>('?action=inbox'),
  inboxDetail: (id: string) => get<{ email: EmailDetail }>(`?action=inbox_detail&id=${id}`),
  replies: () => get<InboxListResponse>('?action=replies'),
  scheduled: () => get<{ success: true; emails: ScheduledEmail[] }>('?action=scheduled'),

  sentList: (opts: { limit?: number; after?: string } = {}) => {
    const params = new URLSearchParams();
    if (opts.limit) params.set('limit', String(opts.limit));
    if (opts.after) params.set('after', opts.after);
    params.set('action', 'sent');
    const qs = params.toString();
    // GET handler ignores `action=sent` and treats no-action as "sent" with limit/after.
    // But callers historically hit `/api/admin/email?limit=...&after=...`. Forward both forms.
    const fallbackQs = new URLSearchParams();
    if (opts.limit) fallbackQs.set('limit', String(opts.limit));
    if (opts.after) fallbackQs.set('after', opts.after);
    return get<SentListResponse>(`?${fallbackQs.toString()}`);
  },

  sentDetail: (id: string) => get<{ email: EmailDetail }>(`?action=email&id=${id}`),
};

export type AdminEmailApi = typeof adminEmailApi;
