import { createHmac } from 'node:crypto';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseWebhook: vi.fn(),
  persistWebhookEvents: vi.fn(),
}));

vi.mock('@/src/lib/whatsapp/provider', () => ({
  getWhatsAppProvider: () => ({ parseWebhook: mocks.parseWebhook }),
}));
vi.mock('@/src/lib/whatsapp/persistence', () => ({
  persistWebhookEvents: mocks.persistWebhookEvents,
}));

import { GET, POST } from '@/app/api/whatsapp/webhook/route';

const ORIGINAL_ENV = { ...process.env };
const APP_SECRET = 'webhook-test-secret';

function signature(body: string): string {
  return `sha256=${createHmac('sha256', APP_SECRET).update(body).digest('hex')}`;
}

function postRequest(body: string, value = signature(body)): NextRequest {
  return new NextRequest('http://localhost/api/whatsapp/webhook', {
    method: 'POST',
    body,
    headers: { 'x-hub-signature-256': value },
  });
}

beforeEach(() => {
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'verify-me';
  process.env.WHATSAPP_APP_SECRET = APP_SECRET;
  mocks.parseWebhook.mockReset();
  mocks.persistWebhookEvents.mockReset();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('WhatsApp webhook route', () => {
  it('returns the challenge only for a matching verification token', async () => {
    const accepted = await GET(
      new NextRequest(
        'http://localhost/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345'
      )
    );
    const rejected = await GET(
      new NextRequest(
        'http://localhost/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345'
      )
    );

    expect(accepted.status).toBe(200);
    await expect(accepted.text()).resolves.toBe('12345');
    expect(rejected.status).toBe(401);
  });

  it('rejects an invalid signature before parsing the payload', async () => {
    const response = await POST(postRequest('{}', 'sha256=invalid'));

    expect(response.status).toBe(401);
    expect(mocks.parseWebhook).not.toHaveBeenCalled();
  });

  it('rejects signed malformed JSON without persistence', async () => {
    const response = await POST(postRequest('{'));

    expect(response.status).toBe(400);
    expect(mocks.persistWebhookEvents).not.toHaveBeenCalled();
  });

  it('parses, persists, and acknowledges a valid signed payload', async () => {
    const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
    const events = [{ kind: 'status', providerMessageId: 'wamid.1' }];
    mocks.parseWebhook.mockReturnValue(events);

    const response = await POST(postRequest(body));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(mocks.persistWebhookEvents).toHaveBeenCalledWith(events);
  });
});
