import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { getResend } from '../syncRunner';
import {
  defaultFromAddress,
  parseReplyTo,
  resolveDefaultReplyTo,
  toRecipientArray,
} from '../service';
import { saveAttachments } from '../services/attachmentStore';
import { notifyEmailLifecycle } from '../services/adminEmailNotifier';
import { AppError } from '@/src/lib/api/errors';
import type { AdminActor } from '@/src/server/http/auth';
import type { SendEmailInput } from '../schemas';

const MAX_RESEND_RECIPIENTS = 50;

interface SendSuccess {
  success: true;
  id: string | undefined;
  batches: number;
  errors?: { error: string; batch: number }[] | undefined;
}

interface ScheduledSuccess {
  success: true;
  id: string;
  scheduled: true;
}

export async function sendEmail(
  ctx: { actor: AdminActor },
  input: SendEmailInput
): Promise<SendSuccess | ScheduledSuccess> {
  const { to, subject, html, from, replyTo, cc, bcc, text, attachments, inReplyTo, scheduledAt } =
    input;

  if (!to || !subject || (!html && !text)) {
    throw AppError.badRequest('Missing required fields: to, subject, html/text');
  }

  const fromAddress = from || defaultFromAddress();

  // Scheduled send — persist as a row, persist attachments, log notification.
  if (scheduledAt) {
    return scheduleEmail(ctx, input, fromAddress);
  }

  return sendImmediate(ctx, input, {
    fromAddress,
    toList: toRecipientArray(to),
    ccList: toRecipientArray(cc),
    bccList: toRecipientArray(bcc),
    replyToList: parseReplyTo(Array.isArray(replyTo) ? replyTo.join(', ') : replyTo || undefined),
    attachments: attachments ?? [],
  });
}

async function scheduleEmail(
  ctx: { actor: AdminActor },
  input: SendEmailInput,
  fromAddress: string
): Promise<ScheduledSuccess> {
  const { to, subject, html, text, replyTo, cc, bcc, attachments, inReplyTo, scheduledAt } = input;

  const defaultReplyTo = await resolveDefaultReplyTo();

  const { data: scheduledRecord, error: scheduleError } = await supabaseAdmin
    .from('scheduled_emails')
    .insert({
      to_emails: Array.isArray(to) ? to : [to],
      cc_emails: cc ? (Array.isArray(cc) ? cc : [cc]) : null,
      bcc_emails: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : null,
      subject,
      html_body: html || text || '',
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
    throw new AppError(500, 'SCHEDULE_FAILED', 'Failed to schedule email');
  }

  const emailId = scheduledRecord.id;

  if (Array.isArray(attachments) && attachments.length > 0) {
    await saveAttachments(emailId, attachments);
  }

  await notifyEmailLifecycle(
    'emailScheduled',
    { id: ctx.actor.id, email: ctx.actor.email },
    { recipients: toRecipientArray(to), subject: scheduledAt }
  );

  return { success: true, id: emailId, scheduled: true };
}

async function sendImmediate(
  ctx: { actor: AdminActor },
  input: SendEmailInput,
  resolved: {
    fromAddress: string;
    toList: string[];
    ccList: string[];
    bccList: string[];
    replyToList: string[] | undefined;
    attachments: SendEmailInput['attachments'];
  }
): Promise<SendSuccess> {
  const { subject, html, text, inReplyTo } = input;
  const { fromAddress, toList, ccList, bccList, replyToList, attachments } = resolved;

  const defaultReplyToString = await resolveDefaultReplyTo();
  const normalizedReplyTo = replyToList || parseReplyTo(defaultReplyToString);

  const resend = getResend();
  if (!resend) throw AppError.internal('Resend is not configured');

  const resendAttachments =
    attachments && attachments.length > 0
      ? attachments.map((att: { filename: string; content: string }) => ({
          filename: att.filename,
          content: att.content,
        }))
      : undefined;

  const baseSendParams = {
    from: fromAddress,
    subject,
    html: html || undefined,
    text: text || undefined,
    replyTo: normalizedReplyTo,
    attachments: resendAttachments,
    headers: inReplyTo
      ? ({ 'In-Reply-To': inReplyTo, References: inReplyTo } as Record<string, string>)
      : undefined,
  };

  const batchCount = Math.max(
    Math.ceil(toList.length / MAX_RESEND_RECIPIENTS),
    Math.ceil(ccList.length / MAX_RESEND_RECIPIENTS),
    Math.ceil(bccList.length / MAX_RESEND_RECIPIENTS),
    1
  );

  const results: Array<{ id?: string; error?: string; batch: number }> = [];

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
    } as any);

    if (batchError) {
      results.push({ error: batchError.message, batch: i });
    } else {
      results.push({ id: batchResult?.id, batch: i });
    }
  }

  const errors = results.filter((r) => r.error);
  if (errors.length > 0 && errors.length === results.length) {
    throw new AppError(
      422,
      'ALL_BATCHES_FAILED',
      `All batches failed. First error: ${errors[0].error}`
    );
  }

  // Notification (non-blocking failure).
  await notifyEmailLifecycle(
    'emailSent',
    { id: ctx.actor.id, email: ctx.actor.email },
    {
      recipients: toList,
      subject,
    }
  );

  // Persist attachments against the first successful batch id.
  const firstSuccessId = results.find((r) => r.id)?.id;
  if (firstSuccessId && Array.isArray(attachments) && attachments.length > 0) {
    await saveAttachments(firstSuccessId, attachments);
  }

  return {
    success: true,
    id: firstSuccessId,
    batches: results.length,
    errors:
      errors.length > 0 ? errors.map((e) => ({ error: e.error!, batch: e.batch })) : undefined,
  };
}
