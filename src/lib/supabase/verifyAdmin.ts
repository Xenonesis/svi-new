import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import type { User } from '@supabase/supabase-js';

/**
 * Verifies the caller is an authenticated admin user.
 * Extracts Bearer token from Authorization header,
 * validates it with Supabase Auth, then checks the user's role.
 *
 * Returns the User object if admin, null otherwise.
 */
export async function verifyAdmin(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin' ? user : null;
}
