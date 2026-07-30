import { getResend } from '../syncRunner';
import { AppError } from '@/src/lib/api/errors';

export async function getDomains() {
  const resend = getResend();
  if (!resend) {
    return { domains: [], notConfigured: true };
  }
  const domains = await resend.domains.list();
  return { domains: domains.data };
}

export async function getInboundStatus(request: Request) {
  const url = new URL(request.url);
  const resend = getResend();

  const inboundDomain = process.env.RESEND_INBOUND_DOMAIN;
  const webhookSecret = !!process.env.RESEND_WEBHOOK_SECRET;
  const webhookUrl = `${url.protocol}//${url.host}/api/webhooks/resend/incoming`;

  let inboundDomains: any[] = [];
  if (resend) {
    try {
      const domainsResp: any = await resend.domains.list();
      const domainData = domainsResp?.data?.data || domainsResp?.data || [];
      if (Array.isArray(domainData)) {
        inboundDomains = domainData.filter((d: any) => d.type === 'inbound');
      }
    } catch {
      // Resend API may not support filtering yet
    }
  }

  return {
    configured: !!inboundDomain && !!resend,
    inboundDomain: inboundDomain || null,
    webhookSecretConfigured: webhookSecret,
    webhookUrl,
    inboundDomains,
    resendConfigured: !!resend,
  };
}

export async function getUsage() {
  const resend = getResend();
  if (!resend) {
    return {
      period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounces: 0,
      spamComplaints: 0,
      dailyStats: [],
      resendConfigured: false,
    };
  }

  let sentCount = 0;
  let deliveredCount = 0;
  let openedCount = 0;
  let clickedCount = 0;
  let bouncedCount = 0;
  let spamComplaintsCount = 0;

  try {
    const emailsResp = await resend.emails.list({ limit: 100 });
    const responseData = emailsResp.data as any;
    const allEmails = responseData?.data || [];

    const dailyStatsMap = new Map<
      string,
      { date: string; sent: number; delivered: number; opened: number }
    >();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      dailyStatsMap.set(dateStr, { date: dateStr, sent: 0, delivered: 0, opened: 0 });
    }

    for (const email of allEmails) {
      sentCount++;

      if (email.last_event === 'delivered') deliveredCount++;
      if (email.last_event === 'opened') {
        deliveredCount++;
        openedCount++;
      }
      if (email.last_event === 'clicked') {
        deliveredCount++;
        openedCount++;
        clickedCount++;
      }
      if (email.last_event === 'bounced') bouncedCount++;
      if (email.last_event === 'complained') spamComplaintsCount++;

      if (email.created_at) {
        const emailDate = new Date(email.created_at);
        const dateStr = emailDate.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        });
        if (dailyStatsMap.has(dateStr)) {
          const stat = dailyStatsMap.get(dateStr)!;
          stat.sent++;
          if (['delivered', 'opened', 'clicked'].includes(email.last_event)) stat.delivered++;
          if (['opened', 'clicked'].includes(email.last_event)) stat.opened++;
        }
      }
    }

    const dailyStats = Array.from(dailyStatsMap.values());

    return {
      period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      sent: sentCount,
      delivered: deliveredCount,
      opened: openedCount,
      clicked: clickedCount,
      bounces: bouncedCount,
      spamComplaints: spamComplaintsCount,
      dailyStats,
      resendConfigured: true,
    };
  } catch (err) {
    console.error('Error fetching usage data:', err);
    throw new AppError(500, 'USAGE_FAILED', 'Failed to fetch usage data');
  }
}
