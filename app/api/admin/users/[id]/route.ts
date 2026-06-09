import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// DELETE /api/admin/users/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    if (id === admin.id) throw AppError.badRequest('Cannot delete your own account');

    // Get user info before deletion for notification
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', id)
      .single();

    // Delete from auth (cascades via DB trigger to profiles table)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw AppError.internal(error.message);

    // Create notification for all admins about user deletion
    if (userProfile) {
      try {
        await NotificationHelper.userDeleted(userProfile.full_name);
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH /api/admin/users/[id] — update profile fields
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }
    const allowedFields = [
      'full_name',
      'phone',
      'property_interest',
      'notes',
      'real_email',
      'role',
    ];
    const updates: Record<string, string> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key !== 'role' && !body[key]) {
          throw AppError.badRequest(`${key.replace('_', ' ')} cannot be empty`);
        }
        updates[key] = body[key];
      }
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw AppError.internal(updateErr.message);

    return NextResponse.json({ user: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
