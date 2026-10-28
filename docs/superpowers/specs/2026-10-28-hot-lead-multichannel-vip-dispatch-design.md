# Hot Lead Multi-Channel VIP Dispatch & SLA Escalation Engine Spec

## Overview

An enterprise-grade, multi-channel alert and response-tracking engine for high-intent real estate leads detected via Voice AI IVR call triage. The system dispatches alerts across configured and verified channels (In-App, Email, Telegram Bot, WhatsApp, Customer Auto-Warmup), enforces a strict response SLA (e.g., 15 minutes) with manager escalation, and provides inline audio snippet seeking in the CRM.

## Core Invariants

- Zero code comments across all created or modified source files.
- Safe channel availability detection: missing credentials in `.env` or settings automatically lock toggles to disabled state in Admin UI.
- Strict database immutability: zero column deletions or schema resets.
- Fault isolation: failure in one external delivery channel (e.g., WhatsApp timeout) must not abort other channels or Voice AI triage.

## Architecture & Data Flow

```
[IVR Call Ended]
       │
       ▼
[Voice AI Triage (Groq)] ──► Mark Hot Lead in chat_leads
       │
       ▼
[Channel Availability Guard] ──► Inspects .env & settings
       │
       ├────────────────────────────────────────┬───────────────────┐
       ▼                                        ▼                   ▼
[1. Internal Alerts]                   [2. SLA Tracker]     [3. Customer Msg]
• In-App notification + Audio chime    • Insert SLA record  • Auto WhatsApp / SMS
• Resend Obsidian/Gold Email           • 15m expiration     • PDF brochure link
• Telegram Bot alert to Sales Group    • Worker monitoring
• WhatsApp Business alert to Advisor
       │
       ▼
[SLA Escalation Worker (/api/cron/lead-sla-escalation)]
• Polls breached records (status = pending_contact AND sla_expires_at < NOW())
• Escalates to Sales Director / Operations Head
```

## System Components

### 1. Channel Availability Resolver (`src/lib/leads/channelAvailability.ts`)

Inspects active environment variables and settings to determine whether each delivery channel can safely operate.

```typescript
export interface ChannelHealthStatus {
  email: { available: boolean; source: 'env' | 'missing'; key: string };
  in_app: { available: boolean; source: 'supabase' };
  telegram: { available: boolean; source: 'env' | 'settings' | 'missing'; key: string };
  whatsapp: { available: boolean; source: 'env' | 'settings' | 'missing'; key: string };
  customer_warmup: { available: boolean; source: 'whatsapp_dependent' | 'missing'; key: string };
}
```

Resolution logic:

- `email`: requires `RESEND_API_KEY`.
- `in_app`: always `true` when Supabase credentials are valid.
- `telegram`: requires `TELEGRAM_BOT_TOKEN` in `.env` or `telegram_config.bot_token` in settings.
- `whatsapp`: requires `WHATSAPP_ACCESS_TOKEN` / `META_ACCESS_TOKEN` in `.env` or `whatsapp_config.api_key` in settings.
- `customer_warmup`: requires active `whatsapp` channel availability.

### 2. Multi-Channel Dispatcher (`src/lib/leads/multiChannelDispatcher.ts`)

Dispatches alerts asynchronously across enabled and available channels.

- **In-App**: Creates notification in `notifications` table with audio chime flag.
- **Email**: Dispatches luxury Obsidian/Gold HTML email via Resend and logs into `email_messages`.
- **Telegram Bot**: Sends structured Markdown card to configured `target_chat_id` with customer phone, Hinglish intent summary, and direct WhatsApp contact link.
- **WhatsApp Advisor Alert**: Sends WhatsApp message to assigned advisor with 1-click `[Call Lead]` action.
- **Customer Auto-Warmup**: Sends WhatsApp/SMS greeting and official project brochure link to the customer.

### 3. Database Schema: `lead_sla_tracking`

Idempotent SQL table creation to track response time commitments:

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

### 4. SLA Escalation Monitor Route (`app/api/cron/lead-sla-escalation/route.ts`)

- Scheduled via cron (every 2-5 minutes).
- Protected by `CRON_SECRET` authorization header.
- Queries `lead_sla_tracking` for rows where `status = 'pending_contact' AND sla_expires_at < NOW()`.
- Dispatches high-priority escalation notifications (In-App + Email + Telegram) to configured escalation targets.
- Updates status to `breached_escalated` and sets `escalated_at = NOW()`.

### 5. Audio Intent Clip Seeker in CRM

Groq Voice AI triage captures quote dialogue and timestamps:

- `key_quote`: Dialogue string expressing buying intent.
- `key_quote_start_sec`: Integer starting offset in seconds.
- `key_quote_end_sec`: Integer ending offset in seconds.

CRM Audio Player component:

- Streams existing transcoded 32kbps MP3 from private bucket `call-recordings`.
- Seeks directly to `key_quote_start_sec`.
- Stops playback automatically when reaching `key_quote_end_sec`.
- Avoids backend ffmpeg clipping or additional storage allocations.

### 6. Admin Settings UI (`src/components/admin/settings/NotificationsTab.tsx`)

- Displays Channel Status Grid with toggle switches for Email, In-App, Telegram, WhatsApp, and Customer Warmup.
- When `available === false`, switches are disabled with an amber warning badge (`Unavailable: Missing API Key`).
- Provides drawer or input fields for Telegram Bot Token, Chat ID, WhatsApp Provider, Customer Greeting Template, and SLA Threshold (15, 30, 45, 60 minutes).
- Includes channel test dispatch triggers (`[⚡ Test Ping]`).

## Error Handling & Reliability

- External network requests (Telegram, Resend, WhatsApp) are wrapped with 8-second timeouts.
- Each channel runs independently using `Promise.allSettled`.
- Detailed delivery errors are logged into `portal_settings` health logs without throwing unhandled exceptions into the triage process.

## Testing & Verification Plan

1. **Unit Tests**:
   - `channelAvailability.test.ts`: Verify missing environment variables correctly return `available: false`.
   - `multiChannelDispatcher.test.ts`: Verify independent channel failures do not affect other channels.
   - `slaEscalation.test.ts`: Verify SLA breach detection logic and status transitions.
2. **Build & Typecheck**:
   - Run `npx tsc --noEmit` to ensure clean TypeScript compilation.
   - Run Next.js production build check.
3. **Admin UI Verification**:
   - Load `/admin/settings?tab=notifications` and confirm that missing API keys render disabled toggles with warning badges.
