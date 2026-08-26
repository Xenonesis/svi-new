import { supabaseAdmin } from '@/src/lib/supabase/admin';

export interface RegularizationItem {
  id: string;
  user_id: string;
  date: string;
  punch_type: 'punch_in' | 'punch_out' | 'full_day';
  suggested_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  admin_notes?: string | null;
  created_at: string;
  full_name?: string;
  email?: string;
}

const FALLBACK_KEY = 'attendance_regularizations_store';

async function getFallbackStore(): Promise<RegularizationItem[]> {
  try {
    const { data } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', FALLBACK_KEY)
      .maybeSingle();

    if (data?.value && Array.isArray(data.value)) {
      return data.value as RegularizationItem[];
    }
  } catch (err) {
    console.error('Error reading regularization fallback store:', err);
  }
  return [];
}

async function saveFallbackStore(items: RegularizationItem[]): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('portal_settings').upsert({
      key: FALLBACK_KEY,
      value: items,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.error('Error saving regularization fallback store:', err);
    return false;
  }
}

export const regularizationStore = {
  async getAllRegularizations(options?: {
    userId?: string;
    status?: string;
  }): Promise<RegularizationItem[]> {
    // 1. Try native table
    const { data: dbData, error } = await supabaseAdmin
      .from('attendance_regularizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && dbData) {
      let records = dbData as RegularizationItem[];
      if (options?.userId) {
        records = records.filter((r) => r.user_id === options.userId);
      }
      if (options?.status && options.status !== 'all') {
        records = records.filter((r) => r.status === options.status);
      }

      // Fetch profiles to hydrate names
      const userIds = Array.from(new Set(records.map((r) => r.user_id)));
      if (userIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        records = records.map((r) => ({
          ...r,
          full_name: profileMap.get(r.user_id)?.full_name || '',
          email: profileMap.get(r.user_id)?.email || '',
        }));
      }

      return records;
    }

    // 2. Fallback
    let fallbackRecords = await getFallbackStore();
    if (options?.userId) {
      fallbackRecords = fallbackRecords.filter((r) => r.user_id === options.userId);
    }
    if (options?.status && options.status !== 'all') {
      fallbackRecords = fallbackRecords.filter((r) => r.status === options.status);
    }

    const userIds = Array.from(new Set(fallbackRecords.map((r) => r.user_id)));
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      fallbackRecords = fallbackRecords.map((r) => ({
        ...r,
        full_name: profileMap.get(r.user_id)?.full_name || '',
        email: profileMap.get(r.user_id)?.email || '',
      }));
    }

    return fallbackRecords.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async createRegularization(data: {
    user_id: string;
    date: string;
    punch_type: 'punch_in' | 'punch_out' | 'full_day';
    suggested_time: string;
    reason: string;
  }): Promise<RegularizationItem> {
    const now = new Date().toISOString();

    // 1. Try native table
    const { data: inserted, error } = await supabaseAdmin
      .from('attendance_regularizations')
      .insert({
        user_id: data.user_id,
        date: data.date,
        punch_type: data.punch_type,
        suggested_time: data.suggested_time,
        reason: data.reason.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (!error && inserted) {
      return inserted as RegularizationItem;
    }

    // 2. Fallback
    const newItem: RegularizationItem = {
      id: crypto.randomUUID(),
      user_id: data.user_id,
      date: data.date,
      punch_type: data.punch_type,
      suggested_time: data.suggested_time,
      reason: data.reason.trim(),
      status: 'pending',
      created_at: now,
    };

    const existing = await getFallbackStore();
    existing.unshift(newItem);
    await saveFallbackStore(existing);

    return newItem;
  },

  async updateRegularizationStatus(
    id: string,
    update: {
      status: 'approved' | 'rejected';
      reviewed_by?: string;
      admin_notes?: string;
    }
  ): Promise<RegularizationItem | null> {
    const now = new Date().toISOString();

    // 1. Try native table
    const { data: updated, error } = await supabaseAdmin
      .from('attendance_regularizations')
      .update({
        status: update.status,
        reviewed_by: update.reviewed_by || null,
        reviewed_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (!error && updated) {
      return updated as RegularizationItem;
    }

    // 2. Fallback
    const existing = await getFallbackStore();
    const index = existing.findIndex((r) => r.id === id);
    if (index === -1) return null;

    existing[index] = {
      ...existing[index],
      status: update.status,
      reviewed_by: update.reviewed_by || existing[index].reviewed_by,
      reviewed_at: now,
      admin_notes: update.admin_notes ?? existing[index].admin_notes,
    };

    await saveFallbackStore(existing);
    return existing[index];
  },
};
