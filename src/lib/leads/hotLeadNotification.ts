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

export function buildHotLeadAlertEmailHtml(params: {
  customerPhone: string;
  intelligence: CallIntelligence;
  duration?: number;
  callRecordId?: string;
}): { html: string; text: string } {
  const { customerPhone, intelligence, duration = 0, callRecordId } = params;
  const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
  const formattedPhone = `+91 ${cleanPhone}`;
  const waGreeting = `Namaste Sir/Ma'am, SVI Infra Solutions se baat kar rahe hain. Aapne Khatu Shyam Ji / Shivani Vatika township ke baare me inquiry ki thi. Kya hum aapki visit schedule kar dein?`;
  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waGreeting)}`;
  const crmUrl = callRecordId
    ? `https://sviinfrasolutions.com/admin/leads?tab=ivr&callId=${callRecordId}`
    : `https://sviinfrasolutions.com/admin/leads?tab=ivr&search=${cleanPhone}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>VIP Hot Lead Alert - SVI Infra Solutions</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e5e9f0; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(15, 23, 42, 0.07), 0 2px 6px rgba(15, 23, 42, 0.04);">
          
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #d4af37 0%, #f6e05e 50%, #d4af37 100%);"></td>
          </tr>

          <tr>
            <td style="padding: 28px 32px 22px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="middle">
                    <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; color: #92400e; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; padding: 3px 8px; border-radius: 4px;">
                      ⚡ SVI VIP VOICE RADAR
                    </div>
                    <div style="font-size: 21px; font-weight: 800; color: #0f172a; margin-top: 8px; letter-spacing: -0.4px; line-height: 1.25;">
                      🔥 High-Priority Hot Lead
                    </div>
                  </td>
                  <td align="right" valign="top" style="width: 130px;">
                    <span style="display: inline-block; background-color: #fee2e2; border: 1px solid #fecaca; color: #991b1b; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 14px; letter-spacing: 0.5px; white-space: nowrap;">
                      ACTION REQUIRED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px 18px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td width="50%" valign="top" style="padding: 16px 20px; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.8px;">Customer Phone</div>
                    <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: -apple-system, BlinkMacSystemFont, monospace;">
                      <a href="tel:+91${cleanPhone}" style="color: #0f172a; text-decoration: none;">${formattedPhone}</a>
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.8px;">Primary Intent</div>
                    <div style="font-size: 14px; font-weight: 800; color: #0284c7; margin-top: 4px;">
                      ${intelligence.intent || 'Site Visit Requested'}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" valign="top" style="padding: 16px 20px; border-right: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.8px;">Estimated Budget</div>
                    <div style="font-size: 15px; font-weight: 800; color: #b45309; margin-top: 4px;">
                      ${intelligence.budget || 'Open / Discussion'}
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding: 16px 20px;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.8px;">Call Duration</div>
                    <div style="font-size: 15px; font-weight: 800; color: #334155; margin-top: 4px;">
                      ${duration}s
                    </div>
                  </td>
                </tr>
                ${
                  intelligence.property_interest
                    ? `
                <tr>
                  <td colspan="2" style="padding: 12px 20px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
                    <span style="font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 800; letter-spacing: 0.6px;">Property Requirement: </span>
                    <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${intelligence.property_interest}</span>
                  </td>
                </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #d4af37; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);">
                <tr>
                  <td style="padding: 16px 20px 14px 20px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 6px;">
                      🎙️ Voice AI Call Synopsis (Hinglish)
                    </div>
                    <div style="font-size: 14px; line-height: 1.6; color: #334155; font-style: italic;">
                      "${intelligence.summary}"
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px 14px 20px; border-top: 1px dashed #e2e8f0; background-color: #fafbfc;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td valign="top" style="width: 20px; padding-top: 1px;">
                          <span style="font-size: 13px;">🎯</span>
                        </td>
                        <td valign="top" style="padding-left: 8px;">
                          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #166534;">Recommended Next Step: </span>
                          <span style="font-size: 13px; font-weight: 700; color: #15803d;">${intelligence.recommended_action || 'WhatsApp par location map, brochure bhejo aur site visit confirm karo'}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" align="center" valign="top">
                    <a href="tel:+91${cleanPhone}" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); color: #080b11; text-align: center; padding: 13px 14px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);">
                      <div style="font-size: 14px; font-weight: 800; line-height: 1.2;">📞 Call Client</div>
                      <div style="font-size: 11px; font-weight: 700; color: #1e293b; margin-top: 2px; font-family: monospace;">${formattedPhone}</div>
                    </a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" align="center" valign="top">
                    <a href="${waUrl}" style="display: block; width: 100%; box-sizing: border-box; background: #25d366; color: #ffffff; text-align: center; padding: 13px 14px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.25);">
                      <div style="font-size: 14px; font-weight: 800; line-height: 1.2;">💬 Chat on WhatsApp</div>
                      <div style="font-size: 11px; font-weight: 700; color: #f0fdf4; margin-top: 2px;">Instant Follow-up</div>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td colspan="3" align="center" style="padding-top: 18px;">
                    <a href="${crmUrl}" style="display: inline-block; color: #475569; font-size: 12px; font-weight: 700; text-decoration: none; border-bottom: 1px dashed #94a3b8; padding-bottom: 2px;">
                      Open Lead Dossier in Admin CRM →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                Confidential Internal Transmission • SVI Infra Solutions Telephony Intelligence Suite<br>
                Official Domain: <strong>sviinfrasolutions.com</strong> • Block E-220, Sector 63, Noida, UP 201309
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
        <td style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <span style="display: inline-block; background: ${isHot ? '#fee2e2' : '#fef3c7'}; border: 1px solid ${isHot ? '#fca5a5' : '#fde68a'}; color: ${isHot ? '#b91c1c' : '#b45309'}; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; margin-bottom: 6px;">
                  ${isHot ? '🔥 HOT' : '☀️ WARM'} • ${item.intelligence.intent}
                </span>
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, monospace;">
                  +91 ${item.customerPhone}
                </div>
                <div style="font-size: 12px; color: #b45309; font-weight: 700; margin-top: 2px;">
                  ${item.intelligence.budget ? `Budget: ${item.intelligence.budget}` : 'Budget Open'} • ${item.intelligence.property_interest || 'Plots near Khatu Shyam'}
                </div>
                <div style="font-size: 13px; color: #334155; margin-top: 8px; line-height: 1.5;">
                  "${item.intelligence.summary}"
                </div>
                <div style="font-size: 12px; color: #0369a1; font-weight: 700; margin-top: 6px;">
                  🎯 Action: ${item.intelligence.recommended_action}
                </div>
              </td>
              <td align="right" valign="top" style="width: 140px; padding-left: 12px;">
                <a href="tel:+91${cleanPhone}" style="display: block; background: linear-gradient(135deg, #d4af37 0%, #c59b27 100%); color: #080b11; text-align: center; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; text-decoration: none; margin-bottom: 6px; box-shadow: 0 2px 6px rgba(212, 175, 55, 0.25);">
                  📞 Call
                </a>
                <a href="https://wa.me/91${cleanPhone}" style="display: block; background: #25d366; color: #ffffff; text-align: center; padding: 7px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; text-decoration: none; margin-bottom: 6px; box-shadow: 0 2px 6px rgba(37, 211, 102, 0.2);">
                  💬 WhatsApp
                </a>
                <a href="https://sviinfrasolutions.com/admin/leads?tab=ivr&search=${cleanPhone}" style="display: block; color: #475569; font-size: 11px; font-weight: 700; text-align: center; text-decoration: underline;">
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
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="650" cellspacing="0" cellpadding="0" style="max-width: 650px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
          
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #d4af37 0%, #f6e05e 50%, #d4af37 100%);"></td>
          </tr>

          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 6px;">
                🌅 SVI INFRA • EXECUTIVE DAILY DIGEST
              </div>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 10px; letter-spacing: -0.5px;">
                High-Intent Lead Intelligence Summary
              </div>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">
                Prepared for <strong>${recipientName}</strong> • Date: ${dateStr}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="31%" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 800; color: #b91c1c;">${hotLeads.length}</div>
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #991b1b; margin-top: 2px;">🔥 Hot Leads</div>
                  </td>
                  <td width="3%"></td>
                  <td width="31%" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 800; color: #b45309;">${warmLeads.length}</div>
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #92400e; margin-top: 2px;">☀️ Warm Leads</div>
                  </td>
                  <td width="3%"></td>
                  <td width="32%" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 800; color: #0284c7;">${siteVisitsCount}</div>
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0369a1; margin-top: 2px;">📍 Site Visits</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #475569; margin-bottom: 10px;">
                📋 Prioritized Lead Roster (${leads.length} Leads)
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                ${leadsHtmlRows}
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                SVI Infra Solutions • Daily Automated Intelligence Transmission<br>
                Official Domain: <strong>sviinfrasolutions.com</strong> • Block E-220, Sector 63, Noida, UP 201309
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

export async function dispatchHotLeadAlert(params: {
  customerPhone: string;
  intelligence: CallIntelligence;
  duration?: number;
  callRecordId?: string;
}): Promise<{ emailedCount: number; inAppCreated: boolean }> {
  const { customerPhone, intelligence, duration, callRecordId } = params;

  const settings = await getHotLeadNotificationSettings();
  if (!settings.enabled) {
    return { emailedCount: 0, inAppCreated: false };
  }

  let inAppCreated = false;
  let emailedCount = 0;

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
  try {
    const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone) {
      const nowIso = new Date().toISOString();
      const dateFormatted = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const reasonText = `Reason: ${intelligence.intent || 'High Interest'}. Budget: ${intelligence.budget || 'Not specified'}. Call Duration: ${duration || 0}s. Summary: ${intelligence.summary}`;

      const { data: existingLeads } = await supabaseAdmin
        .from('chat_leads')
        .select('id, name, notes, phone')
        .ilike('phone', `%${cleanPhone}%`)
        .limit(1);

      let leadId: string | null = null;
      if (existingLeads && existingLeads.length > 0) {
        const current = existingLeads[0];
        leadId = current.id;
        const updatedNotes =
          (current.notes ? current.notes + '\n\n' : '') +
          `[Updated by AI on ${dateFormatted}] ${reasonText}`;
        await supabaseAdmin
          .from('chat_leads')
          .update({
            temperature: 'hot',
            summary: intelligence.summary,
            budget: intelligence.budget || undefined,
            project_interest: intelligence.property_interest || undefined,
            notes: updatedNotes,
            updated_at: nowIso,
          })
          .eq('id', leadId);

        await supabaseAdmin.from('lead_activities').insert([
          {
            lead_id: leadId,
            employee_id: null,
            employee_name: 'Voice AI Triage Engine',
            activity_type: 'note_added',
            title: 'Updated by AI: Hot Lead Identified',
            notes: reasonText,
            created_at: nowIso,
          },
        ]);
      } else {
        const { data: newLead } = await supabaseAdmin
          .from('chat_leads')
          .insert([
            {
              name: `Customer +91${cleanPhone}`,
              phone: `+91${cleanPhone}`,
              normalized_phone: `+91${cleanPhone}`,
              source: 'ivr',
              temperature: 'hot',
              summary: intelligence.summary,
              budget: intelligence.budget || null,
              project_interest: intelligence.property_interest || null,
              qualification_status: 'qualified',
              lifecycle_status: 'lead',
              lead_created_by: 'Voice AI Triage Engine',
              notes: `[Created & Updated by AI on ${dateFormatted}] ${reasonText}`,
              created_at: nowIso,
              updated_at: nowIso,
            },
          ])
          .select('id')
          .single();

        if (newLead?.id) {
          leadId = newLead.id;
          await supabaseAdmin.from('lead_activities').insert([
            {
              lead_id: leadId,
              employee_id: null,
              employee_name: 'Voice AI Triage Engine',
              activity_type: 'lead_created',
              title: 'Lead Created & Updated by AI: Hot Lead',
              notes: reasonText,
              created_at: nowIso,
            },
          ]);
        }
      }
    }
  } catch (chatSyncErr) {
    console.warn('Failed to sync hot lead to chat_leads and lead_activities:', chatSyncErr);
  }

  return { emailedCount, inAppCreated };
}

export async function dispatchDailyDigest(params?: {
  targetEmail?: string;
  currentHourTime?: string;
}): Promise<{ dispatchedCount: number; leadCount: number }> {
  const settings = await getHotLeadNotificationSettings();
  if (!settings.enabled && !params?.targetEmail) {
    return { dispatchedCount: 0, leadCount: 0 };
  }

  const { data: records, error } = await supabaseAdmin
    .from('ivr_call_records')
    .select('id, customer_phone, call_duration, created_at, raw_payload')
    .not('raw_payload->ai_intelligence', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !records || records.length === 0) {
    return { dispatchedCount: 0, leadCount: 0 };
  }

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
    const leadsForRecipient = validLeads.filter((l) => {
      if (recipient.lead_tier === 'hot_only') {
        return l.intelligence.interest_level === 'Hot';
      }
      return true;
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
