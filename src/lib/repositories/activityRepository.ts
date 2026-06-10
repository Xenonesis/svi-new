import { supabaseAdmin } from '@/src/lib/supabase/admin';

export type ActivityLog = {
  id?: string;
  user_id: string;
  action_type: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

export const activityRepository = {
  /**
   * Log an activity entry. Non-blocking — never throws.
   */
  async log(entry: ActivityLog): Promise<void> {
    try {
      await supabaseAdmin.from('activity_logs').insert(entry);
    } catch (err) {
      console.error(`[Activity Log] Failed to log "${entry.action_type}":`, err);
    }
  },

  /**
   * Get recent activity logs.
   */
  async list(
    opts: {
      userId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: ActivityLog[] | null; count: number | null }> {
    const { userId, limit = 50, offset = 0 } = opts;

    let query = supabaseAdmin
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) query = query.eq('user_id', userId);

    const { data, count } = await query;
    return { data, count };
  },
};
