import { NextRequest, NextResponse } from 'next/server';

import type { CreateUserPayload } from '@/src/lib/supabase/types';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

// GET /api/admin/users — list client users with pagination and search
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const search = searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    users: data,
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  });
}

// POST /api/admin/users — create a new client user
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateUserPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, password, full_name, phone, property_interest, notes } = body;

  if (!email || !password || !full_name) {
    return NextResponse.json(
      { error: 'email, password, and full_name are required' },
      { status: 400 }
    );
  }

  // 1. Create the auth user via admin API (bypasses email confirmation)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm so they can log in immediately
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const newUserId = authData.user.id;

  // 2. Insert profile row
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: newUserId,
      email,
      full_name,
      phone: phone || null,
      property_interest: property_interest || null,
      notes: notes || null,
      role: 'client',
      created_by: admin.id,
    })
    .select()
    .single();

  if (profileError) {
    // Rollback: delete the auth user we just created
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Create notification for all admins about new user registration
  try {
    await NotificationHelper.userRegistered(full_name, newUserId);
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
    // Don't fail the request if notification fails
  }

  return NextResponse.json({ user: profile }, { status: 201 });
}
