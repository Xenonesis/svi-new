/** Format a date to IST string */
export function toIST(date: Date): string {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

/** Build a live countdown string for emails */
export function buildCountdownBlock(scheduledAt: Date, includeCountdown: boolean): string {
  if (!includeCountdown) return '';
  const now = new Date();
  const diffMs = scheduledAt.getTime() - now.getTime();
  if (diffMs <= 0) return '';
  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  let timeStr = '';
  if (hours > 0) timeStr += `${hours} hour${hours > 1 ? 's' : ''} `;
  timeStr += `${mins} minute${mins !== 1 ? 's' : ''}`;
  return `
    <div style="text-align:center;margin:24px 0;padding:20px;background:#fef9ec;border-radius:12px;border:1px solid #f0d080;">
      <div style="font-size:12px;color:#b08f36;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">⏳ Draw Happening In</div>
      <div style="font-size:28px;font-weight:700;color:#0a0a0f;">${timeStr}</div>
      <div style="font-size:12px;color:#888;margin-top:6px;">${toIST(scheduledAt)} (IST)</div>
    </div>
  `;
}

export function reminderEmailHtml(opts: {
  participantName: string;
  lotteryTitle: string;
  scheduledAt: Date;
  ticketNumber: string;
  includeCountdown: boolean;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lottery Draw Reminder</title></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:40px 40px 32px;text-align:center;">
          <div style="font-size:11px;letter-spacing:0.2em;color:#c9a84c;text-transform:uppercase;margin-bottom:12px;">✦ SVI Infra Solutions</div>
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">🎉 Draw Reminder</h1>
          <p style="margin:10px 0 0;font-size:14px;color:#a0a0b0;">Your lucky draw is coming up!</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 20px;font-size:16px;color:#1a1a2e;">Dear <strong>${opts.participantName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.7;">
            This is a friendly reminder that the <strong>${opts.lotteryTitle}</strong> lucky draw is happening soon. Get ready for the big reveal!
          </p>
          <!-- Ticket -->
          <div style="background:#f8f8ff;border:1px solid #e0e0f0;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <div style="font-size:11px;color:#888;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Your Ticket Number</div>
            <div style="font-size:24px;font-weight:700;color:#1a1a2e;font-family:monospace;">${opts.ticketNumber}</div>
          </div>
          ${buildCountdownBlock(opts.scheduledAt, opts.includeCountdown)}
          <p style="margin:24px 0 0;font-size:13px;color:#666;line-height:1.7;">
            The draw is scheduled for <strong>${toIST(opts.scheduledAt)}</strong> (IST). You will receive another email immediately after the draw with your result.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8f8ff;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#888;">SVI Infra Solutions | Official Lucky Draw Portal</p>
          <p style="margin:6px 0 0;font-size:11px;color:#bbb;">This is an automated message. Please do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function winnerEmailHtml(opts: {
  participantName: string;
  lotteryTitle: string;
  ticketNumber: string;
  drawnAt: Date;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Congratulations — You Won!</title></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <!-- Gold Header -->
        <tr><td style="background:linear-gradient(135deg,#c9a84c,#f0d080,#b08f36);padding:48px 40px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🏆</div>
          <h1 style="margin:0;font-size:32px;font-weight:800;color:#0a0a0f;letter-spacing:-0.5px;">Congratulations!</h1>
          <p style="margin:10px 0 0;font-size:15px;color:#3a2800;font-weight:600;">You are the winner of ${opts.lotteryTitle}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 20px;font-size:16px;color:#1a1a2e;">Dear <strong>${opts.participantName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.7;">
            We are thrilled to announce that your ticket has been selected as the <strong>Grand Prize Winner</strong> of the <strong>${opts.lotteryTitle}</strong> draw! 🎊
          </p>
          <!-- Winning Ticket -->
          <div style="background:linear-gradient(135deg,#fef9ec,#fffbe8);border:2px solid #c9a84c;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:11px;color:#b08f36;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;font-weight:700;">🎫 Winning Ticket</div>
            <div style="font-size:28px;font-weight:800;color:#0a0a0f;font-family:monospace;">${opts.ticketNumber}</div>
            <div style="font-size:12px;color:#888;margin-top:8px;">Drawn on ${toIST(opts.drawnAt)}</div>
          </div>
          <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">
            Our team will contact you shortly to coordinate the prize handover. Please keep this email for your records.
          </p>
          <p style="margin:0;font-size:14px;color:#444;line-height:1.7;">
            Thank you for being a valued member of the SVI Infra family. Congratulations once again! 🌟
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#fef9ec;padding:24px 40px;text-align:center;border-top:1px solid #f0d080;">
          <p style="margin:0;font-size:12px;color:#888;">SVI Infra Solutions | Official Lucky Draw Portal</p>
          <p style="margin:6px 0 0;font-size:11px;color:#bbb;">This is an automated message. Please do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function nonWinnerEmailHtml(opts: {
  participantName: string;
  lotteryTitle: string;
  ticketNumber: string;
  winnerName: string;
  drawnAt: Date;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Draw Result — ${opts.lotteryTitle}</title></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:40px 40px 32px;text-align:center;">
          <div style="font-size:36px;margin-bottom:12px;">🎰</div>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">Draw Results</h1>
          <p style="margin:10px 0 0;font-size:14px;color:#a0a0b0;">${opts.lotteryTitle}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 20px;font-size:16px;color:#1a1a2e;">Dear <strong>${opts.participantName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.7;">
            Thank you for participating in the <strong>${opts.lotteryTitle}</strong> draw. The results are in!
          </p>
          <!-- Result banner -->
          <div style="background:#f8f8ff;border:1px solid #e0e0f0;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:11px;color:#888;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Your Ticket</div>
            <div style="font-size:22px;font-weight:700;color:#1a1a2e;font-family:monospace;margin-bottom:16px;">${opts.ticketNumber}</div>
            <div style="display:inline-block;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:10px 20px;">
              <span style="font-size:13px;color:#856404;font-weight:600;">Not selected this time</span>
            </div>
          </div>
          <!-- Winner reveal -->
          <div style="background:#f0fff4;border:1px solid #a3d9b1;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <div style="font-size:11px;color:#2d7a3d;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;font-weight:700;">🏆 This Draw's Winner</div>
            <div style="font-size:18px;font-weight:700;color:#1a1a2e;">${opts.winnerName}</div>
            <div style="font-size:12px;color:#888;margin-top:4px;">Drawn on ${toIST(opts.drawnAt)}</div>
          </div>
          <p style="margin:0;font-size:14px;color:#444;line-height:1.7;">
            Don't be disheartened! We regularly organize exclusive draws and special events for our valued clients. Stay tuned for upcoming opportunities. 🙏
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8f8ff;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#888;">SVI Infra Solutions | Official Lucky Draw Portal</p>
          <p style="margin:6px 0 0;font-size:11px;color:#bbb;">This is an automated message. Please do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
