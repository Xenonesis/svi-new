import { NextRequest, NextResponse } from 'next/server';

import type { CreateUserPayload } from '@/src/lib/supabase/types';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { isPhoneMatching, normalizePhoneNumber } from '@/src/lib/utils/sviEmailGenerator';

// GET /api/admin/users — list client users with pagination and search
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
      .select('id, email, full_name, phone, property_interest, role, created_at, real_email', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) throw AppError.internal(error.message);

    // Check portal_settings for deactivated accounts fallback
    let deactivatedIds = new Set<string>();
    try {
      const { data: deactivatedSetting } = await supabaseAdmin
        .from('portal_settings')
        .select('value')
        .eq('key', 'deactivated_user_ids')
        .maybeSingle();
      if (Array.isArray(deactivatedSetting?.value?.ids)) {
        deactivatedIds = new Set(deactivatedSetting.value.ids as string[]);
      }
    } catch {
      // Fallback gracefully if portal_settings not present or in test mock
    }

    const enrichedUsers = (data || []).map((u: Record<string, unknown>) => ({
      ...u,
      is_active: u.is_active !== undefined ? u.is_active : !deactivatedIds.has(String(u.id)),
    }));

    return NextResponse.json({
      users: enrichedUsers,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/admin/users — create a new client user
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body: CreateUserPayload;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body in request.');
    }

    const fullName = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const realEmail = body.real_email?.trim().toLowerCase();
    const password = body.password;
    const phone = body.phone?.trim();
    const propertyInterest = body.property_interest?.trim();
    const notes = body.notes?.trim();

    if (!fullName) {
      throw AppError.badRequest('Full Name is required.');
    }
    if (!email) {
      throw AppError.badRequest('SVI Email Address is required.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw AppError.badRequest(
        `The SVI Email Address "${email}" is invalid. Please check for typos (e.g. .com).`
      );
    }
    if (!realEmail) {
      throw AppError.badRequest('Real Email Address is required.');
    }
    if (!emailRegex.test(realEmail)) {
      throw AppError.badRequest(
        `The Real Email Address "${realEmail}" is invalid. Please check for typos (e.g. .com).`
      );
    }
    if (!password) {
      throw AppError.badRequest('Password is required.');
    }
    if (password.length < 8) {
      throw AppError.badRequest('Password must be at least 8 characters long.');
    }
    if (!phone) {
      throw AppError.badRequest('Phone Number is required.');
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      throw AppError.badRequest('Phone Number must contain at least 10 valid digits.');
    }
    if (!propertyInterest) {
      throw AppError.badRequest('Please select at least one Property Interest.');
    }
    if (!notes) {
      throw AppError.badRequest('Internal Notes are required.');
    }

    // 1. Pre-check SVI Email uniqueness in profiles
    const { data: existingEmailProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role')
      .or(`email.eq.${email},real_email.eq.${email}`)
      .maybeSingle();

    if (existingEmailProfile) {
      throw AppError.badRequest(
        `An account with the SVI Email "${email}" already exists (${existingEmailProfile.full_name || 'User'}, role: ${existingEmailProfile.role || 'client'}).`
      );
    }

    // 2. Pre-check Real Email uniqueness in profiles
    const { data: existingRealEmailProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, real_email, role')
      .or(`real_email.eq.${realEmail},email.eq.${realEmail}`)
      .maybeSingle();

    if (existingRealEmailProfile) {
      throw AppError.badRequest(
        `An account with the Real Email "${realEmail}" already exists (${existingRealEmailProfile.full_name || 'User'}, role: ${existingRealEmailProfile.role || 'client'}).`
      );
    }

    // 3. Pre-check Phone Number uniqueness in profiles
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
            `An account with the Phone Number "${phone}" already exists (${match.full_name || 'User'}, role: ${match.role || 'client'}).`
          );
        }
      }
    }
    // 1. Create the auth user via admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so they can log in immediately
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
      throw AppError.badRequest(rawMsg || 'Failed to create user account in authentication.');
    }

    const newUserId = authData.user.id;

    // 2. Insert profile row
    const insertPayload = {
      id: newUserId,
      email,
      full_name: fullName,
      phone: phone || null,
      property_interest: propertyInterest || null,
      notes: notes || null,
      role: 'client' as const,
      created_by: admin.id,
      real_email: realEmail || null,
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(insertPayload)
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      if (
        profileError.code === '23505' ||
        /duplicate key|unique constraint/i.test(profileError.message)
      ) {
        if (/phone/i.test(profileError.message)) {
          throw AppError.badRequest(`A user with the phone number "${phone}" already exists.`);
        }
        if (/email/i.test(profileError.message)) {
          throw AppError.badRequest(`A user with the email "${email}" already exists.`);
        }
        throw AppError.badRequest('A user with these unique details already exists.');
      }
      throw AppError.internal(`Failed to save user profile: ${profileError.message}`);
    }

    // 3. Send automated notification to client's real email address if enabled in settings
    if (realEmail) {
      try {
        let isSharingEnabled = true;
        const { data: sharingSetting } = await supabaseAdmin
          .from('portal_settings')
          .select('value')
          .eq('key', 'global_email_sharing')
          .single();
        if (sharingSetting?.value) {
          isSharingEnabled = sharingSetting.value.enabled !== false;
        }

        if (isSharingEnabled) {
          const resendApiKey = process.env.RESEND_API_KEY;
          if (resendApiKey) {
            const { Resend } = await import('resend');
            const resend = new Resend(resendApiKey);
            const { data: emailData, error: sendErr } = await resend.emails.send({
              from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
              to: realEmail,
              subject: 'Your SVI Infra Portal Account is Ready',
              html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; rounded-corners: 10px;">
                <h2 style="color: #d4af37; font-family: serif;">Welcome to SVI Infra Solutions</h2>
                <p>Hello <strong>${fullName}</strong>,</p>
                <p>Your authorized client portal account has been successfully created. You can now log in using the details below:</p>
                <div style="background-color: #f9f9f9; color: #333333; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>SVI Email Address:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Password:</strong> <em>(The password set by your system administrator)</em></p>
                </div>
                <p>Please log in to your SVI Client Portal to access your allotment details, payment history, and documents.</p>
                <br>
                <hr style="border: none; border-top: 1px solid #eaeaea;" />
                <p style="font-size: 11px; color: #888;">This is an automated administrative notification. Please contact SVI Support for help.</p>
              </div>
            `,
            });
            if (sendErr || !emailData?.id) {
              console.error(
                'Failed to dispatch welcome email to client real email address:',
                sendErr?.message ?? 'no message id returned'
              );
            }
          }
        }
      } catch (emailErr) {
        console.error('Failed to dispatch welcome email to client real email address:', emailErr);
      }
    }

    // Create notification for all admins about new user registration
    try {
      await NotificationHelper.userRegistered(fullName, newUserId);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    return NextResponse.json({ user: profile }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
