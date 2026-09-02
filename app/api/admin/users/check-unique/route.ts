import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import {
  generateSviEmail,
  slugifyName,
  normalizePhoneNumber,
  isPhoneMatching,
} from '@/src/lib/utils/sviEmailGenerator';

// GET /api/admin/users/check-unique — validate uniqueness of SVI email, real email, and phone
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const fullName = searchParams.get('full_name')?.trim() || '';
    const email = searchParams.get('email')?.trim().toLowerCase() || '';
    const realEmail = searchParams.get('real_email')?.trim().toLowerCase() || '';
    const phone = searchParams.get('phone')?.trim() || '';
    const excludeId = searchParams.get('exclude_id')?.trim() || '';

    let suggestedSviEmail: string | null = null;
    let emailAvailable = true;
    let emailError: string | null = null;
    let realEmailAvailable = true;
    let realEmailError: string | null = null;
    let phoneAvailable = true;
    let phoneError: string | null = null;

    // 1. Suggest unique SVI corporate email if full_name is provided
    if (fullName) {
      const slug = slugifyName(fullName);
      if (slug) {
        let query = supabaseAdmin
          .from('profiles')
          .select('email, real_email')
          .or(`email.ilike.${slug}%@sviinfra.com,real_email.ilike.${slug}%@sviinfra.com`);

        if (excludeId) {
          query = query.neq('id', excludeId);
        }

        const { data: matchedProfiles } = await query;
        const existingEmails: string[] = [];
        if (matchedProfiles) {
          for (const p of matchedProfiles) {
            if (p.email) existingEmails.push(p.email.toLowerCase());
            if (p.real_email) existingEmails.push(p.real_email.toLowerCase());
          }
        }

        suggestedSviEmail = generateSviEmail(fullName, existingEmails);
      }
    }

    // 2. Check SVI Email uniqueness if provided
    if (email) {
      let query = supabaseAdmin
        .from('profiles')
        .select('id, full_name, role')
        .or(`email.eq.${email},real_email.eq.${email}`);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data: existingEmail } = await query.maybeSingle();
      if (existingEmail) {
        emailAvailable = false;
        emailError = `An account with SVI email "${email}" already exists (${existingEmail.full_name || 'User'}).`;
      }
    }

    // 3. Check Real Email uniqueness if provided
    if (realEmail) {
      let query = supabaseAdmin
        .from('profiles')
        .select('id, full_name, role')
        .or(`real_email.eq.${realEmail},email.eq.${realEmail}`);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data: existingRealEmail } = await query.maybeSingle();
      if (existingRealEmail) {
        realEmailAvailable = false;
        realEmailError = `An account with real email "${realEmail}" already exists (${existingRealEmail.full_name || 'User'}).`;
      }
    }

    // 4. Check Phone uniqueness if provided
    if (phone) {
      const { digits, last10 } = normalizePhoneNumber(phone);
      if (digits.length >= 10) {
        let query = supabaseAdmin.from('profiles').select('id, full_name, phone');

        if (excludeId) {
          query = query.neq('id', excludeId);
        }

        // Fast filter by last 10 digits
        query = query.ilike('phone', `%${last10}%`);

        const { data: existingPhoneList } = await query;
        if (existingPhoneList && existingPhoneList.length > 0) {
          const match = existingPhoneList.find((p) => p.phone && isPhoneMatching(p.phone, phone));
          if (match) {
            phoneAvailable = false;
            phoneError = `An account with phone number "${phone}" already exists (${match.full_name || 'User'}).`;
          }
        }
      }
    }

    return NextResponse.json({
      suggested_svi_email: suggestedSviEmail,
      email_available: emailAvailable,
      email_error: emailError,
      real_email_available: realEmailAvailable,
      real_email_error: realEmailError,
      phone_available: phoneAvailable,
      phone_error: phoneError,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
