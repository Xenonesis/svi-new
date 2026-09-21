# Vibe Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate confirmed findings from the Vibe Audit (F-01, F-02, F-03, F-05): secure the Overpass proxy with rate limiting and query validation, eliminate ephemeral in-memory state loss in serverless payroll, fix unpaginated user lookup in candidate allotment approvals, and modularize the 2,049-line email route handler.

**Architecture:**

- **F-01 (API Abuse / Overpass):** Wire existing distributed `rateLimit` (Postgres RPC `increment_rate_limit`) into `app/api/nearby-places/route.ts`, clamp query length, and validate query structure.
- **F-03 (Scalability / Candidate Approval):** Replace unpaginated `auth.admin.listUsers()` inside candidate loop with case-insensitive `profiles` lookup and a bounded, paginated auth user search fallback.
- **F-02 (Reliability / Payroll Persistence):** Remove ephemeral in-memory Maps (`memorySalaryStructures`, `memoryMonthlyPayrolls`, `memoryPayrollItems`) in `src/lib/payroll/payrollStore.ts` and propagate clean `AppError.database` errors handled by `handleApiError`.
- **F-05 (Maintainability / Email Route):** Extract storage bucket provisioning and MIME detection to `src/lib/email/attachments.ts`, and extract inbound Resend synchronization to `src/lib/email/inboundSync.ts`.

**Tech Stack:** Next.js 16 App Router, Supabase JS & Postgres RPC, Resend API, TypeScript 6 strict mode.

---

## Global Constraints

- Strict TypeScript: No `: any` or `as any`. Use concrete interfaces and `import type`.
- No architectural changes or new external dependencies: reuse existing project utilities (`rateLimit.ts`, `errors.ts`, `supabaseAdmin`).
- Maintain existing API contract and response shapes for all modified endpoints.
- All commits must pass git commitlint, typecheck, and GitNexus change detection.

---

### Task 1: Rate Limit and Validate Overpass Proxy (F-01)

**Files:**

- Modify: `app/api/nearby-places/route.ts`

**Interfaces:**

- Consumes: `rateLimit` from `@/src/lib/api/rateLimit`
- Produces: `POST /api/nearby-places` with 429 rate limit and 400 input validation

- [ ] **Step 1: Inspect current route behavior**

Verify `app/api/nearby-places/route.ts` receives JSON `{ data?: string }` without rate limiting.

- [ ] **Step 2: Add rate limiting and input constraints**

In `app/api/nearby-places/route.ts`:

1. Import `rateLimit` from `@/src/lib/api/rateLimit`.
2. Apply `await rateLimit(req, { limit: 15, windowSeconds: 60 })` at the top of `POST`.
3. Validate `query`:
   - Must be string.
   - Length between 10 and 2,048 characters.
   - Must contain expected Overpass QL keywords (e.g. `[out:json]` or `node` or `way` or `around`).

```ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/src/lib/api/rateLimit';

export const runtime = 'nodejs';

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const MAX_QUERY_LENGTH = 2048;

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { limit: 15, windowSeconds: 60 });
  if (limited) return limited;

  let body: { data?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const query = body?.data;
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: 'Query exceeds maximum allowed length' }, { status: 400 });
  }

  // Basic sanity check: Overpass QL queries must specify an output format or target element
  if (!query.includes('[out:json]') && !query.includes('around:') && !query.includes('node') && !query.includes('way')) {
    return NextResponse.json({ error: 'Invalid Overpass query format' }, { status: 400 });
  }
  // ... proceed to fetch from OVERPASS_URLS
```

- [ ] **Step 3: Verify TypeScript and execute smoke test**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit Task 1**

```bash
git add app/api/nearby-places/route.ts
git commit -m "fix(security): rate limit and validate queries on nearby-places proxy (F-01)"
```

---

### Task 2: Replace Unpaginated User Scan in Allotment Approval Loop (F-03)

**Files:**

- Modify: `app/api/admin/portal-allotments/approve/route.ts`

**Interfaces:**

- Consumes: `supabaseAdmin` from `@/src/lib/supabase/admin`
- Produces: Optimized candidate approval user lookup without N+1 unpaginated scan

- [ ] **Step 1: Locate unpaginated `listUsers()` call**

Inspect `app/api/admin/portal-allotments/approve/route.ts:104-116`.

- [ ] **Step 2: Implement bounded case-insensitive user lookup**

Add a helper to resolve existing auth users safely and perform a case-insensitive `ilike` lookup on `profiles` before attempting `createUser`:

```ts
async function findAuthUserByEmail(email: string): Promise<string | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. First check profiles table
  const { data: prof } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .ilike('email', cleanEmail)
    .maybeSingle();
  if (prof?.id) return prof.id;

  // 2. Bounded paginated search in Supabase Auth (max 5 pages = 500 users)
  let page = 1;
  while (page <= 5) {
    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
    if (!usersList?.users || usersList.users.length === 0) break;
    const match = usersList.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (match) return match.id;
    if (!usersList.nextPage) break;
    page = usersList.nextPage;
  }
  return null;
}
```

Replace lines 105–116 in `app/api/admin/portal-allotments/approve/route.ts` with:

```ts
if (authErr) {
  if (authErr.message.includes('already been registered') || authErr.status === 422) {
    profileId = await findAuthUserByEmail(email);
  }
  if (!profileId) {
    console.error(`Failed to resolve auth user for ${cleanTicketId}:`, authErr);
    continue;
  }
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit Task 2**

```bash
git add app/api/admin/portal-allotments/approve/route.ts
git commit -m "fix(portal-allotments): paginate and optimize user resolution on candidate approval (F-03)"
```

---

### Task 3: Remove In-Memory State Fallback in Serverless Payroll Store (F-02)

**Files:**

- Modify: `src/lib/payroll/payrollStore.ts`

**Interfaces:**

- Consumes: `AppError` from `@/src/lib/api/errors`, `supabaseAdmin`
- Produces: Durable database persistence with explicit error throwing instead of silent in-memory Maps

- [ ] **Step 1: Inspect in-memory fallbacks**

Lines 9–13 of `src/lib/payroll/payrollStore.ts`:
`const memorySalaryStructures: Map<string, SalaryStructure> = new Map();`
`const memoryMonthlyPayrolls: Map<string, MonthlyPayroll> = new Map();`
`const memoryPayrollItems: Map<string, PayrollItem[]> = new Map();`

- [ ] **Step 2: Remove in-memory maps and propagate database errors**

1. Delete lines 9–13.
2. In `getSalaryStructures`: On error, log and throw `AppError.database(error.message || 'Failed to fetch salary structures')`.
3. In `getSalaryStructureByUserId`: On error, throw `AppError.database(error.message || 'Failed to fetch salary structure')`.
4. In `upsertSalaryStructure`: On error, throw `AppError.database(error.message || 'Failed to save salary structure')`.
5. In `getMonthlyPayrolls`: On error, throw `AppError.database(error.message || 'Failed to fetch monthly payrolls')`.
6. In `getMonthlyPayrollById`: On error, throw `AppError.database(error.message || 'Failed to fetch monthly payroll by id')`.
7. In `calculateMonthlyPayroll`: On error, throw `AppError.database(error.message || 'Failed to calculate monthly payroll')`.
8. In `togglePayslipDownload`: On error, throw `AppError.database(error.message || 'Failed to update payslip download permissions')`.

- [ ] **Step 3: Verify API route error boundaries**

Verify that `app/api/admin/payroll/` and `app/api/employee/payroll/` catch errors via `handleApiError(err)` and respond with structured JSON error responses.

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/lib/payroll/payrollStore.ts
git commit -m "fix(payroll): remove ephemeral in-memory fallbacks and throw explicit database errors (F-02)"
```

---

### Task 4: Decompose Monolithic Admin Email Route Handler (F-05)

**Files:**

- Create: `src/lib/email/attachments.ts`
- Create: `src/lib/email/inboundSync.ts`
- Modify: `app/api/admin/email/route.ts`

**Interfaces:**

- Produces:
  - `mimeFromFilename(filename: string): string`
  - `ensureAttachmentBucket(): Promise<void>`
  - `syncInboundEmails(resend: Resend, force?: boolean): Promise<void>`
- Refactors: `app/api/admin/email/route.ts` by removing ~250 lines of storage and sync boilerplate into dedicated tested modules.

- [ ] **Step 1: Create `src/lib/email/attachments.ts`**

Extract `mimeFromFilename` and `ensureAttachmentBucket` from `app/api/admin/email/route.ts`:

```ts
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export function mimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mime: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    csv: 'text/csv',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    html: 'text/html',
    json: 'application/json',
  };
  return mime[ext] || 'application/octet-stream';
}

export async function ensureAttachmentBucket(): Promise<void> {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const emailBucket = buckets?.find((b: { name: string }) => b.name === 'email-attachments');
    if (!emailBucket) {
      await supabaseAdmin.storage.createBucket('email-attachments', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10 MB
      });
    } else if (!emailBucket.public) {
      await supabaseAdmin.storage.updateBucket('email-attachments', {
        public: true,
      });
    }
  } catch (err) {
    console.warn('[STORAGE] Could not ensure email-attachments bucket:', err);
  }
}
```

- [ ] **Step 2: Create `src/lib/email/inboundSync.ts`**

Extract `syncInboundEmails` and associated constants from `app/api/admin/email/route.ts`.

- [ ] **Step 3: Update `app/api/admin/email/route.ts` imports**

Import `mimeFromFilename`, `ensureAttachmentBucket`, and `syncInboundEmails` from the new modules, reducing `route.ts` size.

- [ ] **Step 4: Verify TypeScript & ESLint**

Run: `pnpm typecheck && pnpm lint`
Expected: 0 errors.

- [ ] **Step 5: Commit Task 4**

```bash
git add src/lib/email/attachments.ts src/lib/email/inboundSync.ts app/api/admin/email/route.ts
git commit -m "refactor(email): extract attachment storage and inbound sync from monolithic email route (F-05)"
```

---

### Task 5: Full Verification & Pre-Push Audit Check

**Files:**

- Verification only

- [ ] **Step 1: Run complete typecheck**

Run: `pnpm typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 2: Run linter**

Run: `pnpm lint`
Expected: PASS with 0 errors.

- [ ] **Step 3: Run GitNexus graph impact check**

Run: `node .gitnexus/run.cjs detect-changes --scope all --repo .`
Expected: Low risk, no broken execution flows.

- [ ] **Step 4: Push clean branch commits to main**

Run: `git push origin main`
Expected: All 6 CI pre-push checks pass.
