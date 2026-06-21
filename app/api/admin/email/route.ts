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
    if (!buckets?.find((b: any) => b.name === 'email-attachments')) {
      await supabaseAdmin.storage.createBucket('email-attachments', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10 MB
      });
      console.log('[STORAGE] Created email-attachments bucket');
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

    console.log(`[SYNC] Found ${missingEmails.length} missing inbound emails. Syncing now...`);

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
    const emailId = url.searchParams.get('id');
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

      const { data, error } = await supabaseAdmin
        .from('email_inbox')
        .select(
          'id, email_id, thread_id, subject, from_email, from_name, to_emails, received_at, html_content, text_content, opened, clicked, attachments'
        )
        .order('received_at', { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const filteredEmails = (data || []).filter(
        (email: any) => !email.email_id?.startsWith('test-')
      );

      return NextResponse.json({
        emails: filteredEmails.map((email: any) => ({
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
          is_starred: false,
          last_event: email.opened ? 'opened' : email.clicked ? 'clicked' : 'received',
          has_attachments: !!(email.attachments && email.attachments.length > 0),
        })),
      });
    }

    // ─── Inbox detail — single email from email_inbox table ───
    if (action === 'inbox_detail' && emailId) {
      const { data, error } = await supabaseAdmin
        .from('email_inbox')
        .select('*')
        .eq('id', emailId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 });
      }

      // Fetch attachments from the new table
      const { data: attachmentsData } = await supabaseAdmin
        .from('email_attachments')
        .select('*')
        .eq('email_id', data.email_id);

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
        last_event: e.status || 'sent',
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
            reply_to: replyTo || defaultReplyTo,
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
          console.log(`[Admin Email] Email scheduled by ${adminName} for ${scheduledAt}`);
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

      const result = await resend.emails.send({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || undefined,
        text: text || undefined,
        replyTo: replyTo || defaultReplyTo,
        cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        attachments: resendAttachments,
        headers: inReplyTo
          ? {
              'In-Reply-To': inReplyTo,
              References: inReplyTo,
            }
          : undefined,
      });

      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 422 });
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

      if (result.data?.id && Array.isArray(attachments) && attachments.length > 0) {
        await ensureAttachmentBucket();
        const emailId = result.data.id;
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

      return NextResponse.json({ success: true, id: result.data?.id });
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

    if (action === 'star') {
      const { emailId } = body;
      if (!emailId) return NextResponse.json({ error: 'Missing email id' }, { status: 400 });

      const { error } = await supabaseAdmin
        .from('email_stars')
        .insert({ email_id: emailId, admin_id: admin.id });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
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
