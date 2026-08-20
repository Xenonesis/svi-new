import 'server-only';

import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { isOptOutMessage } from './opt-out';
import type { InboundWebhookEvent, StatusWebhookEvent, WhatsAppWebhookEvent } from './types';

const SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

async function persistStatus(event: StatusWebhookEvent): Promise<void> {
  const timestamp = event.timestamp.toISOString();
  const timestamps: Record<string, string> = {};
  if (event.status === 'sent') timestamps.sent_at = timestamp;
  if (event.status === 'delivered') timestamps.delivered_at = timestamp;
  if (event.status === 'read') timestamps.read_at = timestamp;
  if (event.status === 'failed') timestamps.failed_at = timestamp;

  const { error } = await supabaseAdmin
    .from('whatsapp_messages')
    .update({
      status: event.status,
      provider_error_code: event.errorCode ?? null,
      provider_error_message: event.errorMessage ?? null,
      raw_payload: event.raw,
      ...timestamps,
    })
    .eq('provider_message_id', event.providerMessageId);
  if (error) throw new Error(`Could not persist WhatsApp status: ${error.message}`);
}

async function upsertContact(event: InboundWebhookEvent) {
  const { data, error } = await supabaseAdmin
    .from('whatsapp_contacts')
    .upsert(
      {
        phone_e164: event.from,
        provider_profile_name: event.profileName ?? null,
        last_inbound_at: event.timestamp.toISOString(),
      },
      { onConflict: 'phone_e164' }
    )
    .select('*')
    .single();
  if (error || !data) throw new Error(`Could not persist WhatsApp contact: ${error?.message}`);
  return data;
}

async function upsertConversation(contactId: string, event: InboundWebhookEvent) {
  const serviceWindowExpiresAt = new Date(
    event.timestamp.getTime() + SERVICE_WINDOW_MS
  ).toISOString();
  const { data, error } = await supabaseAdmin
    .from('whatsapp_conversations')
    .upsert(
      {
        contact_id: contactId,
        status: 'open',
        last_message_at: event.timestamp.toISOString(),
        service_window_expires_at: serviceWindowExpiresAt,
      },
      { onConflict: 'contact_id' }
    )
    .select('*')
    .single();
  if (error || !data) throw new Error(`Could not persist WhatsApp conversation: ${error?.message}`);
  return data;
}

async function persistInbound(event: InboundWebhookEvent): Promise<void> {
  const contact = await upsertContact(event);
  const conversation = await upsertConversation(contact.id, event);
  const optedOut = Boolean(event.text && isOptOutMessage(event.text));

  const { data: message, error: messageError } = await supabaseAdmin
    .from('whatsapp_messages')
    .upsert(
      {
        conversation_id: conversation.id,
        provider_message_id: event.providerMessageId,
        direction: 'inbound',
        sender_type: 'customer',
        message_type: event.messageType,
        body: event.text?.slice(0, 4096) ?? null,
        status: 'received',
        provider_timestamp: event.timestamp.toISOString(),
        raw_payload: event.raw,
      },
      { onConflict: 'provider_message_id', ignoreDuplicates: true }
    )
    .select('id')
    .maybeSingle();
  if (messageError) throw new Error(`Could not persist WhatsApp message: ${messageError.message}`);

  // Any reply cancels pending automation; a new plan may be scheduled after the
  // customer's latest intent is understood.
  const { error: cancelError } = await supabaseAdmin
    .from('whatsapp_follow_ups')
    .update({ status: 'cancelled', reason: optedOut ? 'contact_opted_out' : 'customer_replied' })
    .eq('conversation_id', conversation.id)
    .in('status', ['pending', 'processing']);
  if (cancelError) throw new Error(`Could not cancel WhatsApp follow-ups: ${cancelError.message}`);

  if (optedOut) {
    const now = new Date().toISOString();
    const [{ error: contactError }, { error: conversationError }, { error: leadError }] =
      await Promise.all([
        supabaseAdmin
          .from('whatsapp_contacts')
          .update({ consent_status: 'opted_out', opted_out_at: now })
          .eq('id', contact.id),
        supabaseAdmin
          .from('whatsapp_conversations')
          .update({ mode: 'paused' })
          .eq('id', conversation.id),
        supabaseAdmin
          .from('chat_leads')
          .update({ consent_status: 'opted_out' })
          .eq('normalized_phone', event.from),
      ]);
    if (contactError || conversationError || leadError) {
      throw new Error('Could not persist WhatsApp opt-out state');
    }
    return;
  }

  if (!message) return; // Duplicate provider message: already persisted and queued.
  const { error: jobError } = await supabaseAdmin.from('whatsapp_processing_jobs').upsert(
    {
      job_key: `inbound:${event.providerMessageId}`,
      job_type: 'process_inbound',
      payload: {
        messageId: message.id,
        conversationId: conversation.id,
        providerMessageId: event.providerMessageId,
      },
    },
    { onConflict: 'job_key', ignoreDuplicates: true }
  );
  if (jobError) throw new Error(`Could not enqueue WhatsApp message: ${jobError.message}`);
}

export async function persistWebhookEvents(events: WhatsAppWebhookEvent[]): Promise<void> {
  // Keep event ordering within a payload so a status cannot race its message insert.
  for (const event of events) {
    if (event.kind === 'message') await persistInbound(event);
    else await persistStatus(event);
  }
}
