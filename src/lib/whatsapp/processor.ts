import 'server-only';

import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { processInboundMessage } from './agent';
import { evaluateMessagingEligibility, nextOutboundWindow } from './policy';
import { getWhatsAppProvider } from './provider';
import { WhatsAppProviderError } from './types';

interface JobRow {
  id: string;
  attempts: number;
  max_attempts: number;
  payload: { conversationId?: string; messageId?: string };
}

interface FollowUpRow {
  id: string;
  conversation_id: string;
  template_id: string;
  dedupe_key: string;
  attempts: number;
}

function retryAt(attempts: number): string {
  const delaySeconds = Math.min(15 * 2 ** Math.max(attempts - 1, 0), 15 * 60);
  return new Date(Date.now() + delaySeconds * 1000).toISOString();
}

function safeError(error: unknown): string {
  return (error instanceof Error ? error.message : 'Unknown processing error').slice(0, 500);
}

export async function processClaimedJob(job: JobRow): Promise<void> {
  try {
    if (!job.payload.conversationId || !job.payload.messageId)
      throw new Error('Job payload is invalid');
    await processInboundMessage(job.payload.conversationId, job.payload.messageId);
    const { error } = await supabaseAdmin
      .from('whatsapp_processing_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        locked_at: null,
        locked_by: null,
      })
      .eq('id', job.id);
    if (error) throw new Error(`Could not complete WhatsApp job: ${error.message}`);
  } catch (error) {
    const retryable = !(error instanceof WhatsAppProviderError) || error.retryable;
    const canRetry = retryable && job.attempts < job.max_attempts;
    await supabaseAdmin
      .from('whatsapp_processing_jobs')
      .update({
        status: canRetry ? 'pending' : 'failed',
        available_at: canRetry ? retryAt(job.attempts) : new Date().toISOString(),
        locked_at: null,
        locked_by: null,
        last_error: safeError(error),
      })
      .eq('id', job.id);
  }
}

export async function processClaimedFollowUp(followUp: FollowUpRow): Promise<void> {
  try {
    const [{ data: conversation }, { data: template }] = await Promise.all([
      supabaseAdmin
        .from('whatsapp_conversations')
        .select('*')
        .eq('id', followUp.conversation_id)
        .single(),
      supabaseAdmin.from('whatsapp_templates').select('*').eq('id', followUp.template_id).single(),
    ]);
    if (!conversation || !template) throw new Error('Follow-up context is missing');

    const [{ data: contact }, { count: sentCount }] = await Promise.all([
      supabaseAdmin
        .from('whatsapp_contacts')
        .select('*')
        .eq('id', conversation.contact_id)
        .single(),
      supabaseAdmin
        .from('whatsapp_follow_ups')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', followUp.conversation_id)
        .eq('status', 'sent'),
    ]);
    if (!contact) throw new Error('Follow-up contact is missing');

    const decision = evaluateMessagingEligibility({
      recipient: contact.phone_e164,
      businessInitiated: true,
      autonomous: true,
      conversationMode: conversation.mode,
      consentStatus: contact.consent_status,
      serviceWindowExpiresAt: conversation.service_window_expires_at,
      template: { active: template.active, providerStatus: template.provider_status },
      completedFollowUps: sentCount ?? 0,
    });
    if (!decision.allowed) {
      const quiet = decision.denialReason === 'quiet_hours';
      await supabaseAdmin
        .from('whatsapp_follow_ups')
        .update({
          status: quiet ? 'pending' : 'skipped',
          scheduled_for: quiet ? nextOutboundWindow().toISOString() : undefined,
          reason: decision.denialReason,
          locked_at: null,
          locked_by: null,
        })
        .eq('id', followUp.id);
      return;
    }
    if (template.parameter_count > 0) {
      await supabaseAdmin
        .from('whatsapp_follow_ups')
        .update({
          status: 'skipped',
          reason: 'template_parameters_not_configured',
          locked_at: null,
          locked_by: null,
        })
        .eq('id', followUp.id);
      return;
    }

    const { data: existing } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('id, status')
      .eq('dedupe_key', followUp.dedupe_key)
      .maybeSingle();
    if (existing && existing.status !== 'queued') {
      await supabaseAdmin
        .from('whatsapp_follow_ups')
        .update({ status: 'sent', sent_message_id: existing.id, locked_at: null, locked_by: null })
        .eq('id', followUp.id);
      return;
    }

    let messageId = existing?.id as string | undefined;
    if (!messageId) {
      const { data: queued, error } = await supabaseAdmin
        .from('whatsapp_messages')
        .insert({
          conversation_id: followUp.conversation_id,
          dedupe_key: followUp.dedupe_key,
          direction: 'outbound',
          sender_type: 'ai',
          message_type: 'template',
          template_name: template.name,
          template_language: template.language,
          body: template.body_preview,
          status: 'queued',
        })
        .select('id')
        .single();
      if (error || !queued) throw new Error('Could not reserve follow-up message');
      messageId = queued.id;
    }

    const sent = await getWhatsAppProvider().sendTemplate({
      to: contact.phone_e164,
      name: template.name,
      language: template.language,
    });
    const now = new Date().toISOString();
    await Promise.all([
      supabaseAdmin
        .from('whatsapp_messages')
        .update({ provider_message_id: sent.providerMessageId, status: 'accepted', sent_at: now })
        .eq('id', messageId),
      supabaseAdmin
        .from('whatsapp_follow_ups')
        .update({
          status: 'sent',
          sent_message_id: messageId,
          reason: null,
          locked_at: null,
          locked_by: null,
        })
        .eq('id', followUp.id),
      supabaseAdmin
        .from('whatsapp_contacts')
        .update({ last_outbound_at: now })
        .eq('id', contact.id),
      supabaseAdmin
        .from('whatsapp_conversations')
        .update({ last_message_at: now })
        .eq('id', conversation.id),
    ]);
  } catch (error) {
    const retryable = !(error instanceof WhatsAppProviderError) || error.retryable;
    const canRetry = retryable && followUp.attempts < 5;
    await supabaseAdmin
      .from('whatsapp_follow_ups')
      .update({
        status: canRetry ? 'pending' : 'failed',
        scheduled_for: canRetry ? retryAt(followUp.attempts) : undefined,
        reason: safeError(error),
        locked_at: null,
        locked_by: null,
      })
      .eq('id', followUp.id);
  }
}

export async function drainPendingWhatsAppWork(
  limit = 10,
  workerPrefix = 'whatsapp-drain'
): Promise<{
  processedJobs: number;
  processedFollowUps: number;
  failedJobs: number;
  failedFollowUps: number;
}> {
  const worker = `${workerPrefix}:${randomUUID()}`;
  const [{ data: jobs, error: jobsError }, { data: followUps, error: followUpsError }] =
    await Promise.all([
      supabaseAdmin.rpc('claim_whatsapp_jobs', {
        p_limit: limit,
        p_worker: worker,
        p_lock_seconds: 120,
      }),
      supabaseAdmin.rpc('claim_whatsapp_followups', {
        p_limit: limit,
        p_worker: worker,
        p_lock_seconds: 120,
      }),
    ]);

  if (jobsError || followUpsError) {
    console.error('WhatsApp drain claim failed', {
      jobs: jobsError?.message,
      followUps: followUpsError?.message,
    });
    return {
      processedJobs: 0,
      processedFollowUps: 0,
      failedJobs: 0,
      failedFollowUps: 0,
    };
  }

  const [jobResults, followUpResults] = await Promise.all([
    Promise.allSettled(
      (jobs ?? []).map((job: Parameters<typeof processClaimedJob>[0]) => processClaimedJob(job))
    ),
    Promise.allSettled(
      (followUps ?? []).map((followUp: Parameters<typeof processClaimedFollowUp>[0]) =>
        processClaimedFollowUp(followUp)
      )
    ),
  ]);

  return {
    processedJobs: jobResults.length,
    processedFollowUps: followUpResults.length,
    failedJobs: jobResults.filter((result) => result.status === 'rejected').length,
    failedFollowUps: followUpResults.filter((result) => result.status === 'rejected').length,
  };
}
