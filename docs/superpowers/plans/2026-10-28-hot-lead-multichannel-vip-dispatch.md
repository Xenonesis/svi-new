# Hot Lead Multi-Channel VIP Dispatch & SLA Escalation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an enterprise-grade multi-channel alert dispatch system (Email, In-App, Telegram, WhatsApp, Customer Warmup) with an automated SLA escalation ladder and native in-CRM audio intent snippet seeking.

**Architecture:** A decoupled pipeline where Voice AI triage detects hot leads, an Availability Guard inspects environment and database settings to disable unconfigured channels, a multi-channel dispatcher broadcasts alerts across available channels concurrently, and a background cron worker tracks and escalates SLA breaches.

**Tech Stack:** Next.js 15, TypeScript (strict, zero `any`), Supabase (PostgreSQL + Storage), Resend API, Telegram Bot API, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-28-hot-lead-multichannel-vip-dispatch-design.md`

## Global Constraints

- Zero code comments across all created or modified source files.
- Strict TypeScript: No `: any` or `as any`. Use concrete interfaces and `import type`.
- Brand Aesthetic: Deep Obsidian Slate (`#080b11`, `#111622`) + Luxury Warm Gold (`#d4af37`).
- Zero database resets or schema drops. Table creation must be idempotent (`IF NOT EXISTS`).
- Push protocol: commit locally; push ONLY upon explicit user approval.

---

### Task 1: Extend Types with Multi-Channel & SLA Configuration

**Files:**

- Modify: `src/lib/leads/hotLeadNotificationTypes.ts`
- Test: `src/lib/leads/__tests__/hotLeadNotificationTypes.test.ts`

**Interfaces:**

- Produces: `ChannelHealthStatus`, `TelegramChannelConfig`, `WhatsAppChannelConfig`, `CustomerWarmupConfig`, `SlaConfig`, updated `HotLeadNotificationSettings`.

- [ ] **Step 1: Write the failing type validation test**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/leads/__tests__/hotLeadNotificationTypes.test.ts`
Expected: FAIL because `channels` and `sla_config` are not yet declared on `DEFAULT_HOT_LEAD_SETTINGS`.

- [ ] **Step 3: Update `src/lib/leads/hotLeadNotificationTypes.ts`**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/leads/__tests__/hotLeadNotificationTypes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/leads/hotLeadNotificationTypes.ts src/lib/leads/__tests__/hotLeadNotificationTypes.test.ts
git commit -m "feat: declare multi-channel and sla configuration types"
```

---

### Task 2: Channel Availability Guard

**Files:**

- Create: `src/lib/leads/channelAvailability.ts`
- Test: `src/lib/leads/__tests__/channelAvailability.test.ts`

**Interfaces:**

- Consumes: `HotLeadNotificationSettings`, `ChannelHealthStatus` from `src/lib/leads/hotLeadNotificationTypes.ts`.
- Produces: `resolveChannelAvailability(settings: HotLeadNotificationSettings, envMap?: Record<string, string | undefined>): ChannelHealthStatus`.

- [ ] **Step 1: Write the failing unit test**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/leads/__tests__/channelAvailability.test.ts`
Expected: FAIL with "module not found" or "resolveChannelAvailability is not defined".

- [ ] **Step 3: Implement `src/lib/leads/channelAvailability.ts`**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/leads/__tests__/channelAvailability.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/leads/channelAvailability.ts src/lib/leads/__tests__/channelAvailability.test.ts
git commit -m "feat: add channel availability resolver"
```

---

### Task 3: Database Migration for SLA Tracking

**Files:**

- Create: `supabase/migrations/20261028_lead_sla_tracking.sql`
- Test: Run script or sql check via node/cli.

**Interfaces:**

- Produces: `lead_sla_tracking` table in Supabase.

- [ ] **Step 1: Write SQL migration file**

Create `supabase/migrations/20261028_lead_sla_tracking.sql`:

```sql
CREATE TABLE IF NOT EXISTS lead_sla_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES chat_leads(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  assigned_advisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_advisor_name TEXT,
  sla_threshold_minutes INTEGER NOT NULL DEFAULT 15,
  sla_expires_at TIMESTAMPTZ NOT NULL,
  contacted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending_contact' CHECK (status IN ('pending_contact', 'contacted_in_sla', 'breached_escalated')),
  escalated_at TIMESTAMPTZ,
  escalation_target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_sla_status_expires
ON lead_sla_tracking (status, sla_expires_at)
WHERE status = 'pending_contact';
```

- [ ] **Step 2: Apply migration to Supabase using node execution**

Run script to execute SQL via Supabase client or RPC:

```bash
node -e "const { supabaseAdmin } = require('./src/lib/supabase/admin.ts');"
```

Or execute through Supabase SQL client helper.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20261028_lead_sla_tracking.sql
git commit -m "feat: add lead sla tracking table migration"
```

---

### Task 4: Multi-Channel Dispatcher Module

**Files:**

- Create: `src/lib/leads/multiChannelDispatcher.ts`
- Test: `src/lib/leads/__tests__/multiChannelDispatcher.test.ts`

**Interfaces:**

- Consumes: `resolveChannelAvailability`, `HotLeadRecipient`, `HotLeadNotificationSettings`.
- Produces: `dispatchMultiChannelHotLead(payload: HotLeadDispatchPayload): Promise<MultiChannelDispatchResult>`.

- [ ] **Step 1: Write the failing unit test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  dispatchMultiChannelHotLead,
  type HotLeadDispatchPayload,
} from '../multiChannelDispatcher';
import { DEFAULT_HOT_LEAD_SETTINGS } from '../hotLeadNotificationTypes';

describe('dispatchMultiChannelHotLead', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/leads/__tests__/multiChannelDispatcher.test.ts`
Expected: FAIL because `multiChannelDispatcher.ts` is not yet implemented.

- [ ] **Step 3: Implement `src/lib/leads/multiChannelDispatcher.ts`**

```typescript
import { resolveChannelAvailability } from './channelAvailability';
import type { HotLeadNotificationSettings } from './hotLeadNotificationTypes';
import { supabaseAdmin } from '../supabase/admin';

export interface HotLeadDispatchPayload {
  leadId: string;
  customerPhone: string;
  customerName?: string;
  summary: string;
  intentScore: number;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  keyQuote?: string;
  keyQuoteStartSec?: number;
  keyQuoteEndSec?: number;
  settings: HotLeadNotificationSettings;
}

export interface ChannelDispatchOutcome {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

export interface MultiChannelDispatchResult {
  email: ChannelDispatchOutcome;
  in_app: ChannelDispatchOutcome;
  telegram: ChannelDispatchOutcome;
  whatsapp: ChannelDispatchOutcome;
  customer_warmup: ChannelDispatchOutcome;
  sla_tracked: boolean;
}

export async function dispatchTelegramAlert(
  token: string,
  chatId: string,
  text: string
): Promise<boolean> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });
  return response.ok;
}

export async function dispatchMultiChannelHotLead(
  payload: HotLeadDispatchPayload
): Promise<MultiChannelDispatchResult> {
  const { settings, customerPhone, customerName, summary, intentScore, leadId } = payload;
  const availability = resolveChannelAvailability(settings);

  const results: MultiChannelDispatchResult = {
    email: { success: false, skipped: true },
    in_app: { success: false, skipped: true },
    telegram: { success: false, skipped: true },
    whatsapp: { success: false, skipped: true },
    customer_warmup: { success: false, skipped: true },
    sla_tracked: false,
  };

  const tasks: Promise<void>[] = [];

  if (settings.channels.in_app && availability.in_app.available) {
    tasks.push(
      (async () => {
        try {
          const { error } = await supabaseAdmin.from('notifications').insert({
            title: `VIP Hot Lead: ${customerName || customerPhone}`,
            message: `${summary} (Intent: ${intentScore}/100)`,
            type: 'hot_lead',
            data: {
              lead_id: leadId,
              phone: customerPhone,
              intent_score: intentScore,
              audio_chime: true,
            },
          });
          results.in_app = { success: !error, error: error?.message };
        } catch (err: unknown) {
          results.in_app = {
            success: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })()
    );
  }

  if (settings.channels.telegram && availability.telegram.available) {
    tasks.push(
      (async () => {
        try {
          const token = settings.telegram_config.bot_token || process.env.TELEGRAM_BOT_TOKEN || '';
          const chatId =
            settings.telegram_config.target_chat_id || process.env.TELEGRAM_CHAT_ID || '';
          if (!token || !chatId) {
            results.telegram = { success: false, error: 'Missing Telegram token or chat ID' };
            return;
          }
          const message = `🔥 *VIP HOT LEAD ALERT*\n\n*Customer:* ${customerName || 'Prospect'} (${customerPhone})\n*Intent Score:* ${intentScore}/100\n*Summary:* ${summary}\n\n[Open Lead in CRM](https://sviinfrasolutions.com/admin/leads?id=${leadId})`;
          const ok = await dispatchTelegramAlert(token, chatId, message);
          results.telegram = { success: ok };
        } catch (err: unknown) {
          results.telegram = {
            success: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })()
    );
  }

  const slaMinutes = settings.sla_config.sla_threshold_minutes || 15;
  const expiresAt = new Date(Date.now() + slaMinutes * 60 * 1000).toISOString();

  tasks.push(
    (async () => {
      try {
        const { error } = await supabaseAdmin.from('lead_sla_tracking').insert({
          lead_id: leadId,
          customer_phone: customerPhone,
          assigned_advisor_id: payload.assignedAdvisorId || null,
          assigned_advisor_name: payload.assignedAdvisorName || null,
          sla_threshold_minutes: slaMinutes,
          sla_expires_at: expiresAt,
          status: 'pending_contact',
        });
        results.sla_tracked = !error;
      } catch {
        results.sla_tracked = false;
      }
    })()
  );

  await Promise.allSettled(tasks);
  return results;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/leads/__tests__/multiChannelDispatcher.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/leads/multiChannelDispatcher.ts src/lib/leads/__tests__/multiChannelDispatcher.test.ts
git commit -m "feat: implement multi-channel hot lead dispatcher"
```

---

### Task 5: SLA Escalation Cron Route

**Files:**

- Create: `app/api/cron/lead-sla-escalation/route.ts`
- Test: `app/api/cron/lead-sla-escalation/__tests__/route.test.ts`

**Interfaces:**

- Produces: `GET /api/cron/lead-sla-escalation` endpoint with `CRON_SECRET` validation.

- [ ] **Step 1: Write the failing endpoint test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';

describe('GET /api/cron/lead-sla-escalation', () => {
  it('returns 401 when authorization header is missing and CRON_SECRET is configured', async () => {
    process.env.CRON_SECRET = 'secret_test';
    const req = new NextRequest('http://localhost:3000/api/cron/lead-sla-escalation');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/cron/lead-sla-escalation/__tests__/route.test.ts`
Expected: FAIL because route does not exist.

- [ ] **Step 3: Implement `app/api/cron/lead-sla-escalation/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nowIso = new Date().toISOString();

  const { data: breachedRows, error } = await supabaseAdmin
    .from('lead_sla_tracking')
    .select('*')
    .eq('status', 'pending_contact')
    .lt('sla_expires_at', nowIso)
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!breachedRows || breachedRows.length === 0) {
    return NextResponse.json({ message: 'No SLA breaches found', processed: 0 });
  }

  const escalatedIds: string[] = [];

  for (const row of breachedRows) {
    await supabaseAdmin.from('notifications').insert({
      title: `🚨 SLA BREACH: Lead ${row.customer_phone}`,
      message: `Lead was not contacted within ${row.sla_threshold_minutes} minutes. Urgent escalation to Director.`,
      type: 'sla_breach',
      data: {
        lead_id: row.lead_id,
        phone: row.customer_phone,
        audio_chime: true,
      },
    });

    await supabaseAdmin
      .from('lead_sla_tracking')
      .update({
        status: 'breached_escalated',
        escalated_at: nowIso,
        escalation_target: 'Sales Director',
      })
      .eq('id', row.id);

    escalatedIds.push(row.id);
  }

  return NextResponse.json({
    message: 'SLA breach escalation processed',
    escalated_count: escalatedIds.length,
    ids: escalatedIds,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/cron/lead-sla-escalation/__tests__/route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/lead-sla-escalation/route.ts app/api/cron/lead-sla-escalation/__tests__/route.test.ts
git commit -m "feat: add lead sla escalation cron endpoint"
```

---

### Task 6: Admin Settings UI Channel Grid & Availability Lock

**Files:**

- Modify: `app/api/admin/settings/hot-lead-alerts/route.ts`
- Modify: `src/components/admin/settings/NotificationsTab.tsx`
- Test: Vitest UI/component test and Next.js build.

**Interfaces:**

- GET returns `{ settings: HotLeadNotificationSettings, channel_status: ChannelHealthStatus }`.
- UI renders toggle switches; when `channel_status[ch].available === false`, toggle is disabled with amber badge.

- [ ] **Step 1: Write API response test for channel status**

```typescript
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/admin/settings/hot-lead-alerts/route';

describe('GET /api/admin/settings/hot-lead-alerts', () => {
  it('returns both settings and channel_status', async () => {
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.channel_status).toBeDefined();
    expect(json.channel_status.in_app.available).toBe(true);
  });
});
```

- [ ] **Step 2: Update `app/api/admin/settings/hot-lead-alerts/route.ts`**

Update `GET` handler to invoke `resolveChannelAvailability` and return `channel_status` alongside `settings`.

- [ ] **Step 3: Update `src/components/admin/settings/NotificationsTab.tsx`**

Integrate:

- Channel status grid: Email, In-App, Telegram, WhatsApp, Customer Warmup.
- Badges: `[Active]`, `[Disabled]`, `[⚠️ Unavailable: Missing API Key]`.
- Input fields for Telegram Bot Token, Telegram Chat ID, and SLA threshold slider (15m, 30m, 45m, 60m).
- Channel test triggers (`[⚡ Test Ping]`).

- [ ] **Step 4: Run typecheck and tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/settings/hot-lead-alerts/route.ts src/components/admin/settings/NotificationsTab.tsx
git commit -m "feat: add channel status grid and availability locks in admin settings"
```

---

### Task 7: Audio Intent Seeker Component in CRM

**Files:**

- Create: `src/components/admin/leads/AudioQuoteSeeker.tsx`
- Test: `src/components/admin/leads/__tests__/AudioQuoteSeeker.test.tsx`

**Interfaces:**

- Consumes: `{ audioUrl: string, startSec: number, endSec: number, quote: string }`.
- Produces: Inline luxury Obsidian/Gold mini audio player that seeks natively to `startSec` and auto-stops at `endSec`.

- [ ] **Step 1: Write component unit test**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AudioQuoteSeeker } from '../AudioQuoteSeeker';

describe('AudioQuoteSeeker', () => {
  it('renders quote text and time offsets', () => {
    render(
      <AudioQuoteSeeker
        audioUrl="https://example.com/test.mp3"
        startSec={42}
        endSec={68}
        quote="A-Block plot final hai, token ready hai"
      />
    );
    expect(screen.getByText(/A-Block plot final hai/i)).toBeDefined();
    expect(screen.getByText(/00:42 - 01:08/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Implement `src/components/admin/leads/AudioQuoteSeeker.tsx`**

```tsx
'use client';

import React, { useRef, useState } from 'react';
import { Play, Pause, Flame } from 'lucide-react';

interface AudioQuoteSeekerProps {
  audioUrl: string;
  startSec: number;
  endSec: number;
  quote: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const AudioQuoteSeeker: React.FC<AudioQuoteSeekerProps> = ({
  audioUrl,
  startSec,
  endSec,
  quote,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startSec;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.currentTime >= endSec) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.currentTime = startSec;
    }
  };

  return (
    <div className="rounded-xl border border-[#d4af37]/30 bg-[#080b11] p-3 shadow-lg">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        preload="none"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d4af37] text-black transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'Pause snippet' : 'Play key quote'}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#d4af37]">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>
              High-Intent Quote ({formatTime(startSec)} - {formatTime(endSec)})
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-300 italic">"{quote}"</p>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Run test to verify it passes**

Run: `npx vitest run src/components/admin/leads/__tests__/AudioQuoteSeeker.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/leads/AudioQuoteSeeker.tsx src/components/admin/leads/__tests__/AudioQuoteSeeker.test.tsx
git commit -m "feat: add native audio intent seeker player component"
```

---

### Task 8: Verification & End-to-End Build Validation

**Files:**

- Test all components and endpoints.

- [ ] **Step 1: Run comprehensive Vitest suite**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 2: Run TypeScript strict check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run Turbopack production build**

Run: `npm run build`
Expected: Successfully compiled.
