# October IVR Call Logs (`CALL_LOGS.csv`) Synchronization Plan

> **Goal:** Ingest and synchronize 5,761 call records and 3,610 unique customer leads from `CALL_LOGS.csv` (Sept 27 – Oct 14, 2026) into Supabase (`ivr_call_records` and `chat_leads`), resolve 100% of sales advisors, preserve audio recording URLs, upgrade the telecom parser, and expose call recordings in the `/admin/leads` Command Center.

---

## 1. Dataset & Database Baseline Facts

- **Source File**: `C:\Users\Acer\Desktop\svi-new\CALL_LOGS.csv` (5,762 lines, 5,761 call records).
- **Date Range**: `2026-09-27` to `2026-10-14 16:15:55 IST`.
- **Dispositions**: 4,120 Answered calls (with active cloud recording URLs), 1,641 Missed calls.
- **Unique Customers**: 3,610 unique 10-digit Indian phone numbers.
- **Existing in `ivr_call_records`**: 0 duplicates (current database ends at `2026-09-30 18:23:26`). All 5,761 records are brand new.
- **Existing in `chat_leads`**: 396 existing leads, 3,214 brand new CRM leads.
- **Active Advisors (27 User Identifiers)**:
  - `abhishek singh` (845 calls) -> Abhishek Kumar (`5eb47ac8-8269-44a5-832f-ea030fc6bd19`)
  - `kajal singh` (668 calls) -> Kajal Vishu (`88bd6666-5688-4588-bd6d-051de9dedf3f`)
  - `Manish Sharma` (642 calls) -> Manish Sharma (`816e1388-4e32-455c-8586-46e68320f6e2`)
  - `Shikha Tomer` (619 calls) -> Shikha Tomar (`c2ee3b02-110c-4f8d-97f1-d85a51aab937`)
  - `DEEPA SHarma` (594 calls) -> Deepa Sharma (`7b9c5455-97cf-4021-80f6-33a5a8b18d31`)
  - `amarnath sharma` (591 calls) -> Amarnath (`0bcdc1e6-0ebf-4b07-beae-32687cd0150c`)
  - `sonia garg` (522 calls) -> Soniya Garg (`52239106-247d-4adb-a8a3-206583001210`)
  - `VINOD JI` (190 calls) -> Vinod (`bb49473e-5fdf-447f-884f-29932e13679d`)
  - `Haider Wasi` (4 calls) -> Wasi Haider (`07e8b286-c451-495f-9661-9c30786c6b4f`)
  - `NITIN CHODHARY` (1 call) -> Nitin Choudhary (`fb08fd20-dfc9-498b-a903-453b396c766e`)
  - `Rashmi Shakya` (6 calls, phone: 9528664770) -> **Rashmi** (`6c05cd22-7cfe-4226-adac-1c62b4196e92`, employee joined 1 Oct 2026, 100% matched via phone & name)
  - `Not Connected` (413 calls) -> System unassigned (`assigned_agent_id: null`)
  - `VARUN kumar` (495 calls) -> preserved with exact `agent_name` and `agent_phone` (`assigned_agent_id: null` until employee profile added).

---

## 2. Invariants & Guardrails

1. **Zero Database Reset / Zero Schema Alterations**: Do not run any table drops, resets, or migrations that could touch existing records. Live Supabase database must remain untouched.
2. **Idempotency**: Canonical key `normalizeCallKey(customer_phone, dial_time)` ensures running the script multiple times is completely idempotent.
3. **Preserve Historical Dispositions**: When upserting into `chat_leads` (`onConflict: normalized_phone`), do NOT overwrite manual sales notes or custom pipeline stages if the lead was already manually triaged.
4. **Phone Number Sanitization**: Clean all customer phone numbers to 10-digit Indian standard for `phone`, and `+91<10_digits>` for `normalized_phone`.
5. **Timestamp Sanitization**: Convert `"0000-00-00 00:00:00"` to `null` to avoid PostgreSQL `timestamptz` syntax errors.
6. **Chunked Batching**: Respect Supabase PostgREST payload limits by chunking database operations to 400 records per HTTP POST.

---

## 3. Step-by-Step Execution Plan

### Task 1: Ingestion Engine & Parser Hardening (`src/lib/leads/ivrParser.ts`)

- **Files**: `src/lib/leads/ivrParser.ts`, `__tests__/lib/ivrParser.test.ts`
- **Changes**:
  1. Add quote-aware CSV row tokenizer that cleanly handles quoted fields (`"FROM NUMBER"`, `"DAIL STATUS"`, etc.).
  2. Add telecom header mappings:
     - `customer_phone`: `from number`, `from_number`, `customer`, `phone`, `number`, `caller`
     - `agent_number`: `to number`, `to_number`, `agent phone`, `agentnumber`, `agent_number`
     - `agent_name`: `user`, `agent name`, `agentname`, `advisor`
     - `dial_time`: `start time`, `start_time`, `dial time`, `dialtime`
     - `customer_ans_time`: `answer time`, `answer_time`, `customeranstime` (returns `null` for `0000-00-00 00:00:00`)
     - `customer_hang_time`: `end time`, `end_time`, `custhangtime`
     - `call_duration`: `duration`, `call duration`
     - `dial_status`: `dail status`, `dailstatus`, `dial status`, `status`
     - `recording_url`: `recording`, `recording_url`
  3. Support `raw_payload` packaging in `ParsedIvrRecord`: `{ recording_url, pulse, virtual_number, status }`.
  4. Expand `aliasMap` in `resolveAdvisorId` for `abhishek singh`, `kajal singh`, `sonia garg`, `shikha tomer`, `deepa sharma`, `vinod ji`.
- **Verification**: Run unit tests `npx vitest run __tests__/lib/ivrParser.test.ts`.

---

### Task 2: Build Safe Ingestion Runner (`scripts/sync_call_logs_october.cjs`)

- **Files**: Create `scripts/sync_call_logs_october.cjs`
- **Workflow**:
  1. Load credentials from `.env.local`.
  2. Parse `C:\Users\Acer\Desktop\svi-new\CALL_LOGS.csv`.
  3. Load staff profiles from Supabase to resolve `assigned_agent_id`.
  4. Fetch existing call keys from `ivr_call_records` to guarantee 0 duplicates.
  5. Compute `temperature` (`hot` for >= 60s or key 1, `warm` for 20–59s, `cold` for < 20s).
  6. **Batch Insert into `ivr_call_records`** in 400-item chunks.
  7. **Batch Upsert into `chat_leads`** on `normalized_phone`:
     - For 3,214 new leads: insert new CRM record with `status: contacted` (if duration >= 20s) or `new`.
     - For 396 existing leads: update `updated_at`, `temperature` (if engagement increased), without wiping custom notes.
  8. `--dry-run` mode reports all metrics without touching the database. `--live` mode executes insertion.
- **Verification**: Execute `node scripts/sync_call_logs_october.cjs --dry-run` and inspect counts.

---

### Task 3: Expose Call Recordings in `/admin/leads` API & UI

- **Files**:
  - `app/api/admin/leads/ivr-records/route.ts`
  - `src/components/admin/leads/IvrLeadsTable.tsx`
  - `src/components/admin/leads/LeadDrawer.tsx`
- **Changes**:
  1. In `app/api/admin/leads/ivr-records/route.ts`:
     - Select `raw_payload` from `ivr_call_records` in base query.
     - Include `recording_url: r.raw_payload?.recording_url || null` in the returned `IvrRecordItem`.
  2. In `IvrLeadsTable.tsx`:
     - Add a Recording audio action button (Play icon / Volume icon) on table rows and mobile cards when `recording_url` is present.
     - Clicking opens the recording in a sleek modal/audio player or direct playback tab.
  3. In `LeadDrawer.tsx`:
     - Display the call recording link in the lead interaction timeline so advisors can review prior calls before reaching out.
- **Verification**: Test table row rendering and verify recording links trigger cleanly.

---

### Task 4: Full Multi-Layer Verification

- **Verification Steps**:
  1. Execute live sync: `node scripts/sync_call_logs_october.cjs --live`.
  2. Verify DB counts:
     - `ivr_call_records` increases from 33,479 to 39,240 (+5,761 calls).
     - `chat_leads` increases from 26,521 to 29,735+ (+3,214 new leads).
  3. Verify RPC `get_telecalling_performance` reflects October stats.
  4. Verify `/admin/leads` loads without errors:
     - Date filter for `2026-10-10` loads 1,100 calls.
     - Date filter for `2026-10-14` loads 199 calls.
     - Call recordings are accessible.
  5. Run quality gates:
     - `pnpm typecheck` -> 0 errors.
     - `pnpm lint` -> 0 errors.
     - `pnpm test` -> 100% passing.
