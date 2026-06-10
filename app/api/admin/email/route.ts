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

async function syncInboundEmails(resend: Resend) {
  try {
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

    for (const e of missingEmails) {
      const emailId = e.id;
      try {
        const { data: emailData, error: fetchError } = await resend.emails.receiving.get(emailId);
        if (fetchError) {
          console.error(`[SYNC] Error fetching email details for ${emailId}:`, fetchError);
          continue;
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
        const normalizedAttachments =
          rawAttachments && Array.isArray(rawAttachments) && rawAttachments.length > 0
            ? rawAttachments.map((att: any) => ({
                filename: att.filename || att.name || null,
                content_type: att.content_type || att.type || null,
                size: att.size || null,
                content:
                  att.content &&
                  typeof att.content === 'string' &&
                  att.content.length < 5_000_000
                    ? att.content
                    : null,
              }))
            : null;

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
            // Fallback for missing columns (from_name, attachments) in older schema
            const fallbackData: any = { ...insertData };
            delete fallbackData.from_name;
            delete fallbackData.attachments;
            const { error: insertError2 } = await supabaseAdmin.from('email_inbox').insert(fallbackData);
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
      } catch (err) {
        console.error(`[SYNC] Exception syncing email ${emailId}:`, err);
      }
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

    if (action === 'email' && emailId) {
      const email = await resend.emails.get(emailId);
      return NextResponse.json({ email: email.data });
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
          attachments: data.attachments || undefined,
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
      const { to, subject, html, from, replyTo, cc, bcc, text, attachments, inReplyTo } = body;

      if (!to || !subject || (!html && !text)) {
        return NextResponse.json(
          { error: 'Missing required fields: to, subject, html/text' },
          { status: 400 }
        );
      }

      const fromAddress = from || 'SVI Infra <noreply@sviiinfrasolutions.com>';

      // Build attachments array for Resend API
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
        replyTo: replyTo || undefined,
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

      return NextResponse.json({ success: true, id: result.data?.id });
    }

    if (action === 'cancel') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Missing email id' }, { status: 400 });
      const result = await resend.emails.cancel(id);
      return NextResponse.json({ success: true, data: result.data });
    }

    if (action === 'star') {
      const { emailId } = body;
      if (!emailId) return NextResponse.json({ error: 'Missing email id' }, { status: 400 });

      const { data, error } = await supabaseAdmin
        .from('email_stars')
        .insert({ email_id: emailId, admin_id: admin.id })
        .select();

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
