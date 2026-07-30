import { getResend } from '../syncRunner';
import { AppError } from '@/src/lib/api/errors';

export async function cancelEmail(_ctx: unknown, input: { id: string }) {
  if (!input.id) {
    throw AppError.badRequest('Missing email id');
  }
  const resend = getResend();
  if (!resend) throw AppError.internal('Resend is not configured');
  const result = await resend.emails.cancel(input.id);
  return { success: true, data: result.data };
}
