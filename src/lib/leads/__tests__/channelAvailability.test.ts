import { describe, it, expect } from 'vitest';
import { resolveChannelAvailability } from '../channelAvailability';
import { DEFAULT_HOT_LEAD_SETTINGS } from '../hotLeadNotificationTypes';

describe('resolveChannelAvailability', () => {
  it('marks telegram and whatsapp unavailable when environment and settings lack keys', () => {
    const status = resolveChannelAvailability(DEFAULT_HOT_LEAD_SETTINGS, {});
    expect(status.email.available).toBe(false);
    expect(status.in_app.available).toBe(true);
    expect(status.telegram.available).toBe(false);
    expect(status.telegram.key).toBe('TELEGRAM_BOT_TOKEN');
    expect(status.whatsapp.available).toBe(false);
    expect(status.customer_warmup.available).toBe(false);
  });

  it('marks channels available when corresponding env variables are present', () => {
    const status = resolveChannelAvailability(DEFAULT_HOT_LEAD_SETTINGS, {
      RESEND_API_KEY: 're_123',
      TELEGRAM_BOT_TOKEN: '123456:ABC-DEF',
      WHATSAPP_ACCESS_TOKEN: 'wh_test_token',
    });
    expect(status.email.available).toBe(true);
    expect(status.in_app.available).toBe(true);
    expect(status.telegram.available).toBe(true);
    expect(status.whatsapp.available).toBe(true);
    expect(status.customer_warmup.available).toBe(true);
  });

  it('marks telegram available when token is supplied in settings even without env', () => {
    const customSettings = {
      ...DEFAULT_HOT_LEAD_SETTINGS,
      telegram_config: {
        bot_token: 'bot_from_settings',
        target_chat_id: '-100123456789',
      },
    };
    const status = resolveChannelAvailability(customSettings, {});
    expect(status.telegram.available).toBe(true);
    expect(status.telegram.source).toBe('settings');
  });
});
