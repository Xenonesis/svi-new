import { supabase } from '@/src/lib/supabase/client';
import type { DraftData, EmailAttachment } from './types';

export async function getToken(): Promise<string> {
  const { useAuthStore } = await import('@/src/stores/authStore');
  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;
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

// ─── Draft Save/Load (Supabase) ────────────────────────────

function rowToDraftData(row: Record<string, unknown>): DraftData {
  let html = String(row.html_body || '');
  let quotedHtml: string | undefined = undefined;
  let templateMeta: {
    templateHtml?: string | null;
    selectedTemplate?: string | null;
    templateVars?: Record<string, string>;
    previewMode?: boolean;
    subjectTemplate?: string;
    toRecipients?: any[];
    ccRecipients?: any[];
    bccRecipients?: any[];
    inReplyToMessageId?: string | null;
    attachments?: EmailAttachment[];
  } | null = null;

  const metaMatch = html.match(/<!-- TEMPLATE_META_START -->([\s\S]*?)<!-- TEMPLATE_META_END -->/);
  if (metaMatch) {
    try {
      templateMeta = JSON.parse(metaMatch[1]);
    } catch {
      // ignore JSON parse error
    }
    html = html
      .replace(/<!-- TEMPLATE_META_START -->[\s\S]*?<!-- TEMPLATE_META_END -->/, '')
      .trim();
  }

  const match = html.match(/<!-- QUOTED_HTML_START -->([\s\S]*?)<!-- QUOTED_HTML_END -->/);
  if (match) {
    quotedHtml = match[1];
    html = html.replace(/<!-- QUOTED_HTML_START -->[\s\S]*?<!-- QUOTED_HTML_END -->/, '').trim();
  } else {
    // Fallback for legacy drafts containing raw reply/forward block
    const legacySplit = html.indexOf(
      '<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">'
    );
    if (legacySplit !== -1) {
      quotedHtml = html.substring(legacySplit);
      html = html.substring(0, legacySplit).trim();
    }
  }

  return {
    id: String(row.id || ''),
    to: String(row.to_emails || ''),
    cc: String(row.cc_emails || ''),
    bcc: String(row.bcc_emails || ''),
    subject: String(row.subject || ''),
    html,
    quotedHtml,
    replyTo: String(row.reply_to || ''),
    fromName: String(row.from_name || 'SVI Infra'),
    savedAt: new Date((row.updated_at || row.created_at) as string).getTime(),
    templateHtml: templateMeta?.templateHtml ?? null,
    selectedTemplate: templateMeta?.selectedTemplate ?? null,
    templateVars: templateMeta?.templateVars ?? {},
    previewMode: templateMeta?.previewMode ?? false,
    subjectTemplate: templateMeta?.subjectTemplate,
    inReplyToMessageId: templateMeta?.inReplyToMessageId ?? null,
    attachments: templateMeta?.attachments ?? [],
    toRecipients: templateMeta?.toRecipients,
    ccRecipients: templateMeta?.ccRecipients,
    bccRecipients: templateMeta?.bccRecipients,
  };
}
function draftDataToRow(draft: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  quotedHtml?: string | null;
  replyTo: string;
  fromName: string;
  isCurrent?: boolean;
  userId?: string;
  templateHtml?: string | null;
  selectedTemplate?: string | null;
  templateVars?: Record<string, string>;
  previewMode?: boolean;
  subjectTemplate?: string;
  toRecipients?: any[];
  ccRecipients?: any[];
  bccRecipients?: any[];
  inReplyToMessageId?: string | null;
  attachments?: EmailAttachment[];
}) {
  let fullBody = draft.html || '';

  const meta = {
    templateHtml: draft.templateHtml,
    selectedTemplate: draft.selectedTemplate,
    templateVars: draft.templateVars,
    previewMode: draft.previewMode,
    subjectTemplate: draft.subjectTemplate,
    toRecipients: draft.toRecipients,
    ccRecipients: draft.ccRecipients,
    bccRecipients: draft.bccRecipients,
    inReplyToMessageId: draft.inReplyToMessageId,
    attachments: draft.attachments?.map((a: EmailAttachment) => ({
      name: a.name,
      size: a.size,
      url: a.url,
      base64: a.url ? undefined : a.base64,
    })),
  };

  if (
    draft.templateHtml ||
    draft.selectedTemplate ||
    (draft.templateVars && Object.keys(draft.templateVars).length > 0) ||
    draft.toRecipients?.length ||
    draft.ccRecipients?.length
  ) {
    fullBody = `${fullBody}\n<!-- TEMPLATE_META_START -->${JSON.stringify(meta)}<!-- TEMPLATE_META_END -->`;
  }

  if (draft.quotedHtml && draft.quotedHtml.trim()) {
    fullBody = `${fullBody}\n<!-- QUOTED_HTML_START -->${draft.quotedHtml}<!-- QUOTED_HTML_END -->`;
  }

  const row: Record<string, unknown> = {
    to_emails: draft.to,
    cc_emails: draft.cc,
    bcc_emails: draft.bcc,
    subject: draft.subject,
    html_body: fullBody,
    reply_to: draft.replyTo,
    from_name: draft.fromName,
    is_current: draft.isCurrent ?? false,
    updated_at: new Date().toISOString(),
  };
  if (draft.userId) row.user_id = draft.userId;
  return row;
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

// Migrate localStorage drafts to Supabase once
async function migrateLocalDrafts(): Promise<void> {
  try {
    const raw = localStorage.getItem('svi-email-drafts');
    if (!raw) return;
    const userId = await getUserId();
    if (!userId) return;

    const localDrafts: DraftData[] = JSON.parse(raw);
    if (!Array.isArray(localDrafts) || localDrafts.length === 0) return;

    for (const d of localDrafts) {
      const row = draftDataToRow({ ...d, isCurrent: d.id === 'current', userId });
      await supabase.from('email_drafts').upsert(row, {
        onConflict: undefined,
        ignoreDuplicates: false,
      });
    }
    localStorage.removeItem('svi-email-drafts');
    localStorage.removeItem('svi-email-draft');
  } catch {
    // migration best-effort
  }
}

let migrationDone = false;

async function ensureMigrated(): Promise<void> {
  if (migrationDone) return;
  migrationDone = true;
  await migrateLocalDrafts();
}

export async function getAllDrafts(): Promise<DraftData[]> {
  try {
    const token = await getToken();
    if (!token) return [];
    const res = await fetch('/api/admin/email?action=drafts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.drafts)) {
        return json.drafts.map(rowToDraftData);
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export async function saveDraft(draft: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  quotedHtml?: string | null;
  replyTo: string;
  fromName: string;
  templateHtml?: string | null;
  selectedTemplate?: string | null;
  templateVars?: Record<string, string>;
  previewMode?: boolean;
  subjectTemplate?: string;
  toRecipients?: any[];
  ccRecipients?: any[];
  bccRecipients?: any[];
  inReplyToMessageId?: string | null;
  attachments?: EmailAttachment[];
}): Promise<boolean> {
  // 1. Instant local persistence (survives page refresh immediately)
  try {
    const safeAttachments = draft.attachments?.map((a: EmailAttachment) => ({
      name: a.name,
      size: a.size,
      url: a.url,
      base64: a.url ? undefined : a.base64 && a.base64.length < 200_000 ? a.base64 : undefined,
    }));
    localStorage.setItem(
      'svi-email-active-draft',
      JSON.stringify({ ...draft, attachments: safeAttachments, savedAt: Date.now() })
    );
  } catch {
    // ignore localStorage quota error
  }

  // 2. Persist to API route
  try {
    const token = await getToken();
    if (!token) return true;
    const row = draftDataToRow({ ...draft, isCurrent: true });
    const res = await fetch('/api/admin/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: 'save_draft',
        row,
      }),
    });
    if (res.ok) return true;
  } catch {
    // Silent fallback to local storage
  }

  return true;
}

export async function loadDraft(): Promise<DraftData | null> {
  // First check local storage backup for instantaneous recovery on reload
  try {
    const local = localStorage.getItem('svi-email-active-draft');
    if (local) {
      const parsed = JSON.parse(local);
      if (
        parsed &&
        (parsed.to ||
          parsed.subject ||
          parsed.html ||
          parsed.templateHtml ||
          parsed.selectedTemplate ||
          (parsed.templateVars && Object.keys(parsed.templateVars).length > 0))
      ) {
        return {
          id: 'local_active',
          to: parsed.to || '',
          cc: parsed.cc || '',
          bcc: parsed.bcc || '',
          subject: parsed.subject || '',
          html: parsed.html || '',
          quotedHtml: parsed.quotedHtml,
          replyTo: parsed.replyTo || '',
          fromName: parsed.fromName || 'SVI Infra',
          savedAt: parsed.savedAt || Date.now(),
          templateHtml: parsed.templateHtml ?? null,
          selectedTemplate: parsed.selectedTemplate ?? null,
          templateVars: parsed.templateVars ?? {},
          previewMode: parsed.previewMode ?? false,
          subjectTemplate: parsed.subjectTemplate,
          inReplyToMessageId: parsed.inReplyToMessageId || null,
          attachments: parsed.attachments || [],
          toRecipients: parsed.toRecipients,
          ccRecipients: parsed.ccRecipients,
          bccRecipients: parsed.bccRecipients,
        };
      }
    }
  } catch {
    // fallback to backend
  }

  try {
    const token = await getToken();
    if (!token) return null;
    const res = await fetch('/api/admin/email?action=draft', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.draft) return rowToDraftData(json.draft);
    }
  } catch {
    // Silent fallback
  }

  return null;
}

export async function clearDraft(): Promise<void> {
  try {
    localStorage.removeItem('svi-email-active-draft');
  } catch {
    // ignore
  }
  try {
    const token = await getToken();
    if (!token) return;
    await fetch('/api/admin/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'clear_draft' }),
    });
  } catch {
    // ignore
  }
}

export async function deleteDraft(id: string): Promise<boolean> {
  try {
    const token = await getToken();
    if (!token) return false;
    const res = await fetch('/api/admin/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'delete_draft', id }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveNewDraft(draft: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  quotedHtml?: string | null;
  replyTo: string;
  fromName: string;
}): Promise<DraftData | null> {
  try {
    const token = await getToken();
    if (!token) return null;
    const row = draftDataToRow({ ...draft, isCurrent: false });
    const res = await fetch('/api/admin/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'save_draft', row }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.draft) return rowToDraftData(json.draft);
    }
  } catch {
    return null;
  }
  return null;
}

// ─── Forward / Reply HTML Builders ──────────────────────────

/**
 * Normalizes email subject by removing existing Re: / Fwd: prefixes
 * and adding a clean prefix (defaults to 'Re:')
 */
export function cleanEmailSubject(subject: string, prefix: 'Re:' | 'Fwd:' = 'Re:'): string {
  if (!subject) return prefix;
  const cleaned = subject.replace(/^(?:(?:Re|Fwd|Fw):\s*)+/i, '').trim();
  return `${prefix} ${cleaned}`;
}

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

export async function uploadEmailAttachment(file: File): Promise<{
  name: string;
  size: number;
  url?: string;
  base64?: string;
}> {
  try {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const fd = new FormData();
    fd.append('action', 'upload_attachment');
    fd.append('file', file);

    const res = await fetch('/api/admin/email', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        return {
          name: file.name,
          size: file.size,
          url: data.url,
        };
      }
    }
  } catch (err) {
    console.warn('[ATTACHMENT] Direct upload failed, falling back to base64:', err);
  }

  const base64 = await fileToBase64(file);
  return {
    name: file.name,
    size: file.size,
    base64,
  };
}
