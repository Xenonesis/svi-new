import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { getResend } from '../syncRunner';
import { syncInboundEmails } from '../syncRunner';
import { AppError } from '@/src/lib/api/errors';
import type { AdminActor } from '@/src/server/http/auth';

export async function getInbox(ctx: { actor: AdminActor }) {
  // Triggers sync — preserved from original behavior to keep inbox contents up to date.
  await syncInboundEmails();

  const { data, error } = await supabaseAdmin
    .from('email_inbox')
    .select(
      'id, email_id, thread_id, subject, from_email, from_name, to_emails, received_at, html_content, text_content, opened, clicked, attachments'
    )
    .order('received_at', { ascending: false })
    .limit(50);

  if (error) {
    throw AppError.badRequest(error.message);
  }

  const filteredEmails = (data || []).filter((email: any) => !email.email_id?.startsWith('test-'));

  return {
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
        email.text_content || email.html_content?.replace(/<[^>]+>/g, '').substring(0, 100) || '',
      html: email.html_content,
      text: email.text_content,
      is_starred: false,
      last_event: email.opened ? 'opened' : email.clicked ? 'clicked' : 'received',
      has_attachments: !!(email.attachments && email.attachments.length > 0),
    })),
  };
}

export async function getInboxDetail(_ctx: { actor: AdminActor }, emailId: string) {
  const { data, error } = await supabaseAdmin
    .from('email_inbox')
    .select('*')
    .eq('id', emailId)
    .single();

  if (error || !data) {
    throw AppError.notFound('Email not found');
  }

  const { data: attachmentsData } = await supabaseAdmin
    .from('email_attachments')
    .select('*')
    .eq('email_id', data.email_id);

  return {
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
  };
}

export async function getScheduledEmails(_ctx: { actor: AdminActor }) {
  const { data, error } = await supabaseAdmin
    .from('scheduled_emails')
    .select('*')
    .order('scheduled_at', { ascending: true });

  if (error) {
    throw AppError.badRequest(error.message);
  }

  return { success: true, emails: data };
}

export async function getSentEmailDetail(_ctx: { actor: AdminActor }, emailId: string) {
  if (!emailId) {
    throw AppError.badRequest('Missing email id');
  }

  const resend = getResend();
  if (!resend) throw AppError.internal('Resend is not configured');
  const email = await resend.emails.get(emailId);
  const emailData = email.data as any;

  if (emailData) {
    let attachments: any[] | null = null;
    const { data: dbAttachments } = await supabaseAdmin
      .from('email_attachments')
      .select('*')
      .eq('email_id', emailId);

    if (dbAttachments && dbAttachments.length > 0) {
      attachments = dbAttachments;
    }

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

  return { email: emailData };
}

export async function getSentEmails(
  ctx: { actor: AdminActor },
  opts: { limit?: number; after?: string }
) {
  const limit = opts.limit ?? 50;
  const after = opts.after;
  const resend = getResend();
  if (!resend) throw AppError.internal('Resend is not configured');
  const emails = await resend.emails.list({ limit, after });
  const responseData = emails.data as any;

  const { data: deletedData } = await supabaseAdmin
    .from('email_deletions')
    .select('email_id')
    .eq('admin_id', ctx.actor.id);
  const deletedIds = new Set((deletedData || []).map((d: { email_id: string }) => d.email_id));

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

  return {
    emails: filteredEmails,
    hasMore: responseData?.has_more ?? false,
  };
}
