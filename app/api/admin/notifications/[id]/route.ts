import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// PATCH /api/admin/notifications/:id - Mark notification as read
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    const { data: notification } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!notification) throw AppError.notFound('Notification not found');
    if (notification.user_id && notification.user_id !== admin.id) throw AppError.forbidden();

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw AppError.internal('Failed to update notification');

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/admin/notifications/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    const { data: notification } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!notification) throw AppError.notFound('Notification not found');
    if (notification.user_id && notification.user_id !== admin.id) throw AppError.forbidden();

    const { error } = await supabaseAdmin.from('notifications').delete().eq('id', id);
    if (error) throw AppError.internal('Failed to delete notification');

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
