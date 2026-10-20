import { supabaseAdmin } from '@/src/lib/supabase/admin';

/**
 * Activity-log writer that tolerates a stale `action_type` CHECK constraint.
 *
 * The `activity_logs_action_type_check` constraint can lag behind the
 * application code (new action types such as `lottery_drawn` or
 * `campaign_created` are rejected with Postgres error 23514 until the matching
 * migration is applied to that database). Migration
 * `20261020160000_extend_activity_logs_action_type_check.sql` aligns the
 * constraint with the current action types, but a failed audit write must
 * never break the business action that triggered it — and an environment that
 * has not applied that migration yet would still hit 23514. So this helper:
 *   1. attempts the insert with the intended action type,
 *   2. on a constraint violation, falls back to a known-allowed type so the
 *      audit entry (and its metadata) is still recorded,
 *   3. reports the outcome so callers can surface it.
 */

const ALLOWED_FALLBACK_ACTION_TYPE = 'settings_updated';

/** Postgres check-constraint violation. */
const CHECK_VIOLATION = '23514';

export interface ActivityLogEntry {
  user_id: string | null;
  action_type: string;
  description: string;
  metadata?: Record<string, unknown>;
  target_id?: string | null;
  target_type?: string | null;
}

export interface ActivityLogResult {
  logged: boolean;
  /** The action type actually stored (may be the fallback). */
  actionType: string;
  /** True when the intended type was rejected and the fallback was used. */
  usedFallback: boolean;
  error: string | null;
}

export async function writeActivityLog(entry: ActivityLogEntry): Promise<ActivityLogResult> {
  const { error } = await supabaseAdmin.from('activity_logs').insert({
    user_id: entry.user_id,
    action_type: entry.action_type,
    description: entry.description,
    metadata: entry.metadata ?? {},
    target_id: entry.target_id ?? null,
    target_type: entry.target_type ?? null,
  });

  if (!error) {
    return { logged: true, actionType: entry.action_type, usedFallback: false, error: null };
  }

  if (error.code !== CHECK_VIOLATION) {
    console.error(`[ActivityLog] Insert failed for "${entry.action_type}":`, error.message);
    return {
      logged: false,
      actionType: entry.action_type,
      usedFallback: false,
      error: error.message,
    };
  }

  // The CHECK constraint does not allow the intended action type yet. Record the
  // event under an allowed type so the audit trail is not lost, and keep the
  // original intent in the metadata.
  const { error: fallbackError } = await supabaseAdmin.from('activity_logs').insert({
    user_id: entry.user_id,
    action_type: ALLOWED_FALLBACK_ACTION_TYPE,
    description: entry.description,
    metadata: {
      ...(entry.metadata ?? {}),
      intended_action_type: entry.action_type,
      action_type_fallback: true,
    },
    target_id: entry.target_id ?? null,
    target_type: entry.target_type ?? null,
  });

  if (fallbackError) {
    console.error(
      `[ActivityLog] Fallback insert failed for "${entry.action_type}":`,
      fallbackError.message
    );
    return {
      logged: false,
      actionType: entry.action_type,
      usedFallback: false,
      error: fallbackError.message,
    };
  }

  console.warn(
    `[ActivityLog] action_type "${entry.action_type}" is not allowed by the database CHECK constraint yet; recorded under "${ALLOWED_FALLBACK_ACTION_TYPE}". Apply the pending migration to store the exact type.`
  );

  return {
    logged: true,
    actionType: ALLOWED_FALLBACK_ACTION_TYPE,
    usedFallback: true,
    error: null,
  };
}
