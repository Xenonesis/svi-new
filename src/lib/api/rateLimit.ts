import { type NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Extract identifier from request (default: IP from headers) */
  keyFn?: (req: NextRequest) => string;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Distributed rate limiter backed by the `increment_rate_limit` Postgres RPC.
 *
 * State lives in Supabase (table `rate_limits`), so limits hold across all
 * Vercel serverless instances — an in-memory Map resets per isolate and is
 * ineffective on Vercel.
 *
 * Fails OPEN on Supabase errors: availability over strictness.
 *
 * Usage:
 *   export async function POST(req: NextRequest) {
 *     const limited = await rateLimit(req, { limit: 10, windowSeconds: 60 });
 *     if (limited) return limited; // 429 response
 *     // ... handle request
 *   }
 */
/**
 * Universal distributed rate limiter check backed by `increment_rate_limit` RPC.
 * Usable across NextRequest route handlers and Server Actions alike.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('increment_rate_limit', {
      p_key: key.slice(0, 200),
      p_window_seconds: windowSeconds,
      p_max_count: limit,
    });
    if (error) throw error;

    const result = data as { allowed: boolean; retry_after: number } | null;
    return {
      allowed: result ? result.allowed : true,
      retryAfter: Math.max(1, result?.retry_after || windowSeconds),
    };
  } catch (err) {
    console.error(
      '[checkRateLimit] Supabase check failed, failing open for availability:',
      err instanceof Error ? err.message : err
    );
    return { allowed: true, retryAfter: 0 };
  }
}

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const { limit, windowSeconds, keyFn = getClientIp } = options;
  const key = `${keyFn(req)}:${req.nextUrl.pathname}`.slice(0, 200);

  const { allowed, retryAfter } = await checkRateLimit(key, limit, windowSeconds);
  if (allowed) return null;

  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      retryAfter,
    },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    }
  );
}
