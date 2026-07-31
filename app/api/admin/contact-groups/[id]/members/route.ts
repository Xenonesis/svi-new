import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import type { ContactGroupMember } from '@/src/components/admin/email/types';

/**
 * GET /api/admin/contact-groups/[id]/members
 * Returns members of a group.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('contact_group_members')
      .select('*')
      .eq('group_id', id)
      .order('added_at');

    if (error) throw AppError.internal('Failed to fetch members');

    const members: ContactGroupMember[] = (data || []).map((m: any) => ({
      id: m.id,
      group_id: m.group_id,
      contact_email: m.contact_email,
      added_at: m.added_at,
    }));

    return NextResponse.json({ members });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/admin/contact-groups/[id]/members
 * Add one or more members to a group.
 * Body: { emails: string[] }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    const body = await request.json();
    const emails: string[] = body.emails || [];

    if (!Array.isArray(emails) || emails.length === 0) {
      throw AppError.badRequest('At least one email is required');
    }

    const rows = emails.map((email) => ({
      group_id: id,
      contact_email: email.trim().toLowerCase(),
    }));

    const { data, error } = await supabaseAdmin
      .from('contact_group_members')
      .upsert(rows, { onConflict: 'group_id,contact_email', ignoreDuplicates: false })
      .select();

    if (error) throw AppError.internal('Failed to add members');

    return NextResponse.json({ members: data }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/admin/contact-groups/[id]/members
 * Remove members from a group.
 * Body: { emails: string[] }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    const body = await request.json();
    const emails: string[] = body.emails || [];

    if (!Array.isArray(emails) || emails.length === 0) {
      throw AppError.badRequest('At least one email is required');
    }

    const { error } = await supabaseAdmin
      .from('contact_group_members')
      .delete()
      .eq('group_id', id)
      .in('contact_email', emails);

    if (error) throw AppError.internal('Failed to remove members');

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
