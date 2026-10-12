import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { emailCampaignSchema } from '@/src/lib/api/schemas';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { dispatchDueCampaigns, executeCampaignSend } from '@/src/lib/email/campaignDispatcher';
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

  // Auto-dispatch any scheduled campaigns whose send time has arrived
  try {
    await dispatchDueCampaigns(admin.id, admin.email);
  } catch (dispatchErr) {
    console.error('Error auto-dispatching due campaigns:', dispatchErr);
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status'); // optional filter
  let query = supabaseAdmin
    .from('email_campaigns')
    .select(
      'id, title, subject, recipient_group, custom_emails, status, scheduled_at, reminder_at, reminder_sent_at, sent_at, recipient_count, created_at, created_by, lottery_id, lotteries:lotteries(title)'
    )
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const [campaignsResult, allUsersCountResult, lotteryCountResult] = await Promise.all([
    query,
    supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .not('email', 'is', null),
    supabaseAdmin
      .from('lottery_participants')
      .select('id', { count: 'exact', head: true })
      .not('email', 'is', null),
  ]);

  if (campaignsResult.error) {
    return NextResponse.json({ error: campaignsResult.error.message }, { status: 500 });
  }

  const allUsersCount = allUsersCountResult.count ?? 0;
  const lotteryCount = lotteryCountResult.count ?? 0;

  interface DbCampaignRecord {
    id: string;
    title: string;
    subject: string;
    recipient_group: 'all_users' | 'lottery_participants' | 'custom';
    custom_emails?: string[] | null;
    status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
    scheduled_at: string | null;
    reminder_at: string | null;
    reminder_sent_at: string | null;
    sent_at: string | null;
    recipient_count: number;
    created_at: string;
    created_by: string;
    lottery_id: string | null;
    lotteries?: { title?: string | null } | null;
  }

  // Flatten lottery relation and calculate delivery statistics
  const campaigns = ((campaignsResult.data as unknown as DbCampaignRecord[]) || []).map((c) => {
    const targetCount =
      c.recipient_group === 'custom'
        ? (c.custom_emails?.length ?? 0)
        : c.recipient_group === 'lottery_participants'
          ? lotteryCount
          : allUsersCount;

    const successfulCount = c.status === 'sent' ? (c.recipient_count ?? 0) : 0;
    const attemptedCount = c.status === 'sent' ? Math.max(targetCount, successfulCount) : 0;
    const failedCount = c.status === 'sent' ? Math.max(0, attemptedCount - successfulCount) : 0;

    return {
      ...c,
      lottery_title: c.lotteries?.title ?? null,
      lotteries: undefined,
      target_count: targetCount,
      attempted_count: attemptedCount,
      successful_count: successfulCount,
      failed_count: failedCount,
    };
  });

  return NextResponse.json({ campaigns });
}

/**
 * POST /api/admin/campaigns
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body: any;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON');
    }

    const parsed = emailCampaignSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validationError(
        parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }))
      );
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
    } = parsed.data;

    if (recipient_group === 'custom' && (!custom_emails || custom_emails.length === 0)) {
      throw AppError.badRequest('Custom recipient group requires at least one email address');
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log
    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'campaign_created',
        description: `Campaign "${title}" created (${status}).`,
        metadata: { campaignId: campaign.id, status },
      });
    } catch (_err) {
      // Audit logging is non-critical; silently ignore failures
    }

    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', admin.id)
        .single();
      const adminName = profile?.full_name || admin.email || 'Admin';
      await NotificationHelper.campaignCreated(title, adminName);
    } catch (notifErr) {
      console.error('Failed to create campaign creation notification:', notifErr);
    }

    if (scheduled_at) {
      try {
        await executeCampaignSend(campaign.id, admin.id, admin.email, true);
      } catch (scheduleErr) {
        console.error('Error pre-queueing campaign with Resend:', scheduleErr);
      }
    }

    return NextResponse.json({ campaign });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
