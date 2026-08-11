import { type NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { compressResponse } from '@/src/lib/api/compression';

type RouteHandler = (
  req: NextRequest,
  context?: { user: NonNullable<Awaited<ReturnType<typeof verifyAdmin>>> }
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps an API route handler with admin authentication.
 * Returns 401 if the caller is not a verified admin.
 *
 * Usage:
 *   export const POST = withAdminAuth(async (req, { user }) => {
 *     // user is guaranteed to be an admin
 *     return NextResponse.json({ ok: true });
 *   });
 */
export function withAdminAuth(handler: RouteHandler) {
  return async (req: NextRequest, ctx?: unknown) => {
    const user = await verifyAdmin(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const res = await handler(req, { user });
    return compressResponse(res, req.headers);
  };
}
