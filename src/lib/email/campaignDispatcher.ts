import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { Resend } from 'resend';
import { NotificationHelper } from '@/src/lib/supabase/notifications';

const FROM_ADDRESS = 'SVI Infra <noreply@sviiinfrasolutions.com>';

export interface CampaignSendResult {
  success: boolean;
  campaignId: string;
  total: number;
  sent: number;
  failed: number;
  error?: string;
}

interface RecipientItem {
  email: string;
  name: string;
}

async function resolveRecipients(campaign: {
  recipient_group: string;
  custom_emails?: string[] | null;
}): Promise<RecipientItem[]> {
  if (campaign.recipient_group === 'custom') {
    return (campaign.custom_emails || []).map((e: string) => ({
      email: e.trim(),
      name: e.trim(),
    }));
  }

  if (campaign.recipient_group === 'lottery_participants') {
    const { data } = await supabaseAdmin
      .from('lottery_participants')
      .select('name, email')
      .not('email', 'is', null);
    return (data || [])
      .filter((p: { email?: string | null }) => Boolean(p.email))
      .map((p: { email: string; name?: string | null }) => ({
        email: p.email.trim(),
        name: p.name?.trim() || p.email.trim(),
      }));
  }

  // all_users
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('full_name, email')
    .not('email', 'is', null);
  return (data || [])
    .filter((p: { email?: string | null }) => Boolean(p.email))
    .map((p: { email: string; full_name?: string | null }) => ({
      email: p.email.trim(),
      name: p.full_name?.trim() || p.email.trim(),
    }));
}

async function sendBatched(
  recipients: RecipientItem[],
  subject: string,
  html: string,
  resend: Resend,
  scheduledAt?: string | null
): Promise<number> {
  const BATCH = 10;
  let sent = 0;
  const isFutureSchedule = Boolean(scheduledAt && new Date(scheduledAt).getTime() > Date.now());

  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (r) => {
        try {
          const payload: {
            from: string;
            to: string[];
            subject: string;
            html: string;
            scheduledAt?: string;
          } = {
            from: FROM_ADDRESS,
            to: [r.email],
            subject,
            html,
          };

          if (isFutureSchedule && scheduledAt) {
            payload.scheduledAt = new Date(scheduledAt).toISOString();
          }

          const { data: emailData, error: sendErr } = await resend.emails.send(payload);
          if (sendErr || !emailData?.id) {
            console.error(
              `Failed to send/schedule campaign email to ${r.email}:`,
              sendErr?.message || 'no id returned'
            );
          } else {
            sent++;
          }
        } catch (err: unknown) {
          console.error(
            `Failed to send/schedule campaign email to ${r.email}:`,
            err instanceof Error ? err.message : String(err)
          );
        }
      })
    );
    if (i + BATCH < recipients.length) {
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, 400);
      await promise;
    }
  }
  return sent;
}

export async function executeCampaignSend(
  campaignId: string,
  adminUserId?: string | null,
  adminEmail?: string | null,
  isScheduling = false
): Promise<CampaignSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      campaignId,
      total: 0,
      sent: 0,
      failed: 0,
      error: 'Missing RESEND_API_KEY',
    };
  }

  // Fetch campaign
  const { data: campaign, error: fetchErr } = await supabaseAdmin
    .from('email_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (fetchErr || !campaign) {
    return {
      success: false,
      campaignId,
      total: 0,
      sent: 0,
      failed: 0,
      error: 'Campaign not found',
    };
  }

  if (campaign.status === 'sent') {
    return {
      success: true,
      campaignId,
      total: campaign.recipient_count || 0,
      sent: campaign.recipient_count || 0,
      failed: 0,
    };
  }

  if (campaign.status === 'cancelled') {
    return {
      success: false,
      campaignId,
      total: 0,
      sent: 0,
      failed: 0,
      error: 'Campaign is cancelled',
    };
  }

  const resend = new Resend(apiKey);
  const recipients = await resolveRecipients(campaign);

  if (recipients.length === 0) {
    await supabaseAdmin.from('email_campaigns').update({ status: 'draft' }).eq('id', campaignId);
    return {
      success: false,
      campaignId,
      total: 0,
      sent: 0,
      failed: 0,
      error: 'No valid recipients found for this campaign',
    };
  }
  const total = recipients.length;
  const isFutureSchedule =
    isScheduling &&
    Boolean(campaign.scheduled_at && new Date(campaign.scheduled_at).getTime() > Date.now());

  const sent = await sendBatched(
    recipients,
    campaign.subject,
    campaign.body_html,
    resend,
    isFutureSchedule ? campaign.scheduled_at : null
  );

  const failed = Math.max(0, total - sent);
  const now = new Date().toISOString();

  if (isFutureSchedule) {
    await supabaseAdmin
      .from('email_campaigns')
      .update({
        status: 'scheduled',
        recipient_count: sent,
      })
      .eq('id', campaignId);
  } else {
    await supabaseAdmin
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: now,
        recipient_count: sent,
      })
      .eq('id', campaignId);
  }
  // Activity log (non-blocking)
  try {
    await supabaseAdmin.from('activity_logs').insert({
      user_id: adminUserId || null,
      action_type: 'campaign_sent',
      description: `Campaign "${campaign.title}" dispatched to ${sent}/${total} recipients.`,
      metadata: { campaignId, totalRecipients: total, sentCount: sent, failedCount: failed },
    });
  } catch {
    // Non-blocking
  }

  // Archive in email_messages
  try {
    await supabaseAdmin.from('email_messages').insert({
      resend_id: `camp-${campaignId}-${Date.now()}`,
      subject: campaign.subject || campaign.title,
      from_email: FROM_ADDRESS,
      to_emails: [campaign.recipient_group || 'All Campaign Recipients'],
      status: 'sent',
      last_event: failed > 0 ? 'partially_delivered' : 'delivered',
      sent_at: now,
      created_at: now,
      metadata: {
        html: campaign.body_html,
        title: campaign.title,
        recipient_count: sent,
        total_planned: total,
        failed_count: failed,
        source: 'email_campaigns',
      },
    });
  } catch {
    // Non-blocking
  }

  // Notification (non-blocking)
  try {
    const sender = adminEmail || 'System Auto-Scheduler';
    await NotificationHelper.campaignSent(campaign.title, sent, sender);
  } catch {
    // Non-blocking
  }

  return {
    success: true,
    campaignId,
    total,
    sent,
    failed,
  };
}

/**
 * Checks and auto-dispatches any scheduled campaigns whose send time has arrived or passed.
 */
export async function dispatchDueCampaigns(
  adminUserId?: string | null,
  adminEmail?: string | null
): Promise<CampaignSendResult[]> {
  const nowIso = new Date().toISOString();
  const { data: due, error } = await supabaseAdmin
    .from('email_campaigns')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', nowIso);

  if (error || !due || due.length === 0) {
    return [];
  }

  const results: CampaignSendResult[] = [];
  for (const item of due) {
    const res = await executeCampaignSend(item.id, adminUserId, adminEmail);
    results.push(res);
  }
  return results;
}
