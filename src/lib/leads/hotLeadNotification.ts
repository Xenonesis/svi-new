import { supabaseAdmin } from '@/src/lib/supabase/admin';
import type { CallIntelligence } from '@/src/lib/leads/callIntelligence';

export * from './hotLeadNotificationTypes';
import {
  SETTINGS_KEY,
  DEFAULT_HOT_LEAD_SETTINGS,
  type HotLeadNotificationSettings,
  type HotLeadRecipient,
  type NotificationDeliveryMode,
  type LeadInterestFilter,
} from './hotLeadNotificationTypes';

/**
 * Fetches current hot lead notification settings from portal_settings table.
 */
export async function getHotLeadNotificationSettings(): Promise<HotLeadNotificationSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return DEFAULT_HOT_LEAD_SETTINGS;
    }

    const val = data.value as Partial<HotLeadNotificationSettings>;
    const rawRecipients =
      Array.isArray(val.recipients) && val.recipients.length > 0
        ? val.recipients
        : DEFAULT_HOT_LEAD_SETTINGS.recipients;

    const normalizedRecipients: HotLeadRecipient[] = rawRecipients.map((r) => ({
      name: r.name || 'Team Member',
      email: String(r.email || '')
        .trim()
        .toLowerCase(),
      role: r.role || 'Member',
      phone: r.phone,
      telegram_chat_id: r.telegram_chat_id,
      delivery_mode: (['instant', 'daily_digest', 'both'].includes(r.delivery_mode as string)
        ? r.delivery_mode
        : 'both') as NotificationDeliveryMode,
      digest_time:
        typeof r.digest_time === 'string' && r.digest_time.trim() ? r.digest_time.trim() : '19:30',
      lead_tier: (['hot_only', 'hot_and_warm'].includes(r.lead_tier as string)
        ? r.lead_tier
        : 'hot_only') as LeadInterestFilter,
    }));

    return {
      enabled: typeof val.enabled === 'boolean' ? val.enabled : DEFAULT_HOT_LEAD_SETTINGS.enabled,
      channels: {
        email:
          typeof val.channels?.email === 'boolean'
            ? val.channels.email
            : DEFAULT_HOT_LEAD_SETTINGS.channels.email,
        in_app:
          typeof val.channels?.in_app === 'boolean'
            ? val.channels.in_app
            : DEFAULT_HOT_LEAD_SETTINGS.channels.in_app,
        telegram:
          typeof val.channels?.telegram === 'boolean'
            ? val.channels.telegram
            : DEFAULT_HOT_LEAD_SETTINGS.channels.telegram,
        whatsapp:
          typeof val.channels?.whatsapp === 'boolean'
            ? val.channels.whatsapp
            : DEFAULT_HOT_LEAD_SETTINGS.channels.whatsapp,
        customer_warmup:
          typeof val.channels?.customer_warmup === 'boolean'
            ? val.channels.customer_warmup
            : DEFAULT_HOT_LEAD_SETTINGS.channels.customer_warmup,
      },
      telegram_config: val.telegram_config || DEFAULT_HOT_LEAD_SETTINGS.telegram_config,
      whatsapp_config: val.whatsapp_config || DEFAULT_HOT_LEAD_SETTINGS.whatsapp_config,
      customer_warmup_config:
        val.customer_warmup_config || DEFAULT_HOT_LEAD_SETTINGS.customer_warmup_config,
      sla_config: val.sla_config || DEFAULT_HOT_LEAD_SETTINGS.sla_config,
      audio_snippet_config:
        val.audio_snippet_config || DEFAULT_HOT_LEAD_SETTINGS.audio_snippet_config,
      recipients: normalizedRecipients,
    };
  } catch (err) {
    console.warn('Failed to load hot lead notification settings, using defaults:', err);
    return DEFAULT_HOT_LEAD_SETTINGS;
  }
}

/**
 * Persists hot lead notification settings to portal_settings table.
 */
export async function updateHotLeadNotificationSettings(
  settings: HotLeadNotificationSettings
): Promise<void> {
  const { error } = await supabaseAdmin.from('portal_settings').upsert({
    key: SETTINGS_KEY,
    value: settings,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to save hot lead notification settings:', error);
    throw new Error(`Database error saving alert settings: ${error.message}`);
  }
}

/**
 * Builds Obsidian / Gold luxury branded HTML email for instant Hot Lead Alert.
 */
export function buildHotLeadAlertEmailHtml(params: {
  customerPhone: string;
  intelligence: CallIntelligence;
  duration?: number;
  callRecordId?: string;
}): { html: string; text: string } {
  const { customerPhone, intelligence, duration = 0, callRecordId } = params;
  const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `Namaste Sir/Ma'am, SVI Infra Solutions se baat kar rahe hain. Aapne Khatu Shyam Ji / Shivani Vatika township ke baare me inquiry ki thi. Kya hum aapki visit schedule kar dein?`
  )}`;
  const crmUrl = callRecordId
    ? `https://sviiinfrasolutions.com/admin/leads?tab=ivr&callId=${callRecordId}`
    : `https://sviiinfrasolutions.com/admin/leads?tab=ivr&search=${cleanPhone}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>VIP Hot Lead Alert - SVI Infra Solutions</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #080b11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #080b11; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #111622; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Gold Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #d4af37 0%, #f0d080 50%, #d4af37 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #d4af37;">
                      ⚡ High-Speed Voice AI Radar
                    </div>
                    <div style="font-size: 24px; font-weight: 800; color: #ffffff; margin-top: 6px; letter-spacing: -0.5px;">
                      🔥 Instant VIP Hot Lead Alert
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; letter-spacing: 1px;">
                      ACTION REQUIRED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead Core Dossier Card -->
          <tr>
            <td style="padding: 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px;">
                <tr>
                  <td width="50%" valign="top" style="padding-bottom: 14px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px;">Customer Contact</span>
                    <div style="font-size: 18px; font-weight: 800; color: #f8fafc; margin-top: 4px; font-family: monospace;">
                      +91 ${customerPhone}
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding-bottom: 14px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px;">Primary Intent</span>
                    <div style="font-size: 15px; font-weight: 700; color: #38bdf8; margin-top: 4px;">
                      ${intelligence.intent}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" valign="top">
                    <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px;">Estimated Budget</span>
                    <div style="font-size: 15px; font-weight: 700; color: #d4af37; margin-top: 4px;">
                      ${intelligence.budget || 'Open / Quotation Requested'}
                    </div>
                  </td>
                  <td width="50%" valign="top">
                    <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px;">Property Requirement</span>
                    <div style="font-size: 14px; font-weight: 600; color: #e2e8f0; margin-top: 4px;">
                      ${intelligence.property_interest || 'Plots near Khatu Shyam / Ring Road'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hinglish Summary & Action Plan -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; margin-bottom: 8px;">
                📝 AI Call Synopsis (Hinglish)
              </div>
              <div style="background-color: #0c1018; border-left: 3px solid #d4af37; padding: 14px 18px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #e2e8f0;">
                "${intelligence.summary}"
              </div>

              <!-- Recommended Action -->
              <div style="margin-top: 16px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 14px 18px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8;">
                  🎯 Recommended Telecaller SOP Action
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #f0f9ff; margin-top: 4px; line-height: 1.5;">
                  ${intelligence.recommended_action}
                </div>
              </div>
            </td>
          </tr>

          <!-- Direct 1-Click Action Buttons -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" align="center">
                    <a href="tel:+91${cleanPhone}" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #d4af37 0%, #b38f2a 100%); color: #080b11; text-align: center; padding: 13px 18px; border-radius: 10px; font-size: 14px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
                      📞 Call Client Now
                    </a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" align="center">
                    <a href="${waUrl}" style="display: block; width: 100%; box-sizing: border-box; background: #25d366; color: #ffffff; text-align: center; padding: 13px 18px; border-radius: 10px; font-size: 14px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
                      💬 Chat on WhatsApp
                    </a>
                  </td>
                </tr>
                <tr>
                  <td colspan="3" align="center" style="padding-top: 14px;">
                    <a href="${crmUrl}" style="color: #94a3b8; font-size: 12px; font-weight: 600; text-decoration: underline;">
                      Open Full Call Dossier in SVI Admin Leads Hub →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0e17; padding: 18px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                Confidential Internal Transmission • SVI Infra Solutions Telephony Intelligence Suite<br>
                To adjust notification preferences or recipients, visit <strong>Admin Settings → Notifications</strong>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `🔥 [VIP HOT LEAD ALERT] +91 ${customerPhone}
--------------------------------------------------
Intent: ${intelligence.intent}
Budget: ${intelligence.budget || 'Open / Enquired'}
Property: ${intelligence.property_interest || 'Plots near Khatu Shyam'}
Call Duration: ${duration}s

AI Summary:
"${intelligence.summary}"

Recommended Action:
${intelligence.recommended_action}

Direct Actions:
- Call Client: tel:+91${cleanPhone}
- WhatsApp: ${waUrl}
- Open CRM: ${crmUrl}
--------------------------------------------------
SVI Infra Solutions Telephony Intelligence Suite`;

  return { html, text };
}

/**
 * Builds Obsidian / Gold luxury branded HTML email for Daily Lead Intelligence Digest.
 */
export function buildDailyDigestEmailHtml(params: {
  dateStr: string;
  recipientName: string;
  leads: Array<{
    customerPhone: string;
    intelligence: CallIntelligence;
    duration?: number;
    callRecordId?: string;
  }>;
}): { html: string; text: string } {
  const { dateStr, recipientName, leads } = params;
  const hotLeads = leads.filter((l) => l.intelligence.interest_level === 'Hot');
  const warmLeads = leads.filter((l) => l.intelligence.interest_level === 'Warm');
  const siteVisitsCount = leads.filter(
    (l) => l.intelligence.intent === 'Site Visit Requested'
  ).length;

  const leadsHtmlRows = leads
    .map((item, idx) => {
      const cleanPhone = item.customerPhone.replace(/\D/g, '').slice(-10);
      const isHot = item.intelligence.interest_level === 'Hot';
      const badgeBg = isHot ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)';
      const badgeBorder = isHot ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)';
      const badgeColor = isHot ? '#fca5a5' : '#fcd34d';

      return `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background-color: ${idx % 2 === 0 ? 'rgba(15, 23, 42, 0.6)' : 'rgba(11, 17, 30, 0.6)'};">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <span style="display: inline-block; background: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor}; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 12px; margin-bottom: 6px;">
                  ${isHot ? '🔥 HOT' : '☀️ WARM'} • ${item.intelligence.intent}
                </span>
                <div style="font-size: 16px; font-weight: 800; color: #ffffff; font-family: monospace;">
                  +91 ${item.customerPhone}
                </div>
                <div style="font-size: 12px; color: #d4af37; font-weight: 600; margin-top: 2px;">
                  ${item.intelligence.budget ? `Budget: ${item.intelligence.budget}` : 'Budget Open'} • ${item.intelligence.property_interest || 'Plots near Khatu Shyam'}
                </div>
                <div style="font-size: 13px; color: #cbd5e1; margin-top: 8px; line-height: 1.5;">
                  "${item.intelligence.summary}"
                </div>
                <div style="font-size: 12px; color: #38bdf8; font-weight: 600; margin-top: 6px;">
                  🎯 Action: ${item.intelligence.recommended_action}
                </div>
              </td>
              <td align="right" valign="top" style="width: 140px; padding-left: 12px;">
                <a href="tel:+91${cleanPhone}" style="display: block; background: #d4af37; color: #080b11; text-align: center; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; text-decoration: none; margin-bottom: 6px;">
                  📞 Call
                </a>
                <a href="https://wa.me/91${cleanPhone}" style="display: block; background: #25d366; color: #ffffff; text-align: center; padding: 7px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; text-decoration: none; margin-bottom: 6px;">
                  💬 WhatsApp
                </a>
                <a href="https://sviiinfrasolutions.com/admin/leads?tab=ivr&search=${cleanPhone}" style="display: block; color: #94a3b8; font-size: 10px; text-align: center; text-decoration: underline;">
                  View Dossier →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Daily Lead Intelligence Digest - SVI Infra</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #080b11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #080b11; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="650" cellspacing="0" cellpadding="0" style="max-width: 650px; width: 100%; background-color: #111622; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #d4af37 0%, #f0d080 50%, #d4af37 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #d4af37;">
                🌅 SVI Infra Executive Daily Digest
              </div>
              <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 6px;">
                High-Intent Lead Intelligence Summary
              </div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                Prepared for <strong>${recipientName}</strong> • Date: ${dateStr}
              </div>
            </td>
          </tr>

          <!-- Metric Cards Bar -->
          <tr>
            <td style="padding: 20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="31%" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 800; color: #f87171;">${hotLeads.length}</div>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #fca5a5; margin-top: 2px;">🔥 Hot Leads</div>
                  </td>
                  <td width="3%"></td>
                  <td width="31%" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 800; color: #fbbf24;">${warmLeads.length}</div>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #fde68a; margin-top: 2px;">☀️ Warm Leads</div>
                  </td>
                  <td width="3%"></td>
                  <td width="32%" style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 800; color: #38bdf8;">${siteVisitsCount}</div>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #bae6fd; margin-top: 2px;">📍 Site Visits</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead Records Table -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; margin-bottom: 10px;">
                📋 Prioritized Lead Roster (${leads.length} Leads)
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; overflow: hidden;">
                ${leadsHtmlRows}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0e17; padding: 18px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                SVI Infra Solutions • Daily Automated Intelligence Transmission<br>
                To change your delivery timing (e.g. 7:00 PM, 8:00 PM) or frequency, visit <strong>Admin Settings → Notifications</strong>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `🌅 SVI INFRA DAILY LEAD INTELLIGENCE DIGEST - ${dateStr}
Recipient: ${recipientName}
Hot Leads: ${hotLeads.length} | Warm Leads: ${warmLeads.length} | Site Visits: ${siteVisitsCount}
--------------------------------------------------
${leads
  .map(
    (l) =>
      `[${l.intelligence.interest_level.toUpperCase()}] +91 ${l.customerPhone} | ${l.intelligence.intent} | Budget: ${l.intelligence.budget || 'Open'}
Summary: ${l.intelligence.summary}
Action: ${l.intelligence.recommended_action}
`
  )
  .join('\n--------------------------------------------------\n')}`;

  return { html, text };
}

/**
 * Dispatches instant Hot Lead notifications across all configured channels.
 * Respects per-recipient `delivery_mode` ('instant' or 'both') and `lead_tier`.
 */
export async function dispatchHotLeadAlert(params: {
  customerPhone: string;
  intelligence: CallIntelligence;
  duration?: number;
  callRecordId?: string;
}): Promise<{ emailedCount: number; inAppCreated: boolean }> {
  const { customerPhone, intelligence, duration, callRecordId } = params;

  // 1. Fetch current settings
  const settings = await getHotLeadNotificationSettings();
  if (!settings.enabled) {
    return { emailedCount: 0, inAppCreated: false };
  }

  let inAppCreated = false;
  let emailedCount = 0;

  // 2. In-App Notification (Supabase `notifications` table)
  if (settings.channels.in_app) {
    try {
      const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10);
      await supabaseAdmin.from('notifications').insert([
        {
          title: `🔥 Hot Lead Alert: +91 ${customerPhone}`,
          message: `${intelligence.intent} | Budget: ${intelligence.budget || 'Open'} | ${intelligence.summary.slice(0, 160)}...`,
          type: 'warning',
          action_url: `/admin/leads?tab=ivr&search=${cleanPhone}`,
          metadata: {
            customer_phone: customerPhone,
            call_record_id: callRecordId,
            interest_level: 'Hot',
            intent: intelligence.intent,
            budget: intelligence.budget,
            property_interest: intelligence.property_interest,
            recommended_action: intelligence.recommended_action,
          },
        },
      ]);
      inAppCreated = true;
    } catch (inAppErr) {
      console.warn('Failed to insert in-app hot lead notification:', inAppErr);
    }
  }

  // 3. Email Dispatch via Resend (Per-Email Filtering)
  const eligibleRecipients = settings.recipients.filter((r) => {
    if (!r.email || !r.email.includes('@')) return false;
    const mode = r.delivery_mode || 'both';
    if (mode !== 'instant' && mode !== 'both') return false;
    const tier = r.lead_tier || 'hot_only';
    if (tier === 'hot_only' && intelligence.interest_level !== 'Hot') return false;
    return true;
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && eligibleRecipients.length > 0) {
    const { html, text } = buildHotLeadAlertEmailHtml({
      customerPhone,
      intelligence,
      duration,
      callRecordId,
    });

    const subject = `🔥 [HOT LEAD] +91 ${customerPhone} - ${intelligence.intent} (${intelligence.budget || 'Deal Open'})`;

    for (const recipient of eligibleRecipients) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'SVI Infra VIP Radar <noreply@sviiinfrasolutions.com>',
            to: [recipient.email],
            subject,
            html,
            text,
          }),
        });

        const resData = await res.json();
        if (res.ok && resData.id) {
          emailedCount++;
          // Log to email_messages table
          await supabaseAdmin.from('email_messages').insert([
            {
              resend_id: resData.id,
              from_email: 'SVI Infra VIP Radar <noreply@sviiinfrasolutions.com>',
              to_emails: [recipient.email],
              subject,
              status: 'sent',
              sent_at: new Date().toISOString(),
              metadata: {
                type: 'hot_lead_alert',
                recipient_id: recipient.email,
                delivery_mode: recipient.delivery_mode,
                customer_phone: customerPhone,
                call_record_id: callRecordId,
                interest_level: intelligence.interest_level,
              },
            },
          ]);
        } else {
          console.warn(`Resend dispatch to ${recipient.email} failed:`, resData);
        }
      } catch (err) {
        console.warn(`Error emailing hot lead alert to ${recipient.email}:`, err);
      }
    }
  }

  return { emailedCount, inAppCreated };
}

/**
 * Dispatches Daily Digest to recipients scheduled for current time or for a test email.
 */
export async function dispatchDailyDigest(params?: {
  targetEmail?: string;
  currentHourTime?: string; // e.g. '19:30'
}): Promise<{ dispatchedCount: number; leadCount: number }> {
  const settings = await getHotLeadNotificationSettings();
  if (!settings.enabled && !params?.targetEmail) {
    return { dispatchedCount: 0, leadCount: 0 };
  }

  // 1. Fetch triaged leads with Hot or Warm status
  const { data: records, error } = await supabaseAdmin
    .from('ivr_call_records')
    .select('id, customer_phone, call_duration, created_at, raw_payload')
    .not('raw_payload->ai_intelligence', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !records || records.length === 0) {
    return { dispatchedCount: 0, leadCount: 0 };
  }

  // Filter Hot and Warm leads
  interface RawRecord {
    id: string;
    customer_phone: string;
    call_duration?: number;
    raw_payload?: {
      ai_intelligence?: CallIntelligence;
    };
  }

  const validLeads = (records as unknown as RawRecord[])
    .filter((r) => {
      const intel = r.raw_payload?.ai_intelligence;
      return intel && (intel.interest_level === 'Hot' || intel.interest_level === 'Warm');
    })
    .map((r) => ({
      customerPhone: r.customer_phone,
      intelligence: r.raw_payload!.ai_intelligence!,
      duration: r.call_duration,
      callRecordId: r.id,
    }));

  if (validLeads.length === 0) {
    return { dispatchedCount: 0, leadCount: 0 };
  }

  // 2. Identify eligible recipients
  let targetRecipients = settings.recipients.filter((r) => {
    if (!r.email || !r.email.includes('@')) return false;
    const mode = r.delivery_mode || 'both';
    return mode === 'daily_digest' || mode === 'both';
  });

  if (params?.targetEmail) {
    const found = settings.recipients.find(
      (r) => r.email.toLowerCase() === params.targetEmail?.toLowerCase()
    );
    targetRecipients = [
      found || {
        name: 'Admin Preview',
        email: params.targetEmail,
        role: 'Director',
        delivery_mode: 'daily_digest',
        digest_time: '19:30',
        lead_tier: 'hot_and_warm',
      },
    ];
  } else if (params?.currentHourTime) {
    targetRecipients = targetRecipients.filter(
      (r) => (r.digest_time || '19:30') === params.currentHourTime
    );
  }

  if (targetRecipients.length === 0) {
    return { dispatchedCount: 0, leadCount: validLeads.length };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { dispatchedCount: 0, leadCount: validLeads.length };
  }

  let dispatchedCount = 0;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  for (const recipient of targetRecipients) {
    // Filter leads based on recipient's lead_tier
    const leadsForRecipient = validLeads.filter((l) => {
      if (recipient.lead_tier === 'hot_only') {
        return l.intelligence.interest_level === 'Hot';
      }
      return true; // hot_and_warm
    });

    if (leadsForRecipient.length === 0) continue;

    const { html, text } = buildDailyDigestEmailHtml({
      dateStr,
      recipientName: recipient.name,
      leads: leadsForRecipient,
    });

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SVI Infra VIP Radar <noreply@sviiinfrasolutions.com>',
          to: [recipient.email],
          subject: `🌅 [DAILY DIGEST] ${dateStr} - ${leadsForRecipient.length} High-Intent Leads Recap`,
          html,
          text,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.id) {
        dispatchedCount++;
        await supabaseAdmin.from('email_messages').insert([
          {
            resend_id: resData.id,
            from_email: 'SVI Infra VIP Radar <noreply@sviiinfrasolutions.com>',
            to_emails: [recipient.email],
            subject: `🌅 [DAILY DIGEST] ${dateStr} - ${leadsForRecipient.length} High-Intent Leads Recap`,
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: {
              type: 'daily_lead_digest',
              recipient_id: recipient.email,
              lead_count: leadsForRecipient.length,
            },
          },
        ]);
      }
    } catch (err) {
      console.warn(`Failed sending daily digest to ${recipient.email}:`, err);
    }
  }

  return { dispatchedCount, leadCount: validLeads.length };
}
