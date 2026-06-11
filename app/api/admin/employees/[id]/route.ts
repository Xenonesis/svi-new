import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = params;

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
