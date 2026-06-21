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

// ─── Draft Save/Load (Supabase) ────────────────────────────

function rowToDraftData(row: Record<string, unknown>): DraftData {
  return {
    id: String(row.id || ''),
    to: String(row.to_emails || ''),
    cc: String(row.cc_emails || ''),
    bcc: String(row.bcc_emails || ''),
    subject: String(row.subject || ''),
    html: String(row.html_body || ''),
    replyTo: String(row.reply_to || ''),
    fromName: String(row.from_name || 'SVI Infra'),
    savedAt: new Date((row.updated_at || row.created_at) as string).getTime(),
  };
}

function draftDataToRow(draft: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  replyTo: string;
  fromName: string;
  isCurrent?: boolean;
  userId?: string;
}) {
  const row: Record<string, unknown> = {
    to_emails: draft.to,
    cc_emails: draft.cc,
    bcc_emails: draft.bcc,
    subject: draft.subject,
    html_body: draft.html,
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
  await ensureMigrated();
  const userId = await getUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('email_drafts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    console.error('Failed to load drafts:', error);
    return [];
  }

  return data.map(rowToDraftData);
}

export async function saveDraft(draft: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  replyTo: string;
  fromName: string;
}): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const row = draftDataToRow({ ...draft, isCurrent: true });

  // Try update first (current draft exists)
  const { data: existing, error: fetchError } = await supabase
    .from('email_drafts')
    .select('id')
    .eq('user_id', userId)
    .eq('is_current', true)
    .maybeSingle();

  if (fetchError) {
    console.error('Failed to check draft:', fetchError);
    return false;
  }

  if (existing) {
    // Update existing current draft
    const { error: updateError } = await supabase
      .from('email_drafts')
      .update(row)
      .eq('id', existing.id);

    if (updateError) {
      console.error('Failed to update draft:', updateError);
      return false;
    }
  } else {
    // Insert new current draft
    const { error: insertError } = await supabase
      .from('email_drafts')
      .insert({ ...row, user_id: userId });

    if (insertError) {
      console.error('Failed to insert draft:', insertError);
      return false;
    }
  }

  return true;
}

export async function loadDraft(): Promise<DraftData | null> {
  await ensureMigrated();
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('email_drafts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_current', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return rowToDraftData(data);
}

export async function clearDraft(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('email_drafts').delete().eq('user_id', userId).eq('is_current', true);
}

export async function deleteDraft(id: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  // Allow deleting 'current' via this too
  const { error } = await supabase.from('email_drafts').delete().eq('id', id).eq('user_id', userId);

  if (error) {
    console.error('Failed to delete draft:', error);
    return false;
  }
  return true;
}

export async function saveNewDraft(draft: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  replyTo: string;
  fromName: string;
}): Promise<DraftData | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const row = draftDataToRow({ ...draft, isCurrent: false });

  const { data, error } = await supabase
    .from('email_drafts')
    .insert({ ...row, user_id: userId })
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to save new draft:', error);
    return null;
  }

  return rowToDraftData(data);
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
