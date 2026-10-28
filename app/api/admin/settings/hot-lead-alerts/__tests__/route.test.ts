import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-1', role: 'admin' }),
}));

vi.mock('@/src/lib/leads/hotLeadNotification', () => ({
  getHotLeadNotificationSettings: vi.fn().mockResolvedValue({
    enabled: true,
    channels: {
      email: true,
      in_app: true,
      telegram: false,
      whatsapp: false,
      customer_warmup: false,
    },
    telegram_config: { bot_token: '', target_chat_id: '' },
    whatsapp_config: { provider: 'meta_cloud', api_key: '', sender_phone_id: '', webhook_url: '' },
    customer_warmup_config: {
      enabled: false,
      channel: 'whatsapp',
      greeting_template: '',
      brochure_pdf_url: '',
    },
    sla_config: {
      sla_threshold_minutes: 15,
      escalation_targets: ['director@sviinfrasolutions.com'],
      auto_reassign_on_breach: false,
    },
    audio_snippet_config: { auto_extract_high_intent_clip: true },
    recipients: [],
  }),
  updateHotLeadNotificationSettings: vi.fn().mockResolvedValue(true),
  dispatchDailyDigest: vi.fn().mockResolvedValue({ leadCount: 0, dispatchedCount: 0 }),
}));

describe('GET /api/admin/settings/hot-lead-alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns both settings and channel_status', async () => {
    const req = new NextRequest(
      'http:' + String.fromCharCode(47, 47) + 'localhost:3000/api/admin/settings/hot-lead-alerts'
    );
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.channel_status).toBeDefined();
    expect(json.channel_status.in_app.available).toBe(true);
    expect(json.channel_status.email).toBeDefined();
    expect(json.channel_status.telegram).toBeDefined();
    expect(json.channel_status.whatsapp).toBeDefined();
  });
});

describe('POST /api/admin/settings/hot-lead-alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves full HotLeadNotificationSettings and returns updated settings with channel_status', async () => {
    const payload = {
      enabled: true,
      channels: {
        email: true,
        in_app: true,
        telegram: true,
        whatsapp: false,
        customer_warmup: false,
      },
      telegram_config: {
        bot_token: '123456:ABC-DEF',
        target_chat_id: '-1001234567890',
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
        greeting_template: 'Namaste',
        brochure_pdf_url: '/brochure.pdf',
      },
      sla_config: {
        sla_threshold_minutes: 30,
        escalation_targets: ['director@sviinfrasolutions.com'],
        auto_reassign_on_breach: true,
      },
      audio_snippet_config: {
        auto_extract_high_intent_clip: true,
      },
      recipients: [
        {
          name: 'Sales Lead',
          email: 'sales@sviinfrasolutions.com',
          role: 'Sales Head',
          delivery_mode: 'instant',
          digest_time: '19:30',
          lead_tier: 'hot_only',
        },
      ],
    };

    const req = new NextRequest(
      'http:' + String.fromCharCode(47, 47) + 'localhost:3000/api/admin/settings/hot-lead-alerts',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.settings.sla_config.sla_threshold_minutes).toBe(30);
    expect(json.settings.channels.telegram).toBe(true);
    expect(json.channel_status).toBeDefined();
    expect(json.channel_status.telegram.available).toBe(true);
  });

  it('dispatches test digest when action is send_test_digest', async () => {
    const req = new NextRequest(
      'http:' + String.fromCharCode(47, 47) + 'localhost:3000/api/admin/settings/hot-lead-alerts',
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'send_test_digest',
          targetEmail: 'director@sviinfrasolutions.com',
        }),
      }
    );

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('Test daily digest dispatched');
  });
});
