import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { resolveChannelAvailability } from '@/src/lib/leads/channelAvailability';
import {
  getHotLeadNotificationSettings,
  updateHotLeadNotificationSettings,
  dispatchDailyDigest,
} from '@/src/lib/leads/hotLeadNotification';
import type {
  HotLeadNotificationSettings,
  HotLeadRecipient,
  NotificationDeliveryMode,
  LeadInterestFilter,
  TelegramChannelConfig,
  WhatsAppChannelConfig,
  CustomerWarmupConfig,
  SlaConfig,
  AudioSnippetConfig,
} from '@/src/lib/leads/hotLeadNotificationTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request?: NextRequest): Promise<NextResponse> {
  try {
    if (request) {
      const admin = await verifyAdmin(request);
      if (!admin) {
        throw AppError.unauthorized('Admin credentials required to view alert settings');
      }
    }

    const settings = await getHotLeadNotificationSettings();
    const channel_status = resolveChannelAvailability(settings);

    return NextResponse.json({
      success: true,
      settings,
      channel_status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin credentials required to update alert settings');
    }

    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      targetEmail?: string;
    } & Partial<HotLeadNotificationSettings>;

    if (body.action === 'send_test_digest') {
      const targetEmail = String(body.targetEmail || '')
        .trim()
        .toLowerCase();
      if (!targetEmail || !targetEmail.includes('@')) {
        throw AppError.badRequest('Valid targetEmail required for test digest');
      }

      const result = await dispatchDailyDigest({ targetEmail });
      return NextResponse.json({
        success: true,
        message: `Test daily digest dispatched to ${targetEmail}`,
        leadCount: result.leadCount,
        dispatchedCount: result.dispatchedCount,
      });
    }

    if (!Array.isArray(body.recipients)) {
      throw AppError.badRequest('Invalid payload: recipients must be an array');
    }

    const validRecipients: HotLeadRecipient[] = body.recipients.map((r, idx) => {
      const email = String(r.email || '')
        .trim()
        .toLowerCase();
      if (!email.includes('@') || !email.includes('.')) {
        throw AppError.badRequest(`Invalid email address: ${r.email}`);
      }

      const delivery_mode: NotificationDeliveryMode =
        r.delivery_mode === 'instant' ||
        r.delivery_mode === 'daily_digest' ||
        r.delivery_mode === 'both'
          ? r.delivery_mode
          : 'both';

      const digest_time =
        typeof r.digest_time === 'string' && r.digest_time.trim() ? r.digest_time.trim() : '19:30';

      const lead_tier: LeadInterestFilter =
        r.lead_tier === 'hot_and_warm' ? 'hot_and_warm' : 'hot_only';

      return {
        name: String(r.name || 'Team Member').trim(),
        email,
        role: String(r.role || 'Member').trim(),
        phone: r.phone ? String(r.phone).trim() : undefined,
        telegram_chat_id: r.telegram_chat_id ? String(r.telegram_chat_id).trim() : undefined,
        delivery_mode,
        digest_time,
        lead_tier,
      };
    });

    const channels = {
      email: typeof body.channels?.email === 'boolean' ? body.channels.email : true,
      in_app: typeof body.channels?.in_app === 'boolean' ? body.channels.in_app : true,
      telegram: typeof body.channels?.telegram === 'boolean' ? body.channels.telegram : false,
      whatsapp: typeof body.channels?.whatsapp === 'boolean' ? body.channels.whatsapp : false,
      customer_warmup:
        typeof body.channels?.customer_warmup === 'boolean' ? body.channels.customer_warmup : false,
    };

    const telegram_config: TelegramChannelConfig = {
      bot_token:
        typeof body.telegram_config?.bot_token === 'string'
          ? body.telegram_config.bot_token.trim()
          : '',
      target_chat_id:
        typeof body.telegram_config?.target_chat_id === 'string'
          ? body.telegram_config.target_chat_id.trim()
          : '',
    };

    const whatsapp_config: WhatsAppChannelConfig = {
      provider: body.whatsapp_config?.provider || 'meta_cloud',
      api_key:
        typeof body.whatsapp_config?.api_key === 'string'
          ? body.whatsapp_config.api_key.trim()
          : '',
      sender_phone_id:
        typeof body.whatsapp_config?.sender_phone_id === 'string'
          ? body.whatsapp_config.sender_phone_id.trim()
          : '',
      webhook_url:
        typeof body.whatsapp_config?.webhook_url === 'string'
          ? body.whatsapp_config.webhook_url.trim()
          : '',
    };

    const customer_warmup_config: CustomerWarmupConfig = {
      enabled:
        typeof body.customer_warmup_config?.enabled === 'boolean'
          ? body.customer_warmup_config.enabled
          : false,
      channel: body.customer_warmup_config?.channel === 'sms' ? 'sms' : 'whatsapp',
      greeting_template:
        typeof body.customer_warmup_config?.greeting_template === 'string'
          ? body.customer_warmup_config.greeting_template
          : 'Namaste {{customer_name}}, thank you for contacting SVI Grand City! Our Senior Property Specialist is reviewing your plot requirements.',
      brochure_pdf_url:
        typeof body.customer_warmup_config?.brochure_pdf_url === 'string'
          ? body.customer_warmup_config.brochure_pdf_url
          : '/brochures/svi-grand-city.pdf',
    };

    const sla_config: SlaConfig = {
      sla_threshold_minutes:
        typeof body.sla_config?.sla_threshold_minutes === 'number'
          ? body.sla_config.sla_threshold_minutes
          : 15,
      escalation_targets:
        Array.isArray(body.sla_config?.escalation_targets) &&
        body.sla_config.escalation_targets.length > 0
          ? body.sla_config.escalation_targets
          : ['director@sviinfrasolutions.com'],
      auto_reassign_on_breach:
        typeof body.sla_config?.auto_reassign_on_breach === 'boolean'
          ? body.sla_config.auto_reassign_on_breach
          : false,
    };

    const audio_snippet_config: AudioSnippetConfig = {
      auto_extract_high_intent_clip:
        typeof body.audio_snippet_config?.auto_extract_high_intent_clip === 'boolean'
          ? body.audio_snippet_config.auto_extract_high_intent_clip
          : true,
    };

    const updatedSettings: HotLeadNotificationSettings = {
      enabled: typeof body.enabled === 'boolean' ? body.enabled : true,
      channels,
      telegram_config,
      whatsapp_config,
      customer_warmup_config,
      sla_config,
      audio_snippet_config,
      recipients: validRecipients,
    };

    await updateHotLeadNotificationSettings(updatedSettings);

    const channel_status = resolveChannelAvailability(updatedSettings);

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      channel_status,
      message: 'Hot lead alert preferences saved successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
