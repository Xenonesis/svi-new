import type { ChannelHealthStatus, HotLeadNotificationSettings } from './hotLeadNotificationTypes';

export function resolveChannelAvailability(
  settings: HotLeadNotificationSettings,
  envMap: Record<string, string | undefined> = process.env
): ChannelHealthStatus {
  const hasResend = Boolean(envMap.RESEND_API_KEY && envMap.RESEND_API_KEY.trim().length > 0);
  const hasTelegramEnv = Boolean(
    envMap.TELEGRAM_BOT_TOKEN && envMap.TELEGRAM_BOT_TOKEN.trim().length > 0
  );
  const hasTelegramSettings = Boolean(
    settings.telegram_config.bot_token && settings.telegram_config.bot_token.trim().length > 0
  );
  const hasTelegram = hasTelegramEnv || hasTelegramSettings;

  const hasWhatsAppEnv = Boolean(
    (envMap.WHATSAPP_ACCESS_TOKEN && envMap.WHATSAPP_ACCESS_TOKEN.trim().length > 0) ||
    (envMap.META_ACCESS_TOKEN && envMap.META_ACCESS_TOKEN.trim().length > 0)
  );
  const hasWhatsAppSettings = Boolean(
    (settings.whatsapp_config.api_key && settings.whatsapp_config.api_key.trim().length > 0) ||
    (settings.whatsapp_config.webhook_url && settings.whatsapp_config.webhook_url.trim().length > 0)
  );
  const hasWhatsApp = hasWhatsAppEnv || hasWhatsAppSettings;

  return {
    email: {
      available: hasResend,
      source: hasResend ? 'env' : 'missing',
      key: 'RESEND_API_KEY',
    },
    in_app: {
      available: true,
      source: 'supabase',
    },
    telegram: {
      available: hasTelegram,
      source: hasTelegramSettings ? 'settings' : hasTelegramEnv ? 'env' : 'missing',
      key: 'TELEGRAM_BOT_TOKEN',
    },
    whatsapp: {
      available: hasWhatsApp,
      source: hasWhatsAppSettings ? 'settings' : hasWhatsAppEnv ? 'env' : 'missing',
      key: 'WHATSAPP_ACCESS_TOKEN',
    },
    customer_warmup: {
      available: hasWhatsApp,
      source: hasWhatsApp ? 'whatsapp_dependent' : 'missing',
      key: 'WHATSAPP_ACCESS_TOKEN',
    },
  };
}
