import { NextRequest, NextResponse } from 'next/server';
import { issueCaptchaToken, CAPTCHA_COOKIE, CAPTCHA_COOKIE_MAX_AGE } from '@/src/lib/captcha';

export const runtime = 'nodejs';

// GET /api/registration/captcha — issue a server-signed math challenge.
// The answer never touches the client; only { a, b } is returned for display.
export async function GET(request: NextRequest) {
  try {
    const { token, challenge } = await issueCaptchaToken();
    const res = NextResponse.json(challenge);
    res.cookies.set(CAPTCHA_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      path: '/',
      maxAge: CAPTCHA_COOKIE_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error('[captcha] Failed to issue challenge:', err);
    return NextResponse.json({ error: 'Failed to load captcha' }, { status: 500 });
  }
}
