import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { isPhoneMatching, normalizePhoneNumber } from '@/src/lib/utils/sviEmailGenerator';

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

    if (body.is_active === false && id === admin.id) {
      throw AppError.badRequest('Cannot deactivate your own account.');
    }

    const allowedFields = [
      'full_name',
      'phone',
      'property_interest',
      'notes',
      'real_email',
      'role',
      'is_active',
    ];
    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key !== 'role' && key !== 'is_active' && !body[key]) {
          throw AppError.badRequest(`${key.replace('_', ' ')} cannot be empty`);
        }
        if (key === 'is_active') {
          updates[key] = Boolean(body[key]);
        } else {
          updates[key] = body[key];
        }
      }
    }
    if (updates.real_email) {
      const cleanRealEmail = updates.real_email.trim().toLowerCase();
      const { data: existingRealEmail } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .neq('id', id)
        .or(`real_email.eq.${cleanRealEmail},email.eq.${cleanRealEmail}`)
        .maybeSingle();

      if (existingRealEmail) {
        throw AppError.badRequest(
          `An account with the Real Email "${cleanRealEmail}" already exists (${existingRealEmail.full_name || 'User'}).`
        );
      }
    }

    if (updates.phone) {
      const cleanPhone = updates.phone.trim();
      const { digits, last10 } = normalizePhoneNumber(cleanPhone);
      if (digits.length >= 10) {
        const { data: existingPhoneList } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, phone')
          .neq('id', id)
          .ilike('phone', `%${last10}%`);

        if (existingPhoneList && existingPhoneList.length > 0) {
          const match = existingPhoneList.find(
            (p) => p.phone && isPhoneMatching(p.phone, cleanPhone)
          );
          if (match) {
            throw AppError.badRequest(
              `An account with the Phone Number "${cleanPhone}" already exists (${match.full_name || 'User'}).`
            );
          }
        }
      }
    }

    let { data: updated, error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    // Graceful fallback if is_active column does not exist on profiles yet
    if (updateErr && /is_active.*schema cache|does not exist/i.test(updateErr.message)) {
      const { is_active: _omitted, ...fallbackUpdates } = updates;
      if (Object.keys(fallbackUpdates).length > 0) {
        const retryRes = await supabaseAdmin
          .from('profiles')
          .update(fallbackUpdates)
          .eq('id', id)
          .select()
          .single();
        updated = retryRes.data;
        updateErr = retryRes.error;
      } else {
        const fetchRes = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
        updated = fetchRes.data;
        updateErr = fetchRes.error;
      }
    }

    if (updateErr) throw AppError.internal(updateErr.message);

    // Sync active/deactivated state with Supabase Auth ban and portal_settings
    if (body.is_active !== undefined) {
      const isActive = Boolean(body.is_active);
      try {
        await supabaseAdmin.auth.admin.updateUserById(id, {
          ban_duration: isActive ? 'none' : '876000h',
          user_metadata: { is_active: isActive },
        });

        const { data: currentSetting } = await supabaseAdmin
          .from('portal_settings')
          .select('value')
          .eq('key', 'deactivated_user_ids')
          .maybeSingle();

        const currentIds = new Set<string>(
          Array.isArray(currentSetting?.value?.ids) ? currentSetting.value.ids : []
        );

        if (isActive) {
          currentIds.delete(id);
        } else {
          currentIds.add(id);
        }

        await supabaseAdmin.from('portal_settings').upsert({
          key: 'deactivated_user_ids',
          value: { ids: Array.from(currentIds) },
          updated_at: new Date().toISOString(),
        });
      } catch (syncErr) {
        console.warn('Failed to sync auth ban or portal_settings for user active state:', syncErr);
      }

      if (updated) {
        updated.is_active = isActive;
      }
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
