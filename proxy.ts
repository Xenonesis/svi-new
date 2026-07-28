import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Set CSRF cookie for registration page
  // The pathname check covers both default-locale and prefixed paths
  if (url.pathname.endsWith('/registration')) {
    const existing = request.cookies.get('csrf')?.value;
    if (!existing) {
      const token = randomBytes(24).toString('hex');
      const response = NextResponse.next();
      response.cookies.set('csrf', token, {
        httpOnly: false,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
      return response;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|attendance|employee|share|opengraph-image|.*\\..*).*)'],
};
