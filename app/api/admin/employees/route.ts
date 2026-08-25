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

    let body: Record<string, any>;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body in request.');
    }

    const fullName = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const phone = body.phone?.trim();
    const notes = body.notes?.trim();

    if (!fullName) {
      throw AppError.badRequest('Full Name is required.');
    }
    if (!email) {
      throw AppError.badRequest('Email Address is required.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw AppError.badRequest(
        `The Email Address "${email}" is invalid. Please check for typos (e.g. .com).`
      );
    }
    if (!password) {
      throw AppError.badRequest('Password is required.');
    }
    if (password.length < 8) {
      throw AppError.badRequest('Password must be at least 8 characters long.');
    }
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        throw AppError.badRequest('Phone Number must contain at least 10 valid digits.');
      }
    }

    // Pre-check if profile already exists with this Email
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      throw AppError.badRequest(
        `An account with the email "${email}" already exists in the system (${existingProfile.full_name || 'User'}, role: ${existingProfile.role || 'user'}).`
      );
    }

    // 1. Create the auth user via admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      const rawMsg = authError.message || '';
      if (
        /already registered|already exists|email address has already been registered/i.test(rawMsg)
      ) {
        throw AppError.badRequest(
          `An account with the email "${email}" has already been registered in authentication.`
        );
      }
      if (/password/i.test(rawMsg)) {
        throw AppError.badRequest(`Password does not meet security requirements: ${rawMsg}`);
      }
      if (/validate email|invalid email/i.test(rawMsg)) {
        throw AppError.badRequest(
          `The email address "${email}" is invalid. Please verify the domain and formatting.`
        );
      }
      throw AppError.badRequest(rawMsg || 'Failed to create employee account in authentication.');
    }

    const newUserId = authData.user.id;

    // 2. Insert profile row
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,
        email,
        full_name: fullName,
        phone: phone || null,
        notes: notes || null,
        role: 'employee',
        created_by: admin.id,
      })
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      if (
        profileError.code === '23505' ||
        /duplicate key|unique constraint/i.test(profileError.message)
      ) {
        if (/phone/i.test(profileError.message)) {
          throw AppError.badRequest(`An employee with the phone number "${phone}" already exists.`);
        }
        if (/email/i.test(profileError.message)) {
          throw AppError.badRequest(`An employee with the email "${email}" already exists.`);
        }
        throw AppError.badRequest('An employee with these unique details already exists.');
      }
      throw AppError.internal(`Failed to save employee profile: ${profileError.message}`);
    }
    return NextResponse.json({ employee: profile }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
