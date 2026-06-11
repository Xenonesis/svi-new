import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'employee')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) throw AppError.internal(error.message);

    return NextResponse.json({
      employees: data,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json();
    const { email, password, full_name, phone, notes } = body;

    if (!email || !password || !full_name) {
      throw AppError.badRequest('Name, Email, and Password are required');
    }

    // Embed the password into notes for admin reference since it is requested
    // Format: [CREDENTIAL_PASS: password]
    let updatedNotes = notes || '';
    updatedNotes += updatedNotes ? `\n\n` : '';
    updatedNotes += `[EMP_PASS: ${password}]`;

    // 1. Create the auth user via admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw AppError.badRequest(authError.message);

    const newUserId = authData.user.id;

    // 2. Insert profile row
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,
        email,
        full_name,
        phone: phone || null,
        notes: updatedNotes,
        role: 'employee',
        created_by: admin.id,
      })
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw AppError.internal(profileError.message);
    }

    return NextResponse.json({ employee: profile }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
