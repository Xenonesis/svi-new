import { describe, it, expect } from 'vitest';
import {
  DEFAULT_HOT_LEAD_SETTINGS,
  type HotLeadNotificationSettings,
  type ChannelHealthStatus,
} from '../hotLeadNotificationTypes';

describe('hotLeadNotificationTypes', () => {
  it('includes channel configurations and default values in DEFAULT_HOT_LEAD_SETTINGS', () => {
    expect(DEFAULT_HOT_LEAD_SETTINGS.channels).toBeDefined();
    expect(DEFAULT_HOT_LEAD_SETTINGS.channels.email).toBe(true);
    expect(DEFAULT_HOT_LEAD_SETTINGS.channels.in_app).toBe(true);
    expect(DEFAULT_HOT_LEAD_SETTINGS.channels.telegram).toBe(false);
    expect(DEFAULT_HOT_LEAD_SETTINGS.channels.whatsapp).toBe(false);
    expect(DEFAULT_HOT_LEAD_SETTINGS.channels.customer_warmup).toBe(false);
    expect(DEFAULT_HOT_LEAD_SETTINGS.sla_config.sla_threshold_minutes).toBe(15);
  });
});
