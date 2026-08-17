import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Run intl middleware first so locale detection/redirect works
  const response = intlMiddleware(request);

  // Set CSRF cookie for registration page
  if (url.pathname.endsWith('/registration')) {
    const existing = request.cookies.get('csrf')?.value;
    if (!existing) {
      const token = randomBytes(24).toString('hex');
      response.cookies.set('csrf', token, {
        httpOnly: false,
        sameSite: 'lax',
        secure: request.nextUrl.protocol === 'https:',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|admin|attendance|employee|share|opengraph-image|@vite|.*\\..*).*)',
  ],
};
