import { supabase } from '@/src/lib/supabase/client';
import type { DraftData } from './types';

export async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
      };
    case 'sent':
      return { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400' };
    case 'opened':
      return {
        bg: 'bg-violet-100 dark:bg-violet-500/15',
        text: 'text-violet-700 dark:text-violet-400',
      };
    case 'clicked':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-500/15',
        text: 'text-indigo-700 dark:text-indigo-400',
      };
    case 'bounced':
    case 'failed':
      return { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-400' };
    case 'complained':
      return {
        bg: 'bg-amber-100 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
      };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' };
  }
}

export function getDomainStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'verified':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'pending':
      return {
        bg: 'bg-amber-100 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
      };
    case 'failed':
      return {
        bg: 'bg-red-100 dark:bg-red-500/15',
        text: 'text-red-700 dark:text-red-400',
        dot: 'bg-red-500',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-400',
        dot: 'bg-gray-400',
      };
  }
}

// ─── Draft Save/Load ───────────────────────────────────────
const DRAFT_KEY = 'svi-email-draft';
const DRAFTS_KEY = 'svi-email-drafts';

// Migration helper: move old single draft to new drafts array
function migrateDraftIfNeeded(): void {
  try {
    const oldRaw = localStorage.getItem(DRAFT_KEY);
    const newRaw = localStorage.getItem(DRAFTS_KEY);
    if (oldRaw && !newRaw) {
      const oldDraft = JSON.parse(oldRaw);
      const draft: DraftData = {
        id: 'migrated-' + Date.now(),
        to: oldDraft.to || '',
        cc: oldDraft.cc || '',
        bcc: oldDraft.bcc || '',
        subject: oldDraft.subject || '',
        html: oldDraft.html || '',
        replyTo: oldDraft.replyTo || '',
        fromName: oldDraft.fromName || 'SVI Infra',
        savedAt: oldDraft.savedAt || Date.now(),
      };
      localStorage.setItem(DRAFTS_KEY, JSON.stringify([draft]));
      localStorage.removeItem(DRAFT_KEY);
    }
  } catch {
    // ignore migration errors
  }
}

export function getAllDrafts(): DraftData[] {
  migrateDraftIfNeeded();
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    const drafts = JSON.parse(raw);
    return Array.isArray(drafts) ? drafts : [];
  } catch {
    return [];
  }
}

export function saveDraft(draft: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  replyTo: string;
  fromName: string;
}): boolean {
  try {
    const drafts = getAllDrafts();
    const idx = drafts.findIndex((d) => d.id === 'current');
    const newDraft: DraftData = {
      id: 'current',
      ...draft,
      savedAt: Date.now(),
    };
    if (idx >= 0) {
      drafts[idx] = newDraft;
    } else {
      drafts.unshift(newDraft);
    }
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return true;
  } catch {
    return false;
  }
}

export function loadDraft(): DraftData | null {
  try {
    const drafts = getAllDrafts();
    return drafts.find((d) => d.id === 'current') || null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    const drafts = getAllDrafts();
    const filtered = drafts.filter((d) => d.id !== 'current');
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function deleteDraft(id: string): boolean {
  try {
    const drafts = getAllDrafts();
    const filtered = drafts.filter((d) => d.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

export function saveNewDraft(draft: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  replyTo: string;
  fromName: string;
}): DraftData | null {
  try {
    const drafts = getAllDrafts();
    const newDraft: DraftData = {
      id: crypto.randomUUID(),
      ...draft,
      savedAt: Date.now(),
    };
    drafts.push(newDraft);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return newDraft;
  } catch {
    return null;
  }
}

// ─── Forward / Reply HTML Builders ──────────────────────────

export function buildForwardHtml(email: {
  from: string;
  to?: string[];
  subject: string;
  created_at: string;
  html?: string;
  text?: string;
}): string {
  const date = new Date(email.created_at).toLocaleString('en-IN');
  const body = email.html || `<p>${email.text || ''}</p>`;
  return `
<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
  <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">
    ---------- Forwarded message ----------
  </p>
  <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">
    <strong>From:</strong> ${email.from}<br/>
    <strong>Date:</strong> ${date}<br/>
    <strong>Subject:</strong> ${email.subject}<br/>
    <strong>To:</strong> ${email.to?.join(', ') || '—'}
  </p>
  <div style="margin-top:16px;">
    ${body}
  </div>
</div>`;
}

export function buildReplyHtml(email: {
  from: string;
  subject: string;
  created_at: string;
  html?: string;
  text?: string;
}): string {
  const date = new Date(email.created_at).toLocaleString('en-IN');
  const body = email.html || `<p>${email.text || ''}</p>`;
  return `
<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
  <p style="color:#6b7280;font-size:13px;margin:0 0 16px;">
    On ${date}, <a href="mailto:${email.from}" style="color:#6366f1;">${email.from}</a> wrote:
  </p>
  <blockquote style="border-left:3px solid #d1d5db;padding-left:16px;margin:0;color:#6b7280;">
    ${body}
  </blockquote>
</div>`;
}

// ─── Copy Email Content ─────────────────────────────────────

export function buildCopyText(email: {
  subject: string;
  from: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  created_at: string;
  text?: string;
  html?: string;
}): string {
  const date = new Date(email.created_at).toLocaleString('en-IN');
  const lines = [
    `Subject: ${email.subject}`,
    `From: ${email.from}`,
    `To: ${email.to?.join(', ') || '—'}`,
  ];
  if (email.cc?.length) lines.push(`CC: ${email.cc.join(', ')}`);
  if (email.bcc?.length) lines.push(`BCC: ${email.bcc.join(', ')}`);
  lines.push(`Date: ${date}`);
  lines.push('', '---', '');
  lines.push(email.text || stripHtml(email.html || ''));
  return lines.join('\n');
}

export function buildCopyHtml(email: {
  subject: string;
  from: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  created_at: string;
  html?: string;
}): string {
  return email.html || '';
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── File → Base64 ──────────────────────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the data:mime;base64, prefix
      resolve(result.split(',')[1] || result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
