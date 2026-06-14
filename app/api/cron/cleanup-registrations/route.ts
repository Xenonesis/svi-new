import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

// GET /api/cron/cleanup-registrations
// Called by Vercel Cron Jobs (see vercel.json or GitHub Actions)
// Deletes non-important registrations older than 30 days
export async function GET(request: NextRequest) {
  try {
    // Simple auth check — cron secret header
    const authHeader = request.headers.get('Authorization');
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error, count } = await supabaseAdmin
      .from('registrations')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .or('is_important.eq.false,is_important.is.null')
      .select('id');

    if (error) {
      console.error('[Cron Cleanup] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deleted: data?.length || 0,
      message: `Cleaned up ${data?.length || 0} old registrations`,
    });
  } catch (err) {
    console.error('[Cron Cleanup] Exception:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
