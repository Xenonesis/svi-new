import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { createClient } from '@/src/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Verifies the caller is an authenticated admin user.
 * Checks Authorization Bearer header first, then falls back to SSR cookies.
 * Validates with Supabase Auth, then checks the user's role in profiles.
 *
 * Returns the User object if admin, null otherwise.
 */
export async function verifyAdmin(request: NextRequest): Promise<User | null> {
  let user: User | null = null;

  // 1. Try Bearer token from header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token && token !== 'null' && token !== 'undefined') {
      const {
        data: { user: tokenUser },
        error,
      } = await supabaseAdmin.auth.getUser(token);
      if (!error && tokenUser) {
        user = tokenUser;
      }
    }
  }

  // 2. Fallback to SSR session cookies
  if (!user) {
    try {
      const supabase = await createClient();
      const {
        data: { user: cookieUser },
        error,
      } = await supabase.auth.getUser();
      if (!error && cookieUser) {
        user = cookieUser;
      }
    } catch {
      // ignore cookie reading errors
    }
  }

  if (!user) return null;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('verifyAdmin DB error:', profileError);
    return null;
  }

  return profile?.role === 'admin' ? user : null;
}
