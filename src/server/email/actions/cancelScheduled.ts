import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError } from '@/src/lib/api/errors';

export async function cancelScheduledEmail(_ctx: unknown, input: { id: string }) {
  if (!input.id) {
    throw AppError.badRequest('Missing scheduled email id');
  }

  const { error } = await supabaseAdmin
    .from('scheduled_emails')
    .update({ status: 'cancelled' })
    .eq('id', input.id);

  if (error) {
    throw AppError.badRequest(error.message);
  }
  return { success: true };
}
