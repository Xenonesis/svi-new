import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError } from '@/src/lib/api/errors';
import type { AdminActor } from '@/src/server/http/auth';

export async function starEmail(_ctx: { actor: AdminActor }, input: { emailId: string }) {
  if (!input.emailId) {
    throw AppError.badRequest('Missing email id');
  }
  const { error } = await supabaseAdmin
    .from('email_stars')
    .insert({ email_id: input.emailId, admin_id: _ctx.actor.id });

  if (error) {
    throw AppError.badRequest(error.message);
  }
  return { success: true, starred: true };
}

export async function unstarEmail(_ctx: { actor: AdminActor }, input: { emailId: string }) {
  if (!input.emailId) {
    throw AppError.badRequest('Missing email id');
  }
  const { error } = await supabaseAdmin
    .from('email_stars')
    .delete()
    .eq('email_id', input.emailId)
    .eq('admin_id', _ctx.actor.id);

  if (error) {
    throw AppError.badRequest(error.message);
  }
  return { success: true, starred: false };
}

export async function getStarredEmailIds(ctx: { actor: AdminActor }) {
  const { data, error } = await supabaseAdmin
    .from('email_stars')
    .select('email_id')
    .eq('admin_id', ctx.actor.id);

  if (error) {
    throw AppError.badRequest(error.message);
  }
  const starredIds = new Set((data || []).map((d: { email_id: string }) => d.email_id));
  return { success: true, starredIds: Array.from(starredIds) };
}
