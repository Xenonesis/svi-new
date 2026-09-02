import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { isPhoneMatching, normalizePhoneNumber } from '@/src/lib/utils/sviEmailGenerator';
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

    const employees = data || [];
    const employeeIds = employees.map((e) => e.id);

    const statsMap: Record<
      string,
      {
        totalLeads: number;
        activeLeads: number;
        wonLeads: number;
        presentDays: number;
        totalDays: number;
        attendanceRate: number;
      }
    > = {};

    if (employeeIds.length > 0) {
      const [leadsRes, attRes] = await Promise.all([
        supabaseAdmin
          .from('chat_leads')
          .select('assigned_to, lifecycle_status')
          .in('assigned_to', employeeIds),
        supabaseAdmin
          .from('attendance_records')
          .select('user_id, status')
          .in('user_id', employeeIds),
      ]);

      const leads = leadsRes.data || [];
      const attendance = attRes.data || [];

      employeeIds.forEach((id) => {
        const empLeads = leads.filter((l) => l.assigned_to === id);
        const totalLeads = empLeads.length;
        const wonLeads = empLeads.filter((l) => l.lifecycle_status === 'won').length;
        const activeLeads = empLeads.filter(
          (l) => l.lifecycle_status !== 'won' && l.lifecycle_status !== 'lost'
        ).length;

        const empAtt = attendance.filter((a) => a.user_id === id);
        const totalDays = empAtt.length;
        const presentDays = empAtt.filter((a) => a.status === 'present').length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

        statsMap[id] = {
          totalLeads,
          activeLeads,
          wonLeads,
          presentDays,
          totalDays,
          attendanceRate,
        };
      });
    }

    const employeesWithStats = employees.map((emp) => ({
      ...emp,
      stats: statsMap[emp.id] || {
        totalLeads: 0,
        activeLeads: 0,
        wonLeads: 0,
        presentDays: 0,
        totalDays: 0,
        attendanceRate: 100,
      },
    }));

    return NextResponse.json({
      employees: employeesWithStats,
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
    const department = body.department?.trim();
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
    const realEmail = body.real_email?.trim().toLowerCase() || null;

    // 1. Pre-check SVI Email uniqueness in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role')
      .or(`email.eq.${email},real_email.eq.${email}`)
      .maybeSingle();

    if (existingProfile) {
      throw AppError.badRequest(
        `An account with the email "${email}" already exists in the system (${existingProfile.full_name || 'User'}, role: ${existingProfile.role || 'user'}).`
      );
    }

    // 2. Pre-check Real Email uniqueness in profiles
    if (realEmail) {
      const { data: existingRealEmailProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, real_email, role')
        .or(`real_email.eq.${realEmail},email.eq.${realEmail}`)
        .maybeSingle();

      if (existingRealEmailProfile) {
        throw AppError.badRequest(
          `An account with the Real Email "${realEmail}" already exists in the system (${existingRealEmailProfile.full_name || 'User'}).`
        );
      }
    }

    // 3. Pre-check Phone Number uniqueness in profiles
    if (phone) {
      const { digits, last10 } = normalizePhoneNumber(phone);
      if (digits.length >= 10) {
        const { data: existingPhoneList } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, phone, role')
          .ilike('phone', `%${last10}%`);

        if (existingPhoneList && existingPhoneList.length > 0) {
          const match = existingPhoneList.find((p) => p.phone && isPhoneMatching(p.phone, phone));
          if (match) {
            throw AppError.badRequest(
              `An account with the Phone Number "${phone}" already exists (${match.full_name || 'User'}, role: ${match.role || 'employee'}).`
            );
          }
        }
      }
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
    const insertPayload: Record<string, any> = {
      id: newUserId,
      email,
      real_email: realEmail,
      full_name: fullName,
      phone: phone || null,
      department: department || null,
      notes: notes || null,
      created_by: admin.id,
    };

    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(insertPayload)
      .select()
      .single();

    // Graceful fallback if department column is not yet in Supabase schema cache
    if (profileError && /department.*schema cache/i.test(profileError.message)) {
      delete insertPayload.department;
      const retryRes = await supabaseAdmin.from('profiles').insert(insertPayload).select().single();
      profile = retryRes.data;
      profileError = retryRes.error;
    }
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
