export type NotificationDeliveryMode = 'instant' | 'daily_digest' | 'both';
export type LeadInterestFilter = 'hot_only' | 'hot_and_warm';

export interface HotLeadRecipient {
  email: string;
  name: string;
  role: string;
  phone?: string;
  telegram_chat_id?: string;
  delivery_mode: NotificationDeliveryMode;
  digest_time: string;
  lead_tier: LeadInterestFilter;
}

export interface ChannelHealthStatus {
  email: { available: boolean; source: 'env' | 'missing'; key: string };
  in_app: { available: boolean; source: 'supabase' };
  telegram: { available: boolean; source: 'env' | 'settings' | 'missing'; key: string };
  whatsapp: { available: boolean; source: 'env' | 'settings' | 'missing'; key: string };
  customer_warmup: { available: boolean; source: 'whatsapp_dependent' | 'missing'; key: string };
}

export interface TelegramChannelConfig {
  bot_token?: string;
  target_chat_id?: string;
}

export interface WhatsAppChannelConfig {
  provider: 'meta_cloud' | 'wati' | 'twilio' | 'webhook';
  api_key?: string;
  sender_phone_id?: string;
  webhook_url?: string;
}

export interface CustomerWarmupConfig {
  enabled: boolean;
  channel: 'whatsapp' | 'sms';
  greeting_template: string;
  brochure_pdf_url: string;
}

export interface SlaConfig {
  sla_threshold_minutes: number;
  escalation_targets: string[];
  auto_reassign_on_breach: boolean;
}

export interface AudioSnippetConfig {
  auto_extract_high_intent_clip: boolean;
}

export interface HotLeadNotificationSettings {
  enabled: boolean;
  channels: {
    email: boolean;
    in_app: boolean;
    telegram: boolean;
    whatsapp: boolean;
    customer_warmup: boolean;
  };
  telegram_config: TelegramChannelConfig;
  whatsapp_config: WhatsAppChannelConfig;
  customer_warmup_config: CustomerWarmupConfig;
  sla_config: SlaConfig;
  audio_snippet_config: AudioSnippetConfig;
  recipients: HotLeadRecipient[];
}

export const SETTINGS_KEY = 'hot_lead_notification_settings';

export const DEFAULT_HOT_LEAD_SETTINGS: HotLeadNotificationSettings = {
  enabled: true,
  channels: {
    email: true,
    in_app: true,
    telegram: false,
    whatsapp: false,
    customer_warmup: false,
  },
  telegram_config: {
    bot_token: '',
    target_chat_id: '',
  },
  whatsapp_config: {
    provider: 'meta_cloud',
    api_key: '',
    sender_phone_id: '',
    webhook_url: '',
  },
  customer_warmup_config: {
    enabled: false,
    channel: 'whatsapp',
    greeting_template:
      'Namaste {{customer_name}}, thank you for contacting SVI Grand City! Our Senior Property Specialist is reviewing your plot requirements.',
    brochure_pdf_url: '/brochures/svi-grand-city.pdf',
  },
  sla_config: {
    sla_threshold_minutes: 15,
    escalation_targets: ['director@sviinfrasolutions.com'],
    auto_reassign_on_breach: false,
  },
  audio_snippet_config: {
    auto_extract_high_intent_clip: true,
  },
  recipients: [
    {
      email: 'director@sviinfrasolutions.com',
      name: 'Sales Director',
      role: 'Director',
      delivery_mode: 'instant',
      digest_time: '19:30',
      lead_tier: 'hot_only',
    },
    {
      email: 'sales@sviinfrasolutions.com',
      name: 'VIP Sales Desk',
      role: 'Sales Head',
      delivery_mode: 'both',
      digest_time: '20:00',
      lead_tier: 'hot_and_warm',
    },
  ],
};
