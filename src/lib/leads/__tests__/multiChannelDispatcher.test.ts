import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  dispatchMultiChannelHotLead,
  dispatchTelegramAlert,
  dispatchSlaBreachEscalation,
  type HotLeadDispatchPayload,
} from '../multiChannelDispatcher';
import { DEFAULT_HOT_LEAD_SETTINGS } from '../hotLeadNotificationTypes';

let notificationsInsertError: Error | null = null;

vi.mock('../../supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'notifications') {
        return {
          insert: vi.fn(async () => {
            if (notificationsInsertError) {
              throw notificationsInsertError;
            }
            return { error: null };
          }),
        };
      }
      if (table === 'lead_sla_tracking') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    }),
  },
}));

describe('dispatchMultiChannelHotLead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationsInsertError = null;
  });

  it('runs enabled and available channels without throwing when one channel fails', async () => {
    const payload: HotLeadDispatchPayload = {
      leadId: 'test-lead-id',
      customerPhone: '+919876543210',
      customerName: 'Rohit Sharma',
      summary: 'Wants 200 sq yd plot in A-Block',
      intentScore: 92,
      settings: {
        ...DEFAULT_HOT_LEAD_SETTINGS,
        channels: {
          email: false,
          in_app: true,
          telegram: false,
          whatsapp: false,
          customer_warmup: false,
        },
      },
    };

    const result = await dispatchMultiChannelHotLead(payload);
    expect(result.in_app.success).toBe(true);
    expect(result.telegram.skipped).toBe(true);
    expect(result.whatsapp.skipped).toBe(true);
    expect(result.sla_tracked).toBe(true);
  });

  it('dispatches telegram alert when channel is enabled and available', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const payload: HotLeadDispatchPayload = {
      leadId: 'test-lead-id',
      customerPhone: '+919876543210',
      customerName: 'Sunil Verma',
      summary: 'Ready for registry',
      intentScore: 95,
      settings: {
        ...DEFAULT_HOT_LEAD_SETTINGS,
        channels: {
          email: false,
          in_app: false,
          telegram: true,
          whatsapp: false,
          customer_warmup: false,
        },
        telegram_config: {
          bot_token: '123456:ABC-DEF',
          target_chat_id: '-100987654321',
        },
      },
    };

    const result = await dispatchMultiChannelHotLead(payload);
    expect(result.telegram.success).toBe(true);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('isolates failures so telegram network error does not crash in_app dispatch', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Telegram API connection timeout'));
    vi.stubGlobal('fetch', fetchMock);

    const payload: HotLeadDispatchPayload = {
      leadId: 'test-lead-id-fail',
      customerPhone: '+919876543211',
      customerName: 'Vikram Singh',
      summary: 'Corner plot 250 sq yd',
      intentScore: 88,
      settings: {
        ...DEFAULT_HOT_LEAD_SETTINGS,
        channels: {
          email: false,
          in_app: true,
          telegram: true,
          whatsapp: false,
          customer_warmup: false,
        },
        telegram_config: {
          bot_token: '123456:FAIL-TOKEN',
          target_chat_id: '-100987654321',
        },
      },
    };

    const result = await dispatchMultiChannelHotLead(payload);
    expect(result.in_app.success).toBe(true);
    expect(result.telegram.success).toBe(false);
    expect(result.telegram.error).toBeDefined();
    expect(result.sla_tracked).toBe(true);
  });

  it('handles database rejection in in_app without throwing', async () => {
    notificationsInsertError = new Error('Database connection failed');

    const payload: HotLeadDispatchPayload = {
      leadId: 'test-lead-db-fail',
      customerPhone: '+919876543212',
      customerName: 'Anil Kumar',
      summary: 'Investment plot in commercial zone',
      intentScore: 90,
      settings: {
        ...DEFAULT_HOT_LEAD_SETTINGS,
        channels: {
          email: false,
          in_app: true,
          telegram: false,
          whatsapp: false,
          customer_warmup: false,
        },
      },
    };

    const result = await dispatchMultiChannelHotLead(payload);
    expect(result.in_app.success).toBe(false);
    expect(result.in_app.error).toContain('Database connection failed');
  });

  it('returns skipped for all channels when settings are disabled', async () => {
    const payload: HotLeadDispatchPayload = {
      leadId: 'test-lead-disabled',
      customerPhone: '+919876543213',
      summary: 'General query',
      intentScore: 80,
      settings: {
        ...DEFAULT_HOT_LEAD_SETTINGS,
        enabled: false,
      },
    };

    const result = await dispatchMultiChannelHotLead(payload);
    expect(result.email.skipped).toBe(true);
    expect(result.in_app.skipped).toBe(true);
    expect(result.telegram.skipped).toBe(true);
    expect(result.whatsapp.skipped).toBe(true);
    expect(result.customer_warmup.skipped).toBe(true);
    expect(result.sla_tracked).toBe(false);
  });

  it('dispatches telegram alert helper directly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const ok = await dispatchTelegramAlert('tok123', 'chat456', 'Test notification');
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/bottok123/sendMessage',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('dispatches sla breach escalation helper', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const success = await dispatchSlaBreachEscalation({
      leadId: 'lead-breach-1',
      customerPhone: '+919876543214',
      slaThresholdMinutes: 15,
      escalationTarget: 'Sales Director',
      settings: {
        ...DEFAULT_HOT_LEAD_SETTINGS,
        channels: {
          ...DEFAULT_HOT_LEAD_SETTINGS.channels,
          telegram: true,
        },
        telegram_config: {
          bot_token: 'bot-token-test',
          target_chat_id: 'chat-test-1',
        },
      },
    });

    expect(success).toBe(true);
  });
});
