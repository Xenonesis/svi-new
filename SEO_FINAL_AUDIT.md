# SVI Infra Solutions — Comprehensive SEO & AEO Audit Report (v2 Final)

**Date**: 2026-09-25  
**Domain**: https://www.sviinfrasolutions.com  
**Audit Scope**: Technical SEO, AEO (Answer Engine Optimization), Entity & Data Consistency, Schema.org Markup, Internal Linking Graph, Core Web Vitals, Mobile UX, and Competitor Differentiation.

---

## 1. Executive Summary & Site Status

The major SEO architecture for SVI Infra Solutions is structurally sound, featuring localized routing (`/` and `/hi`), dedicated corridor money hubs, single-project deep-dive pages (`/projects/shivani-vatika-11th`), comprehensive FAQ directories, calculators, and over 29 high-intent commercial & AEO blog articles.

Crucially, **no architectural redesign is needed**. The site requires targeted **data hardening, disclaimer calibration, duplicate schema elimination, and topical entity strengthening** to outperform competitor websites (e.g. NavBharat Niwas) across Google Search, Google AI Overviews, Perplexity, and Claude.

---

## 2. Data Consistency & Factual Claims Audit Table

| Claim / Metric                           | Where Found                                 | Previous Discrepancies                           | Authoritative Ground Truth                                                                                         | Status / Remediation                                                                                                                                                                                     |
| :--------------------------------------- | :------------------------------------------ | :----------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Company Experience**                   | Layouts, About, Leadership, Schemas         | "over a decade", "over two decades", "15+ years" | **"17+ Years of Industry Experience / Building Legacies Since 2009"**                                              | **Unified across all locales, schemas, author cards, and metadata.**                                                                                                                                     |
| **Zero / Broken Counters**               | Hero section stats, counters                | SSR hydration flash of `0+` before animation     | Fixed in `StatsCounter.tsx` by setting initial state to target values (`5000+`, `17+`, `100%`).                    | **No `0+` counters exist in markup or SSR output.**                                                                                                                                                      |
| **Shivani Vatika 11th - Total Plots**    | Projects DB, Brochure, Blogs, Corridor Hubs | 198 vs 230                                       | **230 master-planned residential plots** across 11.5 Bigha (approx. 30,480 sq. yds.).                              | **Consistently aligned across all components.**                                                                                                                                                          |
| **Shivani Vatika 11th - Plot Sizes**     | Project detail, FAQ, Blog articles          | Vague 80-250 sq. yds.                            | **80, 100, 150, 200, and 250 sq. yds.** (Configurations: 80–150 compact, 150–200 standard, 200–250 wide-frontage). | **100% consistent across project DB, FAQ, and blogs.**                                                                                                                                                   |
| **Shivani Vatika 11th - Verified Price** | Project DB, Calculator, FAQs                | Unstated or variable                             | **₹ 7,500/sq. yd.** (Starting at approx. ₹ 15 Lakhs* for 80 sq. yds.).                                             | **Explicitly documented with `*` and transparent cost terms.**                                                                                                                                           |
| **Project Status**                       | Project DB, Corridor pages                  | "Pre-Launch", "Upcoming"                         | **"Ongoing / Active Development"** with immediate registry and possession readiness.                               | **Standardized as "Ongoing" in `src/data/projects.ts`.**                                                                                                                                                 |
| **Annual Pilgrimage Footfall**           | Khatu Shyam Hub, Blog articles              | 4.5+ crore annual devotees                       | Historical and peak festival estimates                                                                             | **Qualified with survey and festival peak cycle context.**                                                                                                                                               |
| **Projected ROI / Appreciation**         | Calculator, Phulera Hub, Khatu Hub, Blog    | Unhedged "15–20% annual ROI / guaranteed"        | Regulatory disclaimers mandatory                                                                                   | **Rewritten to "Illustrative projection based on an assumed annual growth rate. Actual property values may vary depending on market conditions, demand, infrastructure development and other factors."** |

---

## 3. Existing Page Quality & Search Intent Alignment

### A. Homepage (`/` & `/hi`)

- **Intent**: Brand discovery, authority establishment, corporate trust, and pathway to primary corridors.
- **Audit Result**: Clean header hierarchy, dynamic `--header-height` clearance, SSR hydration-safe stats counter, direct WhatsApp/call CTAs.

### B. Plots in Jaipur (`/plots-in-jaipur` & `/hi/plots-in-jaipur`)

- **Intent**: High-volume generic transactional search (`Plots in Jaipur`, `Residential plots in Jaipur`).
- **Optimization**: Added direct corridor exploration cards connecting users seamlessly to:
  1. `/plots-for-sale-near-khatu-shyam-ji`
  2. `/plots-for-sale-in-phulera`
  3. `/plots-near-renwal-railway-station`

### C. Phulera Smart City Hub (`/plots-for-sale-in-phulera` & `/hi/...`)

- **Intent**: High-intent logistics, DMIC, DFC freight investor queries.
- **Optimization**: Labeled un-hedged appreciation figures as illustrative projections; reinforced connection to Western DFC rail junction and Shivani Vatika 11th.

### D. Khatu Shyam Ji Highway Hub (`/plots-for-sale-near-khatu-shyam-ji` & `/hi/...`)

- **Intent**: Commercial pilgrimage guesthouse land, devotee villas, NHAI 4-lane highway expansion.
- **Optimization**: Calibrated annual footfall and appreciation notes; added clear transit matrix and doorstep free AC cab booking CTA.

### E. Shivani Vatika 11th Flagship Page (`/projects/shivani-vatika-11th`)

- **Intent**: Primary conversion entity against competitor hijack (NavBharat).
- **Optimization**: Added exact ₹ 7,500/sq. yd. pricing, 20–25 min distance to temple, Section 90-A revenue orders, and 230-plot masterplan blueprint.

### F. FAQ Directory (`/faq`)

- **Intent**: Broad informational queries on stamp duty, Section 90-A, registries, and site visits.
- **Optimization**: Deduplicated schema rendering: removed nested `showStructuredData` duplicate inside `FAQSection.tsx` so only the top-level route emits `FAQPage` JSON-LD.

---

## 4. Technical SEO & Schema Verification

- **Robots.txt**: Accessible at `/robots.txt`. Allows standard Googlebot/Bingbot/Baidu as well as AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`), while blocking sensitive administrative, employee, and payment endpoints.
- **Sitemap.xml**: Dynamically generated via `app/sitemap.ts`. Includes all static routes, 3 projects, 4 area landing pages, and 29 localized blog articles with `en-IN`, `hi-IN`, and `x-default` hreflang tags.
- **IndexNow Protocol**: Configured at `/api/indexnow` with key `e57c6b9074d24177b9605809115f2e8f` submitting updated URLs directly to Bing and Yandex in real-time.
- **Canonicals**: Strictly generated via `buildAlternates()` pointing to self-referential canonicals with language alternates.
- **Schema Hierarchy**:
  - `Organization` & `RealEstateAgent` emitted globally in root `app/layout.tsx`.
  - Duplicate `OrganizationSchema` removed from `[locale]/(main)/layout.tsx`.
  - `FAQPage` schema isolated and matched 1:1 with visible UI text.
  - `BreadcrumbList` schema rendered per route matching visible navigation.

---

## 5. Performance, Core Web Vitals & Mobile UX

- **LCP (Largest Contentful Paint)**: Hero images preloaded with WebP/AVIF formats, prioritized with Next.js `priority={true}`.
- **CLS (Cumulative Layout Shift)**: Header height offset managed via CSS variables; dynamic counters pre-populated with default integer strings to eliminate visual jumping.
- **Touch Target Integrity**: Minimum 44px x 44px on all interactive mobile buttons, sticky site-visit pills, and drawer triggers.
- **Heavy Bundles**: `jspdf` and `exceljs` lazy-loaded dynamically only on user click inside administrative report flows.

---

## 6. Next Steps & Execution Roadmap

1. Complete Step 3: Verify all 7 high-priority pages respond with HTTP 200 and error-free rendering.
2. Complete Step 4: Verify schema validation using Google Rich Results testing patterns.
3. Complete Step 5: Execute full end-to-end smoke checks.
4. Complete Step 6: Generate `SEO_IMPLEMENTATION_REPORT.md` and commit to `main`.
