import { supabaseAdmin } from '@/src/lib/supabase/admin';
import type { PostgrestError } from '@supabase/supabase-js';

export type Property = {
  id: string;
  name: string;
  slug?: string | null;
  active?: boolean;
  location?: string | null;
  type?: string | null;
  status?: string | null;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  gallery?: string[] | null;
  amenities?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectImage = {
  id: string;
  project_id?: string | null;
  image_url: string;
  alt_text?: string | null;
  sort_order?: number;
  created_at?: string;
};

export const propertyRepository = {
  /**
   * List active properties (public-facing, minimal fields).
   */
  async listActive(): Promise<{
    data: Property[] | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin
      .from('properties')
      .select('id, name, slug, active')
      .eq('active', true)
      .order('name', { ascending: true });
  },

  /**
   * List all properties (public). Returns basic info.
   */
  async listPublic(): Promise<{
    data: Property[] | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin
      .from('properties')
      .select('id, name, location, type, status, price, image_url, created_at')
      .order('created_at', { ascending: false });
  },

  /**
   * List all properties (admin). Includes all fields.
   */
  async listAll(): Promise<{
    data: Property[] | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('properties').select('*').order('created_at', { ascending: false });
  },

  /**
   * Get a single property by ID.
   */
  async getById(id: string): Promise<{
    data: Property | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('properties').select('*').eq('id', id).single();
  },

  /**
   * Create a new property.
   */
  async create(data: Partial<Property>): Promise<{
    data: Property | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('properties').insert(data).select().single();
  },

  /**
   * Update an existing property.
   */
  async update(
    id: string,
    updates: Partial<Property>
  ): Promise<{
    data: Property | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('properties').update(updates).eq('id', id).select().single();
  },

  /**
   * Delete a property.
   */
  async delete(id: string): Promise<{
    data: Property[] | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await supabaseAdmin.from('properties').delete().eq('id', id).select();
    return { data, error };
  },

  /**
   * Get project images.
   */
  async getProjectImages(projectId?: string): Promise<{
    data: ProjectImage[] | null;
    error: PostgrestError | null;
  }> {
    let query = supabaseAdmin
      .from('project_images')
      .select('*')
      .order('sort_order', { ascending: true });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    return query;
  },
};
