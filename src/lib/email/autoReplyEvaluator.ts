/**
 * Out-of-Office & Business Hours Evaluator for SVI Infra Solutions.
 * Evaluates whether an incoming client email should receive an automated out-of-office or acknowledgement reply.
 * Timezone: Asia/Kolkata (Indian Standard Time, UTC+05:30).
 */

export interface AutoReplySettings {
  enabled: boolean;
  mode: 'out_of_office' | 'always' | 'vacation';
  business_hours: {
    start: string; // '09:30' (24h format)
    end: string; // '18:30' (24h format)
    timezone: string; // 'Asia/Kolkata'
    working_days: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
  };
  subject: string;
  body_text: string;
  cooldown_hours: number; // default: 24
  excluded_senders: string[];
  emergency_phone: string;
  emergency_email: string;
}

export const DEFAULT_AUTO_REPLY_SETTINGS: AutoReplySettings = {
  enabled: true,
  mode: 'out_of_office',
  business_hours: {
    start: '09:30',
    end: '18:30',
    timezone: 'Asia/Kolkata',
    working_days: [1, 2, 3, 4, 5, 6], // Mon-Sat
  },
  subject: 'Thank you for contacting SVI Infra Solutions',
  body_text:
    'Thank you for reaching out to SVI Infra Solutions. Our corporate office hours are 9:30 AM to 6:30 PM IST (Monday through Saturday). A senior property advisor will review your message and connect with you as soon as business hours resume.',
  cooldown_hours: 24,
  excluded_senders: [
    'noreply@',
    'no-reply@',
    'mailer-daemon@',
    'postmaster@',
    'notifications@',
    'bounce',
  ],
  emergency_phone: '+91 73000-07643',
  emergency_email: 'info@sviiinfrasolutions.com',
};

/**
 * Returns current IST Day of Week (1=Mon ... 7=Sun) and hour/minute values.
 */
export function getISTDateTime(date: Date = new Date()): {
  dayOfWeek: number;
  hours: number;
  minutes: number;
  timeString: string;
} {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  let weekdayStr = '';
  let hourStr = '0';
  let minStr = '0';

  for (const p of parts) {
    if (p.type === 'weekday') weekdayStr = p.value;
    if (p.type === 'hour') hourStr = p.value;
    if (p.type === 'minute') minStr = p.value;
  }

  const DAY_MAP: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  const dayOfWeek = DAY_MAP[weekdayStr] || 1;
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);

  const displayTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return { dayOfWeek, hours, minutes, timeString: displayTime };
}

/**
 * Checks if a given timestamp falls within business hours (IST).
 */
export function isWithinBusinessHours(
  now: Date = new Date(),
  config = DEFAULT_AUTO_REPLY_SETTINGS.business_hours
): boolean {
  const { dayOfWeek, hours, minutes } = getISTDateTime(now);

  // Check day of week
  if (!config.working_days.includes(dayOfWeek)) {
    return false;
  }

  // Parse start & end times
  const [startH, startM] = config.start.split(':').map((n) => parseInt(n, 10));
  const [endH, endM] = config.end.split(':').map((n) => parseInt(n, 10));

  const currentMin = hours * 60 + minutes;
  const startMin = (startH || 9) * 60 + (startM || 30);
  const endMin = (endH || 18) * 60 + (endM || 30);

  return currentMin >= startMin && currentMin < endMin;
}

/**
 * Generates luxury HTML auto-response envelope matching corporate brand standard.
 */
export function buildAutoReplyHtml(
  inbound: { senderName?: string; subject?: string },
  settings: AutoReplySettings = DEFAULT_AUTO_REPLY_SETTINGS
): string {
  const clientName = inbound.senderName?.trim() || 'Valued Client';
  const customMessage = settings.body_text.replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SVI Infra Solutions - Automatic Response</title>
</head>
<body style="margin:0;padding:0;background-color:#080b11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080b11;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#111622;border:1px solid rgba(212,175,55,0.25);border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          <!-- Top Gold Accent Line -->
          <tr>
            <td height="4" style="background:linear-gradient(90deg, #d4af37 0%, #f6e05e 50%, #d4af37 100%);"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 20px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">SVI INFRA SOLUTIONS</h1>
              <p style="margin:6px 0 0;font-size:11px;color:#d4af37;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Client Relationship Command</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:10px 32px 24px;color:#cbd5e1;font-size:14px;line-height:1.7;">
              <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#ffffff;">Dear ${clientName},</p>
              <p style="margin:0 0 16px;">${customMessage}</p>

              <!-- Business Hours Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:#0b0f17;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#d4af37;text-transform:uppercase;letter-spacing:1px;">Business Hours (IST)</p>
                    <p style="margin:0;font-size:13px;color:#e2e8f0;font-weight:500;">Monday – Saturday: 9:30 AM to 6:30 PM IST</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, UP 201309</p>
                    <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">Helpline: <strong style="color:#ffffff;">${settings.emergency_phone}</strong></p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#94a3b8;">This is an automated acknowledgment. You do not need to reply to this message.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#0b0f17;border-top:1px solid rgba(255,255,255,0.06);text-align:center;font-size:11px;color:#64748b;">
              © ${new Date().getFullYear()} SVI Infra Solutions Pvt. Ltd. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
