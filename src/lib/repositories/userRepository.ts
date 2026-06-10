import { supabaseAdmin } from '@/src/lib/supabase/admin';
import type { PostgrestError } from '@supabase/supabase-js';

/** Minimal profile shape used across the app */
export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  real_email?: string | null;
  photo_url?: string | null;
  role?: string;
  created_at?: string;
};

export const userRepository = {
  /**
   * Fetch a single profile by ID.
   */
  async getById(id: string): Promise<{ data: Profile | null; error: PostgrestError | null }> {
    return supabaseAdmin.from('profiles').select('*').eq('id', id).single();
  },

  /**
   * Fetch profiles by a list of IDs.
   */
  async getByIds(ids: string[]): Promise<{ data: Profile[] | null; error: PostgrestError | null }> {
    return supabaseAdmin.from('profiles').select('*').in('id', ids);
  },

  /**
   * Paginated list with optional search.
   */
  async list(
    opts: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{
    data: Profile[] | null;
    count: number | null;
    error: PostgrestError | null;
  }> {
    const { page = 1, limit = 50, search = '' } = opts;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    return query;
  },

  /**
   * Update a profile's fields.
   */
  async update(
    id: string,
    updates: Partial<Profile>
  ): Promise<{
    data: Profile | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('profiles').update(updates).eq('id', id).select().single();
  },

  /**
   * Get admin name for activity logs / notifications.
   */
  async getAdminName(id: string): Promise<string> {
    const { data } = await supabaseAdmin.from('profiles').select('full_name').eq('id', id).single();
    return data?.full_name || 'Admin';
  },

  /**
   * Get advisor profiles for registration form dropdown.
   */
  async getAdvisors(advisorIds: string[]): Promise<string[]> {
    if (advisorIds.length === 0) return [];
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .in('id', advisorIds);

    return (profiles || []).map((p) => p.full_name).sort((a, b) => a.localeCompare(b));
  },
};
