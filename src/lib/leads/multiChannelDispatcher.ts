import { resolveChannelAvailability } from './channelAvailability';
import type { HotLeadNotificationSettings } from './hotLeadNotificationTypes';
import { supabaseAdmin } from '../supabase/admin';

export interface HotLeadDispatchPayload {
  leadId: string;
  customerPhone: string;
  customerName?: string;
  summary: string;
  intentScore: number;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  keyQuote?: string;
  keyQuoteStartSec?: number;
  keyQuoteEndSec?: number;
  settings: HotLeadNotificationSettings;
}

export interface ChannelDispatchOutcome {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

export interface MultiChannelDispatchResult {
  email: ChannelDispatchOutcome;
  in_app: ChannelDispatchOutcome;
  telegram: ChannelDispatchOutcome;
  whatsapp: ChannelDispatchOutcome;
  customer_warmup: ChannelDispatchOutcome;
  sla_tracked: boolean;
}

export interface SlaBreachPayload {
  leadId: string;
  customerPhone: string;
  slaThresholdMinutes: number;
  escalationTarget?: string;
  settings?: HotLeadNotificationSettings;
}

export async function dispatchTelegramAlert(
  token: string,
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function dispatchSlaBreachEscalation(payload: SlaBreachPayload): Promise<boolean> {
  const { leadId, customerPhone, slaThresholdMinutes, escalationTarget, settings } = payload;
  const title = `🚨 SLA BREACH: Lead ${customerPhone}`;
  const message = `Lead was not contacted within ${slaThresholdMinutes} minutes. Urgent escalation to ${escalationTarget || 'Director'}.`;

  const tasks: Promise<unknown>[] = [];

  tasks.push(
    (async () => {
      await supabaseAdmin.from('notifications').insert({
        title,
        message,
        type: 'sla_breach',
        data: {
          lead_id: leadId,
          phone: customerPhone,
          audio_chime: true,
        },
      });
    })()
  );

  if (settings && settings.channels.telegram) {
    const token = settings.telegram_config.bot_token || process.env.TELEGRAM_BOT_TOKEN || '';
    const chatId = settings.telegram_config.target_chat_id || process.env.TELEGRAM_CHAT_ID || '';
    if (token && chatId) {
      const tgText = `🚨 *SLA BREACH ESCALATION*\n\n*Phone:* ${customerPhone}\n*Breached Threshold:* ${slaThresholdMinutes} minutes\n*Escalation:* ${escalationTarget || 'Director'}\n\n[Open Lead](https://sviinfrasolutions.com/admin/leads?id=${leadId})`;
      tasks.push(dispatchTelegramAlert(token, chatId, tgText));
    }
  }

  const settled = await Promise.allSettled(tasks);
  return settled.some((s) => s.status === 'fulfilled');
}

export async function dispatchMultiChannelHotLead(
  payload: HotLeadDispatchPayload
): Promise<MultiChannelDispatchResult> {
  const { settings, customerPhone, customerName, summary, intentScore, leadId } = payload;

  const results: MultiChannelDispatchResult = {
    email: { success: false, skipped: true },
    in_app: { success: false, skipped: true },
    telegram: { success: false, skipped: true },
    whatsapp: { success: false, skipped: true },
    customer_warmup: { success: false, skipped: true },
    sla_tracked: false,
  };

  if (!settings.enabled) {
    return results;
  }

  const availability = resolveChannelAvailability(settings);
  const tasks: Promise<void>[] = [];

  if (settings.channels.in_app && availability.in_app.available) {
    tasks.push(
      (async () => {
        try {
          const { error } = await supabaseAdmin.from('notifications').insert({
            title: `VIP Hot Lead: ${customerName || customerPhone}`,
            message: `${summary} (Intent: ${intentScore}/100)`,
            type: 'hot_lead',
            data: {
              lead_id: leadId,
              phone: customerPhone,
              intent_score: intentScore,
              audio_chime: true,
            },
          });
          results.in_app = { success: !error, skipped: false, error: error?.message };
        } catch (err: unknown) {
          results.in_app = {
            success: false,
            skipped: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })()
    );
  }

  if (settings.channels.telegram && availability.telegram.available) {
    tasks.push(
      (async () => {
        try {
          const token = settings.telegram_config.bot_token || process.env.TELEGRAM_BOT_TOKEN || '';
          const chatId =
            settings.telegram_config.target_chat_id || process.env.TELEGRAM_CHAT_ID || '';
          if (!token || !chatId) {
            results.telegram = {
              success: false,
              skipped: false,
              error: 'Missing Telegram token or chat ID',
            };
            return;
          }
          const quoteSection = payload.keyQuote ? `\n*Key Quote:* "${payload.keyQuote}"` : '';
          const message = `🔥 *VIP HOT LEAD ALERT*\n\n*Customer:* ${customerName || 'Prospect'} (${customerPhone})\n*Intent Score:* ${intentScore}/100\n*Summary:* ${summary}${quoteSection}\n\n[Open Lead in CRM](https://sviinfrasolutions.com/admin/leads?id=${leadId})`;
          const ok = await dispatchTelegramAlert(token, chatId, message);
          results.telegram = {
            success: ok,
            skipped: false,
            error: ok ? undefined : 'Telegram dispatch failed',
          };
        } catch (err: unknown) {
          results.telegram = {
            success: false,
            skipped: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })()
    );
  }

  if (settings.channels.email && availability.email.available) {
    tasks.push(
      (async () => {
        try {
          const resendApiKey = process.env.RESEND_API_KEY;
          const recipients = (settings.recipients || []).filter(
            (r) => r.email && r.email.includes('@')
          );
          if (!resendApiKey || recipients.length === 0) {
            results.email = {
              success: false,
              skipped: false,
              error: 'Missing Resend API key or recipients',
            };
            return;
          }
          const subject = `🔥 [VIP HOT LEAD] ${customerName ? `${customerName} - ` : ''}${customerPhone}`;
          const html = `<div style="font-family: sans-serif; background: #080b11; color: #f1f5f9; padding: 24px; border-radius: 8px;">
<h2 style="color: #d4af37; margin-top: 0;">🔥 VIP Hot Lead Alert</h2>
<p><strong>Customer:</strong> ${customerName || 'Prospect'} (${customerPhone})</p>
<p><strong>Intent Score:</strong> ${intentScore}/100</p>
<p><strong>Summary:</strong> ${summary}</p>
<p><a href="https://sviinfrasolutions.com/admin/leads?id=${leadId}" style="display: inline-block; background: #d4af37; color: #080b11; padding: 10px 18px; text-decoration: none; font-weight: bold; border-radius: 4px;">Open Lead in CRM</a></p>
</div>`;
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(8000),
            body: JSON.stringify({
              from: 'SVI Infra VIP Radar <noreply@sviinfrasolutions.com>',
              to: recipients.map((r) => r.email),
              subject,
              html,
            }),
          });
        } catch (err: unknown) {
          results.email = {
            success: false,
            skipped: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })()
    );
  }

  if (settings.channels.whatsapp && availability.whatsapp.available) {
    tasks.push(
      (async () => {
        try {
          const webhookUrl = settings.whatsapp_config.webhook_url;
          if (webhookUrl) {
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(8000),
              body: JSON.stringify({
                type: 'vip_hot_lead',
                leadId,
                customerPhone,
                customerName,
                summary,
                intentScore,
              }),
            });
            results.whatsapp = { success: res.ok, skipped: false };
          } else {
            results.whatsapp = { success: true, skipped: false };
          }
        } catch (err: unknown) {
          results.whatsapp = {
            success: false,
            skipped: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })()
    );
  }

  if (settings.channels.customer_warmup && availability.customer_warmup.available) {
    tasks.push(
      (async () => {
        try {
          const template = settings.customer_warmup_config.greeting_template;
          const greeting = template.replace('{{customer_name}}', customerName || 'Valued Customer');
          const webhookUrl = settings.whatsapp_config.webhook_url;
          if (webhookUrl) {
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(8000),
              body: JSON.stringify({
                type: 'customer_warmup',
                customerPhone,
                message: greeting,
                brochureUrl: settings.customer_warmup_config.brochure_pdf_url,
              }),
            });
            results.customer_warmup = { success: res.ok, skipped: false };
          } else {
            results.customer_warmup = { success: true, skipped: false };
          }
        } catch (err: unknown) {
          results.customer_warmup = {
            success: false,
            skipped: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })()
    );
  }

  const slaMinutes = settings.sla_config.sla_threshold_minutes || 15;
  const expiresAt = new Date(Date.now() + slaMinutes * 60 * 1000).toISOString();

  tasks.push(
    (async () => {
      try {
        const { error } = await supabaseAdmin.from('lead_sla_tracking').insert({
          lead_id: leadId,
          customer_phone: customerPhone,
          assigned_advisor_id: payload.assignedAdvisorId || null,
          assigned_advisor_name: payload.assignedAdvisorName || null,
          sla_threshold_minutes: slaMinutes,
          sla_expires_at: expiresAt,
          status: 'pending_contact',
        });
        results.sla_tracked = !error;
      } catch {
        results.sla_tracked = false;
      }
    })()
  );

  await Promise.allSettled(tasks);
  return results;
}
