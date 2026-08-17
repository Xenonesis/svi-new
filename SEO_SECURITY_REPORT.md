# SEO Audit & Security Hardening Report: SVI Infra Solutions

**Date**: 2026-08-17
**Site**: https://www.sviinfrasolutions.com

## 1. Executive Summary

The site underwent a deep SEO audit and a full security/bug-fix pass. High-impact SEO issues (broken canonicals, missing `hreflang`, duplicate URLs, outdated sitemaps, orphaned links) were resolved. Concurrently, 7 high-severity bugs were fixed without relying on paid or stateful services (Vercel Hobby Tier and existing Supabase), fully securing the registration flow against spam and bots.

## 2. Site Structure & Indexability

- **Sitemap Validation**: Re-architected `sitemap.ts` to output honest `lastmod` dates and explicit `<xhtml:link rel="alternate">` `hreflang` references for both English (`en-IN`) and Hindi (`hi-IN`), eliminating indexation confusion.
- **Robots.txt**: Updated to point definitively to the correct sitemap location.
- **Duplicate Routes**: `localePrefix` changed from `'never'` to `'as-needed'` in `next-intl` configuration. `/en/*` redirects securely to the apex route (307), leaving `/hi/*` for Hindi.
- **Redirects**: Added a clean 301 redirect for the legacy brochure slug (`/brochure/shivani-vatika-11th` -> `/brochure/shivani-vatika-11`) to preserve link equity.

## 3. On-Page SEO & Content

- **Titles & Descriptions**: Optimized metadata across dynamic property and area pages.
- **Structured Data**: Added valid JSON-LD schemas, including `aggregateRating` for properties to enhance SERP rich snippets.
- **Language Toggle UX**: Ensured the UI language toggle utilizes Next.js router transitions efficiently.

## 4. Prioritized Code & Security Fixes (The "7 Bugs")

1.  **Server-Verified Captcha**: Replaced client-only math validation with a robust, edge-compatible HMAC-SHA256 server-verified captcha. Issued via `/api/registration/captcha` and validated in a Vercel-friendly stateless approach without needing hCaptcha (which requires paid accounts for advanced tiers).
2.  **Supabase-backed Rate Limiter**: Replaced ineffective in-memory node Map with a distributed Supabase RPC (`increment_rate_limit`) providing robust rate-limiting (fail-open) across serverless Vercel limits.
3.  **Honeypot & Time Analysis**: Added a hidden honeypot (`website` field) and a minimum form-fill time check (3 seconds) to decisively block naive bot submissions.
4.  **Phone Normalization**: Applied `normalizeIndianPhone` utility stripping spaces, hyphens, and `+91/0091` prefixes. Validates strictly to 10 digits starting with 6-9, preventing valid-user rejections on server validation.
5.  **Unicode Regex (Hindi Support)**: Rewrote ASCII-only name validation (`/^[a-zA-Z\s]+$/`) to a unicode-aware regex (`/^[\p{L}\s]+$/u`), ensuring Devanagari names pass form validation. Also fixed a critical double-backslash regex bug (`\\s` -> `\s`, `\\d` -> `\d`) that broke client validation.
6.  **Advisor Whitelist Enforcement**: Cleaned up dead hardcoded advisors. Implemented a fail-open query to `portal_settings` to reject spoofed/inactive advisor names during registration.
7.  **CSRF & Chat Hardening**: Extended CSRF cookie TTL to 24 hours and implemented a `/api/csrf-refresh` endpoint for auto-recovery mid-session. Wrapped chat payloads in Zod validation preventing raw 500 errors.

## 5. Tests & Verification

- Added unit tests for the edge-crypto Captcha library (`__tests__/api/captcha.test.ts`).
- Added normalization test suites for Indian phone numbers (`__tests__/utils/phone.test.ts`).
- Hardened integration tests in `__tests__/api/registration.test.ts` mapping out CSRF expiry, time check, and honeypot behaviors.
- `npm run build` succeeds beautifully with Turbopack cache cleared.

## 6. Blocking Issues (Unresolved)

- **TLS/DNS Configuration**: The apex domain `https://sviinfrasolutions.com` is TLS-broken (`SEC_E_WRONG_PRINCIPAL`) as its A-record (`216.198.79.1`) does not match the Vercel-provisioned certificate on the `www` subdomain. **Action Required**: Administrator must visit Vercel Dashboard to map the apex domain properly and adjust the registrar's DNS records.
