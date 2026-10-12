import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { executeCampaignSend } from '@/src/lib/email/campaignDispatcher';

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/campaigns/[id]/send
 * Send campaign immediately (ignores schedule)
 */
export async function POST(request: NextRequest, { params }: Params) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const result = await executeCampaignSend(id, admin.id, admin.email);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Failed to dispatch campaign' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    sent: result.sent,
    total: result.total,
    failed: result.failed,
  });
}
