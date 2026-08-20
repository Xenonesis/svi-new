import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isOptOutMessage } from '@/src/lib/whatsapp/opt-out';
import { normalizeE164 } from '@/src/lib/whatsapp/phone';
import { evaluateMessagingEligibility, isOutboundQuietHours } from '@/src/lib/whatsapp/policy';
import { verifyMetaWebhookSignature } from '@/src/lib/whatsapp/signature';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.WHATSAPP_MOCK_SEND = 'true';
  process.env.AUTONOMOUS_OUTBOUND_ENABLED = 'false';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('WhatsApp webhook signature', () => {
  it('accepts the raw body only with the matching SHA-256 signature', () => {
    const body = JSON.stringify({ object: 'whatsapp_business_account' });
    const secret = 'test-secret';
    const signature = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
    expect(verifyMetaWebhookSignature(body, signature, secret)).toBe(true);
    expect(verifyMetaWebhookSignature(`${body} `, signature, secret)).toBe(false);
    expect(verifyMetaWebhookSignature(body, null, secret)).toBe(false);
  });
});

describe('phone normalization and opt-out', () => {
  it('normalizes local and provider Indian numbers to one E.164 value', () => {
    expect(normalizeE164('98765 43210')).toBe('+919876543210');
    expect(normalizeE164('919876543210')).toBe('+919876543210');
    expect(normalizeE164('123')).toBeNull();
  });

  it.each([
    'STOP',
    'unsubscribe please',
    'message mat karo',
    'band karo',
    'मैसेज बंद करो',
    'मुझे संदेश नहीं चाहिए',
  ])('detects opt-out text: %s', (text) => expect(isOptOutMessage(text)).toBe(true));

  it('does not treat ordinary property questions as opt-outs', () => {
    expect(isOptOutMessage('Plot ka price batao')).toBe(false);
  });
});

describe('messaging eligibility', () => {
  const base = {
    recipient: '+919876543210',
    businessInitiated: true,
    autonomous: true,
    conversationMode: 'ai' as const,
    consentStatus: 'opted_in' as const,
    template: { active: true, providerStatus: 'approved' },
    completedFollowUps: 0,
  };

  it('allows an inbound session reply without marketing opt-in during the service window', () => {
    const now = new Date('2026-08-20T08:00:00.000Z');
    expect(
      evaluateMessagingEligibility({
        ...base,
        now,
        businessInitiated: false,
        consentStatus: 'unknown',
        serviceWindowExpiresAt: '2026-08-20T08:00:01.000Z',
      })
    ).toEqual({ allowed: true, messageMode: 'session' });
  });

  it('closes the service window exactly at the boundary', () => {
    const now = new Date('2026-08-20T08:00:00.000Z');
    expect(
      evaluateMessagingEligibility({
        ...base,
        now,
        businessInitiated: false,
        serviceWindowExpiresAt: now.toISOString(),
      }).denialReason
    ).toBe('service_window_closed');
  });

  it('enforces opt-out, takeover, pause, and the global outbound switch', () => {
    expect(evaluateMessagingEligibility({ ...base, consentStatus: 'opted_out' }).denialReason).toBe(
      'contact_opted_out'
    );
    expect(evaluateMessagingEligibility({ ...base, conversationMode: 'human' }).denialReason).toBe(
      'human_takeover'
    );
    expect(evaluateMessagingEligibility({ ...base, conversationMode: 'paused' }).denialReason).toBe(
      'conversation_paused'
    );
    expect(evaluateMessagingEligibility(base).denialReason).toBe('global_kill_switch');
  });

  it('enforces quiet hours, approval, consent, and the two-follow-up cap', () => {
    process.env.AUTONOMOUS_OUTBOUND_ENABLED = 'true';
    expect(isOutboundQuietHours(new Date('2026-08-20T14:31:00.000Z'))).toBe(true);
    expect(
      evaluateMessagingEligibility({ ...base, now: new Date('2026-08-20T14:31:00.000Z') })
        .denialReason
    ).toBe('quiet_hours');
    const businessHours = new Date('2026-08-20T08:00:00.000Z');
    expect(
      evaluateMessagingEligibility({ ...base, now: businessHours, consentStatus: 'unknown' })
        .denialReason
    ).toBe('missing_consent');
    expect(
      evaluateMessagingEligibility({
        ...base,
        now: businessHours,
        template: { active: false, providerStatus: 'approved' },
      }).denialReason
    ).toBe('template_not_approved');
    expect(
      evaluateMessagingEligibility({ ...base, now: businessHours, completedFollowUps: 2 })
        .denialReason
    ).toBe('follow_up_cap_reached');
    expect(evaluateMessagingEligibility({ ...base, now: businessHours })).toEqual({
      allowed: true,
      messageMode: 'template',
    });
  });
});
