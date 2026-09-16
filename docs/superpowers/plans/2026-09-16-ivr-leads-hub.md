# Master Leads Hub & IVR Telephony Campaign Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a consolidated Master Leads Hub (`/admin/leads`) with in-app CSV upload, high-speed parsing for 4,000+ row IVR reports (e.g. `report (6).csv`), dual-tier database persistence (`ivr_call_records` + `chat_leads`), automatic advisor resolution, and dial status (`ANSWER` vs `NOANSWER`) filtering.

**Architecture:** A streaming CSV ingestion API parses call records into `ivr_call_records` and upserts unique customer leads into `chat_leads`. A modular React interface under `/admin/leads` provides dedicated views for IVR Campaign Leads, AI Chatbot Leads, and Consolidated Pipeline, complete with KPI metrics, dial status badges, advisor filtering, and one-click manual temperature overrides.

**Tech Stack:** Next.js 15+ (App Router), TypeScript 5.9+, Tailwind CSS, Supabase (PostgreSQL), Lucide React, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-16-ivr-leads-hub-design.md`

## Global Constraints

- `ts-import-type`: Use top-level `import type` declarations for type-only dependencies.
- `ts-no-dynamic-import`: Static imports for author-time known modules.
- `ts-no-any`: Zero `any` casts; declare explicit TypeScript interfaces.
- `ts-no-return-type`: Do not publish contracts through `ReturnType<typeof fn>`. Name and export concrete types.
- Strict pre-commit / pre-push: typecheck, lint-staged, commitlint (under 100 char headers), security audit, no console leaks, no debuggers.

---

### Task 1: Database Migration - `ivr_call_records` Table & Indexes

**Files:**

- Create: `supabase/migrations/20260916_ivr_call_records.sql`

**Interfaces:**

- Produces: `ivr_call_records` table in Supabase PostgreSQL with phone, agent, dial timestamps, duration, dial_status, pressed_key, and indexes.

- [ ] **Step 1: Write the migration file**

```sql
-- Migration: Create ivr_call_records table for granular telephony logs
CREATE TABLE IF NOT EXISTS public.ivr_call_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_phone VARCHAR(20) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    agent_phone VARCHAR(20),
    assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    dial_time TIMESTAMPTZ NOT NULL,
    customer_ans_time TIMESTAMPTZ,
    customer_hang_time TIMESTAMPTZ,
    call_duration INTEGER NOT NULL DEFAULT 0,
    dial_status VARCHAR(50) NOT NULL DEFAULT 'NOANSWER',
    pressed_key VARCHAR(10),
    campaign_name VARCHAR(150) NOT NULL DEFAULT 'General Campaign',
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ivr_call_records_phone ON public.ivr_call_records(customer_phone);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_agent ON public.ivr_call_records(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_dial_time ON public.ivr_call_records(dial_time DESC);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_status_duration ON public.ivr_call_records(dial_status, call_duration DESC);
```

- [ ] **Step 2: Apply migration to Supabase using `eval` script**
- [ ] **Step 3: Verify table and columns exist in Postgres**
- [ ] **Step 4: Commit migration**

---

### Task 2: CSV Parser, Phone Normalizer & Intent Scoring Engine

**Files:**

- Create: `src/lib/leads/ivrParser.ts`
- Test: `__tests__/lib/ivrParser.test.ts`

**Interfaces:**

- Produces:
  - `cleanPhoneNumber(raw: string): string`
  - `calculateLeadTemperature(durationSeconds: number, pressedKey?: string | null): 'hot' | 'warm' | 'cold'`
  - `parseIvrCsvText(csvContent: string): ParsedIvrRecord[]`
  - `resolveAdvisorId(agentName: string, agentPhone: string, profiles: AdvisorProfile[]): string | null`

- [ ] **Step 1: Write failing unit tests in `__tests__/lib/ivrParser.test.ts`**
  - Test phone number extraction and cleaning (removing leading +91 / 0 / spaces).
  - Test scoring: duration >= 60s -> `hot`; key === '1' -> `hot`; 20-59s -> `warm`; <20s -> `cold`.
  - Test parsing a multi-line CSV snippet matching `report (6).csv` format.
  - Test advisor resolution matching "Shivam Yadav", "Shikha Tomar", "Khushi Pal", "Manish".
- [ ] **Step 2: Run test to verify it fails**
  - Run: `npx vitest run __tests__/lib/ivrParser.test.ts`
- [ ] **Step 3: Implement `src/lib/leads/ivrParser.ts`**
- [ ] **Step 4: Run test to verify it passes**
  - Run: `npx vitest run __tests__/lib/ivrParser.test.ts`
- [ ] **Step 5: Commit**

---

### Task 3: Ingestion API Endpoint - `POST /api/admin/leads/ivr-upload`

**Files:**

- Create: `app/api/admin/leads/ivr-upload/route.ts`
- Test: `__tests__/api/admin/ivrUploadRoute.test.ts`

**Interfaces:**

- Consumes: `parseIvrCsvText`, `cleanPhoneNumber`, `calculateLeadTemperature`, `resolveAdvisorId` from `src/lib/leads/ivrParser.ts`
- Produces: `POST /api/admin/leads/ivr-upload` returning:
  `{ success: boolean, processed_calls: number, unique_leads: number, hot_leads: number, warm_leads: number, cold_leads: number }`

- [ ] **Step 1: Write failing test in `__tests__/api/admin/ivrUploadRoute.test.ts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `app/api/admin/leads/ivr-upload/route.ts`**
  - Verify admin session with `verifyAdmin`.
  - Parse form data and CSV body.
  - Fetch employee profiles for advisor lookup.
  - Chunked insertion (500 rows/batch) into `ivr_call_records`.
  - Upsert unique leads into `chat_leads` with `source: 'ivr'`.
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: API Endpoint for IVR Logs - `GET /api/admin/leads/ivr-records`

**Files:**

- Create: `app/api/admin/leads/ivr-records/route.ts`

**Interfaces:**

- Produces: `GET /api/admin/leads/ivr-records` with query params `page`, `limit`, `advisor`, `dial_status` (`all`, `ANSWER`, `NOANSWER`), `temperature`, `search`.
- Returns paginated records + summary metrics (`totalCalls`, `answeredCalls`, `missedCalls`, `hotCount`, `warmCount`, `coldCount`).

- [ ] **Step 1: Implement `app/api/admin/leads/ivr-records/route.ts`**
- [ ] **Step 2: Verify endpoint via curl / script**
- [ ] **Step 3: Commit**

---

### Task 5: Frontend IVR Leads Table Component

**Files:**

- Create: `src/components/admin/leads/IvrLeadsTable.tsx`
- Test: `__tests__/admin/IvrLeadsTable.test.tsx`

**Interfaces:**

- Displays columns:
  - Customer Phone (with quick Call & WhatsApp buttons)
  - Assigned Advisor (with interactive reassignment dropdown)
  - **Dial Status Badge** (prominent `🟢 Answered` vs `🔴 Not Answered`)
  - Call Duration (formatted with visual duration progress bar)
  - Pressed Key tag (`Key 1`, `Key 2`, etc.)
  - Temperature Pill (Hot/Warm/Cold with 1-click manual override)
  - Call Date/Time
- Filters: Advisor chips, Dial Status chips (`All`, `Answered`, `Not Answered`), Temperature chips, and search input.

- [ ] **Step 1: Write component unit tests**
- [ ] **Step 2: Implement `IvrLeadsTable.tsx`**
- [ ] **Step 3: Verify tests pass**
- [ ] **Step 4: Commit**

---

### Task 6: Frontend CSV Upload Drawer / Modal

**Files:**

- Create: `src/components/admin/leads/IvrCsvUploadModal.tsx`

**Interfaces:**

- Props: `isOpen: boolean`, `onClose: () => void`, `onSuccess: () => void`, `token: string`.
- Features: Drag-and-drop CSV dropzone, progress bar, error boundary, and summary banner after processing.

- [ ] **Step 1: Implement `IvrCsvUploadModal.tsx`**
- [ ] **Step 2: Commit**

---

### Task 7: Master Leads Hub Page (`/admin/leads`) & Sidebar Integration

**Files:**

- Create: `app/admin/leads/page.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`

**Interfaces:**

- Tab 1: `IvrLeadsTable` + KPI Grid + Upload Trigger.
- Tab 2: Existing Chatbot Leads viewer (`WorkforceLeadsTab` component reuse / adapter).
- Tab 3: Consolidated Leads overview.
- Sidebar: Add `Leads Hub` (`/admin/leads`) under Management items.

- [ ] **Step 1: Implement `app/admin/leads/page.tsx`**
- [ ] **Step 2: Add navigation link to `AdminSidebar.tsx`**
- [ ] **Step 3: Run full typecheck and linter**
- [ ] **Step 4: Commit**

---

### Task 8: Ingestion Smoke Test & Verification with `report (6).csv`

**Files:**

- Test with actual `report (6).csv`

- [ ] **Step 1: Test upload of `report (6).csv` via the API / UI**
- [ ] **Step 2: Verify `ivr_call_records` and `chat_leads` rows in database**
- [ ] **Step 3: Verify all 4 advisors (`Shivam Yadav`, `Shikha Tomar`, `Khushi Pal`, `Manish Sharma`) have correctly attributed calls**
- [ ] **Step 4: Verify Dial Status filter (`ANSWER` vs `NOANSWER`) correctly isolates answered calls**
- [ ] **Step 5: Run full test suite and build verification**
- [ ] **Step 6: Update context documentation in `context/database_schema.md` and `context/overview.md`**
