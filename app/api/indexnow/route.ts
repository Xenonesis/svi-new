import { NextRequest, NextResponse } from 'next/server';
import { triggerIndexNow, INDEXNOW_KEY } from '@/src/lib/indexnow';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

export async function POST(request: NextRequest) {
  try {
    // Verify caller is admin or has internal CRON_SECRET authorization
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isAuthorizedSecret = Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;

    if (!isAuthorizedSecret) {
      const admin = await verifyAdmin(request);
      if (!admin) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin authentication required to trigger IndexNow' },
          { status: 401 }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const urls = Array.isArray(body.urls) && body.urls.length > 0 ? body.urls : undefined;

    const result = await triggerIndexNow(urls);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'IndexNow submission failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(INDEXNOW_KEY, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
