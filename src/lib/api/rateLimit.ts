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
export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const { limit, windowSeconds, keyFn = getClientIp } = options;
  const key = `${keyFn(req)}:${req.nextUrl.pathname}`.slice(0, 200);

  try {
    const { data, error } = await supabaseAdmin.rpc('increment_rate_limit', {
      p_key: key,
      p_window_seconds: windowSeconds,
      p_max_count: limit,
    });
    if (error) throw error;

    const result = data as { allowed: boolean; retry_after: number } | null;
    if (!result || result.allowed) return null;

    const retryAfter = Math.max(1, result.retry_after || windowSeconds);
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
  } catch (err) {
    console.error(
      '[rateLimit] Supabase check failed, allowing request:',
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
