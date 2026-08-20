import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { evaluateMessagingEligibility } from '@/src/lib/whatsapp/policy';
import { getWhatsAppProvider } from '@/src/lib/whatsapp/provider';

export const runtime = 'nodejs';

function requireId(value: string | null): string {
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) throw AppError.badRequest('A valid conversation ID is required');
  return parsed.data;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();
    const conversationId = request.nextUrl.searchParams.get('conversation_id');

    if (conversationId) {
      const id = requireId(conversationId);
      const [conversationResult, messagesResult, followUpsResult, visitsResult, templatesResult] =
        await Promise.all([
          supabaseAdmin
            .from('whatsapp_conversations')
            .select('*, contact:whatsapp_contacts(*)')
            .eq('id', id)
            .single(),
          supabaseAdmin
            .from('whatsapp_messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true })
            .limit(200),
          supabaseAdmin
            .from('whatsapp_follow_ups')
            .select('*, template:whatsapp_templates(name, language, body_preview)')
            .eq('conversation_id', id)
            .order('sequence_number'),
          supabaseAdmin
            .from('whatsapp_site_visit_requests')
            .select('*, project:properties(name)')
            .eq('conversation_id', id)
            .order('created_at', { ascending: false }),
          supabaseAdmin
            .from('whatsapp_templates')
            .select('id, name, language, body_preview, parameter_count')
            .eq('active', true)
            .eq('provider_status', 'approved')
            .order('name'),
        ]);
      if (conversationResult.error) throw AppError.internal('Could not load WhatsApp conversation');
      return NextResponse.json({
        conversation: conversationResult.data,
        messages: messagesResult.data ?? [],
        followUps: followUpsResult.data ?? [],
        siteVisits: visitsResult.data ?? [],
        templates: templatesResult.data ?? [],
      });
    }

    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? 50))
    );
    const offset = (page - 1) * limit;
    const mode = request.nextUrl.searchParams.get('mode');
    let query = supabaseAdmin
      .from('whatsapp_conversations')
      .select('*, contact:whatsapp_contacts(*)', { count: 'exact' });
    if (mode && ['ai', 'human', 'paused'].includes(mode)) query = query.eq('mode', mode);
    const {
      data: conversations,
      error,
      count,
    } = await query
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);
    if (error) throw AppError.internal('Could not load WhatsApp inbox');

    const ids = (conversations ?? []).map((conversation) => conversation.id);
    const { data: recentMessages } = ids.length
      ? await supabaseAdmin
          .from('whatsapp_messages')
          .select('conversation_id, body, message_type, status, created_at')
          .in('conversation_id', ids)
          .order('created_at', { ascending: false })
      : { data: [] };
    const latest = new Map<string, unknown>();
    for (const message of recentMessages ?? []) {
      if (!latest.has(message.conversation_id)) latest.set(message.conversation_id, message);
    }

    return NextResponse.json({
      conversations: (conversations ?? []).map((conversation) => ({
        ...conversation,
        latestMessage: latest.get(conversation.id) ?? null,
      })),
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const actionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.enum(['take_over', 'return_to_ai', 'pause', 'cancel_followups']),
    conversationId: z.string().uuid(),
  }),
  z.object({
    action: z.literal('send_text'),
    conversationId: z.string().uuid(),
    text: z.string().trim().min(1).max(4096),
  }),
  z.object({
    action: z.literal('schedule_follow_up'),
    conversationId: z.string().uuid(),
    templateId: z.string().uuid(),
    scheduledFor: z.string().datetime(),
  }),
  z.object({
    action: z.literal('record_consent'),
    conversationId: z.string().uuid(),
    consentStatus: z.enum(['opted_in', 'opted_out']),
    source: z.string().trim().min(1).max(120),
  }),
]);

async function conversationContext(conversationId: string) {
  const { data: conversation, error } = await supabaseAdmin
    .from('whatsapp_conversations')
    .select('*, contact:whatsapp_contacts(*)')
    .eq('id', conversationId)
    .single();
  if (error || !conversation || !conversation.contact)
    throw AppError.badRequest('Conversation was not found');
  return conversation;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();
    const parsed = actionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw AppError.badRequest('Invalid WhatsApp inbox action');
    const input = parsed.data;
    const context = await conversationContext(input.conversationId);

    if (input.action === 'take_over' || input.action === 'pause') {
      const mode = input.action === 'take_over' ? 'human' : 'paused';
      const { error } = await supabaseAdmin
        .from('whatsapp_conversations')
        .update({
          mode,
          assigned_to: input.action === 'take_over' ? admin.id : context.assigned_to,
        })
        .eq('id', input.conversationId);
      if (error) throw AppError.internal('Could not update conversation state');
      await supabaseAdmin
        .from('whatsapp_follow_ups')
        .update({
          status: 'cancelled',
          reason: mode === 'human' ? 'human_takeover' : 'conversation_paused',
        })
        .eq('conversation_id', input.conversationId)
        .in('status', ['pending', 'processing']);
      return NextResponse.json({ success: true, mode });
    }

    if (input.action === 'return_to_ai') {
      if (context.contact.consent_status === 'opted_out')
        throw AppError.badRequest('Opted-out contacts cannot be returned to AI');
      const { error } = await supabaseAdmin
        .from('whatsapp_conversations')
        .update({ mode: 'ai', assigned_to: null })
        .eq('id', input.conversationId);
      if (error) throw AppError.internal('Could not return conversation to AI');
      return NextResponse.json({ success: true, mode: 'ai' });
    }

    if (input.action === 'cancel_followups') {
      const { error } = await supabaseAdmin
        .from('whatsapp_follow_ups')
        .update({ status: 'cancelled', reason: 'cancelled_by_admin' })
        .eq('conversation_id', input.conversationId)
        .in('status', ['pending', 'processing']);
      if (error) throw AppError.internal('Could not cancel follow-ups');
      return NextResponse.json({ success: true });
    }

    if (input.action === 'record_consent') {
      const now = new Date().toISOString();
      const optedOut = input.consentStatus === 'opted_out';
      const [{ error: contactError }, { error: leadError }] = await Promise.all([
        supabaseAdmin
          .from('whatsapp_contacts')
          .update({
            consent_status: input.consentStatus,
            consent_source: input.source,
            consent_recorded_at: now,
            opted_out_at: optedOut ? now : null,
          })
          .eq('id', context.contact.id),
        supabaseAdmin
          .from('chat_leads')
          .update({ consent_status: input.consentStatus })
          .eq('normalized_phone', context.contact.phone_e164),
      ]);
      if (contactError || leadError) throw AppError.internal('Could not record consent');
      if (optedOut) {
        await Promise.all([
          supabaseAdmin
            .from('whatsapp_conversations')
            .update({ mode: 'paused' })
            .eq('id', input.conversationId),
          supabaseAdmin
            .from('whatsapp_follow_ups')
            .update({ status: 'cancelled', reason: 'contact_opted_out' })
            .eq('conversation_id', input.conversationId)
            .in('status', ['pending', 'processing']),
        ]);
      }
      return NextResponse.json({ success: true, consentStatus: input.consentStatus });
    }

    if (input.action === 'schedule_follow_up') {
      if (process.env.AUTONOMOUS_OUTBOUND_ENABLED !== 'true')
        throw AppError.badRequest('Autonomous outbound is disabled');
      if (context.contact.consent_status !== 'opted_in')
        throw AppError.badRequest('Recorded opt-in is required');
      const { data: template } = await supabaseAdmin
        .from('whatsapp_templates')
        .select('*')
        .eq('id', input.templateId)
        .eq('active', true)
        .eq('provider_status', 'approved')
        .single();
      if (!template || template.parameter_count > 0)
        throw AppError.badRequest('An active parameter-free approved template is required');
      const { data: existing, count } = await supabaseAdmin
        .from('whatsapp_follow_ups')
        .select('sequence_number', { count: 'exact' })
        .eq('conversation_id', input.conversationId)
        .order('sequence_number', { ascending: false })
        .limit(1);
      if ((count ?? 0) >= 2) throw AppError.badRequest('Two-follow-up cap reached');
      const sequenceNumber = Number(existing?.[0]?.sequence_number ?? 0) + 1;
      const { error } = await supabaseAdmin.from('whatsapp_follow_ups').insert({
        conversation_id: input.conversationId,
        template_id: input.templateId,
        sequence_number: sequenceNumber,
        scheduled_for: input.scheduledFor,
        dedupe_key: `followup:${input.conversationId}:${sequenceNumber}`,
      });
      if (error) throw AppError.internal('Could not schedule follow-up');
      return NextResponse.json({ success: true, sequenceNumber });
    }

    if (input.action !== 'send_text') throw AppError.badRequest('Unsupported WhatsApp action');
    const decision = evaluateMessagingEligibility({
      recipient: context.contact.phone_e164,
      businessInitiated: false,
      autonomous: false,
      conversationMode: 'ai',
      consentStatus: context.contact.consent_status,
      serviceWindowExpiresAt: context.service_window_expires_at,
    });
    if (!decision.allowed) throw AppError.badRequest(`Message blocked: ${decision.denialReason}`);
    const dedupeKey = `admin:${admin.id}:${randomUUID()}`;
    const { data: queued, error: queueError } = await supabaseAdmin
      .from('whatsapp_messages')
      .insert({
        conversation_id: input.conversationId,
        dedupe_key: dedupeKey,
        direction: 'outbound',
        sender_type: 'admin',
        message_type: 'text',
        body: input.text,
        status: 'queued',
      })
      .select('id')
      .single();
    if (queueError || !queued) throw AppError.internal('Could not reserve message');
    try {
      const sent = await getWhatsAppProvider().sendText({
        to: context.contact.phone_e164,
        text: input.text,
      });
      const now = new Date().toISOString();
      await Promise.all([
        supabaseAdmin
          .from('whatsapp_messages')
          .update({ provider_message_id: sent.providerMessageId, status: 'accepted', sent_at: now })
          .eq('id', queued.id),
        supabaseAdmin
          .from('whatsapp_conversations')
          .update({ last_message_at: now })
          .eq('id', input.conversationId),
        supabaseAdmin
          .from('whatsapp_contacts')
          .update({ last_outbound_at: now })
          .eq('id', context.contact.id),
      ]);
      return NextResponse.json({ success: true, messageId: queued.id });
    } catch (error) {
      await supabaseAdmin
        .from('whatsapp_messages')
        .delete()
        .eq('id', queued.id)
        .eq('status', 'queued');
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
