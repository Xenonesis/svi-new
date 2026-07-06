import { supabaseAdmin } from '@/src/lib/supabase/admin';
import type { PostgrestError } from '@supabase/supabase-js';

export type Career = {
  id: string;
  title: string;
  type: string;
  salary: string;
  description?: string | null;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export const careerRepository = {
  /**
   * List all active careers (public-facing).
   */
  async listActive(): Promise<{
    data: Career[] | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin
      .from('careers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
  },

  /**
   * List all careers (admin).
   */
  async listAll(): Promise<{
    data: Career[] | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('careers').select('*').order('sort_order', { ascending: true });
  },

  /**
   * Get a single career by ID.
   */
  async getById(id: string): Promise<{
    data: Career | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('careers').select('*').eq('id', id).single();
  },

  /**
   * Create a new career listing.
   */
  async create(data: Partial<Career>): Promise<{
    data: Career | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('careers').insert(data).select().single();
  },

  /**
   * Update an existing career listing.
   */
  async update(
    id: string,
    updates: Partial<Career>
  ): Promise<{
    data: Career | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin
      .from('careers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete a career listing.
   */
  async delete(id: string): Promise<{
    data: Career[] | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await supabaseAdmin.from('careers').delete().eq('id', id).select();
    return { data, error };
  },
};
