import { NextRequest, NextResponse } from 'next/server';

import type { CreateUserPayload } from '@/src/lib/supabase/types';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

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
      .select('*', { count: 'exact' })
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
      users: data,
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
      throw AppError.badRequest('Invalid JSON body');
    }

    const { email, password, full_name, phone, property_interest, notes, real_email } = body;

    if (
      !email ||
      !password ||
      !full_name ||
      !real_email ||
      !phone ||
      !property_interest ||
      !notes
    ) {
      throw AppError.badRequest(
        'Name, SVI Email, Real Email, Password, Phone, Property Interest, and Notes are required'
      );
    }

    // 1. Create the auth user via admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so they can log in immediately
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
        property_interest: property_interest || null,
        notes: notes || null,
        role: 'client',
        created_by: admin.id,
        real_email: real_email || null,
      })
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw AppError.internal(profileError.message);
    }

    // 3. Send automated notification to client's real email address if enabled in settings
    if (real_email) {
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
            await resend.emails.send({
              from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
              to: real_email,
              subject: 'Your SVI Infra Portal Account is Ready',
              html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; rounded-corners: 10px;">
                <h2 style="color: #d4af37; font-family: serif;">Welcome to SVI Infra Solutions</h2>
                <p>Hello <strong>${full_name}</strong>,</p>
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
          }
        }
      } catch (emailErr) {
        console.error('Failed to dispatch welcome email to client real email address:', emailErr);
      }
    }

    // Create notification for all admins about new user registration
    try {
      await NotificationHelper.userRegistered(full_name, newUserId);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ user: profile }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
