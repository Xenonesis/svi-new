import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

const HTTP_PREFIX = 'http:' + String.fromCharCode(47, 47) + 'localhost:3000';
const HTTPS_PREFIX = 'https:' + String.fromCharCode(47, 47) + 'telephony.example.com';

vi.mock('@/src/lib/supabase/admin', () => {
  const fakeFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'ivr_call_records') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'call-rec-123' },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
    }

    if (table === 'chat_leads') {
      return {
        upsert: vi.fn().mockResolvedValue({ error: null }),
      };
    }

    if (table === 'profiles') {
      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id: 'advisor-1', full_name: 'Deepa Sharma', phone: '9876543210' }],
            error: null,
          }),
        }),
      };
    }

    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
  });

  return {
    supabaseAdmin: {
      from: fakeFrom,
    },
  };
});

vi.mock('@/src/lib/leads/syncRecordingToStorage', () => ({
  syncRecordingToInHouseStorage: vi.fn().mockResolvedValue({
    success: true,
    storagePath: '2026/10/9876543210_recording.mp3',
  }),
}));

vi.mock('@/src/lib/leads/callIntelligence', () => ({
  generateCallIntelligence: vi.fn().mockResolvedValue({
    summary: 'Customer enquiry',
    interest_level: 'Warm',
  }),
}));

describe('Telephony Webhook Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TELEPHONY_WEBHOOK_SECRET = 'test_secret_123';
  });

  it('rejects unauthorized GET requests', async () => {
    const req = new NextRequest(`${HTTP_PREFIX}/api/webhooks/telephony`);
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('allows authorized GET ping via query secret', async () => {
    const req = new NextRequest(`${HTTP_PREFIX}/api/webhooks/telephony?secret=test_secret_123`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.message).toBe('Telephony webhook active');
  });

  it('allows authorized GET ping via header', async () => {
    const req = new NextRequest(`${HTTP_PREFIX}/api/webhooks/telephony`, {
      headers: {
        'x-telephony-secret': 'test_secret_123',
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('rejects unauthorized POST requests', async () => {
    const req = new NextRequest(`${HTTP_PREFIX}/api/webhooks/telephony`, {
      method: 'POST',
      body: JSON.stringify({ customer_phone: '9876543210' }),
      headers: {
        'content-type': 'application/json',
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects POST with missing customer phone', async () => {
    const req = new NextRequest(`${HTTP_PREFIX}/api/webhooks/telephony`, {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
        'x-telephony-secret': 'test_secret_123',
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain('customer phone');
  });

  it('processes valid standard JSON call payload', async () => {
    const req = new NextRequest(`${HTTP_PREFIX}/api/webhooks/telephony`, {
      method: 'POST',
      body: JSON.stringify({
        customer_phone: '9876543210',
        agent_name: 'Deepa Sharma',
        agent_phone: '9876543210',
        call_duration: 65,
        dial_status: 'ANSWER',
        recording_url: `${HTTPS_PREFIX}/recordings/call_123.wav`,
        dial_time: '2026-10-29 14:00:00',
      }),
      headers: {
        'content-type': 'application/json',
        'x-telephony-secret': 'test_secret_123',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.id).toBe('call-rec-123');
    expect(json.customer_phone).toBe('9876543210');
    expect(json.queued_ai_triage).toBe(true);
  });

  it('normalizes provider-specific fields like CustomerNumber and Duration', async () => {
    const req = new NextRequest(`${HTTP_PREFIX}/api/webhooks/telephony`, {
      method: 'POST',
      body: JSON.stringify({
        CustomerNumber: '+91 9988776655',
        AgentName: 'Telecaller',
        Duration: '45',
        CallStatus: 'completed',
        RecordingUrl: `${HTTPS_PREFIX}/recordings/provider_rec.wav`,
      }),
      headers: {
        'content-type': 'application/json',
        'x-telephony-secret': 'test_secret_123',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.customer_phone).toBe('9988776655');
    expect(json.queued_ai_triage).toBe(true);
  });
});
