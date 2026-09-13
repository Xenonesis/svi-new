import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!resendApiKey) {
  console.error('Missing RESEND_API_KEY');
  process.exit(1);
}

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runRecovery() {
  console.log('🚀 STARTING SENT EMAIL RECOVERY & BACKFILL PIPELINE...\n');

  let resendSynced = 0;
  let quotedRecovered = 0;
  let scheduledSynced = 0;
  let campaignsSynced = 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. RECOVER ALL ACTIVE SENT EMAILS FROM RESEND API (WITH FULL HTML & TEXT)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Phase 1: Syncing all active sent emails from Resend API ---');
  try {
    const listResp = await resend.emails.list({ limit: 100 });
    const resendEmails = (listResp.data as any)?.data || listResp.data || [];
    console.log(`Found ${resendEmails.length} active sent emails in Resend.`);

    for (let i = 0; i < resendEmails.length; i++) {
      const item = resendEmails[i];
      try {
        // Fetch full email body & details
        const detailResp = await resend.emails.get(item.id);
        const detail = (detailResp.data as any) || item;

        const toList = Array.isArray(detail.to) ? detail.to : [detail.to].filter(Boolean);
        const ccList = Array.isArray(detail.cc) ? detail.cc : [detail.cc].filter(Boolean);
        const bccList = Array.isArray(detail.bcc) ? detail.bcc : [detail.bcc].filter(Boolean);

        const emailRecord = {
          resend_id: item.id,
          subject: detail.subject || item.subject || '(no subject)',
          from_email: detail.from || item.from || 'noreply@sviiinfrasolutions.com',
          to_emails: toList,
          status: 'sent',
          last_event: detail.last_event || item.last_event || 'delivered',
          sent_at: detail.created_at || item.created_at,
          created_at: detail.created_at || item.created_at,
          metadata: {
            html: detail.html || null,
            text: detail.text || null,
            cc: ccList,
            bcc: bccList,
            reply_to: detail.reply_to || null,
            source: 'resend_sync',
          },
        };

        const { error } = await supabase
          .from('email_messages')
          .upsert(emailRecord, { onConflict: 'resend_id' });

        if (error) {
          console.error(`Error saving ${item.id}:`, error.message);
        } else {
          resendSynced++;
          if (resendSynced % 15 === 0 || resendSynced === resendEmails.length) {
            console.log(`  ✓ Synced ${resendSynced}/${resendEmails.length} Resend emails...`);
          }
        }
      } catch (err: any) {
        console.error(`Failed to process Resend email ${item.id}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error('Phase 1 error:', err);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. RECOVER HISTORICAL SENT EMAILS FROM QUOTED REPLIES (PRE-AUG 16)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Phase 2: Recovering Pre-August emails from quoted client replies ---');
  const historicalEmails: any[] = [
    {
      resend_id: 'rec-abhilasha-payment-reminder-20260805',
      subject: 'Payment Due Reminder',
      from_email: 'SVI Infra <noreply@sviiinfrasolutions.com>',
      to_emails: ['abhilashasahayvarma@gmail.com'],
      sent_at: '2026-08-05T10:32:00.000Z', // 4:02 PM IST
      created_at: '2026-08-05T10:32:00.000Z',
      status: 'sent',
      last_event: 'delivered',
      metadata: {
        source: 'recovered_quote',
        client_name: 'Abhilasha Varma',
        project: 'Shyam Aangan Phase 1',
        text: `SVI Infra Solutions\n\nPayment Reminder\nDear Abhilasha Varma,\n\nThis is a friendly reminder that your EMI for Shyam Aangan Phase 1 is due on 6 August 2026.\n\nKindly make the payment on time to avoid any inconvenience.\n\nThank you!\nSVI Infra Solutions Pvt. Ltd.`,
        html: `<h1>SVI Infra Solutions</h1><p>Payment Reminder</p><h2>Dear Abhilasha Varma,</h2><p>This is a friendly reminder that your EMI for <strong>Shyam Aangan Phase 1</strong> is due on <strong>6 August 2026</strong>.</p><p>Kindly make the payment on time to avoid any inconvenience.</p><p>Thank you!<br><strong>SVI Infra Solutions Pvt. Ltd.</strong></p>`,
      },
    },
    {
      resend_id: 'rec-surenderpal-lottery-winner-20260801',
      subject: '🏆 Congratulations! You Won the Lucky Draw!',
      from_email: 'SVI Infra <noreply@sviiinfrasolutions.com>',
      to_emails: ['surenderpalnj@gmail.com'],
      sent_at: '2026-08-01T16:44:00.000Z', // 10:14 PM IST
      created_at: '2026-08-01T16:44:00.000Z',
      status: 'sent',
      last_event: 'delivered',
      metadata: {
        source: 'recovered_quote',
        client_name: 'Mr surinder pal singh',
        ticket_id: 'SVI2227',
        plot_no: '09',
        project: 'Shivani Vatika 11th',
        text: `Congratulations!\n\nDear Mr surinder pal singh,\nWe are thrilled to announce that you have been selected as the Grand Prize Winner of the lucky draw!\nWinning Ticket: SVI2227\nPlot No. 09 (100 Sq. Yds.) - Shivani Vatika 11th\nDraw Date: 1 August 2026\nOur team will contact you shortly to coordinate formal documentation.\n\nThank you for being a valued member of the SVI Infra family.`,
        html: `<h2>🏆 Congratulations!</h2><p>Dear <strong>Mr surinder pal singh</strong>,</p><p>We are thrilled to announce that you have been selected as the <strong>Grand Prize Winner</strong> of the lucky draw!</p><p><strong>Winning Ticket:</strong> SVI2227<br><strong>Plot No.:</strong> 09 (100 Sq. Yds.)<br><strong>Project:</strong> Shivani Vatika 11th<br><strong>Draw Date:</strong> 1 August 2026</p><p>Our team will contact you shortly to coordinate documentation.</p>`,
      },
    },
    {
      resend_id: 'rec-surenderpal-payment-received-20260731',
      subject: 'Payment Received – Plot',
      from_email: 'SVI Infra <noreply@sviiinfrasolutions.com>',
      to_emails: ['surenderpalnj@gmail.com'],
      sent_at: '2026-07-31T08:19:00.000Z', // 1:49 PM IST
      created_at: '2026-07-31T08:19:00.000Z',
      status: 'sent',
      last_event: 'delivered',
      metadata: {
        source: 'recovered_quote',
        client_name: 'Mr surinder pal singh',
        receipt_no: '2087',
        amount: '₹2,100',
        text: `SVI Infra Solutions - PAYMENT CONFIRMED\n✓ Payment Successfully Received\nDear Mr. Mr surinder pal singh,\nWe have received your payment for Plot (100 Sq. Yds.).\nAmount Paid: ₹2,100\nPayment Date: 31/07/2026\nReceipt No.: 2087\n\n© 2026 SVI Infra Solutions`,
        html: `<h2>PAYMENT CONFIRMED</h2><p>Dear <strong>Mr surinder pal singh</strong>,</p><p>We have received your payment for <strong>Plot (100 Sq. Yds.)</strong>.</p><p><strong>Amount Paid:</strong> ₹2,100<br><strong>Date:</strong> 31/07/2026<br><strong>Receipt No.:</strong> 2087</p>`,
      },
    },
    {
      resend_id: 'rec-khushi-portal-account-20260622',
      subject: 'Your SVI Infra Portal Account is Ready',
      from_email: 'SVI Infra <noreply@sviiinfrasolutions.com>',
      to_emails: ['Khushi.sviiinfrasolutions@gmail.com'],
      sent_at: '2026-06-22T05:41:00.000Z', // 11:11 AM IST
      created_at: '2026-06-22T05:41:00.000Z',
      status: 'sent',
      last_event: 'delivered',
      metadata: {
        source: 'recovered_quote',
        text: `Welcome to SVI Infra Solutions\nHello Khushi,\nYour authorized client portal account has been successfully created. You can now log in using your SVI Email: Khushi.sviiinfrasolutions@gmail.com`,
        html: `<h2>Welcome to SVI Infra Solutions</h2><p>Hello <strong>Khushi</strong>,</p><p>Your authorized client portal account has been successfully created. You can now log in using your SVI Email: <strong>Khushi.sviiinfrasolutions@gmail.com</strong></p>`,
      },
    },
    {
      resend_id: 'rec-arwaz-portal-account-20260612',
      subject: 'Your SVI Infra Portal Account is Ready',
      from_email: 'SVI Infra <noreply@sviiinfrasolutions.com>',
      to_emails: ['Arwazkhan@sviinfrasolutions.com'],
      sent_at: '2026-06-12T09:25:00.000Z', // 2:55 PM IST
      created_at: '2026-06-12T09:25:00.000Z',
      status: 'sent',
      last_event: 'delivered',
      metadata: {
        source: 'recovered_quote',
        text: `Welcome to SVI Infra Solutions\nHello Arwaz Khan,\nYour authorized client portal account has been successfully created. SVI Email: Arwazkhan@sviinfrasolutions.com`,
        html: `<h2>Welcome to SVI Infra Solutions</h2><p>Hello <strong>Arwaz Khan</strong>,</p><p>Your authorized client portal account has been successfully created. SVI Email: <strong>Arwazkhan@sviinfrasolutions.com</strong></p>`,
      },
    },
    {
      resend_id: 'rec-abhilasha-allotment-confirmed-20260606',
      subject: '🎉 Allotment Confirmed – Shyam Aangan | Unit 1',
      from_email: 'SVI Infra <noreply@sviiinfrasolutions.com>',
      to_emails: ['abhilashasahayvarma@gmail.com'],
      sent_at: '2026-06-06T14:36:40.000Z', // 8:06:40 PM IST
      created_at: '2026-06-06T14:36:40.000Z',
      status: 'sent',
      last_event: 'delivered',
      metadata: {
        source: 'recovered_quote',
        client_name: 'Ms. Abhilasha Varma',
        ticket_id: 'SVI002051',
        project: 'Shyam Aangan',
        unit: '1',
        area: '193.90 Sq. Yds.',
        total_cost: '₹10,66,450',
        text: `ALLOTMENT CONFIRMATION\n✅ Allotment Successfully Confirmed\nDear Ms. Abhilasha Varma,\nCongratulations on your investment in Shyam Aangan.\nTicket ID: SVI002051\nUnit Number: 1 (193.90 Sq. Yds.)\nTotal Cost: ₹10,66,450\nPayment Plan: 12 Months\nBooking Date: 2026-06-06\nAccount Manager: Muskan Varshney`,
        html: `<h2>ALLOTMENT CONFIRMATION</h2><p>Dear <strong>Ms. Abhilasha Varma</strong>,</p><p>Congratulations on your new investment in <strong>Shyam Aangan</strong>.</p><p><strong>Ticket ID:</strong> SVI002051<br><strong>Unit Number:</strong> 1 (193.90 Sq. Yds.)<br><strong>Total Cost:</strong> ₹10,66,450<br><strong>Booking Date:</strong> 2026-06-06<br><strong>Account Manager:</strong> Muskan Varshney</p>`,
      },
    },
    {
      resend_id: 'rec-wasi-hi-20260608',
      subject: 'hi',
      from_email: 'SVI Infra <noreply@sviiinfrasolutions.com>',
      to_emails: ['wasi.sviinfrasolutions@gmail.com'],
      sent_at: '2026-06-08T06:25:00.000Z', // 11:55 AM IST
      created_at: '2026-06-08T06:25:00.000Z',
      status: 'sent',
      last_event: 'delivered',
      metadata: {
        source: 'recovered_quote',
        text: 'hinmnbkj',
        html: '<p>hinmnbkj</p>',
      },
    },
  ];

  for (const hist of historicalEmails) {
    const { error } = await supabase
      .from('email_messages')
      .upsert(hist, { onConflict: 'resend_id' });
    if (error) {
      console.error(`Error recovering historical email ${hist.subject}:`, error.message);
    } else {
      quotedRecovered++;
      console.log(
        `  ✓ Recovered: "${hist.subject}" to ${hist.to_emails.join(', ')} (${hist.sent_at})`
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. BACKFILL SENT SCHEDULED EMAILS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Phase 3: Backfilling sent scheduled_emails ---');
  try {
    const { data: schedData } = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'sent');

    for (const item of schedData || []) {
      const rec = {
        resend_id: `sched-${item.id}`,
        subject: item.subject,
        from_email: item.metadata?.from || 'noreply@sviiinfrasolutions.com',
        to_emails: item.to_emails || [],
        status: 'sent',
        last_event: 'delivered',
        sent_at: item.sent_at || item.created_at,
        created_at: item.sent_at || item.created_at,
        metadata: {
          html: item.html_body,
          text: item.html_body,
          source: 'scheduled_emails',
        },
      };
      const { error } = await supabase
        .from('email_messages')
        .upsert(rec, { onConflict: 'resend_id' });
      if (!error) scheduledSynced++;
    }
    console.log(`  ✓ Synced ${scheduledSynced} sent scheduled emails.`);
  } catch (err: any) {
    console.error('Phase 3 error:', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. BACKFILL SENT CAMPAIGNS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Phase 4: Backfilling sent email_campaigns ---');
  try {
    const { data: campData } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('status', 'sent');

    for (const camp of campData || []) {
      const rec = {
        resend_id: `camp-${camp.id}`,
        subject: camp.subject || camp.title,
        from_email: 'SVI Infra <noreply@sviiinfrasolutions.com>',
        to_emails: [camp.recipient_group || 'All Recipients'],
        status: 'sent',
        last_event: 'delivered',
        sent_at: camp.sent_at || camp.created_at,
        created_at: camp.sent_at || camp.created_at,
        metadata: {
          html: camp.body_html,
          title: camp.title,
          recipient_count: camp.recipient_count,
          source: 'email_campaigns',
        },
      };
      const { error } = await supabase
        .from('email_messages')
        .upsert(rec, { onConflict: 'resend_id' });
      if (!error) campaignsSynced++;
    }
    console.log(`  ✓ Synced ${campaignsSynced} sent campaigns.`);
  } catch (err: any) {
    console.error('Phase 4 error:', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VERIFY TOTALS
  // ─────────────────────────────────────────────────────────────────────────────
  const { count: finalCount } = await supabase
    .from('email_messages')
    .select('*', { count: 'exact', head: true });

  console.log('\n========================================');
  console.log('🎉 RECOVERY & BACKFILL COMPLETE!');
  console.log(`  - Resend Active Emails Synced: ${resendSynced}`);
  console.log(`  - Historical Pre-Aug Emails Recovered: ${quotedRecovered}`);
  console.log(`  - Scheduled Emails Backfilled: ${scheduledSynced}`);
  console.log(`  - Campaigns Backfilled: ${campaignsSynced}`);
  console.log(`  👉 Total Permanent Sent Emails in Supabase: ${finalCount}`);
  console.log('========================================\n');
}

runRecovery().catch(console.error);
