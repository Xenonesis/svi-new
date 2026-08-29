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
      .maybeSingle();

    // 1. Gracefully clean up/nullify dependent relational records
    try {
      await Promise.allSettled([
        supabaseAdmin.from('tasks').delete().eq('user_id', id),
        supabaseAdmin.from('tasks').update({ assigned_by: null }).eq('assigned_by', id),
        supabaseAdmin.from('work_logs').delete().eq('user_id', id),
        supabaseAdmin.from('leave_requests').delete().eq('user_id', id),
        supabaseAdmin.from('leave_requests').update({ reviewed_by: null }).eq('reviewed_by', id),
        supabaseAdmin.from('attendance_regularizations').delete().eq('user_id', id),
        supabaseAdmin
          .from('attendance_regularizations')
          .update({ reviewed_by: null })
          .eq('reviewed_by', id),
        supabaseAdmin.from('salary_structures').delete().eq('user_id', id),
        supabaseAdmin.from('payroll_items').delete().eq('user_id', id),
        supabaseAdmin
          .from('monthly_payrolls')
          .update({ processed_by: null })
          .eq('processed_by', id),
        supabaseAdmin
          .from('chat_leads')
          .update({ lead_created_by: null })
          .eq('lead_created_by', id),
        supabaseAdmin.from('chat_leads').update({ assigned_to: null }).eq('assigned_to', id),
        supabaseAdmin
          .from('chat_lead_activities')
          .update({ employee_id: null })
          .eq('employee_id', id),
        supabaseAdmin.from('attendance_records').delete().eq('user_id', id),
        supabaseAdmin.from('attendance_logs').delete().eq('user_id', id),
        supabaseAdmin.from('team_members').delete().eq('user_id', id),
        supabaseAdmin.from('team_attendance').delete().eq('user_id', id),
        supabaseAdmin.from('employee_locations').delete().eq('admin_id', id),
        supabaseAdmin.from('allotments').delete().eq('user_id', id),
        supabaseAdmin.from('payment_milestones').delete().eq('user_id', id),
        supabaseAdmin.from('email_drafts').delete().eq('user_id', id),
        supabaseAdmin.from('email_stars').delete().eq('admin_id', id),
        supabaseAdmin.from('email_deletions').delete().eq('admin_id', id),
        supabaseAdmin.from('notifications').delete().eq('user_id', id),
      ]);
    } catch (cleanupErr) {
      console.warn('Non-blocking relation cleanup warning during user delete:', cleanupErr);
    }

    // 2. Delete from auth.users (if user exists in auth)
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError && !authError.message?.toLowerCase().includes('not found')) {
        console.warn('Auth admin delete user warning:', authError.message);
      }
    } catch (authErr) {
      console.warn('Auth delete error ignored if user not in auth:', authErr);
    }

    // 3. Explicitly delete from profiles table
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', id);

    if (profileError) {
      console.error('Failed to delete profile record:', profileError);
      throw AppError.internal(profileError.message);
    }

    // 4. Create notification for all admins about user deletion
    if (userProfile?.full_name) {
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
