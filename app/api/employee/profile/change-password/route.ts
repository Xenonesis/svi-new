import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { createNotificationForAllAdmins } from '@/src/lib/supabase/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to change your password');
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      throw AppError.badRequest('Missing request payload');
    }

    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      throw AppError.badRequest('Current password is required');
    }

    if (!newPassword || typeof newPassword !== 'string') {
      throw AppError.badRequest('New password is required');
    }

    if (newPassword.length < 8) {
      throw AppError.badRequest('New password must be at least 8 characters long');
    }

    if (newPassword === currentPassword) {
      throw AppError.badRequest('New password must be different from current password');
    }

    if (newPassword !== confirmPassword) {
      throw AppError.badRequest('New password and confirmation password do not match');
    }

    // Verify current password against Supabase Auth using client authentication
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw AppError.internal('Authentication service configuration missing');
    }

    const authClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: verified.profile.email,
      password: currentPassword,
    });

    if (signInError || !signInData.user) {
      throw AppError.badRequest('Current password is incorrect');
    }

    // Update password securely via admin auth client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(verified.user.id, {
      password: newPassword,
    });

    if (updateError) {
      throw AppError.internal(updateError.message || 'Failed to update password');
    }

    // Notify all system administrators
    try {
      await createNotificationForAllAdmins({
        title: 'Staff Password Updated',
        message: `${verified.profile.full_name} (${verified.profile.email}) has successfully updated their workspace password.`,
        type: 'info',
        action_url: '/admin/employees',
        metadata: {
          employee_id: verified.user.id,
          employee_name: verified.profile.full_name,
          employee_email: verified.profile.email,
          event: 'employee_password_change',
          updated_at: new Date().toISOString(),
        },
      });
    } catch (notifErr) {
      console.error('Failed to notify administrators of password change:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. Admin has been notified.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
