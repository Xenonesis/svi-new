import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY environment variable');
  return new Resend(apiKey);
}

/** Guess content-type from filename extension */
function mimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mime: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    csv: 'text/csv',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    html: 'text/html',
    json: 'application/json',
  };
  return mime[ext] || 'application/octet-stream';
}

/** Ensure the email-attachments storage bucket exists */
async function ensureAttachmentBucket() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const emailBucket = buckets?.find((b: any) => b.name === 'email-attachments');
    if (!emailBucket) {
      await supabaseAdmin.storage.createBucket('email-attachments', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10 MB
      });
    } else if (!emailBucket.public) {
      await supabaseAdmin.storage.updateBucket('email-attachments', {
        public: true,
      });
    }
  } catch (err) {
    console.warn('[STORAGE] Could not ensure email-attachments bucket:', err);
  }
}

async function syncInboundEmails(resend: Resend) {
  try {
    await ensureAttachmentBucket();
    const resendEmails = await resend.emails.receiving.list();
    const emails = (resendEmails.data as any)?.data || resendEmails.data || [];
    if (emails.length === 0) return;

    const emailIds = emails.map((e: any) => e.id).filter(Boolean);
    if (emailIds.length === 0) return;

    const { data: existingRecords, error: checkError } = await supabaseAdmin
      .from('email_inbox')
      .select('email_id')
      .in('email_id', emailIds);

    if (checkError) {
      console.error('[SYNC] Error checking existing emails in database:', checkError);
      return;
    }

    const existingIds = new Set((existingRecords || []).map((r: any) => r.email_id));
    const missingEmails = emails.filter((e: any) => !existingIds.has(e.id));

    if (missingEmails.length === 0) return;

    // Process missing emails in parallel batches (concurrency = 5)
    const CONCURRENCY = 5;
    const syncEmail = async (e: any) => {
      const emailId = e.id;
      try {
        const { data: emailData, error: fetchError } = await resend.emails.receiving.get(emailId);
        if (fetchError) {
          console.error(`[SYNC] Error fetching email details for ${emailId}:`, fetchError);
          return;
        }

        const fromRaw = (emailData as any).from || '';
        let fromEmail = fromRaw;
        let fromName = '';
        const nameMatch = fromRaw.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
        if (nameMatch) {
          fromName = nameMatch[1].trim();
          fromEmail = nameMatch[2].trim();
        }

        const toEmails: string[] = [];
        const rawTo = (emailData as any).to || [];
        (Array.isArray(rawTo) ? rawTo : [rawTo]).forEach((addr: string) => {
          const m = addr.match(/<([^>]+)>/);
          toEmails.push(m ? m[1] : addr);
        });

        const rawAttachments = (emailData as any).attachments;
        const normalizedAttachments: any[] = [];
        if (rawAttachments && Array.isArray(rawAttachments) && rawAttachments.length > 0) {
          for (const att of rawAttachments) {
            const filename = att.filename || att.name || 'unnamed_attachment';
            const content_type = att.content_type || att.type || 'application/octet-stream';
            const size = att.size || null;
            const content =
              att.content && typeof att.content === 'string' && att.content.length < 5_000_000
                ? att.content
                : null;

            let url = null;
            if (content) {
              const buffer = Buffer.from(content, 'base64');
              const filePath = `${emailId}/${filename}`;
              const { error: uploadError } = await supabaseAdmin.storage
                .from('email-attachments')
                .upload(filePath, buffer, { contentType: content_type, upsert: true });

              if (!uploadError) {
                const { data: publicUrlData } = supabaseAdmin.storage
                  .from('email-attachments')
                  .getPublicUrl(filePath);
                url = publicUrlData.publicUrl;
              } else {
                console.error(
                  `[SYNC] Failed to upload attachment ${filename} for email ${emailId}:`,
                  uploadError
                );
              }
            }

            normalizedAttachments.push({
              filename,
              content_type,
              size,
              content,
              url,
            });
          }
        }

        const insertData = {
          email_id: emailId,
          thread_id: (emailData as any).thread_id || (emailData as any).message_id || emailId,
          subject: (emailData as any).subject || '(No Subject)',
          from_email: fromEmail,
          from_name: fromName || null,
          to_emails: toEmails,
          html_content: (emailData as any).html || null,
          text_content: (emailData as any).text || null,
          received_at: (emailData as any).created_at || new Date().toISOString(),
          status: 'received',
          attachments: normalizedAttachments,
        };

        const { error: insertError } = await supabaseAdmin.from('email_inbox').insert(insertData);
        if (insertError) {
          if (
            insertError.message?.includes('duplicate key') ||
            insertError.message?.includes('column "from_name" of relation') ||
            insertError.message?.includes('column "attachments" of relation')
          ) {
            const fallbackData: any = { ...insertData };
            delete fallbackData.from_name;
            delete fallbackData.attachments;
            const { error: insertError2 } = await supabaseAdmin
              .from('email_inbox')
              .insert(fallbackData);
            if (insertError2 && !insertError2.message?.includes('duplicate key')) {
              console.error(
                `[SYNC] Failed to insert email ${emailId} without from_name:`,
                insertError2
              );
            }
          } else {
            console.error(`[SYNC] Failed to insert email ${emailId}:`, insertError);
          }
        }

        if (normalizedAttachments && normalizedAttachments.length > 0) {
          const attachmentRecords = normalizedAttachments.map((att: any) => ({
            email_id: emailId,
            filename: att.filename,
            content_type: att.content_type,
            size: att.size,
            url: att.url,
          }));
          const { error: attError } = await supabaseAdmin
            .from('email_attachments')
            .insert(attachmentRecords);
          if (attError && !attError.message?.includes('duplicate key')) {
            console.error(`[SYNC] Failed to insert attachments for email ${emailId}:`, attError);
          }
        }
      } catch (err) {
        console.error(`[SYNC] Exception syncing email ${emailId}:`, err);
      }
    };

    // Parallel batches with controlled concurrency
    for (let i = 0; i < missingEmails.length; i += CONCURRENCY) {
      const batch = missingEmails.slice(i, i + CONCURRENCY);
      await Promise.allSettled(batch.map(syncEmail));
    }
  } catch (err) {
    console.error('[SYNC] Exception during inbound email sync:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const resend = getResend();
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const emailId =
      url.searchParams.get('id') ||
      url.searchParams.get('email_id') ||
      url.searchParams.get('emailId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const after = url.searchParams.get('after') || undefined;

    if (action === 'domains') {
      const domains = await resend.domains.list();
      return NextResponse.json({ domains: domains.data });
    }

    if (action === 'inbound_status') {
      // Check inbound email configuration status
      const inboundDomain = process.env.RESEND_INBOUND_DOMAIN;
      const webhookSecret = !!process.env.RESEND_WEBHOOK_SECRET;
      const webhookUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/webhooks/resend/incoming`;

      let inboundDomains: any[] = [];
      try {
        // Check if Resend has inbound domains configured
        const domainsResp: any = await resend.domains.list();
        const domainData = domainsResp?.data?.data || domainsResp?.data || [];
        if (Array.isArray(domainData)) {
          inboundDomains = domainData.filter((d: any) => d.type === 'inbound');
        }
      } catch {
        // Resend API may not support filtering yet
      }

      // How many emails received today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count, error: countError } = await supabaseAdmin
        .from('email_inbox')
        .select('*', { count: 'exact', head: true })
        .gte('received_at', todayStart.toISOString());

      const todayCount = countError ? 0 : count || 0;

      return NextResponse.json({
        configured: !!inboundDomain,
        inboundDomain: inboundDomain || null,
        webhookSecretConfigured: webhookSecret,
        webhookUrl,
        inboundDomains,
        todayCount,
      });
    }

    if (action === 'usage') {
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
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          dailyStatsMap.set(dateStr, { date: dateStr, sent: 0, delivered: 0, opened: 0 });
        }

        for (const email of allEmails) {
          sentCount++; // Count total sent/attempted

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

        return NextResponse.json({
          period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          sent: sentCount,
          delivered: deliveredCount,
          opened: openedCount,
          clicked: clickedCount,
          bounces: bouncedCount,
          spamComplaints: spamComplaintsCount,
          dailyStats,
        });
      } catch (err) {
        console.error('Error fetching usage data:', err);
        return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
      }
    }

    if (action === 'scheduled') {
      const { data, error } = await supabaseAdmin
        .from('scheduled_emails')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, emails: data });
    }

    if (action === 'email' && emailId) {
      const email = await resend.emails.get(emailId);
      const emailData = email.data as any;

      // Fetch attachments: try DB first, then fallback to Resend attachment API
      if (emailData) {
        // 1) Try our Supabase email_attachments table (uploaded during send)
        let attachments: any[] | null = null;
        const { data: dbAttachments } = await supabaseAdmin
          .from('email_attachments')
          .select('*')
          .eq('email_id', emailId);

        if (dbAttachments && dbAttachments.length > 0) {
          attachments = dbAttachments;
        }

        // 2) Fallback: fetch from Resend's attachment API (signed URLs)
        if (!attachments) {
          try {
            const attRes = await resend.emails.attachments.list({ emailId });
            const attData = attRes.data;
            if (attData?.data?.length) {
              attachments = attData.data.map((a: any) => ({
                filename: a.filename || 'attachment',
                content_type: a.content_type,
                size: a.size,
                url: a.download_url,
                expires_at: a.expires_at,
              }));
            }
          } catch (_err) {
            // Resend attachment API may not be available for older emails
          }
        }

        if (attachments) {
          emailData.attachments = attachments;
        }
      }

      return NextResponse.json({ email: emailData });
    }

    // ─── Inbox / Replies — from email_inbox table ───
    if (action === 'replies' || action === 'inbox') {
      // Sync latest emails from Resend receiving API
      await syncInboundEmails(resend);

      const filter = url.searchParams.get('filter') || 'inbox'; // inbox, unread, starred, archived, all
      const tag = url.searchParams.get('tag');
      const search = url.searchParams.get('search')?.toLowerCase().trim();

      // Fetch deleted email IDs for this admin
      const { data: deletedData } = await supabaseAdmin
        .from('email_deletions')
        .select('email_id')
        .eq('admin_id', admin.id);
      const deletedIds = new Set((deletedData || []).map((d: { email_id: string }) => d.email_id));

      // Fetch starred email IDs for this admin
      const { data: starredData } = await supabaseAdmin
        .from('email_stars')
        .select('email_id')
        .eq('admin_id', admin.id);
      const starredIds = new Set((starredData || []).map((s: { email_id: string }) => s.email_id));

      let query = supabaseAdmin
        .from('email_inbox')
        .select(
          'id, email_id, thread_id, subject, from_email, from_name, to_emails, received_at, html_content, text_content, opened, clicked, attachments, is_read, is_archived, is_starred, tags'
        )
        .order('received_at', { ascending: false });

      if (filter === 'inbox') {
        query = query.eq('is_archived', false);
      } else if (filter === 'archived') {
        query = query.eq('is_archived', true);
      } else if (filter === 'unread') {
        query = query.eq('is_archived', false).eq('is_read', false);
      }

      if (tag) {
        query = query.contains('tags', [tag]);
      }

      let { data, error } = await query.limit(limit);

      // Fallback: If is_read, is_archived, is_starred, or tags columns don't exist yet in Supabase
      if (
        error &&
        (error.message?.includes('column') ||
          error.code === '42703' ||
          error.message?.includes('does not exist'))
      ) {
        const fallbackRes = await supabaseAdmin
          .from('email_inbox')
          .select(
            'id, email_id, thread_id, subject, from_email, from_name, to_emails, received_at, html_content, text_content, opened, clicked, attachments'
          )
          .order('received_at', { ascending: false })
          .limit(limit);

        if (!fallbackRes.error) {
          data = (fallbackRes.data || []).map((row: Record<string, unknown>) => ({
            ...row,
            is_read: false,
            is_archived: false,
            is_starred: false,
            tags: [],
          })) as unknown as typeof data;
          error = null;
        }
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      interface InboxRow {
        id: string;
        email_id: string;
        thread_id?: string;
        subject: string;
        from_email: string;
        from_name?: string | null;
        to_emails?: string[];
        received_at: string;
        html_content?: string;
        text_content?: string;
        opened?: boolean;
        clicked?: boolean;
        attachments?: unknown[];
        is_read?: boolean;
        is_archived?: boolean;
        is_starred?: boolean;
        tags?: string[];
      }

      let emailList = ((data as unknown as InboxRow[]) || []).filter(
        (email) =>
          !email.email_id?.startsWith('test-') &&
          !deletedIds.has(email.id) &&
          !deletedIds.has(email.email_id)
      );
      // Apply view filters in memory if database query did not apply them
      if (filter === 'archived') {
        emailList = emailList.filter((email) => Boolean(email.is_archived));
      } else if (filter === 'unread') {
        emailList = emailList.filter((email) => !email.is_archived && !email.is_read);
      } else if (filter === 'inbox') {
        emailList = emailList.filter((email) => !email.is_archived);
      } else if (filter === 'starred') {
        emailList = emailList.filter(
          (email) =>
            email.is_starred ||
            starredIds.has(email.id) ||
            (email.email_id && starredIds.has(email.email_id))
        );
      }

      if (tag) {
        emailList = emailList.filter(
          (email) => Array.isArray(email.tags) && email.tags.includes(tag)
        );
      }
      // Filter by search query if provided
      if (search) {
        emailList = emailList.filter((e) => {
          return (
            e.subject?.toLowerCase().includes(search) ||
            e.from_email?.toLowerCase().includes(search) ||
            e.from_name?.toLowerCase().includes(search) ||
            e.text_content?.toLowerCase().includes(search)
          );
        });
      }

      const mappedEmails = emailList.map((email) => {
        const isStarred = Boolean(
          email.is_starred ||
          starredIds.has(email.id) ||
          (email.email_id && starredIds.has(email.email_id))
        );
        const isRead = Boolean(email.is_read);
        const isArchived = Boolean(email.is_archived);
        const tags = Array.isArray(email.tags) ? email.tags : [];

        return {
          id: email.id,
          email_id: email.email_id,
          thread_id: email.thread_id || email.email_id,
          subject: email.subject,
          from: email.from_email,
          from_email: email.from_email,
          from_name: email.from_name || null,
          to: email.to_emails || [],
          created_at: email.received_at,
          snippet:
            email.text_content ||
            email.html_content?.replace(/<[^>]+>/g, '').substring(0, 100) ||
            '',
          html: email.html_content,
          text: email.text_content,
          is_starred: isStarred,
          is_read: isRead,
          is_archived: isArchived,
          tags,
          last_event: email.opened ? 'opened' : email.clicked ? 'clicked' : 'received',
          has_attachments: Boolean(email.attachments && email.attachments.length > 0),
        };
      });

      const unreadCount = mappedEmails.filter((e) => !e.is_read && !e.is_archived).length;

      return NextResponse.json({
        emails: mappedEmails,
        unreadCount,
        totalCount: mappedEmails.length,
      });
    }

    // ─── Inbox detail — single email from email_inbox table ───
    if (action === 'inbox_detail' && emailId) {
      const autoMarkRead = url.searchParams.get('mark_read') !== 'false';

      const { data, error } = await supabaseAdmin
        .from('email_inbox')
        .select('*')
        .or(`id.eq.${emailId},email_id.eq.${emailId}`)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 });
      }

      // Auto mark as read if requested and currently unread
      if (autoMarkRead && data.is_read === false) {
        try {
          await supabaseAdmin.from('email_inbox').update({ is_read: true }).eq('id', data.id);
        } catch {
          // Non-fatal if column doesn't exist
        }
        data.is_read = true;
      }

      // Fetch attachments from the new table
      const { data: attachmentsData } = await supabaseAdmin
        .from('email_attachments')
        .select('*')
        .eq('email_id', data.email_id);

      // Check starred status for this admin
      const { data: starRecord } = await supabaseAdmin
        .from('email_stars')
        .select('id')
        .eq('admin_id', admin.id)
        .or(`email_id.eq.${data.id},email_id.eq.${data.email_id}`)
        .maybeSingle();

      const isStarred = Boolean(data.is_starred || starRecord);

      return NextResponse.json({
        email: {
          id: data.id,
          email_id: data.email_id,
          thread_id: data.thread_id,
          subject: data.subject,
          from: data.from_email,
          from_email: data.from_email,
          from_name: data.from_name || null,
          to: data.to_emails || [],
          created_at: data.received_at,
          html: data.html_content,
          text: data.text_content,
          opened: data.opened,
          clicked: data.clicked,
          is_read: Boolean(data.is_read),
          is_archived: Boolean(data.is_archived),
          is_starred: isStarred,
          tags: Array.isArray(data.tags) ? data.tags : [],
          attachments:
            attachmentsData && attachmentsData.length > 0
              ? attachmentsData
              : data.attachments || undefined,
        },
      });
    }

    // ─── For Sent tab — fetch from Resend API ───
    const emails = await resend.emails.list({ limit, after });
    const responseData = emails.data as any;

    // Fetch deleted email IDs for this admin
    const { data: deletedData } = await supabaseAdmin
      .from('email_deletions')
      .select('email_id')
      .eq('admin_id', admin.id);
    const deletedIds = new Set((deletedData || []).map((d: { email_id: string }) => d.email_id));

    // Filter out deleted emails and map to include last_event
    const filteredEmails = (responseData?.data || [])
      .filter((e: any) => !deletedIds.has(e.id))
      .map((e: any) => ({
        id: e.id,
        object: e.object,
        created_at: e.created_at,
        subject: e.subject,
        from: e.from,
        to: e.to,
        last_event: e.last_event || e.status || 'sent',
      }));

    return NextResponse.json({
      emails: filteredEmails,
      hasMore: responseData?.has_more ?? false,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/admin/email - Send an email via Resend
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const resend = getResend();
    const body = await request.json();
    const { action } = body;

    if (action === 'send') {
      const {
        to,
        subject,
        html,
        from,
        replyTo,
        cc,
        bcc,
        text,
        attachments,
        inReplyTo,
        scheduledAt,
      } = body;

      if (!to || !subject || (!html && !text)) {
        return NextResponse.json(
          { error: 'Missing required fields: to, subject, html/text' },
          { status: 400 }
        );
      }

      let defaultReplyTo = 'info@sviiinfrasolutions.com, hr.sviinfrasolutions@gmail.com';
      try {
        const { data: settingsData } = await supabaseAdmin
          .from('portal_settings' as any)
          .select('value')
          .eq('key', 'email_settings')
          .single();
        if (settingsData?.value?.admin_email) {
          defaultReplyTo = `info@sviiinfrasolutions.com, ${settingsData.value.admin_email}`;
        }
      } catch (err) {
        // ignore
      }

      const fromAddress = from || 'SVI Infra <noreply@sviiinfrasolutions.com>';

      // If scheduledAt is provided, queue it in the database instead of sending immediately
      if (scheduledAt) {
        // Insert into scheduled_emails
        const { data: scheduledRecord, error: scheduleError } = await supabaseAdmin
          .from('scheduled_emails')
          .insert({
            to_emails: Array.isArray(to) ? to : [to],
            cc_emails: cc ? (Array.isArray(cc) ? cc : [cc]) : null,
            bcc_emails: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : null,
            subject,
            html_body: html || text || '', // Fallback to text
            reply_to: Array.isArray(replyTo) ? replyTo.join(', ') : replyTo || defaultReplyTo,
            in_reply_to: inReplyTo || null,
            scheduled_at: scheduledAt,
            status: 'pending',
            metadata: {
              from: fromAddress,
              has_attachments: Array.isArray(attachments) && attachments.length > 0,
            },
          })
          .select('id')
          .single();

        if (scheduleError || !scheduledRecord) {
          console.error('Error scheduling email:', scheduleError);
          return NextResponse.json({ error: 'Failed to schedule email' }, { status: 500 });
        }

        const emailId = scheduledRecord.id;

        // Handle attachments for scheduled emails
        if (Array.isArray(attachments) && attachments.length > 0) {
          await ensureAttachmentBucket();
          for (const att of attachments) {
            const buffer = Buffer.from(att.content, 'base64');
            const filePath = `${emailId}/${att.filename}`;
            let url = null;

            const { error: uploadError } = await supabaseAdmin.storage
              .from('email-attachments')
              .upload(filePath, buffer, {
                contentType: mimeFromFilename(att.filename),
                upsert: true,
              });

            if (!uploadError) {
              const { data: publicUrlData } = supabaseAdmin.storage
                .from('email-attachments')
                .getPublicUrl(filePath);
              url = publicUrlData.publicUrl;
            } else {
              console.error(
                `Failed to upload scheduled attachment ${att.filename} for email ${emailId}:`,
                uploadError
              );
            }

            const { error: attInsertError } = await supabaseAdmin.from('email_attachments').insert({
              email_id: emailId,
              filename: att.filename,
              content_type: mimeFromFilename(att.filename),
              size: att.size || buffer.length,
              url: url,
            });

            if (attInsertError) {
              console.error(
                `Failed to insert scheduled attachment record for ${att.filename}:`,
                attInsertError
              );
            }
          }
        }

        // Optional notification logging
        try {
          const { data: profileData } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', admin.id)
            .single();
          const adminName = profileData?.full_name || admin.email || 'Admin';
        } catch (notifErr) {
          // ignore
        }

        return NextResponse.json({ success: true, id: emailId, scheduled: true });
      }

      // Build attachments array for Resend API (Immediate Send)
      const resendAttachments =
        Array.isArray(attachments) && attachments.length > 0
          ? attachments.map((att: { filename: string; content: string }) => ({
              filename: att.filename,
              content: att.content, // base64 string (no data: prefix)
            }))
          : undefined;

      // Parse replyTo: may be comma-separated string, normalize to array
      const parseReplyTo = (val: string | undefined | null): string[] | undefined => {
        if (!val) return undefined;
        const parts = val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        return parts.length > 0 ? parts : undefined;
      };

      const normalizedReplyTo = parseReplyTo(replyTo) || parseReplyTo(defaultReplyTo);

      // Resend limits `to`/`cc`/`bcc` to 50 items each — batch if needed
      const MAX_RESEND_RECIPIENTS = 50;
      const toList = Array.isArray(to) ? to : [to];
      const ccList = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
      const bccList = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];

      // Build the base send params (shared across batches)
      const baseSendParams = {
        from: fromAddress,
        subject,
        html: html || undefined,
        text: text || undefined,
        replyTo: normalizedReplyTo,
        attachments: resendAttachments,
        headers: inReplyTo ? { 'In-Reply-To': inReplyTo, References: inReplyTo } : undefined,
      };

      const batchCount = Math.max(
        Math.ceil(toList.length / MAX_RESEND_RECIPIENTS),
        Math.ceil(ccList.length / MAX_RESEND_RECIPIENTS),
        Math.ceil(bccList.length / MAX_RESEND_RECIPIENTS),
        1
      );

      const results = [];
      for (let i = 0; i < batchCount; i++) {
        const toChunk = toList.slice(i * MAX_RESEND_RECIPIENTS, (i + 1) * MAX_RESEND_RECIPIENTS);
        const ccChunk = ccList.slice(i * MAX_RESEND_RECIPIENTS, (i + 1) * MAX_RESEND_RECIPIENTS);
        const bccChunk = bccList.slice(i * MAX_RESEND_RECIPIENTS, (i + 1) * MAX_RESEND_RECIPIENTS);

        if (toChunk.length === 0 && ccChunk.length === 0 && bccChunk.length === 0) break;

        const { data: batchResult, error: batchError } = await resend.emails.send({
          ...baseSendParams,
          to: toChunk,
          cc: ccChunk.length > 0 ? ccChunk : undefined,
          bcc: bccChunk.length > 0 ? bccChunk : undefined,
        });

        if (batchError) {
          results.push({ error: batchError.message, batch: i });
        } else {
          results.push({ id: batchResult?.id, batch: i });
        }
      }

      const errors = results.filter((r) => r.error);
      if (errors.length > 0 && errors.length === results.length) {
        return NextResponse.json(
          { error: `All batches failed. First error: ${errors[0].error}` },
          { status: 422 }
        );
      }

      try {
        const { data: profileData } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', admin.id)
          .single();
        const adminName = profileData?.full_name || admin.email || 'Admin';
        await NotificationHelper.emailSent(Array.isArray(to) ? to[0] : to, subject, adminName);
      } catch (notifErr) {
        console.error('Failed to create email sent notification:', notifErr);
      }

      // Attach files to first successful batch's Resend ID
      const firstSuccessId = results.find((r) => r.id)?.id;
      if (firstSuccessId && Array.isArray(attachments) && attachments.length > 0) {
        await ensureAttachmentBucket();
        const emailId = firstSuccessId;
        for (const att of attachments) {
          const buffer = Buffer.from(att.content, 'base64');
          const filePath = `${emailId}/${att.filename}`;
          let url = null;

          const { error: uploadError } = await supabaseAdmin.storage
            .from('email-attachments')
            .upload(filePath, buffer, {
              contentType: mimeFromFilename(att.filename),
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from('email-attachments')
              .getPublicUrl(filePath);
            url = publicUrlData.publicUrl;
          } else {
            console.error(
              `Failed to upload outbound attachment ${att.filename} for email ${emailId}:`,
              uploadError
            );
          }

          const { error: attInsertError } = await supabaseAdmin.from('email_attachments').insert({
            email_id: emailId,
            filename: att.filename,
            content_type: mimeFromFilename(att.filename),
            size: att.size || buffer.length,
            url: url,
          });

          if (attInsertError) {
            console.error(
              `Failed to insert outbound attachment record for ${att.filename}:`,
              attInsertError
            );
          }
        }
      }

      return NextResponse.json({
        success: true,
        id: firstSuccessId,
        batches: results.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    if (action === 'cancel') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Missing email id' }, { status: 400 });
      const result = await resend.emails.cancel(id);
      return NextResponse.json({ success: true, data: result.data });
    }

    if (action === 'cancel_scheduled') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Missing scheduled email id' }, { status: 400 });

      const { error } = await supabaseAdmin
        .from('scheduled_emails')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }
    // ─── 1-Click Retry / Resend Sent or Failed Email ───
    if (action === 'retry_send') {
      const { emailId, customRecipient, subject: customSubject, html: customHtml } = body;
      if (!emailId) {
        return NextResponse.json({ error: 'Missing emailId' }, { status: 400 });
      }

      let toRecipients: string[] = [];
      let sendSubject = customSubject || '';
      let sendHtml = customHtml || '';
      let sendText: string | undefined = undefined;
      let fromAddress =
        process.env.RESEND_FROM_EMAIL || 'SVI Infra Solutions <info@sviinfrasolutions.com>';
      const resendAttachments: Array<{ filename: string; content?: Buffer; path?: string }> = [];

      try {
        const original = await resend.emails.get(emailId);
        const emailData = original.data as {
          from?: string;
          to?: string[];
          subject?: string;
          html?: string;
          text?: string;
        } | null;

        if (emailData) {
          toRecipients = customRecipient ? [customRecipient] : emailData.to || [];
          sendSubject = customSubject || emailData.subject || 'Retry: (no subject)';
          sendHtml =
            customHtml || emailData.html || (emailData.text ? `<p>${emailData.text}</p>` : '');
          sendText = emailData.text;
          if (emailData.from) fromAddress = emailData.from;
        }
      } catch (fetchErr) {
        console.error('[RETRY] Could not fetch from Resend, checking scheduled_emails:', fetchErr);
      }

      // If not found in Resend, check scheduled_emails
      if (toRecipients.length === 0) {
        const { data: schedData } = await supabaseAdmin
          .from('scheduled_emails')
          .select('*')
          .eq('id', emailId)
          .maybeSingle();

        if (schedData) {
          toRecipients = customRecipient ? [customRecipient] : schedData.to_emails || [];
          sendSubject = customSubject || schedData.subject || '';
          sendHtml = customHtml || schedData.html_body || '';
          if (schedData.metadata?.from) fromAddress = schedData.metadata.from;
        }
      }

      if (toRecipients.length === 0) {
        return NextResponse.json(
          { error: 'Could not determine recipients for retry' },
          { status: 400 }
        );
      }

      // Fetch attachments from email_attachments table if available
      const { data: attachmentsData } = await supabaseAdmin
        .from('email_attachments')
        .select('*')
        .eq('email_id', emailId);

      interface DbAttachment {
        filename: string;
        url?: string | null;
      }

      if (attachmentsData && attachmentsData.length > 0) {
        for (const att of attachmentsData as unknown as DbAttachment[]) {
          if (att.url) {
            resendAttachments.push({
              filename: att.filename,
              path: att.url,
            });
          }
        }
      }

      // Send email via Resend
      const { data: sendResult, error: sendError } = await resend.emails.send({
        from: fromAddress,
        to: toRecipients,
        subject: sendSubject,
        html: sendHtml || undefined,
        text: sendText || undefined,
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
      });

      if (sendError) {
        return NextResponse.json({ error: `Retry failed: ${sendError.message}` }, { status: 422 });
      }

      // If retrying from scheduled_emails, update its status to 'sent'
      await supabaseAdmin
        .from('scheduled_emails')
        .update({ status: 'sent', updated_at: new Date().toISOString() })
        .eq('id', emailId);

      return NextResponse.json({
        success: true,
        newEmailId: sendResult?.id,
        message: 'Email resent successfully',
      });
    }

    // ─── 1-Click Retry Failed Scheduled Email ───
    if (action === 'retry_scheduled') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Missing scheduled email id' }, { status: 400 });

      const { data: email, error: fetchErr } = await supabaseAdmin
        .from('scheduled_emails')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !email) {
        return NextResponse.json({ error: 'Scheduled email not found' }, { status: 404 });
      }

      // Fetch attachments
      const { data: attachmentsData } = await supabaseAdmin
        .from('email_attachments')
        .select('*')
        .eq('email_id', email.id);

      interface DbAttachment {
        filename: string;
        url?: string | null;
      }

      const resendAttachments: Array<{ filename: string; path?: string; content?: Buffer }> = [];
      if (attachmentsData && attachmentsData.length > 0) {
        for (const att of attachmentsData as unknown as DbAttachment[]) {
          if (att.url) {
            resendAttachments.push({ filename: att.filename, path: att.url });
          }
        }
      }

      const fromAddress =
        email.metadata?.from ||
        process.env.RESEND_FROM_EMAIL ||
        'SVI Infra Solutions <info@sviinfrasolutions.com>';

      const { data: result, error: sendError } = await resend.emails.send({
        from: fromAddress,
        to: email.to_emails,
        cc: email.cc_emails?.length ? email.cc_emails : undefined,
        bcc: email.bcc_emails?.length ? email.bcc_emails : undefined,
        subject: email.subject,
        html: email.html_body,
        replyTo: email.reply_to || undefined,
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
      });

      if (sendError) {
        await supabaseAdmin.from('scheduled_emails').update({ status: 'failed' }).eq('id', id);
        return NextResponse.json(
          { error: `Retry send failed: ${sendError.message}` },
          { status: 422 }
        );
      }

      await supabaseAdmin
        .from('scheduled_emails')
        .update({ status: 'sent', updated_at: new Date().toISOString() })
        .eq('id', id);

      return NextResponse.json({
        success: true,
        newEmailId: result?.id,
        message: 'Scheduled email sent successfully',
      });
    }

    // ─── Bulk Retry Failed Emails ───
    if (action === 'bulk_retry_failed') {
      const { emailIds } = body;
      if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
        return NextResponse.json({ error: 'Missing emailIds array' }, { status: 400 });
      }

      const results = [];
      for (const id of emailIds) {
        try {
          // Try scheduled first
          const { data: schedData } = await supabaseAdmin
            .from('scheduled_emails')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (schedData) {
            const fromAddress =
              schedData.metadata?.from ||
              process.env.RESEND_FROM_EMAIL ||
              'SVI Infra Solutions <info@sviinfrasolutions.com>';
            const { data: resendRes, error: sendErr } = await resend.emails.send({
              from: fromAddress,
              to: schedData.to_emails,
              subject: schedData.subject,
              html: schedData.html_body,
            });
            if (sendErr) {
              results.push({ id, success: false, error: sendErr.message });
            } else {
              await supabaseAdmin.from('scheduled_emails').update({ status: 'sent' }).eq('id', id);
              results.push({ id, success: true, newEmailId: resendRes?.id });
            }
          } else {
            // Resend get & retry
            const original = await resend.emails.get(id);
            const emailData = original.data as {
              from?: string;
              to?: string[];
              subject?: string;
              html?: string;
              text?: string;
            } | null;
            if (emailData && emailData.to?.length) {
              const { data: resendRes, error: sendErr } = await resend.emails.send({
                from: emailData.from || 'SVI Infra Solutions <info@sviinfrasolutions.com>',
                to: emailData.to,
                subject: emailData.subject || '(no subject)',
                html: emailData.html || (emailData.text ? `<p>${emailData.text}</p>` : ''),
              });
              if (sendErr) {
                results.push({ id, success: false, error: sendErr.message });
              } else {
                results.push({ id, success: true, newEmailId: resendRes?.id });
              }
            } else {
              results.push({ id, success: false, error: 'Email details not found' });
            }
          }
        } catch (err: unknown) {
          results.push({ id, success: false, error: (err as Error).message });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      return NextResponse.json({
        success: true,
        retried: results.length,
        successful: successCount,
        results,
      });
    }

    // ─── Mark Read / Unread ───
    if (action === 'mark_read' || action === 'mark_unread') {
      const isRead =
        action === 'mark_read' ? (body.isRead !== undefined ? Boolean(body.isRead) : true) : false;
      const { emailIds } = body;

      if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
        return NextResponse.json({ error: 'Missing emailIds array' }, { status: 400 });
      }

      const idFilter = emailIds.join(',');
      const { error } = await supabaseAdmin
        .from('email_inbox')
        .update({ is_read: isRead })
        .or(`id.in.(${idFilter}),email_id.in.(${idFilter})`);

      if (error) {
        if (
          error.message?.includes('column') ||
          error.code === '42703' ||
          error.message?.includes('does not exist')
        ) {
          return NextResponse.json({
            success: true,
            is_read: isRead,
            count: emailIds.length,
            pending_migration: true,
          });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, is_read: isRead, count: emailIds.length });
    }

    // ─── Mark All as Read ───
    if (action === 'mark_all_read') {
      const { error } = await supabaseAdmin
        .from('email_inbox')
        .update({ is_read: true })
        .eq('is_archived', false);

      if (error) {
        if (
          error.message?.includes('column') ||
          error.code === '42703' ||
          error.message?.includes('does not exist')
        ) {
          return NextResponse.json({ success: true, message: 'All inbox emails marked as read' });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'All inbox emails marked as read' });
    }

    // ─── Archive / Unarchive ───
    if (action === 'archive' || action === 'unarchive') {
      const isArchived =
        action === 'archive'
          ? body.isArchived !== undefined
            ? Boolean(body.isArchived)
            : true
          : false;
      const { emailIds } = body;

      if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
        return NextResponse.json({ error: 'Missing emailIds array' }, { status: 400 });
      }

      const idFilter = emailIds.join(',');
      const { error } = await supabaseAdmin
        .from('email_inbox')
        .update({ is_archived: isArchived })
        .or(`id.in.(${idFilter}),email_id.in.(${idFilter})`);

      if (error) {
        if (
          error.message?.includes('column') ||
          error.code === '42703' ||
          error.message?.includes('does not exist')
        ) {
          return NextResponse.json({
            success: true,
            is_archived: isArchived,
            count: emailIds.length,
            pending_migration: true,
          });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, is_archived: isArchived, count: emailIds.length });
    }

    // ─── Apply Tags ───
    if (action === 'apply_tags') {
      const { emailIds, tags, mode = 'set' } = body; // mode: 'add' | 'remove' | 'set'
      if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
        return NextResponse.json({ error: 'Missing emailIds array' }, { status: 400 });
      }

      const idFilter = emailIds.join(',');
      const cleanTags = Array.isArray(tags)
        ? tags.map((t: unknown) => String(t).trim()).filter(Boolean)
        : [];

      if (mode === 'set') {
        const { error } = await supabaseAdmin
          .from('email_inbox')
          .update({ tags: cleanTags })
          .or(`id.in.(${idFilter}),email_id.in.(${idFilter})`);

        if (error) {
          if (
            error.message?.includes('column') ||
            error.code === '42703' ||
            error.message?.includes('does not exist')
          ) {
            return NextResponse.json({
              success: true,
              count: emailIds.length,
              pending_migration: true,
            });
          }
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      } else {
        const { data: items, error: fetchErr } = await supabaseAdmin
          .from('email_inbox')
          .select('id, email_id, tags')
          .or(`id.in.(${idFilter}),email_id.in.(${idFilter})`);

        if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 400 });

        interface InboxTagItem {
          id: string;
          email_id: string;
          tags?: string[];
        }

        for (const item of (items as unknown as InboxTagItem[]) || []) {
          const currentTags: string[] = Array.isArray(item.tags) ? item.tags : [];
          let updatedTags: string[];
          if (mode === 'add') {
            const set = new Set([...currentTags, ...cleanTags]);
            updatedTags = Array.from(set);
          } else {
            const removeSet = new Set(cleanTags);
            updatedTags = currentTags.filter((t) => !removeSet.has(t));
          }

          await supabaseAdmin.from('email_inbox').update({ tags: updatedTags }).eq('id', item.id);
        }
      }

      return NextResponse.json({ success: true, count: emailIds.length });
    }

    // ─── Bulk Star / Unstar ───
    if (action === 'bulk_star' || action === 'bulk_unstar') {
      const isStarred =
        action === 'bulk_star'
          ? body.isStarred !== undefined
            ? Boolean(body.isStarred)
            : true
          : false;
      const { emailIds } = body;

      if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
        return NextResponse.json({ error: 'Missing emailIds array' }, { status: 400 });
      }

      const idFilter = emailIds.join(',');
      try {
        await supabaseAdmin
          .from('email_inbox')
          .update({ is_starred: isStarred })
          .or(`id.in.(${idFilter}),email_id.in.(${idFilter})`);
      } catch {
        // Non-fatal if column missing
      }
      if (isStarred) {
        await supabaseAdmin.from('email_stars').upsert(
          emailIds.map((emailId: string) => ({
            email_id: emailId,
            admin_id: admin.id,
          })),
          { onConflict: 'email_id,admin_id' }
        );
      } else {
        await supabaseAdmin
          .from('email_stars')
          .delete()
          .eq('admin_id', admin.id)
          .in('email_id', emailIds);
      }

      return NextResponse.json({ success: true, is_starred: isStarred, count: emailIds.length });
    }

    if (action === 'star') {
      const { emailId } = body;
      if (!emailId) return NextResponse.json({ error: 'Missing email id' }, { status: 400 });

      const { error } = await supabaseAdmin
        .from('email_stars')
        .insert({ email_id: emailId, admin_id: admin.id });

      if (error && !error.message?.includes('duplicate key')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Update email_inbox table flag as well (non-fatal if column missing)
      try {
        await supabaseAdmin
          .from('email_inbox')
          .update({ is_starred: true })
          .or(`id.eq.${emailId},email_id.eq.${emailId}`);
      } catch {
        // Non-fatal
      }
      return NextResponse.json({ success: true, starred: true });
    }

    if (action === 'unstar') {
      const { emailId } = body;
      if (!emailId) return NextResponse.json({ error: 'Missing email id' }, { status: 400 });

      const { error } = await supabaseAdmin
        .from('email_stars')
        .delete()
        .eq('email_id', emailId)
        .eq('admin_id', admin.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Update email_inbox table flag as well (non-fatal if column missing)
      try {
        await supabaseAdmin
          .from('email_inbox')
          .update({ is_starred: false })
          .or(`id.eq.${emailId},email_id.eq.${emailId}`);
      } catch {
        // Non-fatal
      }
      return NextResponse.json({ success: true, starred: false });
    }

    if (action === 'get_starred') {
      const { data, error } = await supabaseAdmin
        .from('email_stars')
        .select('email_id')
        .eq('admin_id', admin.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      const starredIds = new Set((data || []).map((d: { email_id: string }) => d.email_id));
      return NextResponse.json({ success: true, starredIds });
    }

    // ─── Get Deleted IDs (for Sent tab filtering) ───
    if (action === 'get_deleted') {
      const { data, error } = await supabaseAdmin
        .from('email_deletions')
        .select('email_id')
        .eq('admin_id', admin.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      const deletedIds = new Set((data || []).map((d: { email_id: string }) => d.email_id));
      return NextResponse.json({ success: true, deletedIds });
    }

    // ─── Get Deleted List (for Recycle Bin) ───
    if (action === 'get_deleted_list') {
      const { data, error } = await supabaseAdmin
        .from('email_deletions')
        .select('*')
        .eq('admin_id', admin.id)
        .order('deleted_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const deleted = (data || []).map((d: any) => ({
        id: d.email_id,
        email_id: d.email_id,
        subject: d.email_data?.subject || '(unknown)',
        from: d.email_data?.from || '',
        to: d.email_data?.to || [],
        created_at: d.email_data?.created_at || d.deleted_at,
        last_event: d.email_data?.last_event || 'deleted',
        deleted_at: d.deleted_at,
      }));

      return NextResponse.json({ success: true, emails: deleted });
    }

    // ─── Bulk Delete (with optional email data for recycle bin) ───
    if (action === 'delete_emails') {
      const { emailIds, emails } = body;
      if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
        return NextResponse.json({ error: 'Missing emailIds array' }, { status: 400 });
      }

      // Build a lookup of email data by ID if provided
      const emailDataMap = new Map<string, any>();
      if (Array.isArray(emails)) {
        emails.forEach((e: any) => {
          if (e.id) emailDataMap.set(e.id, e);
        });
      }

      const { error } = await supabaseAdmin.from('email_deletions').insert(
        emailIds.map((emailId: string) => ({
          email_id: emailId,
          admin_id: admin.id,
          email_data: emailDataMap.get(emailId) || null,
        }))
      );

      if (error) {
        if (!error.message?.includes('duplicate key')) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }

      // ── Notification ──
      const deletedSubjects = Array.isArray(emails)
        ? emails.map((e: any) => e.subject || '(no subject)').filter(Boolean)
        : [];
      if (emailIds.length > 0) {
        try {
          const { data: profileData } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', admin.id)
            .single();
          const adminName = profileData?.full_name || admin.email || 'Admin';
          await NotificationHelper.emailDeleted(emailIds.length, deletedSubjects, adminName);
        } catch (notifErr) {
          console.error('Failed to create delete notification:', notifErr);
        }
      }

      return NextResponse.json({ success: true, deleted: emailIds.length });
    }

    // ─── Restore (Undelete) ───
    if (action === 'restore_emails') {
      const { emailIds } = body;
      if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
        return NextResponse.json({ error: 'Missing emailIds array' }, { status: 400 });
      }

      // Fetch subjects before deleting for the notification
      let restoredSubjects: string[] = [];
      try {
        const { data: restoreData } = await supabaseAdmin
          .from('email_deletions')
          .select('email_data')
          .eq('admin_id', admin.id)
          .in('email_id', emailIds);
        restoredSubjects = (restoreData || [])
          .map((d: any) => d.email_data?.subject || '(no subject)')
          .filter(Boolean);
      } catch {
        // Non-critical
      }

      const { error } = await supabaseAdmin
        .from('email_deletions')
        .delete()
        .eq('admin_id', admin.id)
        .in('email_id', emailIds);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // ── Notification ──
      try {
        const { data: profileData } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', admin.id)
          .single();
        const adminName = profileData?.full_name || admin.email || 'Admin';
        await NotificationHelper.emailRestored(emailIds.length, restoredSubjects, adminName);
      } catch (notifErr) {
        console.error('Failed to create restore notification:', notifErr);
      }

      return NextResponse.json({ success: true, restored: emailIds.length });
    }

    // ─── Permanently Delete (remove from Recycle Bin) ───
    if (action === 'permanently_delete') {
      const { emailIds, all } = body;

      // Fetch subjects before deleting for the notification
      let permDeletedCount = 0;
      let permDeletedSubjects: string[] = [];
      try {
        let fetchQuery = supabaseAdmin
          .from('email_deletions')
          .select('email_data')
          .eq('admin_id', admin.id);
        if (!all && Array.isArray(emailIds) && emailIds.length > 0) {
          fetchQuery = fetchQuery.in('email_id', emailIds);
        }
        const { data: permData, count: permCount } = await fetchQuery;
        permDeletedCount = permCount ?? 0;
        permDeletedSubjects = (permData || [])
          .map((d: any) => d.email_data?.subject || '(no subject)')
          .filter(Boolean);
      } catch {
        // Non-critical
      }

      let query = supabaseAdmin.from('email_deletions').delete().eq('admin_id', admin.id);

      if (all) {
        // Delete ALL records for this admin
      } else if (Array.isArray(emailIds) && emailIds.length > 0) {
        query = query.in('email_id', emailIds);
      } else {
        return NextResponse.json({ error: 'Missing emailIds or all flag' }, { status: 400 });
      }

      const { error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // ── Notification ──
      if (permDeletedCount > 0) {
        try {
          const { data: profileData } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', admin.id)
            .single();
          const adminName = profileData?.full_name || admin.email || 'Admin';
          await NotificationHelper.emailPermanentlyDeleted(
            permDeletedCount,
            permDeletedSubjects,
            adminName
          );
        } catch (notifErr) {
          console.error('Failed to create permanent delete notification:', notifErr);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return handleApiError(err);
  }
}
