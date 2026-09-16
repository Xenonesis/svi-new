# Design Specification: Master Leads Hub & IVR Telephony Campaign Ingestion

**Date**: 2026-09-16  
**Status**: Approved  
**Author**: Engineering Team  
**Scope**: Master CRM Leads Page (`/admin/leads`), In-App IVR CSV Ingestion, Call Records Data Layer, Auto-Scoring & Advisor Mapping

---

## 1. Executive Summary

SVI Infra uses outbound automated telephony / IVR campaigns where customers receive automated calls and interact with options (e.g. Press 1 for property details) before routing to human telecalling advisors (`Shivam Yadav`, `Shikha Tomar`, `Khushi Pal`, `Manish Sharma`).

Currently, IVR campaign reports (such as `report (6).csv` containing 4,396 call logs) remain in disconnected spreadsheets. This project introduces:

1. **A Consolidated Master Leads Hub (`/admin/leads`)** providing dedicated views for IVR Campaign Leads, AI Chatbot Leads, and Consolidated CRM Pipeline.
2. **A High-Performance In-App CSV Uploader** that ingests multi-thousand-row IVR reports in seconds.
3. **A Two-Tier Data Layer**:
   - `ivr_call_records`: Preserves granular telecalling metadata (call duration, customer pick/hang timestamps, pressed DTMF keys, dial status).
   - `chat_leads`: Master unified CRM table holding normalized customer records, auto-scored temperatures (`hot`, `warm`, `cold`), and linked advisor assignments.
4. **Intelligent Auto-Scoring with Manual Override**: Classifies lead intent by call duration and DTMF keypress with instant one-click advisor overrides.

---

## 2. Architecture & Data Model

### 2.1 Database Schema Additions

#### Table: `ivr_call_records`

Stores every discrete call attempt from campaign CSVs without dropping duplicate customer attempts.

```sql
CREATE TABLE IF NOT EXISTS public.ivr_call_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_phone VARCHAR(20) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    agent_phone VARCHAR(20),
    assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    dial_time TIMESTAMPTZ NOT NULL,
    customer_ans_time TIMESTAMPTZ,
    customer_hang_time TIMESTAMPTZ,
    call_duration INTEGER NOT NULL DEFAULT 0, -- in seconds
    dial_status VARCHAR(50) NOT NULL DEFAULT 'NOANSWER', -- 'ANSWER', 'NOANSWER'
    pressed_key VARCHAR(10), -- '1', '2', '*', 'A', etc.
    campaign_name VARCHAR(150) NOT NULL DEFAULT 'General Campaign',
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for blazing fast aggregations and searches
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_phone ON public.ivr_call_records(customer_phone);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_agent ON public.ivr_call_records(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_dial_time ON public.ivr_call_records(dial_time DESC);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_status_duration ON public.ivr_call_records(dial_status, call_duration DESC);
```

#### Integration with `chat_leads` (Unified CRM Lead Pool)

When processing each row, the ingestion engine upserts into `chat_leads`:

- **Lookup key**: `phone = customer_phone` AND `source = 'ivr'`
- **If exists**:
  - Updates `updated_at = NOW()`.
  - Updates `temperature` if the new call demonstrates higher intent (e.g. upgraded from warm to hot).
  - Prepends note: `[YYYY-MM-DD HH:mm] IVR Call: {duration}s, Key: {pressed_key}, Agent: {agent_name}`.
- **If not exists**:
  - `name`: `IVR Lead - {customer_phone}`
  - `phone`: `customer_phone`
  - `source`: `'ivr'`
  - `assigned_to`: `assigned_agent_id`
  - `temperature`: Auto-scored (`hot`, `warm`, or `cold`)
  - `lifecycle_status`: `captured` (or `contacted` if `call_duration >= 20`)
  - `created_at`: `dial_time`

---

## 3. CSV Ingestion & Parsing Engine

### 3.1 Endpoint: `POST /api/admin/leads/ivr-upload`

- **Authentication**: Admin only via `verifyAdmin(request)`.
- **Payload**: `multipart/form-data` with file field `file` (`.csv`) and optional `campaign_name`.
- **Streaming Parser**: Node.js stream / chunked reading with `csv-parser` or `PapaParse` to handle 5,000+ rows within memory limits.
- **Batching**: Bulk inserts in chunks of 500 rows into `ivr_call_records` and bulk upserts into `chat_leads`.

### 3.2 Advisor Auto-Resolution Mapping

The ingestion engine pre-loads employee profiles (`profiles` where `role IN ('employee', 'admin')`) and matches `AgentName` & `AgentNumber`:

| CSV Agent Name | CSV Agent Number | Target Profile Full Name |
| :------------- | :--------------- | :----------------------- |
| `Shivam Yadav` | `9311290543`     | Shivam yadav             |
| `Shikha Tomar` | `9870345702`     | Shikha Tomar             |
| `Khushi Pal`   | `9315964031`     | KHUSHI PAl               |
| `Manish`       | `9217085407`     | Manish Sharma            |

If an agent cannot be resolved by phone or name, the record is flagged for admin reassignment and left unassigned.

### 3.3 Intent Scoring Rules

- **🔥 Hot Lead**:
  - `call_duration >= 60` seconds **OR**
  - `pressed_key = '1'` (Explicit customer response)
- **⚡ Warm Lead**:
  - `call_duration` between `20` and `59` seconds AND `pressed_key != '1'`
- **❄️ Cold Lead**:
  - `call_duration < 20` seconds AND no significant keypress.

---

## 4. Frontend Application (`/admin/leads`)

### 4.1 Page Layout & Navigation

Located at `app/admin/leads/page.tsx` with sidebar navigation entry in `AdminSidebar.tsx`:

- **Icon**: `Users` / `PhoneCall`
- **Label**: `Leads Hub`
- **Badge**: Uncontacted / Hot leads count

### 4.2 Tab Structure

1. **Tab 1: 📞 IVR Calling Leads**
   - Direct CSV upload dropzone.
   - Advisor filter chips (`All`, `Shivam Yadav`, `Shikha Tomar`, `Khushi Pal`, `Manish Sharma`, `Unassigned`).
   - Temperature filter chips (`All`, `🔥 Hot`, `⚡ Warm`, `❄️ Cold`).
   - Search bar (by customer phone or advisor name).
   - Data Table:
     - Customer Phone (with quick Call & WhatsApp buttons)
     - Advisor (with reassignment dropdown)
     - Call Duration (formatted in MM:SS with visual duration meter)
     - Pressed Key badge (`Key 1`, `Key 2`, etc.)
     - Dial Status (`ANSWER`, `NOANSWER`)
     - Temperature Pill (with 1-click manual override)
     - Dial Timestamp
2. **Tab 2: 🤖 AI Chatbot Leads**
   - Integrates existing web chatbot leads with conversation transcript modal.
3. **Tab 3: 🌐 All Leads Overview**
   - Global pipeline overview, stage conversion funnel, and team workload distribution.

### 4.3 Key User Actions

- **Upload CSV**: Modal dialog with file picker, format preview, live progress bar, and result summary.
- **Export Filtered Leads**: Instant client-side / server-side CSV export of active filters.
- **Quick Contact**: `tel:{phone}` click-to-call and `https://wa.me/91{phone}` WhatsApp trigger.
- **Manual Override**: Change temperature or stage with immediate optimistic UI update.

---

## 5. Security & Verification

1. **Authentication & Authorization**: Admin-only gate guarded by `verifyAdmin`.
2. **Input Sanitization**: Phone numbers strictly sanitized to standard 10-digit Indian mobile formats.
3. **Data Integrity**: Foreign key constraints with `ON DELETE SET NULL` to preserve call logs even if an employee profile is modified.
4. **Testing Plan**:
   - Unit tests for CSV parser, auto-scoring logic, and phone sanitization.
   - API integration tests for batch upload and duplicate phone resolution.
   - UI component tests for table rendering, advisor filtering, and temperature toggling.
