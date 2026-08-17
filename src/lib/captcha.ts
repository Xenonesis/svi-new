/**
 * Server-issued, stateless math captcha (edge-runtime safe, Web Crypto only).
 *
 * Flow:
 *  1. GET /api/registration/captcha → issueCaptcha() sets an httpOnly cookie
 *     containing a signed challenge token and returns { a, b } for display.
 *  2. User submits `captchaAnswer`; verifyCaptcha() re-signs the payload,
 *     checks signature + expiry, and compares the answer.
 *
 * Token format: v1.<issuedAtMs>.<a>.<b>.<hmacSha256Hex>
 */

const CAPTCHA_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getSecret(): string {
  const secret = process.env.CAPTCHA_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('CAPTCHA_SECRET (or SUPABASE_SERVICE_ROLE_KEY) not configured');
  return secret;
}

async function hmacHex(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Constant-time string comparison to avoid timing leaks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface CaptchaChallenge {
  a: number;
  b: number;
}

export async function issueCaptchaToken(): Promise<{ token: string; challenge: CaptchaChallenge }> {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const payload = `v1.${Date.now()}.${a}.${b}`;
  const sig = await hmacHex(payload);
  return { token: `${payload}.${sig}`, challenge: { a, b } };
}

/**
 * Verify a captcha token + user answer.
 * Returns true only if the token is authentic, unexpired, and the answer matches.
 */
export async function verifyCaptchaToken(
  token: string | undefined,
  answer: string
): Promise<boolean> {
  if (!token || !answer) return false;
  const parts = token.split('.');
  if (parts.length !== 5 || parts[0] !== 'v1') return false;
  const [, tsRaw, aRaw, bRaw, sig] = parts;

  const payload = `v1.${tsRaw}.${aRaw}.${bRaw}`;
  const expectedSig = await hmacHex(payload);
  if (!safeEqual(sig, expectedSig)) return false;

  const issuedAt = Number(tsRaw);
  const a = Number(aRaw);
  const b = Number(bRaw);
  if (!Number.isFinite(issuedAt) || !Number.isInteger(a) || !Number.isInteger(b)) return false;
  if (Date.now() - issuedAt > CAPTCHA_TTL_MS) return false;

  return parseInt(answer, 10) === a + b;
}

export const CAPTCHA_COOKIE = 'captcha_token';
export const CAPTCHA_COOKIE_MAX_AGE = CAPTCHA_TTL_MS / 1000;
