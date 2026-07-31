import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

/**
 * DELETE /api/admin/contact-groups/[id]
 * Delete a contact group (and all its members via CASCADE).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    const { error } = await supabaseAdmin.from('contact_groups').delete().eq('id', id);

    if (error) throw AppError.internal('Failed to delete group');

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PATCH /api/admin/contact-groups/[id]
 * Update group name/description.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, string> = {};
    if (body.name) updates.name = body.name.trim();
    if (body.description !== undefined) updates.description = body.description.trim();

    if (Object.keys(updates).length === 0) {
      throw AppError.badRequest('No fields to update');
    }

    const { error } = await supabaseAdmin.from('contact_groups').update(updates).eq('id', id);

    if (error) {
      if (error.code === '23505') throw AppError.badRequest('Group name already exists');
      throw AppError.internal('Failed to update group');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
