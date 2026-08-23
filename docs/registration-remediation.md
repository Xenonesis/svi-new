# Registration Endpoint — Remediation Plan

**Target:** `https://www.sviinfrasolutions.com/registration` and the backing `POST /api/registration` endpoint
**Stack:** Next.js 15 (App Router, RSC) on Vercel · Supabase (Postgres + GoTrue + RLS) · Resend (transactional email) · Stateless HMAC Captcha
**Date:** 2026-07-28
**Owner:** TBD (backend + infra)
**Severity ceiling:** **Critical** (PII leak in progress)

---

## 1. Findings Recap

| #   | Finding                                                                                                                            | Severity     | Surface                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------- |
| 1   | `public.registrations` table is `SELECT`-able by `anon` role — leaks Aadhar, PAN, email, phone, address, photo & PAN-card URLs     | **Critical** | Supabase RLS           |
| 2   | `/api/admin/` returns a Vercel directory listing of all admin lambdas                                                              | High         | Vercel config          |
| 3   | `/api/registration` accepts arbitrary 100 KB strings, negative amounts, malformed email, SQL fragments — no server-side validation | High         | Next.js route          |
| 4   | Open email relay through SVI's Resend account (sends to any address the client posts)                                              | High         | Next.js route + Resend |
| 5   | No CSRF token on `/api/registration`; cross-origin POSTs succeed silently                                                          | Medium       | Next.js route          |
| 6   | Per-IP rate limit kicks in after ~4–5 requests, `retryAfter` ~44 s                                                                 | Medium       | Vercel/edge            |
| 7   | Supabase GoTrue has no rate limit (15 rapid failures allowed with no throttling)                                                   | Medium       | Supabase auth config   |
| 8   | Login form has no `minlength`/`pattern`/strength check on the password field                                                       | Medium       | Next.js form           |
| 9   | Math captcha ("4+5=?") is client-only; `/api/registration` accepts requests with no captcha field                                  | Low          | Next.js route          |
| 10  | `GET /api/registration` returns advisor list (low impact — already public)                                                         | Info         | Next.js route          |

Headers — all good (`CSP`, `HSTS`, `X-Frame-Options: DENY`, `nosniff`, `Permissions-Policy`, `Referrer-Policy`).

---

## 2. Priority & Sequencing

The plan ships in **three phases**. Phase 1 must land before any public disclosure; Phase 2 within the same release; Phase 3 is hardening.

```
Phase 1 — Stop the bleeding (same-day)          [P0]
  1.1 Lock RLS on public.registrations
  1.2 Disable Vercel directory listing on /api/admin/

Phase 2 — Validate the write path (this week)   [P1]
  2.1 Server-side schema validation on /api/registration
  2.2 Server-side email format + Resend guard
  2.3 Wire server-verified captcha
  2.4 CSRF token (double-submit cookie) on /api/registration
  2.5 Enable Supabase GoTrue rate limit

Phase 3 — Hardening (next sprint)               [P2]
  3.1 Password policy on signup
  3.2 Tighten per-IP + per-submission-id limits
  3.3 Move advisory list to signed config (drop /api/registration GET)
  3.4 Log + alert on Resend failures & 4xx spikes
```

---

## 3. Phase 1 — Stop the Bleeding

### 3.1 Lock RLS on `public.registrations` (Finding #1)

**Current state:** Anon key has implicit `GRANT SELECT` (or an `USING (true)` policy). `UPDATE` is correctly blocked.

**Action:** add a deny-by-default RLS policy for `anon` and route server reads through a `SECURITY DEFINER` function or the `service_role` only.

```sql
-- migration: 2026-07-28_anon_deny_registrations.sql

-- 1. Drop any permissive policies that allow anon read.
DROP POLICY IF EXISTS registrations_anon_read ON public.registrations;
DROP POLICY IF EXISTS registrations_public_read  ON public.registrations;

-- 2. Confirm RLS is on (idempotent).
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations FORCE  ROW LEVEL SECURITY;

-- 3. Deny anon/authenticated reads and writes; only service_role bypasses.
CREATE POLICY registrations_no_anon_read
  ON public.registrations
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY registrations_no_anon_write
  ON public.registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY registrations_no_anon_update
  ON public.registrations
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- 4. Audit any other tables that may share the same anon-grant. Run:
--    SELECT schemaname, tablename, policyname, roles, cmd, qual
--    FROM pg_policies
--    WHERE schemaname = 'public'
--    ORDER BY tablename, policyname;
```

**Server-side read path** (used by `/api/registration/list`, admin tools, etc.) must use the **service_role** key on the server only — never the anon key in a public route.

**Validation steps:**

1. Re-run the leak probe:
   `curl -s "https://rfvhjgetfbalndgtkpaa.supabase.co/rest/v1/registrations?select=id" -H "apikey: <anon>" -H "Authorization: Bearer <anon>"`
   → expect `[]` and **not** 200 with rows.
2. With `service_role` key: same request returns the 13 records (proves admin path still works).
3. Browser smoke: `/registration` form still submits and the API returns `success:true`.

**Rollback:** `DROP POLICY …` (the policies are additive denials; dropping restores previous behavior).

### 3.2 Disable directory listing on `/api/admin/` (Finding #2)

The listing is Vercel's default behavior for any folder under `app/api/` that contains a `route.ts` _or_ is a directory with no matching route. The fix is to **never let a bare directory exist** under `app/api/admin/`. Every subfolder must contain at least one `route.ts` so Vercel treats it as a route, not a listing target.

**Action items:**

1. Audit `app/api/admin/**` — every folder must have at least one `route.ts` or be removed.
2. Add a top-level guard:
   ```ts
   // app/api/admin/route.ts  (replaces the implicit directory listing)
   import { NextResponse } from 'next/server';
   export const dynamic = 'force-dynamic';
   export function GET() {
     return NextResponse.json({ error: 'Not found' }, { status: 404 });
   }
   ```
3. Repeat for any subfolder that does not yet have a `route.ts` (`lottery/`, `attendance/`).
4. Add to `vercel.json`:
   ```json
   {
     "cleanUrls": true,
     "trailingSlash": false,
     "headers": [
       {
         "source": "/api/admin(?:/.*)?",
         "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }]
       }
     ]
   }
   ```
5. Confirm with `curl -i https://www.sviinfrasolutions.com/api/admin/` → 404, not the directory HTML.

---

## 4. Phase 2 — Validate the Write Path

### 4.1 Server-side schema validation (Finding #3)

Introduce a single zod schema shared by client and server; reject anything that fails server-side with `400`.

```ts
// lib/schemas/registration.ts
import { z } from 'zod';

export const RegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{1,50}$/, 'First name must be A–Z only, ≤ 50 chars'),
  lastName: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{1,50}$/, 'Last name must be A–Z only, ≤ 50 chars'),
  mobileNo: z.string().regex(/^[6-9]\d{9}$/, 'Mobile must be a 10-digit Indian number'),
  email: z.string().trim().toLowerCase().email().max(254),
  soWoDo: z.string().trim().min(1).max(50),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
  aadharNumber: z.string().regex(/^[2-9]\d{11}$/, 'Aadhar must be 12 digits, starts 2–9'),
  panNumber: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'PAN must be ABCDE1234F format'),
  state: z.string().trim().min(2).max(50),
  city: z.string().trim().min(2).max(50),
  address: z.string().trim().min(5).max(500),
  advisorName: z.enum(ALLOWED_ADVISORS), // mirror the form's <option>s
  project: z.enum(ALLOWED_PROJECTS),
  propertySize: z.enum(ALLOWED_SIZES),
  propertyType: z.enum(ALLOWED_TYPES),
  plotPreference: z.enum(ALLOWED_PREFS),
  paymentPlan: z.enum(ALLOWED_PLANS),
  paymentMode: z.enum(ALLOWED_MODES),
  schemeAmount: z.coerce.number().int().min(0).max(10_000_000),
  // optional file uploads
  photo: z.instanceof(Blob).optional(),
  panCard: z.instanceof(Blob).optional(),
  // captcha
  captchaAnswer: z.string(),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;
```

Apply at the top of the route:

```ts
// app/api/registration/route.ts
import { RegistrationSchema } from '@/lib/schemas/registration';
import { verifyCaptchaToken } from '@/src/lib/captcha';

export async function POST(req: Request) {
  const form = await req.formData();
  const parsed = RegistrationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid form data', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  // …verify captcha, then insert via service_role…
}
```

`GET` returns `405 Method Not Allowed` (currently returns the advisor list — see 3.3 in Phase 3).

### 4.2 Email-relay guard (Finding #4)

Three layers, all needed:

1. **Schema** already constrains `email` to a real address.
2. **Disposable-domain blocklist** — drop known throwaway providers:
   ```ts
   const DISPOSABLE = new Set(['mailinator.com', 'guerrillamail.com', 'tempmail.com' /* … */]);
   const domain = parsed.data.email.split('@')[1];
   if (DISPOSABLE.has(domain)) return reject(400, 'Please use a permanent email address');
   ```
3. **Resend API hardening** — use a dedicated `from:` like `registrations@sviinfrasolutions.com` and restrict `to:` to either the applicant's address **or** an internal alias, never a free-form value chosen by the client.

### 4.3 Stateless HMAC Captcha server-side verify (Finding #9)

```ts
// src/lib/captcha.ts
import { verifyCaptchaToken } from '@/src/lib/captcha';

const captchaOk = await verifyCaptchaToken(
  request.cookies.get('captcha_token')?.value,
  captchaAnswer
);
if (!captchaOk) {
  return NextResponse.json(
    { error: 'Captcha verification failed', code: 'CAPTCHA_INVALID' },
    { status: 400 }
  );
}
```

### 4.4 CSRF token (Finding #5)

Use the **double-submit cookie** pattern — already idiomatic in Next.js:

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export function middleware(req) {
  const url = req.nextUrl;
  if (url.pathname === '/registration') {
    const existing = req.cookies.get('csrf')?.value;
    if (!existing) {
      const token = randomBytes(24).toString('hex');
      const res = NextResponse.next();
      res.cookies.set('csrf', token, { httpOnly: false, sameSite: 'lax', secure: true });
      return res;
    }
  }
  return NextResponse.next();
}
```

Route check:

```ts
// in /api/registration POST
const cookieToken = req.cookies.get('csrf')?.value;
const formToken = form.get('csrf');
if (!cookieToken || !formToken || cookieToken !== formToken) {
  return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 });
}
```

Add the `csrf` hidden input to the form via a server component. Submit requests without the token are dropped at the edge.

### 4.5 Supabase GoTrue rate limit (Finding #7)

In `supabase/config.toml`:

```toml
[auth.rate_limit]
email_sent      = "1/2min"   # OTP / password reset
token_refresh   = "30/min"
sign_in_sign_ups = "10/min"
verify_otp      = "10/min"
```

`sign_in_sign_ups = "10/min"` caps the brute force window. Combine with a per-email exponential backoff in the Next.js `/login` wrapper to mask Supabase's response time and avoid user enumeration via timing.

---

## 5. Phase 3 — Hardening

### 5.1 Password policy (Finding #8)

Two layers:

1. **Client:** `input pattern` + JS check before submit.
   ```html
   <input
     type="password"
     required
     minlength="10"
     pattern="(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w]).{10,}"
   />
   ```
2. **Server:** Supabase trigger
   ```sql
   CREATE OR REPLACE FUNCTION public.check_password_strength()
   RETURNS trigger AS $$
   BEGIN
     IF length(NEW.encrypted_password) < 60 THEN
       RAISE EXCEPTION 'Password too short';
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```
   Length-only is fine; the _strength_ rules belong on the client (Supabase stores bcrypt hashes, you can't enforce charset post-hash).

### 5.2 Per-IP + per-submission-id limits (Finding #6)

- Keep Vercel/edge IP limit, **raise to 10/hour** with **per-IP blocklist** that escalates to a 1-hour ban after 3 hits.
- Add a **per-submission-id** key: derive from `(email + dob + aadhar-last-4)` and reject duplicates within 24 h.

### 5.3 Drop the advisor-list GET (Finding #10)

`/api/registration` GET currently returns the advisor list. Move the list into the page's RSC payload (signed or build-time constant) and return `405` from the route. Eliminates the only GET on the write endpoint.

### 5.4 Logging & alerts (cross-cutting)

- Resend: capture `emailStatus.error`; alert on > 5% failure rate / 5 min.
- `/api/registration` 4xx spike: alert at > 50/min.
- Supabase auth 4xx: alert at > 100/min.
- All structured logs go through Sentry (already wired — `sentry-trace` meta is present).

---

## 6. Verification Matrix

Run after each phase. **Do not** declare the phase done until every row passes.

| Test                                                |   Pre-fix   | Post Phase 1 | Post Phase 2 |       Post Phase 3        |
| --------------------------------------------------- | :---------: | :----------: | :----------: | :-----------------------: |
| Anon `GET /rest/v1/registrations` returns rows      |   ✅ leak   |   ❌ empty   |   ❌ empty   |         ❌ empty          |
| `GET /api/admin/` returns directory listing         |     ✅      |    ❌ 404    |    ❌ 404    |          ❌ 404           |
| `POST /api/registration` with 100 KB firstName      | ✅ accepted | ✅ accepted  |    ❌ 400    |          ❌ 400           |
| `POST /api/registration` with negative schemeAmount | ✅ accepted | ✅ accepted  |    ❌ 400    |          ❌ 400           |
| `POST /api/registration` with malformed email       |   ✅ sent   |   ✅ sent    |    ❌ 400    |          ❌ 400           |
| `POST /api/registration` with no captcha            | ✅ accepted | ✅ accepted  |    ❌ 400    |          ❌ 400           |
| `POST /api/registration` cross-origin (no CSRF)     | ✅ accepted | ✅ accepted  |    ❌ 403    |          ❌ 403           |
| 4th `POST /api/registration` from same IP           |   ⚠️ 429    |    ⚠️ 429    |    ⚠️ 429    |  ✅ 429 with longer ban   |
| 15 rapid `POST /auth/v1/token`                      | ✅ no limit | ✅ no limit  |    ❌ 429    |          ❌ 429           |
| `POST /login` with 1-char password                  | ✅ accepted | ✅ accepted  | ✅ accepted  | ❌ client + server reject |
| XSS payload in any field reflected unescaped        | ❌ escaped  |  ❌ escaped  |  ❌ escaped  |        ❌ escaped         |
| CSP / HSTS / XFO / Permissions-Policy headers       |     ✅      |      ✅      |      ✅      |            ✅             |

---

## 7. Rollout Checklist

- [ ] **Phase 1**
  - [ ] Author SQL migration `2026-07-28_anon_deny_registrations.sql`
  - [ ] Apply via `supabase db push` to staging, verify with the matrix above
  - [ ] Apply to production during low-traffic window (weekend)
  - [ ] Add `app/api/admin/route.ts` + `vercel.json` headers
  - [ ] Deploy; smoke test admin URLs return 404
- [ ] **Phase 2**
  - [ ] Add `lib/schemas/registration.ts` (zod, shared)
  - [ ] Rewrite `app/api/registration/route.ts` with validate → captcha → insert
  - [ ] Add `src/lib/captcha.ts` for stateless HMAC-SHA256 challenge & verification
  - [ ] Wire `csrf` cookie in `middleware.ts`; add hidden input to form
  - [ ] Update Supabase `config.toml` rate limits; `supabase db push`
  - [ ] Deploy behind a feature flag (`REGISTRATION_STRICT=true`)
  - [ ] Monitor 4xx for 24 h, then remove flag
- [ ] **Phase 3**
  - [ ] Add password pattern to `/login`
  - [ ] Add Supabase `check_password_strength` trigger
  - [ ] Move advisor list to RSC payload, return 405 on `GET /api/registration`
  - [ ] Wire Sentry alert rules

---

## 8. Out of Scope (Noted, Not Fixed Here)

- WAF / DDoS protection at the edge — handled by Vercel defaults + the new rate limits.
- Image-upload scanning for the `photo` / `panCard` fields — recommend ClamAV or Cloudflare Images pipeline in a separate change.
- End-to-end email-content sanitization (currently Resend is fed the validated form fields; no user-supplied HTML body is accepted).
- Mobile app / client-portal deep audit — separate scope.

---

## 9. References

- Live probe transcript captured in this session under `xd://browser` (Supabase anon key, response bodies, status codes).
- Supabase RLS docs: https://supabase.com/docs/guides/auth/row-level-security
- Vercel clean URLs: https://vercel.com/docs/projects/project-configuration#cleanurls
- DPDP Act 2023 (India) — defines Aadhar/PAN as Sensitive Personal Data.
