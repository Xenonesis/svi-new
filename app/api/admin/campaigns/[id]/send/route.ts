import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { Resend } from 'resend';
import { NotificationHelper } from '@/src/lib/supabase/notifications';

const FROM_ADDRESS = 'SVI Infra <noreply@sviiinfrasolutions.com>';

async function resolveRecipients(campaign: any): Promise<{ email: string; name: string }[]> {
  if (campaign.recipient_group === 'custom') {
    return (campaign.custom_emails || []).map((e: string) => ({ email: e, name: e }));
  }

  if (campaign.recipient_group === 'lottery_participants') {
    const { data } = await supabaseAdmin
      .from('lottery_participants')
      .select('name, email')
      .not('email', 'is', null);
    return (data || [])
      .filter((p: any) => p.email)
      .map((p: any) => ({ email: p.email, name: p.name }));
  }

  // all_users
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('full_name, email')
    .not('email', 'is', null);
  return (data || []).map((p: any) => ({ email: p.email, name: p.full_name }));
}

async function sendBatched(
  recipients: { email: string; name: string }[],
  subject: string,
  html: string,
  resend: Resend
) {
  const BATCH = 10;
  let sent = 0;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (r) => {
        try {
          await resend.emails.send({ from: FROM_ADDRESS, to: [r.email], subject, html });
          sent++;
        } catch (err: any) {
          console.error(`Failed to send to ${r.email}:`, err.message);
        }
      })
    );
    if (i + BATCH < recipients.length) await new Promise((res) => setTimeout(res, 400));
  }
  return sent;
}

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/campaigns/[id]/send
 * Send campaign immediately (ignores schedule)
 */
export async function POST(request: NextRequest, { params }: Params) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data: campaign, error: fetchErr } = await supabaseAdmin
    .from('email_campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !campaign)
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (campaign.status === 'sent')
    return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
  if (campaign.status === 'cancelled')
    return NextResponse.json({ error: 'Campaign is cancelled' }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
  const resend = new Resend(apiKey);

  const recipients = await resolveRecipients(campaign);
  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found for this campaign' }, { status: 400 });
  }

  const sent = await sendBatched(recipients, campaign.subject, campaign.body_html, resend);

  await supabaseAdmin
    .from('email_campaigns')
    .update({ status: 'sent', sent_at: new Date().toISOString(), recipient_count: sent })
    .eq('id', id);

  try {
    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'campaign_sent',
      description: `Campaign "${campaign.title}" sent to ${sent} recipients.`,
      metadata: { campaignId: id, recipientCount: sent },
    });
  } catch {
    // Activity logging is non-critical
  }

  try {
    await NotificationHelper.campaignSent(campaign.title, sent, admin.email || 'Admin');
  } catch (notifErr) {
    console.error('Failed to create campaign sent notification:', notifErr);
  }

  return NextResponse.json({ success: true, sent });
}
