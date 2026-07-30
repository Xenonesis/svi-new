import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError } from '@/src/lib/api/errors';
import { notifyEmailLifecycle } from '../services/adminEmailNotifier';
import type { AdminActor } from '@/src/server/http/auth';

export async function getDeletedEmailIds(ctx: { actor: AdminActor }) {
  const { data, error } = await supabaseAdmin
    .from('email_deletions')
    .select('email_id')
    .eq('admin_id', ctx.actor.id);

  if (error) {
    throw AppError.badRequest(error.message);
  }
  const deletedIds = new Set((data || []).map((d: { email_id: string }) => d.email_id));
  return { success: true, deletedIds: Array.from(deletedIds) };
}

export async function getDeletedEmailList(ctx: { actor: AdminActor }) {
  const { data, error } = await supabaseAdmin
    .from('email_deletions')
    .select('*')
    .eq('admin_id', ctx.actor.id)
    .order('deleted_at', { ascending: false });

  if (error) {
    throw AppError.badRequest(error.message);
  }

  const deleted = (data || []).map((d: any) => ({
    id: d.email_id,
    email_id: d.email_id,
    subject: d.email_data?.subject || '(unknown)',
    from: d.email_data?.from || '',
    to: d.email_data?.to || [],
    created_at: d.email_data?.created_at || d.deleted_at,
    last_event: d.email_data?.last_event || 'deleted',
    deleted_at: d.deleted_at,
  }));

  return { success: true, emails: deleted };
}

export async function deleteEmails(
  ctx: { actor: AdminActor },
  input: { emailIds: string[]; emails?: any[] }
) {
  const { emailIds, emails } = input;
  if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
    throw AppError.badRequest('Missing emailIds array');
  }

  const emailDataMap = new Map<string, any>();
  if (Array.isArray(emails)) {
    for (const e of emails) {
      if (e.id) emailDataMap.set(e.id, e);
    }
  }

  const { error } = await supabaseAdmin.from('email_deletions').insert(
    emailIds.map((emailId: string) => ({
      email_id: emailId,
      admin_id: ctx.actor.id,
      email_data: emailDataMap.get(emailId) || null,
    }))
  );

  if (error && !error.message?.includes('duplicate key')) {
    throw AppError.badRequest(error.message);
  }

  if (emailIds.length > 0) {
    const deletedSubjects = Array.isArray(emails)
      ? emails.map((e: any) => e.subject || '(no subject)').filter(Boolean)
      : [];
    await notifyEmailLifecycle(
      'emailDeleted',
      { id: ctx.actor.id, email: ctx.actor.email },
      { count: emailIds.length, subjects: deletedSubjects }
    );
  }

  return { success: true, deleted: emailIds.length };
}

export async function restoreEmails(ctx: { actor: AdminActor }, input: { emailIds: string[] }) {
  const { emailIds } = input;
  if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
    throw AppError.badRequest('Missing emailIds array');
  }

  // Fetch subjects for the notification (non-critical, swallow failures).
  let restoredSubjects: string[] = [];
  try {
    const { data: restoreData } = await supabaseAdmin
      .from('email_deletions')
      .select('email_data')
      .eq('admin_id', ctx.actor.id)
      .in('email_id', emailIds);
    restoredSubjects = (restoreData || [])
      .map((d: any) => d.email_data?.subject || '(no subject)')
      .filter(Boolean);
  } catch {
    // Non-critical
  }

  const { error } = await supabaseAdmin
    .from('email_deletions')
    .delete()
    .eq('admin_id', ctx.actor.id)
    .in('email_id', emailIds);

  if (error) {
    throw AppError.badRequest(error.message);
  }

  await notifyEmailLifecycle(
    'emailRestored',
    { id: ctx.actor.id, email: ctx.actor.email },
    { count: emailIds.length, subjects: restoredSubjects }
  );

  return { success: true, restored: emailIds.length };
}

export async function permanentlyDeleteEmails(
  ctx: { actor: AdminActor },
  input: { emailIds?: string[]; all?: boolean }
) {
  const { emailIds, all } = input;

  // Fetch subjects before deleting for the notification.
  let permDeletedCount = 0;
  let permDeletedSubjects: string[] = [];
  try {
    let fetchQuery: any = supabaseAdmin
      .from('email_deletions')
      .select('email_data')
      .eq('admin_id', ctx.actor.id);
    if (!all && Array.isArray(emailIds) && emailIds.length > 0) {
      fetchQuery = fetchQuery.in('email_id', emailIds);
    }
    const { data: permData, count: permCount } = await fetchQuery;
    permDeletedCount = permCount ?? 0;
    permDeletedSubjects = (permData || [])
      .map((d: any) => d.email_data?.subject || '(no subject)')
      .filter(Boolean);
  } catch {
    // Non-critical
  }

  let query: any = supabaseAdmin.from('email_deletions').delete().eq('admin_id', ctx.actor.id);

  if (all) {
    // Delete ALL records for this admin — no further filter required.
  } else if (Array.isArray(emailIds) && emailIds.length > 0) {
    query = query.in('email_id', emailIds);
  } else {
    throw AppError.badRequest('Missing emailIds or all flag');
  }

  const { error } = await query;

  if (error) {
    throw AppError.badRequest(error.message);
  }

  if (permDeletedCount > 0) {
    await notifyEmailLifecycle(
      'emailPermanentlyDeleted',
      { id: ctx.actor.id, email: ctx.actor.email },
      { count: permDeletedCount, subjects: permDeletedSubjects }
    );
  }

  return { success: true };
}
