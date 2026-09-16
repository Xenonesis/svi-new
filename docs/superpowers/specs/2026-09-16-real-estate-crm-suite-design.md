# SVI Real Estate CRM & Telecalling Suite — Design Specification

**Date**: 2026-09-16  
**Status**: Approved  
**Author**: SVI Engineering

---

## 1. Executive Summary

The SVI Real Estate CRM & Telecalling Suite upgrades the existing telecalling and IVR leads manager (`/admin/leads`) into an end-to-end real estate conversion pipeline. It equips telecallers and sales advisors with instant follow-up reminders, 1-click WhatsApp brochure templates, client interaction timeline logs, site visit tracking, bulk lead reassignment/export, and advisor performance analytics.

---

## 2. Core Feature Modules

### Module 1: Follow-up Scheduler & Due Reminders

- **Capabilities**:
  - Telecallers can schedule an exact date & time for their next callback directly from the table or lead drawer.
  - Leads with overdue or upcoming follow-ups display an executive warning badge (`Due: Today 4:00 PM` or `Overdue: 2h ago`).
  - Top filter bar includes a dedicated quick filter pill: `Follow-ups Due` with active count.
- **Data Attributes**: `follow_up_at: TIMESTAMPTZ` on `chat_leads`.

### Module 2: 1-Click WhatsApp Smart Templates

- **Capabilities**:
  - WhatsApp action button upgraded from plain URL to an action dropdown containing high-converting pre-drafted templates:
    1. **Brochure & Location**: Official brochure PDF link + Google Maps pin of Shivani Vatika-11.
    2. **Free Site Visit Invitation**: Weekend site visit invite with complimentary AC cab pick & drop details.
    3. **Plot Sizes & Price List**: Overview of 50, 100, 150, 200 sq. yard plots with bank loan availability notes.
  - Telecaller clicks template -> formatted text auto-populates in WhatsApp Web / App ready to send.
  - Automatically logs a `whatsapp_sent` interaction in the lead's history.

### Module 3: Slide-Over Lead Profile & Activity Timeline Drawer

- **Capabilities**:
  - Clicking any lead opens a sleek, non-intrusive right-side slide-over drawer (`motion.div` + backdrop).
  - Displays complete customer context: Phone, Name, City, Property Interest, Current Temperature, Assigned Advisor.
  - Allows adding timestamped notes (e.g. "Client needs 100 gaj east-facing plot, SBI home loan enquiry").
  - Reverse-chronological timeline showing call history, WhatsApp sends, advisor reassignments, stage changes, and internal notes.

### Module 4: Site Visit Booking & Real Estate Stage Pipeline

- **Capabilities**:
  - Stage Progression Pipeline:
    `new` ➔ `contacted` ➔ `visit_scheduled` ➔ `visited` ➔ `negotiation` ➔ `booked` ➔ `lost`.
  - Dedicated Site Visit scheduler: Telecaller can select visit date/time and project location.
  - Site visit counter and calendar badge visible in the admin leads overview.

### Module 5: Bulk Actions & CSV/Excel Export

- **Capabilities**:
  - Multi-select row checkboxes + "Select All (filtered/page)".
  - Sleek floating bottom action bar when 1+ rows are selected:
    - **Bulk Reassign**: Reassign selected leads to any advisor in one click.
    - **Bulk Stage Change**: Move selected leads to another pipeline stage.
    - **Export to CSV**: Clean client export with phone, name, temperature, dial status, duration, notes, and advisor name.

### Module 6: Advisor Telecalling Performance & Leaderboard

- **Capabilities**:
  - Metrics cards on the leads hub:
    - Total Outbound/Inbound Calls Handled
    - Answer Rate (%) & Total Talk Time
    - Hot Leads Generated
    - Site Visits Booked per Advisor
  - Leaderboard view to track top converting team members.

---

## 3. Database Schema

### 3.1 Extensions to `chat_leads` Table:

```sql
ALTER TABLE chat_leads
ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS site_visit_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS site_visit_project TEXT,
ADD COLUMN IF NOT EXISTS budget_range TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_chat_leads_follow_up_at ON chat_leads(follow_up_at);
CREATE INDEX IF NOT EXISTS idx_chat_leads_pipeline_stage ON chat_leads(pipeline_stage);
```

### 3.2 New `lead_interactions` Table:

```sql
CREATE TABLE IF NOT EXISTS lead_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_phone VARCHAR(20) NOT NULL,
    advisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    advisor_name VARCHAR(100),
    type TEXT NOT NULL, -- 'note' | 'call_log' | 'follow_up_scheduled' | 'whatsapp_sent' | 'visit_booked' | 'stage_changed' | 'reassigned'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_interactions_phone ON lead_interactions(lead_phone);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_created_at ON lead_interactions(created_at DESC);
```

---

## 4. API Endpoints

1. **`GET /api/admin/leads/[phone]/interactions`**: Fetches full audit timeline for a specific lead.
2. **`POST /api/admin/leads/[phone]/interactions`**: Adds a new note, schedules follow-up, or books site visit.
3. **`PATCH /api/admin/leads/[phone]`**: Updates `pipeline_stage`, `follow_up_at`, `budget_range`, `notes`, or `assigned_agent_id`.
4. **`POST /api/admin/leads/bulk`**: Executes bulk reassignment or bulk stage updates on an array of phone numbers/record IDs.
5. **`GET /api/admin/leads/performance`**: Returns advisor-wise daily call metrics, conversion counts, and site visit stats.

---

## 5. UI Architecture & Components

- **`src/components/admin/leads/IvrLeadsTable.tsx`**:
  - Bulk checkbox selection & bottom action dock.
  - 1-Click WhatsApp template popup.
  - Follow-up date pill with overdue state.
- **`src/components/admin/leads/LeadDrawer.tsx`**:
  - Slide-over panel with stage stepper, customer details, note creation, and interaction timeline feed.
- **`src/components/admin/leads/WhatsAppTemplateModal.tsx`**:
  - Dropdown/modal with 3 formatted Hindi/English real estate messages + brochure link.
- **`src/components/admin/leads/LeaderboardCard.tsx`**:
  - Summary banner with conversion stats and top advisor achievements.

---

## 6. Verification & Test Strategy

- **Unit Tests**:
  - `__tests__/admin/LeadDrawer.test.tsx`: Tests timeline rendering, note submission, and stage changes.
  - `__tests__/admin/WhatsAppTemplates.test.tsx`: Verifies message formatting and link generation.
  - `__tests__/api/admin/leadInteractions.test.ts`: Tests API route security, schema validation, and persistence.
- **Integration/E2E**:
  - Vitest test suite verification across all new API routes and components.
  - Typecheck (`tsc --noEmit`) and ESLint validation.
