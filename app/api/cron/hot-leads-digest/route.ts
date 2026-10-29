import { NextRequest, NextResponse } from 'next/server';
import { dispatchDailyDigest } from '@/src/lib/leads/hotLeadNotification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/hot-leads-digest
 * Automated daily digest dispatch worker.
 * Checks recipient schedules (or runs for all digest subscribers if ?force=true).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Check if called from internal authorized key
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    if (key !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized cron access' }, { status: 401 });
    }
  }

  try {
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    // Compute current time in Asia/Kolkata (IST)
    const now = new Date();
    const istTimeStr = now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }); // e.g. "19:30"

    const result = await dispatchDailyDigest(force ? undefined : { currentHourTime: istTimeStr });

    return NextResponse.json({
      success: true,
      istTime: istTimeStr,
      forced: force,
      dispatchedCount: result.dispatchedCount,
      leadCount: result.leadCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cron hot-leads-digest error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
