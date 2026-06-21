import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from '@/src/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1. Supabase session refresh (admin routes only) ───────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const user = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (user.error || !user.data?.user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Session is valid — continue
    return supabaseResponse;
  }

  // ─── 2. i18n locale routing (public pages only) ────────────────────
  if (!pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
    return intlMiddleware(request);
  }

  // ─── 3. Everything else (API, static files) — pass through ──────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|images|favicons|manifest\\.json|opengraph-image|robots\\.txt|.*\\..*).*)',
  ],
};
