import { supabaseAdmin } from '@/src/lib/supabase/admin';

/**
 * Resolve the default reply-to address for admin emails.
 * Reads `portal_settings.email_settings.admin_email`; falls back to a known string.
 */
export async function resolveDefaultReplyTo(): Promise<string> {
  const fallback = 'info@sviiinfrasolutions.com, hr.sviinfrasolutions@gmail.com';
  try {
    const { data: settingsData } = await supabaseAdmin
      .from('portal_settings' as any)
      .select('value')
      .eq('key', 'email_settings')
      .single();

    if ((settingsData as any)?.value?.admin_email) {
      return `info@sviiinfrasolutions.com, ${(settingsData as any).value.admin_email}`;
    }
  } catch {
    // ignore and return fallback
  }
  return fallback;
}

export function defaultFromAddress(): string {
  return 'SVI Infra <noreply@sviiinfrasolutions.com>';
}

/**
 * Accept a string or array of recipients. Always returns an array; trims/empties removed.
 */
export function toRecipientArray(input: string | string[] | undefined | null): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((s) => s.trim()).filter(Boolean);
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parse a possibly comma-separated reply-to string into an array Resend accepts.
 */
export function parseReplyTo(value: string | undefined | null): string[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}
