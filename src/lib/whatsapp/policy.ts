import type { MessagingEligibilityDecision, MessagingEligibilityInput } from './types';

const TIME_ZONE = 'Asia/Kolkata';
const QUIET_START_HOUR = 20;
const QUIET_END_HOUR = 9;

function localHour(date: Date): number {
  const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  return Number(hour);
}

export function isOutboundQuietHours(date = new Date()): boolean {
  const hour = localHour(date);
  return hour >= QUIET_START_HOUR || hour < QUIET_END_HOUR;
}

export function nextOutboundWindow(date = new Date()): Date {
  if (!isOutboundQuietHours(date)) return date;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const addDay = Number(values.hour) >= QUIET_START_HOUR ? 1 : 0;
  const localMidnightUtc = new Date(`${values.year}-${values.month}-${values.day}T00:00:00.000Z`);
  localMidnightUtc.setUTCDate(localMidnightUtc.getUTCDate() + addDay);
  // 09:00 Asia/Kolkata is 03:30 UTC.
  localMidnightUtc.setUTCHours(3, 30, 0, 0);
  return localMidnightUtc;
}

function allowlisted(recipient: string): boolean {
  const configured = (process.env.WHATSAPP_TEST_NUMBER_ALLOWLIST ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (configured.length === 0) return process.env.NODE_ENV !== 'production';
  return configured.includes(recipient);
}

export function evaluateMessagingEligibility(
  input: MessagingEligibilityInput
): MessagingEligibilityDecision {
  const now = input.now ?? new Date();
  if (input.consentStatus === 'opted_out') {
    return { allowed: false, messageMode: 'none', denialReason: 'contact_opted_out' };
  }
  if (input.conversationMode === 'human' && input.autonomous) {
    return { allowed: false, messageMode: 'none', denialReason: 'human_takeover' };
  }
  if (input.conversationMode === 'paused') {
    return { allowed: false, messageMode: 'none', denialReason: 'conversation_paused' };
  }
  if (!allowlisted(input.recipient) && process.env.WHATSAPP_MOCK_SEND === 'false') {
    return { allowed: false, messageMode: 'none', denialReason: 'test_number_not_allowed' };
  }

  const serviceWindowOpen = Boolean(
    input.serviceWindowExpiresAt && new Date(input.serviceWindowExpiresAt).getTime() > now.getTime()
  );
  if (!input.businessInitiated && serviceWindowOpen) {
    return { allowed: true, messageMode: 'session' };
  }
  if (!input.businessInitiated) {
    return { allowed: false, messageMode: 'none', denialReason: 'service_window_closed' };
  }
  if (input.autonomous && process.env.AUTONOMOUS_OUTBOUND_ENABLED !== 'true') {
    return { allowed: false, messageMode: 'none', denialReason: 'global_kill_switch' };
  }
  if (input.consentStatus !== 'opted_in') {
    return { allowed: false, messageMode: 'none', denialReason: 'missing_consent' };
  }
  if ((input.completedFollowUps ?? 0) >= 2) {
    return { allowed: false, messageMode: 'none', denialReason: 'follow_up_cap_reached' };
  }
  if (isOutboundQuietHours(now)) {
    return { allowed: false, messageMode: 'none', denialReason: 'quiet_hours' };
  }
  if (!input.template) {
    return { allowed: false, messageMode: 'none', denialReason: 'template_required' };
  }
  if (!input.template.active || input.template.providerStatus !== 'approved') {
    return { allowed: false, messageMode: 'none', denialReason: 'template_not_approved' };
  }
  return { allowed: true, messageMode: 'template' };
}
