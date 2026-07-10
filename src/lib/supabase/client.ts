import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Browser/client-side Supabase client with cookie-based auth for SSR compatibility

// Utility to clear corrupted Supabase cookies that cause base64url-decode errors
if (typeof document !== 'undefined') {
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=').map((c) => c.trim());
      if (name.startsWith('sb-') && name.includes('-auth-token')) {
        // Quick validation: chunked cookies should be valid base64url
        if (value && value.length > 0 && !/^[A-Za-z0-9_-]+$/.test(value)) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
