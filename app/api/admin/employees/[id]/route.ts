import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    // Delete auth user first
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) throw AppError.internal(authError.message);

    // Profile will be cascade deleted if setup, but we'll manually delete just in case
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', id);
    if (profileError) throw AppError.internal(profileError.message);

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
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (department !== undefined) updateData.department = department?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', id);
      if (profileError) throw AppError.internal(profileError.message);
    }

    return NextResponse.json({ success: true, message: 'Employee updated successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}
