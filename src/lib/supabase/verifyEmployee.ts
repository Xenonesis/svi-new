import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { createClient } from '@/src/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface EmployeeProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string | null;
  phone?: string | null;
}

export interface VerifiedEmployee {
  user: User;
  profile: EmployeeProfile;
}

/**
 * Verifies the caller is an authenticated employee or admin.
 * Supports both Authorization Bearer tokens (for mobile/Capacitor apps)
 * and Supabase SSR session cookies (for web browser clients).
 */
export async function verifyEmployee(request: NextRequest): Promise<VerifiedEmployee | null> {
  let user: User | null = null;

  // 1. Try Authorization header first (Mobile Capacitor app)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      }
    }
  }

  // 2. Fallback to SSR cookies (Web browser)
  if (!user) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    } catch {
      // Ignored if cookies cannot be parsed
    }
  }

  if (!user) return null;

  // 3. Verify user profile and role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (profileError || !profile || profile.is_active === false) {
    return null;
  }

  // Allow 'employee' and 'admin' roles
  if (profile.role !== 'employee' && profile.role !== 'admin') {
    return null;
  }

  return {
    user,
    profile: {
      id: profile.id,
      email: profile.email || user.email || '',
      full_name: profile.full_name || 'Employee',
      role: profile.role,
      department: profile.department || null,
      phone: profile.phone || null,
    },
  };
}
