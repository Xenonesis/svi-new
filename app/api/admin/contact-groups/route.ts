import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import type { ContactGroup } from '@/src/components/admin/email/types';

/**
 * GET /api/admin/contact-groups
 * Returns all contact groups with member counts.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { data, error } = await supabaseAdmin
      .from('contact_groups')
      .select('*, member_count:contact_group_members(count)')
      .order('name');

    if (error) throw AppError.internal('Failed to fetch groups');

    const groups: ContactGroup[] = (data || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description || '',
      created_by: g.created_by,
      created_at: g.created_at,
      updated_at: g.updated_at,
      member_count: g.member_count?.[0]?.count || 0,
    }));

    return NextResponse.json({ groups });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/admin/contact-groups
 * Create a new contact group.
 * Body: { name, description? }
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw AppError.badRequest('Group name is required');
    }

    const { data, error } = await supabaseAdmin
      .from('contact_groups')
      .insert({ name: name.trim(), description: description?.trim() || '' })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw AppError.badRequest('Group already exists');
      throw AppError.internal('Failed to create group');
    }

    return NextResponse.json({ group: data }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
