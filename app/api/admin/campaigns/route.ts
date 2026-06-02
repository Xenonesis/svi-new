import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

/**
 * DELETE /api/admin/campaigns?lottery_id=xxx
 * Delete all campaigns linked to a lottery
 */
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const lotteryId = new URL(request.url).searchParams.get('lottery_id');
  if (!lotteryId) {
    return NextResponse.json({ error: 'lottery_id query param required' }, { status: 400 });
  }

  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from('email_campaigns')
    .select('id')
    .eq('lottery_id', lotteryId);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const count = existing?.length ?? 0;

  if (count > 0) {
    const { error } = await supabaseAdmin
      .from('email_campaigns')
      .delete()
      .eq('lottery_id', lotteryId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: count });
}

/**
 * GET /api/admin/campaigns
 * List all campaigns, newest first
 */
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get('status'); // optional filter

  let query = supabaseAdmin
    .from('email_campaigns')
    .select(
      'id, title, subject, recipient_group, status, scheduled_at, reminder_at, reminder_sent_at, sent_at, recipient_count, created_at, created_by, lottery_id, lotteries:lotteries(title)'
    )
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten lottery relation
  const campaigns = (data || []).map((c: any) => ({
    ...c,
    lottery_title: c.lotteries?.title ?? null,
    lotteries: undefined,
  }));

  return NextResponse.json({ campaigns });
}

/**
 * POST /api/admin/campaigns
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    title,
    subject,
    body_html,
    recipient_group = 'all_users',
    custom_emails,
    scheduled_at,
    reminder_at,
    reminder_subject,
    lottery_id,
  } = body;

  if (!title || !subject || !body_html) {
    return NextResponse.json(
      { error: 'title, subject, and body_html are required' },
      { status: 400 }
    );
  }

  if (recipient_group === 'custom' && (!custom_emails || custom_emails.length === 0)) {
    return NextResponse.json(
      { error: 'custom_emails required when recipient_group is custom' },
      { status: 400 }
    );
  }

  const status = scheduled_at ? 'scheduled' : 'draft';

  const { data: campaign, error } = await supabaseAdmin
    .from('email_campaigns')
    .insert({
      title,
      subject,
      body_html,
      recipient_group,
      custom_emails: recipient_group === 'custom' ? custom_emails : null,
      status,
      scheduled_at: scheduled_at || null,
      reminder_at: reminder_at || null,
      reminder_subject: reminder_subject || null,
      created_by: admin.id,
      lottery_id: lottery_id || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log
  try {
    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'campaign_created',
      description: `Campaign "${title}" created (${status}).`,
      metadata: { campaignId: campaign.id, status },
    });
  } catch {
    // Audit logging is non-critical; silently ignore failures
  }

  return NextResponse.json({ campaign });
}
