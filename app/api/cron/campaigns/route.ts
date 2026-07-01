import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError } from '@/src/lib/api/errors';
import { Resend } from 'resend';
import * as Sentry from '@sentry/nextjs';

const FROM_ADDRESS = 'SVI Infra <noreply@sviiinfrasolutions.com>';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY');
  return new Resend(key);
}

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
  return (data || []).map((p: any) => ({ email: p.email, name: p.full_name || p.email }));
}

async function sendBatched(
  recipients: { email: string; name: string }[],
  subject: string,
  html: string
): Promise<number> {
  const resend = getResend();
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
          console.error(`Campaign email failed for ${r.email}:`, err.message);
        }
      })
    );
    if (i + BATCH < recipients.length) await new Promise((res) => setTimeout(res, 400));
  }
  return sent;
}

export async function GET(request: NextRequest) {
  return Sentry.withMonitor('campaign-cron', async () => {
    const secret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    if (!secret || authHeader !== `Bearer ${secret}`) {
      throw AppError.unauthorized();
    }

    const now = new Date();
    const results: string[] = [];

    try {
      // ── 1. SEND MAIN CAMPAIGN EMAILS ─────────────────────────────────────────────
      const { data: dueCampaigns } = await supabaseAdmin
        .from('email_campaigns')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_at', now.toISOString());

      for (const campaign of dueCampaigns || []) {
        results.push(`[Campaign ${campaign.id}] Sending main email: "${campaign.title}"...`);
        try {
          const recipients = await resolveRecipients(campaign);
          const sent = await sendBatched(recipients, campaign.subject, campaign.body_html);
          await supabaseAdmin
            .from('email_campaigns')
            .update({ status: 'sent', sent_at: now.toISOString(), recipient_count: sent })
            .eq('id', campaign.id);
          results.push(`  → Sent to ${sent} recipients.`);
          try {
            await supabaseAdmin.from('activity_logs').insert({
              user_id: null,
              action_type: 'campaign_sent',
              description: `Campaign "${campaign.title}" automatically sent to ${sent} recipients.`,
              metadata: { campaignId: campaign.id, recipientCount: sent },
            });
          } catch {
            // Activity log failure is non-blocking
          }
        } catch (err: any) {
          results.push(`  → Error: ${err.message}`);
        }
      }

      // ── 2. SEND REMINDER EMAILS ───────────────────────────────────────────────────
      const { data: reminderCampaigns } = await supabaseAdmin
        .from('email_campaigns')
        .select('*')
        .eq('status', 'sent')
        .not('reminder_at', 'is', null)
        .is('reminder_sent_at', null)
        .lte('reminder_at', now.toISOString());

      for (const campaign of reminderCampaigns || []) {
        results.push(`[Campaign ${campaign.id}] Sending reminder email: "${campaign.title}"...`);
        try {
          const recipients = await resolveRecipients(campaign);
          const reminderSubject = campaign.reminder_subject || `Reminder: ${campaign.subject}`;
          const sent = await sendBatched(recipients, reminderSubject, campaign.body_html);
          await supabaseAdmin
            .from('email_campaigns')
            .update({ reminder_sent_at: now.toISOString() })
            .eq('id', campaign.id);
          results.push(`  → Reminder sent to ${sent} recipients.`);
        } catch (err: any) {
          results.push(`  → Reminder error: ${err.message}`);
        }
      }

      return NextResponse.json({
        ok: true,
        processedMain: (dueCampaigns || []).length,
        processedReminders: (reminderCampaigns || []).length,
        results,
      });
    } catch (err: any) {
      console.error('[CronCampaigns]', err);
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
  });
}
