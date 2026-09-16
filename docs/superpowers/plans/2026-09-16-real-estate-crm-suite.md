# SVI Real Estate CRM & Telecalling Suite — Implementation Plan

**Spec**: `docs/superpowers/specs/2026-09-16-real-estate-crm-suite-design.md`  
**Date**: 2026-09-16  
**Goal**: Build an end-to-end Real Estate Telecalling & Conversion CRM covering:

1. Follow-up Scheduler & Callback Reminders (Date/Time + Overdue badges)
2. 1-Click WhatsApp Quick Templates (Brochure, Site Visit, Plot Prices)
3. Lead Profile & Activity Timeline Drawer (Notes + History feed)
4. Site Visit Booking & Stage Progression Pipeline
5. Bulk Lead Actions & CSV Export (Multi-select, Bulk Assign)
6. Advisor Performance & Telecalling Leaderboard

---

## Phase 1: Database Migration & Schema Extensions

### Task 1.1: Supabase Migration Script

- **Target**: `supabase/migrations/20260916_real_estate_crm_suite.sql`
- **Actions**:
  - Add columns to `chat_leads`:
    - `follow_up_at TIMESTAMPTZ`
    - `pipeline_stage TEXT DEFAULT 'new'`
    - `site_visit_at TIMESTAMPTZ`
    - `site_visit_project TEXT`
    - `budget_range TEXT`
    - `notes TEXT`
  - Create table `lead_interactions`:
    - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
    - `lead_phone VARCHAR(20) NOT NULL`
    - `advisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL`
    - `advisor_name VARCHAR(100)`
    - `type TEXT NOT NULL`
    - `content TEXT NOT NULL`
    - `metadata JSONB DEFAULT '{}'::jsonb`
    - `created_at TIMESTAMPTZ DEFAULT NOW()`
  - Create performance indexes.

---

## Phase 2: Backend API Endpoints

### Task 2.1: Lead Interactions & Notes API Route

- **Target**: `app/api/admin/leads/[phone]/interactions/route.ts`
- **Actions**:
  - `GET`: Fetch interactions timeline for a phone number ordered by `created_at DESC`.
  - `POST`: Add a note, follow-up log, or site visit record.
- **Verification**: `__tests__/api/admin/leadInteractionsRoute.test.ts`.

### Task 2.2: Lead Details & Stage Update API Route

- **Target**: `app/api/admin/leads/[phone]/route.ts`
- **Actions**:
  - `PATCH`: Update `pipeline_stage`, `follow_up_at`, `budget_range`, `notes`, or `site_visit_at`. Automatically log corresponding `lead_interactions` record.

### Task 2.3: Bulk Lead Operations API Route

- **Target**: `app/api/admin/leads/bulk/route.ts`
- **Actions**:
  - `POST`: Accept `{ phone_numbers: string[], action: 'reassign' | 'stage', advisor_id?: string, stage?: string }`.
  - Batch updates both `chat_leads` and `ivr_call_records`.

### Task 2.4: Telecalling & Conversion Performance API Route

- **Target**: `app/api/admin/leads/performance/route.ts`
- **Actions**:
  - `GET`: Return aggregate metrics per advisor: total calls, answered rate, talk time, hot leads, site visits booked.

---

## Phase 3: WhatsApp Templates & Follow-up Scheduler Helpers

### Task 3.1: WhatsApp Template Generator Utility

- **Target**: `src/lib/utils/whatsappTemplates.ts`
- **Actions**:
  - Template 1: Shivani Vatika Brochure & Google Maps Pin.
  - Template 2: Complimentary Weekend Site Visit Invitation with Pick & Drop.
  - Template 3: Plot Sizes & Pricing Sheet (50 to 200 sq. yards).
  - Helper to build `https://wa.me/91...` encoded URLs with automatic line breaks and emojis.
- **Verification**: `__tests__/lib/whatsappTemplates.test.ts`.

---

## Phase 4: Frontend UI Components

### Task 4.1: Slide-Over Lead Profile & Timeline Drawer

- **Target**: `src/components/admin/leads/LeadDrawer.tsx`
- **Actions**:
  - Right-side slide-over drawer with smooth `AnimatePresence` and `motion.div`.
  - Pipeline Stage Stepper (`New` ➔ `Contacted` ➔ `Visit Scheduled` ➔ `Visited` ➔ `Booked`).
  - Follow-up Date/Time picker.
  - Site Visit booking section.
  - Add Note form with instant timeline prepend.
  - Reverse chronological activity timeline.
- **Verification**: `__tests__/admin/LeadDrawer.test.tsx`.

### Task 4.2: 1-Click WhatsApp Template Selector

- **Target**: `src/components/admin/leads/WhatsAppTemplateDropdown.tsx`
- **Actions**:
  - Executive action popup triggered from the WhatsApp icon in each table row.
  - 1-click button to open pre-filled WhatsApp message.
  - Silently logs a `whatsapp_sent` interaction in the background.

### Task 4.3: Table Enhancements: Multi-Select, Bulk Action Dock & Follow-up Badges

- **Target**: `src/components/admin/leads/IvrLeadsTable.tsx`
- **Actions**:
  - Checkboxes on each row + "Select All" in header.
  - Floating bottom dock when leads are selected:
    - Selected Count
    - Bulk Reassign to Advisor dropdown
    - Bulk Stage Change dropdown
    - Export to CSV button (client-side clean CSV generator)
  - Follow-up reminder badges: `Due: Today 4:00 PM` or `Overdue: 2h ago`.
  - Quick filter pill for `Today's Follow-ups Due`.

### Task 4.4: Telecalling Performance & Leaderboard Banner

- **Target**: `src/components/admin/leads/LeaderboardCard.tsx`
- **Actions**:
  - Visual summary card at top of `/admin/leads` showing total calls, answer %, hot leads, and top advisors.

---

## Phase 5: Verification & Integration Testing

- Run Vitest test suites:
  - `__tests__/lib/whatsappTemplates.test.ts`
  - `__tests__/api/admin/leadInteractionsRoute.test.ts`
  - `__tests__/admin/LeadDrawer.test.tsx`
  - `__tests__/admin/IvrLeadsTable.test.tsx`
  - `__tests__/lib/ivrSmokeTest.test.ts`
- Run `npm run typecheck` and `npm run lint`.
- Update `context/database_schema.md` and `context/overview.md`.
