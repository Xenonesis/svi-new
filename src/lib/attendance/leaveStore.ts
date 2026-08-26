import { supabaseAdmin } from '@/src/lib/supabase/admin';

export interface LeaveItem {
  id: string;
  user_id: string;
  leave_type: 'casual' | 'sick' | 'earned' | 'unpaid' | 'half_day';
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined employee fields
  full_name?: string;
  email?: string;
}

const FALLBACK_KEY = 'employee_leaves_store';

async function getFallbackStore(): Promise<LeaveItem[]> {
  try {
    const { data } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', FALLBACK_KEY)
      .maybeSingle();

    if (data?.value && Array.isArray(data.value)) {
      return data.value as LeaveItem[];
    }
  } catch (err) {
    console.error('Error reading leave fallback store:', err);
  }
  return [];
}

async function saveFallbackStore(items: LeaveItem[]): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('portal_settings').upsert({
      key: FALLBACK_KEY,
      value: items,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.error('Error saving leave fallback store:', err);
    return false;
  }
}

export const leaveStore = {
  async getAllLeaves(options?: { userId?: string; status?: string }): Promise<LeaveItem[]> {
    // 1. Try native employee_leaves table
    const { data: dbData, error } = await supabaseAdmin
      .from('employee_leaves')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && dbData) {
      let leaves = dbData as LeaveItem[];
      if (options?.userId) {
        leaves = leaves.filter((l) => l.user_id === options.userId);
      }
      if (options?.status && options.status !== 'all') {
        leaves = leaves.filter((l) => l.status === options.status);
      }

      // Fetch profiles to hydrate names
      const userIds = Array.from(new Set(leaves.map((l) => l.user_id)));
      if (userIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        leaves = leaves.map((l) => ({
          ...l,
          full_name: profileMap.get(l.user_id)?.full_name || '',
          email: profileMap.get(l.user_id)?.email || '',
        }));
      }

      return leaves;
    }

    // 2. Fallback to portal_settings if table not in schema cache
    let fallbackLeaves = await getFallbackStore();
    if (options?.userId) {
      fallbackLeaves = fallbackLeaves.filter((l) => l.user_id === options.userId);
    }
    if (options?.status && options.status !== 'all') {
      fallbackLeaves = fallbackLeaves.filter((l) => l.status === options.status);
    }

    // Hydrate names
    const userIds = Array.from(new Set(fallbackLeaves.map((l) => l.user_id)));
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      fallbackLeaves = fallbackLeaves.map((l) => ({
        ...l,
        full_name: profileMap.get(l.user_id)?.full_name || '',
        email: profileMap.get(l.user_id)?.email || '',
      }));
    }

    return fallbackLeaves.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async createLeave(data: {
    user_id: string;
    leave_type: 'casual' | 'sick' | 'earned' | 'unpaid' | 'half_day';
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
  }): Promise<LeaveItem> {
    const now = new Date().toISOString();

    // 1. Try native table
    const { data: inserted, error } = await supabaseAdmin
      .from('employee_leaves')
      .insert({
        user_id: data.user_id,
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.end_date,
        total_days: data.total_days,
        reason: data.reason.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (!error && inserted) {
      return inserted as LeaveItem;
    }

    // 2. Fallback
    const newItem: LeaveItem = {
      id: crypto.randomUUID(),
      user_id: data.user_id,
      leave_type: data.leave_type,
      start_date: data.start_date,
      end_date: data.end_date,
      total_days: data.total_days,
      reason: data.reason.trim(),
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    const existing = await getFallbackStore();
    existing.unshift(newItem);
    await saveFallbackStore(existing);

    return newItem;
  },

  async updateLeaveStatus(
    id: string,
    update: {
      status: 'approved' | 'rejected' | 'cancelled';
      reviewed_by?: string;
      admin_notes?: string;
    }
  ): Promise<LeaveItem | null> {
    const now = new Date().toISOString();

    // 1. Try native table
    const { data: updated, error } = await supabaseAdmin
      .from('employee_leaves')
      .update({
        status: update.status,
        reviewed_by: update.reviewed_by || null,
        reviewed_at: now,
        admin_notes: update.admin_notes || null,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (!error && updated) {
      return updated as LeaveItem;
    }

    // 2. Fallback
    const existing = await getFallbackStore();
    const index = existing.findIndex((l) => l.id === id);
    if (index === -1) return null;

    existing[index] = {
      ...existing[index],
      status: update.status,
      reviewed_by: update.reviewed_by || existing[index].reviewed_by,
      reviewed_at: now,
      admin_notes: update.admin_notes ?? existing[index].admin_notes,
      updated_at: now,
    };

    await saveFallbackStore(existing);
    return existing[index];
  },
};
