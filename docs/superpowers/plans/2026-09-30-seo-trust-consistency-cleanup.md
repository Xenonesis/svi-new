# SVI Infra Solutions — Final Trust, Consistency & SEO Cleanup Plan

## ROLE

You are a Senior Technical SEO Engineer, AEO Specialist and Content Quality Engineer.

You are working on the existing production website:

https://www.sviinfrasolutions.com

The main SEO architecture is already implemented.

## IMPORTANT

DO NOT:

- redesign the website
- create new SEO landing pages
- create new blogs
- change the SEO architecture
- change existing URLs
- rewrite the entire website
- add unnecessary schema
- repeatedly submit IndexNow URLs

Your task is now only:

> **AUDIT → VERIFY → FIX VERIFIED ISSUES → RECRAWL → REPORT**

---

# CURRENT SEO STATE

The website already has:

- Jaipur SEO page (`/plots-in-jaipur`)
- Phulera commercial page (`/plots-for-sale-in-phulera`)
- Khatu Shyam Ji commercial page (`/plots-for-sale-near-khatu-shyam-ji`)
- Renwal Railway Station page (`/plots-near-renwal-railway-station`)
- Budget corridor page (`/plots-in-jaipur-under-20-lakhs`)
- Shivani Vatika 11th project page (`/projects/shivani-vatika-11th`)
- FAQ/AEO content with `FAQSchema` structured data
- 20+ blog articles in `src/lib/blog.ts`
- Internal linking across all corridor pages
- Sitemap with bilingual `hreflang` alternates (`en-IN`, `hi-IN`)
- Canonical structure via `src/lib/seo.ts`
- Robots configuration with AI bot allowlisting (GPTBot, ClaudeBot, PerplexityBot, etc.)
- IndexNow integration (`app/api/indexnow/route.ts` + `triggerIndexNow()` helper)
- Schema.org JSON-LD: Organization, RealEstateListing, PlaceAndArea, FAQPage, BreadcrumbList, amenityFeature
- CorridorEmiWidget interactive calculators on corridor landing pages
- Project/location SEO architecture with area corridors

The remaining work is primarily:

1. Road width consistency (blogs only — landing pages already standardized)
2. Project status consistency
3. Legal/trust claim accuracy
4. Investment/ROI claim quality & sourcing
5. Contact/email consistency
6. GPS verification-language accuracy
7. Blog HTML technical debt

---

# PRIORITY 1 — ROAD WIDTH CONSISTENCY (BLOGS ONLY)

## CURRENT STATE (ALREADY VERIFIED)

Main landing pages, project data, blogs, templates, and schemas have been standardized to **`40 ft`** internal road width (with **`160 ft`** connecting state highway frontage).

- `src/data/corridorAmenities.ts` → `40 ft`
- `src/data/projects.ts` → `40ft`
- `src/components/home/CorridorDiscovery.tsx` → `160 ft & 40 ft`
- `src/components/plots/khatu-shyam/KhatuTownshipSpotlight.tsx` → `40 ft`
- `src/components/plots/khatu-shyam/khatuData.ts` → `40 ft`
- `src/components/plots/phulera/phuleraData.ts` → `40 ft`
- `src/components/plots/renwal/PlotsRenwalFeatured.tsx` → `40 ft`
- `src/components/plots/renwal/plotsRenwalData.ts` → `40 ft`
- `src/components/plots/under-20-lakhs/plotsUnder20LakhsData.ts` → `40-foot-wide`
- `src/components/projects/ProjectFaqSection.tsx` → `40 ft`
- `src/lib/blog.ts` → `40 ft` (all articles, takeaways, specs, and FAQs standardized)
- `src/lib/utils/whatsappTemplates.ts` → `40 ft`
- `app/[locale]/(main)/plots-near-renwal-railway-station/page.tsx` → `40 ft`
- `public/llms.txt` and `public/llms-full.txt` → `40 ft`

## ACTION

All references consistently use the verified **`40 ft`** internal road width.

Note: Plot dimension references like `18 ft x 40 ft` or `30 ft x 60 ft` in pricing tables are **plot sizes**, NOT road widths.
---

# PRIORITY 2 — PROJECT STATUS CONSISTENCY

## CURRENT STATE (VERIFIED)

The primary project data is in `src/data/projects.ts`:

| Project                  | Current Status      | Correct?                               |
| ------------------------ | ------------------- | -------------------------------------- |
| Shivani Vatika 11th      | `Ongoing`           | ✅ Verified authoritative source       |
| Shivani Vatika (Basandi) | `Ready to Move`     | ✅ Different project, different status |
| Shyam Aangan (Nayla)     | `Under Development` | ✅ Different project, different status |

## REMAINING CONFLICT

`src/components/plots/under-20-lakhs/PlotsUnder20LakhsFeatured.tsx:60` says:

> `'Ready possession with electrical poles and wide roads'`

This describes the **budget corridor** which includes Shivani Vatika 11th (status: Ongoing). The wording `"Ready possession"` contradicts the project status.

## ACTION

Replace with factual wording:

> `'Electrical poles, wide roads, and active development infrastructure'`

or similar that does NOT claim ready possession for an Ongoing project.

---

# PRIORITY 3 — LEGAL CLAIMS

Search the entire repository for excessive absolute legal assurances:

```text
100% legal
100% clear title
100% clear ownership
100% verified
100% Registry Ready
zero legal ambiguity
guaranteed legal
guaranteed title
zero dispute
zero encumbrance
zero brokerage
```

## KNOWN OCCURRENCES (VERIFIED IN CODEBASE)

| File                                                               | Line  | Current Claim                                                  |
| ------------------------------------------------------------------ | ----- | -------------------------------------------------------------- |
| `src/components/home/TrustMetricsGrid.tsx`                         | 9     | `100% clear ownership & secure plots`                          |
| `src/components/areas/PhuleraInteractive.tsx`                      | 292   | `100% clear titles, zero brokerage & direct developer pricing` |
| `src/components/brochure/shivani-vatika-11/BrochureInvestment.tsx` | 7     | `100% verified documentation`                                  |
| `src/data/faq/general.ts`                                          | 98    | `ensuring 100% verified townships and clear ownership titles`  |
| `src/data/faq/general.ts`                                          | 149   | `100% verified land titles and clear registry documentation`   |
| `src/components/plots/khatu-shyam/khatuData.ts`                    | 152   | `100% Registry Ready (90-A)`                                   |
| `src/lib/blog.ts`                                                  | ~3542 | `completing a 100% legal...`                                   |
| `src/lib/blog.ts`                                                  | ~3947 | `Both provide 100% legal, non-agricultural ownership`          |

## REPLACE WITH FACTUAL LANGUAGE

Preferred replacement:

> **Section 90-A converted with individual sub-registrar registry. Buyers should independently verify title, revenue records, and encumbrances before purchase.**

For badges/pills where brevity is needed:

> **Clear 90-A Registry** or **Verified Documentation**

Do NOT promise:

- guaranteed legal safety
- guaranteed title
- zero legal risk
- absolute ownership security
- 100% anything regarding legal status

unless there is explicit authoritative documentation supporting the exact claim.

---

# PRIORITY 4 — INVESTMENT / ROI CLAIM AUDIT

Search all content for:

```text
ROI
annual appreciation
capital appreciation
capital growth
rental yield
rental return
wealth multiplier
equity multiple
12%
15%
16%
18%
20%
22%
25%
30%
2.5x
3x
6% to 9%
7% to 10%
5.5% to 7.2%
12-16%
15-20%
20-30%
```

## KNOWN OCCURRENCES (VERIFIED IN CODEBASE)

| Claim                                 | File                                      | Type             | Has Disclaimer?                                 |
| ------------------------------------- | ----------------------------------------- | ---------------- | ----------------------------------------------- |
| `12-16% annual appreciation`          | `blog.ts` (DMIC article ~72, ~103)        | Blog             | ✅ Yes                                          |
| `15-20% appreciation`                 | `khatuData.ts:430` (FAQ answer)           | Landing page FAQ | ⚠️ Partial — says "estimated" but no disclaimer |
| `15% estimated corridor appreciation` | `CorridorEmiWidget.tsx:36` (code comment) | Calculator logic | ❌ No — hardcoded assumption                    |
| `20-30% capital value surges`         | `blog.ts` (~1444)                         | Blog             | ✅ Yes                                          |
| `6% to 9% rental yields`              | `blog.ts` (~1916, ~1965)                  | Blog             | ✅ Yes                                          |
| `5.5% to 7.2% rental yields`          | `blog.ts` (~3264, ~3358)                  | Blog             | ✅ Yes                                          |
| `7% to 10% commercial yields`         | `blog.ts` (~685)                          | Blog             | ✅ Yes                                          |
| `2.5% to 4% residential yields`       | `blog.ts` (~686)                          | Blog             | ✅ Yes                                          |
| `12% to 18% guest house yields`       | `blog.ts` (~1753)                         | Blog             | ⚠️ No explicit disclaimer nearby                |

Create:

```text
INVESTMENT_CLAIMS_AUDIT.md
```

Use:

| Claim               | File:Line        | Source | Period      | Type    | Has Disclaimer | Action                                  |
| ------------------- | ---------------- | ------ | ----------- | ------- | -------------- | --------------------------------------- |
| 15–20% appreciation | khatuData.ts:430 | None   | Unspecified | Assumed | Partial        | Add disclaimer or label as illustrative |

## RULES

### If historical:

Provide source, location, period, methodology.

### If projected/illustrative:

Clearly label:

> **Illustrative projection / scenario based on historical trends**

and add:

> Actual property values and returns may vary depending on market conditions, demand, infrastructure development and other factors.

### If assumed (like CorridorEmiWidget's 15%):

Mark explicitly in UI:

> **Illustrative estimate**

### If unsupported:

REMOVE THE SPECIFIC PERCENTAGE. Do not present speculative returns as established market facts.

---

# PRIORITY 5 — REMOVE EXCESSIVE PROMOTIONAL LANGUAGE

## KNOWN OCCURRENCES (VERIFIED IN CODEBASE)

| File      | Line  | Current Claim                                                              |
| --------- | ----- | -------------------------------------------------------------------------- |
| `blog.ts` | ~3781 | `represents the quintessential high-appreciation asset`                    |
| `blog.ts` | ~3791 | `provides the highest risk-adjusted upside in Rajasthan real estate today` |
| `blog.ts` | ~3299 | `most balanced risk-adjusted land investment propositions`                 |

## ACTION

Replace unsupported promotional language with factual descriptions.

Instead of:

> Quintessential high-appreciation asset

Use:

> Located within a corridor influenced by highway expansion, industrial development, and pilgrimage infrastructure.

Instead of:

> Highest risk-adjusted upside

Use:

> The corridor has several infrastructure and connectivity developments relevant to residential and commercial property demand.

---

# PRIORITY 6 — GPS / DISTANCE CLAIMS

## KNOWN OCCURRENCE (VERIFIED)

`src/components/projects/ProjectTransitMatrix.tsx:191`:

```
{isHindi ? '100% सत्यापित दूरियां' : '100% GPS Verified'}
```

## ACTION

Unless there is a reproducible GPS verification methodology documented, replace with:

> **Map-Based Drive Time Estimates** / **मानचित्र-आधारित दूरी अनुमान**

or:

> **Estimated Drive Times & Distances**

Do NOT claim `100% verified` without an actual verification system.

---

# PRIORITY 7 — EMAIL CONSISTENCY

## VERIFIED STATUS

The official company email is: `info@sviinfrasolutions.com`

## KNOWN INCORRECT OCCURRENCES

| File                                           | Line | Current (Wrong)                   | Should Be                    |
| ---------------------------------------------- | ---- | --------------------------------- | ---------------------------- |
| `src/components/projects/ProjectActions.tsx`   | 47   | `info@sviinfra.com`               | `info@sviinfrasolutions.com` |
| `src/components/admin/settings/CompanyTab.tsx` | 92   | `info@sviinfra.com` (placeholder) | `info@sviinfrasolutions.com` |

Fix both occurrences. Check structured data and metadata for any other instances.

---

# PRIORITY 8 — COMPANY EXPERIENCE YEARS

## VERIFIED STATUS

The codebase consistently uses `17+ years` and `since 2009` across all files:

- `app/layout.tsx` metadata
- `src/components/common/Schema.tsx`
- `src/components/blog/BlogPostAuthorCard.tsx`
- `src/components/blog/BlogPostJsonLd.tsx`
- `src/lib/blog.ts` (multiple articles)
- `app/api/chat/route.ts`
- `public/manifest.json`

**This is consistent.** No conflicting claims found.

## MINOR NOTE

`app/[locale]/(main)/about/page.tsx:25` says `15+ projects` — this is about **project count**, NOT years of experience. This is NOT a conflict.

**Math verification:** Founded 2009, current year 2026 = 17 years. `"17+ years"` is factually accurate.

**No action required** on this priority unless a future audit finds new inconsistencies.

---

# PRIORITY 9 — PROJECT DATA CONSISTENCY

Audit these project facts across the entire site:

| Fact                     | Verified Master Value               | Source                           |
| ------------------------ | ----------------------------------- | -------------------------------- |
| Total plots              | 230                                 | `src/data/projects.ts`           |
| Total area               | 11.5 Bigha (~30,480 sq. yds.)       | `src/data/projects.ts`           |
| Plot sizes               | 80–250 sq. yds.                     | `src/data/projects.ts`           |
| Base rate                | ₹7,500/sq. yd.                      | Landing pages, blog articles     |
| Starting price           | ₹6,00,000 (80 sq. yds. × ₹7,500)    | Schema `lowPrice`, landing pages |
| Internal road width      | 30 ft                               | Standardized commit `0872e41e`   |
| Project status (SV 11th) | Ongoing                             | `src/data/projects.ts`           |
| Section conversion       | 90-A                                | Multiple authoritative sources   |
| Location                 | Harsholi, Kishangarh Renwal, Jaipur | Project data                     |
| Bank loan                | Up to 80% (SBI, HDFC, ICICI, BOB)   | Landing pages                    |

## IMPORTANT EXCEPTIONS

- `plots-in-jaipur-under-20-lakhs` page has `offerCount={120}` — this is correct because it represents a **budget subset** of the total 230 plots. Do NOT change to 230.
- `RealEstateListingSchema` on the Khatu page has `price="1500000"` (₹15 Lakhs for 200 sq. yds. reference plot) while Renwal page has `lowPrice="600000"`. Both are correct — different pricing representations.

Create a master consistency table:

| Fact | Master Value | Pages Checked | Conflicts Found | Action |
| ---- | ------------ | ------------- | --------------- | ------ |

---

# PRIORITY 10 — DO NOT CHANGE GOOD SEO ARCHITECTURE

Preserve the existing URL hierarchy:

```
/ (Homepage)
├── /plots-in-jaipur
├── /plots-for-sale-in-phulera
├── /plots-for-sale-near-khatu-shyam-ji
├── /plots-near-renwal-railway-station
├── /plots-in-jaipur-under-20-lakhs
├── /projects/shivani-vatika-11th
├── /projects/current
├── /projects/completed
├── /areas/[slug]
├── /blog/[slug]
├── /about
├── /contact
├── /calculators
└── /exclusive-offers
```

Do not create duplicate pages for the same intent.

Do not change URLs unnecessarily.

Do not remove working commercial pages.

---

# PRIORITY 11 — VERIFY CURRENT AEO

Do not add lots of new FAQs.

Audit existing FAQs for:

- direct answers
- factual accuracy
- consistency with master project data (Priority 9)
- visible HTML content
- no duplicated answers
- no unsupported claims (cross-reference with Priority 3 and Priority 4)

Priority questions to verify:

```text
What is Shivani Vatika 11th?
Where is Shivani Vatika 11th?
What plot sizes are available?
What is the project status?
What is the current price?
What payment plans are available?
How far is it from Khatu Shyam Ji?
How far is it from Jaipur?
What documents should buyers verify?
How can I schedule a site visit?
```

FAQ source files:

- `src/data/faq/general.ts`
- `src/components/plots/khatu-shyam/khatuData.ts`
- `src/components/plots/phulera/phuleraData.ts`
- `src/components/plots/renwal/plotsRenwalData.ts`
- `src/components/plots/jaipur/jaipurPlotsData.ts`
- `src/components/projects/ProjectFaqSection.tsx`

---

# PRIORITY 12 — BLOG HTML TECHNICAL DEBT

## ISSUE

`src/lib/blog.ts` contains **28 instances** of duplicate `class` + `className` attributes in HTML strings rendered via `dangerouslySetInnerHTML`:

```html
<p class="mt-6 text-xs ..." className="mt-6 text-xs ..."></p>
```

Since blog content is injected via `dangerouslySetInnerHTML`, React does NOT process `className` — it passes raw HTML. This means:

- The `class` attribute works correctly in the browser
- The `className` attribute is rendered as a **non-standard duplicate attribute**
- This is technically invalid HTML

## ACTION

Remove the duplicate `className="..."` from all 28 disclaimer paragraphs. Keep only the `class="..."` attribute since these are raw HTML strings, not JSX.

---

# PRIORITY 13 — TECHNICAL SEO REGRESSION CHECK

DO NOT change technical SEO unless an actual regression is found.

Verify:

```text
https://www.sviinfrasolutions.com/robots.txt
https://www.sviinfrasolutions.com/sitemap.xml
```

Check:

- HTTP 200
- Canonical tags present
- Indexability (no accidental noindex)
- Redirects working
- Sitemap includes all corridor pages, blog posts, area pages
- No broken internal links on key pages
- IndexNow functionality intact (`/api/indexnow` route responds)
- AI bot crawlers allowed (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)

---

# PRIORITY 14 — PRODUCTION RECRAWL

After fixes, re-crawl these exact pages:

```text
https://www.sviinfrasolutions.com/
https://www.sviinfrasolutions.com/plots-in-jaipur
https://www.sviinfrasolutions.com/plots-for-sale-in-phulera
https://www.sviinfrasolutions.com/plots-for-sale-near-khatu-shyam-ji
https://www.sviinfrasolutions.com/plots-near-renwal-railway-station
https://www.sviinfrasolutions.com/plots-in-jaipur-under-20-lakhs
https://www.sviinfrasolutions.com/projects/shivani-vatika-11th
https://www.sviinfrasolutions.com/blog/buy-residential-plots-near-khatu-shyam-ji-temple-guide
https://www.sviinfrasolutions.com/blog/top-5-high-appreciation-real-estate-corridors-jaipur-2026
```

Verify the old conflicting wording is actually gone from production.

---

# PRIORITY 15 — FINAL REPORT

Create:

```text
FINAL_CONSISTENCY_AUDIT.md
```

Include:

## 1. Issues Found (total count + severity)

## 2. Issues Fixed (with file:line references)

## 3. Issues Not Changed (with reasoning)

## 4. Road Width Verification (blog standardization results)

## 5. Project Status Verification

## 6. Legal Claims Audit (before/after for each occurrence)

## 7. Investment Claims Audit (table with source/disclaimer status)

## 8. Contact/Email Consistency

## 9. GPS/Distance Claim Audit

## 10. Project Data Consistency (master table)

## 11. Blog HTML Technical Debt (class/className cleanup count)

## 12. Technical SEO Regression Check

## 13. Production Re-Crawl Results

## 14. Remaining Issues (if any)

---

# IMPORTANT DEVELOPMENT RULES

DO NOT:

- invent project specifications
- choose conflicting data arbitrarily
- invent legal guarantees
- invent ROI statistics
- invent sources or citations
- create new pages unnecessarily
- create new blogs
- redesign the site
- modify URLs unnecessarily
- modify plot dimension tables (e.g., `18 ft x 40 ft` are plot sizes, NOT road widths)
- change `offerCount` values without understanding context (120 ≠ 230 is intentional)

DO:

- verify against `src/data/projects.ts` as the authoritative project source
- use existing commit `0872e41e` standardization as the road width reference
- remove contradictions
- make wording factual
- preserve good SEO architecture
- fix blog HTML `class`/`className` duplication
- re-crawl production after changes

---

# FINAL DECISION RULE

If an information conflict cannot be verified:

> **DO NOT GUESS.**

Either:

1. obtain the authoritative value from existing verified project data (`src/data/projects.ts`, `src/data/corridorAmenities.ts`), or
2. use neutral wording that does not make the unsupported claim.

---

# STOP CONDITION

When these are complete:

- Road width consistent across blogs and WhatsApp templates
- Project status consistent (no "Ready possession" for Ongoing projects)
- Legal wording factual (no "100% guaranteed" absolute claims)
- ROI claims sourced/clearly illustrative/removed
- GPS wording accurate (no "100% verified" without methodology)
- Email consistent (`info@sviinfrasolutions.com` everywhere)
- Blog HTML `class`/`className` duplication fixed
- Technical SEO unaffected
- Production re-crawl successful

## STOP.

Do not create more SEO pages.

Do not create more blogs.

Do not make additional SEO changes.

Generate:

```text
FINAL_CONSISTENCY_AUDIT.md
```

and report the final status.
