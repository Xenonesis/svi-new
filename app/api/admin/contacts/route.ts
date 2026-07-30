import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import type { Contact } from '@/src/components/admin/email/types';

const VALID_ROLES = ['admin', 'employee', 'client'] as const;
type DbRole = (typeof VALID_ROLES)[number];

function isDbRole(value: string | null): value is DbRole {
  return value !== null && VALID_ROLES.includes(value as DbRole);
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  real_email: string | null;
  role: string | null;
}

/**
 * GET /api/admin/contacts
 *
 * Returns all profiles that have a verified real_email.
 * Only accessible by authenticated admins.
 * Optional ?search= query param for server-side filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, real_email, role')
      .not('real_email', 'is', null)
      .neq('real_email', '')
      .order('full_name');

    if (search) {
      const pattern = `%${search}%`;
      query = query.or(
        `full_name.ilike.${pattern},email.ilike.${pattern},real_email.ilike.${pattern}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('[CONTACTS] Query error:', error);
      throw AppError.internal('Failed to fetch contacts');
    }

    const contacts: Contact[] = (data || []).map((row: ProfileRow) => ({
      id: row.id,
      full_name: row.full_name || '',
      email: row.email || '',
      real_email: row.real_email || null,
      role: isDbRole(row.role) ? row.role : 'client',
    }));

    return NextResponse.json({ contacts });
  } catch (err) {
    return handleApiError(err);
  }
}
