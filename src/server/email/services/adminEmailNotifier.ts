import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';

/** Resolve the admin's full_name from `profiles` with email/Admin fallback. */
export async function getAdminDisplayName(
  adminId: string,
  fallbackEmail: string | null
): Promise<string> {
  try {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', adminId)
      .single();
    return data?.full_name || fallbackEmail || 'Admin';
  } catch {
    return fallbackEmail || 'Admin';
  }
}

/**
 * Centralized wrapper for email lifecycle notifications.
 * - Always resolves a display name for the actor
 * - Never throws into the calling flow (logs on failure) because notifications
 *   should not block transactional paths.
 */
export async function notifyEmailLifecycle(
  event:
    'emailSent' | 'emailScheduled' | 'emailDeleted' | 'emailRestored' | 'emailPermanentlyDeleted',
  admin: { id: string; email: string | null },
  payload: {
    recipients?: string[];
    subject?: string;
    count?: number;
    subjects?: string[];
  }
): Promise<void> {
  const displayName = await getAdminDisplayName(admin.id, admin.email);

  try {
    switch (event) {
      case 'emailSent':
        await NotificationHelper.emailSent(
          payload.recipients?.[0] || 'recipient',
          payload.subject || '(no subject)',
          displayName
        );
        break;
      case 'emailScheduled':
        // Original implementation logged only; preserve that behavior.
        console.log(
          `[Admin Email] Email scheduled by ${displayName} for ${payload.subject ?? payload.recipients?.[0] ?? ''}`
        );
        break;
      case 'emailDeleted':
        await NotificationHelper.emailDeleted(
          payload.count ?? 0,
          payload.subjects ?? [],
          displayName
        );
        break;
      case 'emailRestored':
        await NotificationHelper.emailRestored(
          payload.count ?? 0,
          payload.subjects ?? [],
          displayName
        );
        break;
      case 'emailPermanentlyDeleted':
        await NotificationHelper.emailPermanentlyDeleted(
          payload.count ?? 0,
          payload.subjects ?? [],
          displayName
        );
        break;
    }
  } catch (err) {
    console.error(`[notifyEmailLifecycle] ${event} failed:`, err);
  }
}
