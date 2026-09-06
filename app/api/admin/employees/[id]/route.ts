import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { isPhoneMatching, normalizePhoneNumber } from '@/src/lib/utils/sviEmailGenerator';
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

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
      ]);
    } catch (cleanupErr) {
      console.warn('Non-blocking relation cleanup warning during employee delete:', cleanupErr);
    }

    // 2. Delete from auth (if user exists in auth)
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError && !authError.message?.toLowerCase().includes('not found')) {
        console.warn('Auth admin delete employee warning:', authError.message);
      }
    } catch (authErr) {
      console.warn('Auth delete error ignored if user not in auth:', authErr);
    }

    // 3. Delete profile record
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', id);
    if (profileError) {
      console.error('Failed to delete employee profile:', profileError);
      throw AppError.internal(profileError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    let body: Record<string, any>;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { password, full_name, phone, department, notes } = body;
    // If new password provided, update Supabase Auth User credentials
    if (password) {
      if (typeof password !== 'string' || password.length < 8) {
        throw AppError.badRequest('Password must be at least 8 characters long.');
      }
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        password,
      });
      if (authError) throw AppError.internal(authError.message);
    }

    // Update profile metadata if provided
    const updateData: Record<string, any> = {};
    if (full_name !== undefined) updateData.full_name = full_name.trim();
    if (phone !== undefined) {
      const cleanPhone = phone?.trim() || null;
      if (cleanPhone) {
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
      updateData.phone = cleanPhone;
    }
    if (body.real_email !== undefined) {
      const cleanRealEmail = body.real_email?.trim().toLowerCase() || null;
      if (cleanRealEmail) {
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
      updateData.real_email = cleanRealEmail;
    }
    if (department !== undefined) updateData.department = department?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (body.is_active !== undefined) {
      if (body.is_active === false && id === admin.id) {
        throw AppError.badRequest('Cannot deactivate your own account.');
      }
      updateData.is_active = Boolean(body.is_active);
    }
    if (Object.keys(updateData).length > 0) {
      let { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', id);
      // Graceful fallback if department column is not yet in Supabase schema cache
      if (profileError && /department.*schema cache/i.test(profileError.message)) {
        const { department: _omitted, ...fallbackData } = updateData;
        if (Object.keys(fallbackData).length > 0) {
          const fallbackRes = await supabaseAdmin
            .from('profiles')
            .update(fallbackData)
            .eq('id', id);
          profileError = fallbackRes.error;
        } else {
          profileError = null;
        }
      }

      if (profileError) throw AppError.internal(profileError.message);
    }

    return NextResponse.json({ success: true, message: 'Employee updated successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}
