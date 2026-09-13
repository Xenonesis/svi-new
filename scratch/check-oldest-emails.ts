import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const resend = resendApiKey ? new Resend(resendApiKey) : null;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log('=== CHECKING EMAILS IN SUPABASE & RESEND ===\n');

  // 1. Supabase email_inbox
  console.log('--- 1. Supabase: email_inbox ---');
  try {
    const { count: inboxCount } = await supabase
      .from('email_inbox')
      .select('*', { count: 'exact', head: true });
    console.log(`Total rows in email_inbox: ${inboxCount}`);

    const { data: oldestInbox } = await supabase
      .from('email_inbox')
      .select('id, email_id, subject, from_email, to_emails, received_at')
      .order('received_at', { ascending: true })
      .limit(3);

    const { data: newestInbox } = await supabase
      .from('email_inbox')
      .select('id, email_id, subject, from_email, to_emails, received_at')
      .order('received_at', { ascending: false })
      .limit(3);

    console.log('Oldest in email_inbox:', oldestInbox);
    console.log('Newest in email_inbox:', newestInbox);
  } catch (err: any) {
    console.error('Error querying email_inbox:', err.message);
  }

  // 2. Supabase: scheduled_emails
  console.log('\n--- 2. Supabase: scheduled_emails ---');
  try {
    const { count: scheduledCount } = await supabase
      .from('scheduled_emails')
      .select('*', { count: 'exact', head: true });
    console.log(`Total rows in scheduled_emails: ${scheduledCount}`);

    const { data: oldestScheduled } = await supabase
      .from('scheduled_emails')
      .select('id, subject, to_emails, status, scheduled_at, sent_at, created_at')
      .order('created_at', { ascending: true })
      .limit(3);

    const { data: newestScheduled } = await supabase
      .from('scheduled_emails')
      .select('id, subject, to_emails, status, scheduled_at, sent_at, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('Oldest in scheduled_emails:', oldestScheduled);
    console.log('Newest in scheduled_emails:', newestScheduled);
  } catch (err: any) {
    console.error('Error querying scheduled_emails:', err.message);
  }

  // 3. Supabase: email_campaigns
  console.log('\n--- 3. Supabase: email_campaigns ---');
  try {
    const { count: campaignsCount } = await supabase
      .from('email_campaigns')
      .select('*', { count: 'exact', head: true });
    console.log(`Total rows in email_campaigns: ${campaignsCount}`);

    const { data: oldestCampaign } = await supabase
      .from('email_campaigns')
      .select('id, title, subject, status, scheduled_at, sent_at, created_at')
      .order('created_at', { ascending: true })
      .limit(3);

    console.log('Oldest in email_campaigns:', oldestCampaign);
  } catch (err: any) {
    console.error('Error querying email_campaigns:', err.message);
  }

  // 4. Supabase: email_deletions (Trash / Filtered out)
  console.log('\n--- 4. Supabase: email_deletions (Trash / Hidden) ---');
  try {
    const { count: delCount } = await supabase
      .from('email_deletions')
      .select('*', { count: 'exact', head: true });
    console.log(`Total rows in email_deletions: ${delCount}`);

    const { data: deletions } = await supabase
      .from('email_deletions')
      .select('id, email_id, admin_id, deleted_at, email_data')
      .order('deleted_at', { ascending: false })
      .limit(5);

    console.log('Sample email_deletions:', deletions);
  } catch (err: any) {
    console.error('Error querying email_deletions:', err.message);
  }

  // 5. Resend API
  if (resend) {
    console.log('\n--- 5. Resend API: Outbound (Sent) ---');
    try {
      // Fetch sent emails from Resend
      let allSentEmails: any[] = [];
      let hasMore = true;
      let afterCursor: string | undefined = undefined;
      let pageCount = 0;

      while (hasMore && pageCount < 10) {
        pageCount++;
        const resp: any = await resend.emails.list(
          afterCursor ? { limit: 100, after: afterCursor } : { limit: 100 }
        );
        const listData = resp?.data?.data || resp?.data || [];
        if (Array.isArray(listData) && listData.length > 0) {
          allSentEmails.push(...listData);
          if (resp?.data?.has_more && listData[listData.length - 1]?.id) {
            afterCursor = listData[listData.length - 1].id;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      console.log(`Total sent emails retrieved from Resend: ${allSentEmails.length}`);
      if (allSentEmails.length > 0) {
        // Sort by created_at
        allSentEmails.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        console.log(
          'Oldest sent email in Resend:',
          allSentEmails.slice(0, 3).map((e) => ({
            id: e.id,
            created_at: e.created_at,
            to: e.to,
            from: e.from,
            subject: e.subject,
            last_event: e.last_event,
          }))
        );
        console.log(
          'Newest sent email in Resend:',
          allSentEmails.slice(-3).map((e) => ({
            id: e.id,
            created_at: e.created_at,
            to: e.to,
            from: e.from,
            subject: e.subject,
            last_event: e.last_event,
          }))
        );
      }
    } catch (err: any) {
      console.error('Error querying Resend sent emails:', err.message);
    }

    console.log('\n--- 6. Resend API: Inbound (Receiving) ---');
    try {
      const inboundResp: any = await resend.emails.receiving.list();
      const inbounds = inboundResp?.data?.data || inboundResp?.data || [];
      console.log(`Total inbound emails in Resend receiving: ${inbounds.length}`);
      if (Array.isArray(inbounds) && inbounds.length > 0) {
        inbounds.sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        console.log('Oldest inbound in Resend:', inbounds.slice(0, 3));
        console.log('Newest inbound in Resend:', inbounds.slice(-3));
      }
    } catch (err: any) {
      console.error('Error querying Resend receiving:', err.message);
    }
  } else {
    console.log('\nNo RESEND_API_KEY found');
  }
}

check().catch(console.error);
