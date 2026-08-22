import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

// POST /api/csrf-refresh — issue a fresh CSRF token.
// Used by the registration form when its cookie expired mid-session,
// so a long-open form can recover instead of failing with a bare 403.
export async function POST(request: NextRequest) {
  const token = randomBytes(24).toString('hex');
  const res = NextResponse.json({ token });
  res.cookies.set('csrf', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return res;
}
