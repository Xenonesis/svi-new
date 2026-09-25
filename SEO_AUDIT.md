# Comprehensive SEO & AEO Technical Audit

**Domain**: [https://www.sviinfrasolutions.com](https://www.sviinfrasolutions.com)  
**Company**: SVI Infra Solutions Pvt. Ltd.  
**Auditor**: Senior Technical SEO Engineer & Information Architect  
**Audit Date**: 2026-09-25

---

## 1. Executive Summary & Core Objective

The primary objective is to build unassailable search authority and Answer Engine Optimization (AEO) visibility for **SVI Infra Solutions** across its primary operating corridor:

```
SVI Infra Solutions
       ↓
Jaipur Real Estate
       ↓
Phulera (DMIC Logistics Corridor)
       ↓
Khatu Shyam Ji (Pilgrimage Highway Corridor)
       ↓
Residential Plots
       ↓
Shivani Vatika 11th
```

The website already possesses high-tier modern Next.js 15 App Router architecture, bilingual routing (`/` and `/hi`), dynamic JSON-LD schemas, and recently deployed corridor hubs. However, significant topical gaps, landing page voids (specifically around **Phulera plots** and **direct Khatu Shyam Ji commercial intent**), schema opportunities, and data consistency items require targeted elevation.

---

## 2. Codebase Architecture & Technical SEO Analysis

### 2.1. Framework & Routing

- **Framework**: Next.js 15 (App Router) with React 19, TypeScript, Tailwind CSS, Framer Motion.
- **Routing Structure**: `app/[locale]/(main)/...` managed via `next-intl` (`routing.ts`: locales `['en', 'hi']`, `localePrefix: 'as-needed'`).
- **Canonical & Hreflang**:
  - Implemented cleanly via `src/lib/seo.ts` (`buildAlternates()`).
  - Emits `en-IN`, `hi-IN`, and `x-default` canonical tags.
- **Robots.txt (`app/robots.ts`)**:
  - Properly blocks `/admin`, `/api`, `/login`, `/employee`, `/payment`, `/thank-you`, and search query parameters (`/*?type=`, etc.).
  - Explicitly permits AI bots (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`).
  - Correctly references sitemap: `https://www.sviinfrasolutions.com/sitemap.xml`.
- **Sitemap (`app/sitemap.ts`)**:
  - Uses static timestamps (`STATIC_LAST_MODIFIED`) to avoid crawler timestamp churn.
  - Generates alternates for both `en-IN` and `hi-IN`.
  - Dynamically traverses `PROJECTS_DB`, `AREAS_DATA`, and `BLOG_POSTS`.
- **IndexNow Protocol (`app/api/indexnow/route.ts`)**:
  - Live with key verification (`e57c6b9074d24177b9605809115f2e8f.txt`).

---

## 3. Data Consistency & Verification Audit

As mandated by Section 6 of the Master Prompt, the codebase was exhaustively audited for conflicting figures:

### 3.1. Total Plot Count: "198" vs "230"

- **Audit Findings**:
  - `src/data/projects.ts`:
    - `totalPlots: '230'` (Lines 104, 112, 235).
    - Description: _"The township offers 230 residential plots ranging from 80 sq. yds. to 250 sq. yds."_
    - Blueprint Tag: _"Master Plan · 230 Plots"_.
  - `src/components/brochure/shivani-vatika-11/BrochureMasterplan.tsx` & `BrochureTrust.tsx`:
    - Display stat: `230 Premium Plots`.
  - Search for `"198"`:
    - **No project plot count anywhere in the codebase uses 198**.
    - The number 198 only appeared in customer email usernames or contact hashes (`SMSHARMA1987@GMAIL.COM`).
  - **Verdict**: **230 Plots** is the single, authoritative, verified figure. No contradiction exists.

### 3.2. Project Status: "Pre-Launch" vs "Ongoing"

- **Audit Findings**:
  - `src/data/projects.ts` (Line 66): `status: 'Ongoing'`.
  - `app/[locale]/(main)/areas/[slug]/page.tsx` (Line 28): `status: 'Ongoing'`.
  - `app/[locale]/(main)/projects/current/layout.tsx`: Represents current/ongoing portfolio.
  - "Pre-Launch" mentions: Found only in generic email marketing templates (`src/components/admin/email/campaigns/CampaignFormModal.tsx`) and exit popup placeholders.
  - **Verdict**: **Ongoing** is the authoritative status.

### 3.3. Project Approvals: RERA vs 90A vs Society

- **Audit Findings**:
  - `src/data/areas.ts` (Line 31) contained an unverified copy phrase: _"RERA-approved plots with immediate highway connectivity"_.
  - However, in `src/data/projects.ts`, `Shivani Vatika 11th` is accurately presented as a planned residential society with clear registry documents, Section 90-A conversion, Jamabandi, and mutation (dakhil-kharij) title records.
  - Company settings store a corporate UP-RERA registration (`UPRERAPRJ123456`), but local Rajasthan plot developments are governed by 90A/Panchayat/JDA jurisdiction.
  - **Verdict**: Remove loose "RERA-approved" phrasing from area metadata to prevent misleading buyers and maintain strict factual compliance.

---

## 4. Current SEO & AEO Strengths

1. **Clean Semantic Markup**: H1, H2, H3 hierarchy is well respected on project pages and corridor landing hubs.
2. **Robust Schema Ecosystem**:
   - `OrganizationSchema` with multi-city `areaServed` (Jaipur, Noida, Phulera, Rajasthan).
   - `BreadcrumbSchema` with valid ListItem hierarchy.
   - `RealEstateListingSchema` and `PlaceAndAreaSchema` on area pages.
   - `FAQSchema` rendering valid JSON-LD on high-intent hubs.
3. **High-Performance Image Handling**: Uses Next.js `<Image>` with WebP/AVIF formats and responsive sizing.
4. **Bilingual hreflang Support**: Both English and Hindi routes are cross-referenced with `x-default`.

---

## 5. Critical SEO, AEO & Keyword Gaps

### 5.1. Missing Landing Pages (High-Intent Commercial Gaps)

While the website has `/plots-in-jaipur`, `/plots-near-renwal-railway-station`, and `/plots-in-jaipur-under-20-lakhs`, the following **critical search intents from the prompt are currently missing dedicated URLs**:

1. **`plots for sale near Khatu Shyam Ji` / `residential plots near Khatu Shyam Ji`**:
   - Currently, Khatu Shyam Ji is only an area slug (`/areas/khatu-shyam-highway`), which has a diluted title and lacks a direct commercial buying angle.
   - **Need**: Dedicated commercial landing page at `/plots-for-sale-near-khatu-shyam-ji` targeting pilgrim investors, temple proximity (20-25 mins), and 4-lane highway frontage.
2. **`plots for sale in Phulera` / `residential plots in Phulera` / `plots for sale in Jaipur Phulera`**:
   - Currently exists only as `/areas/phulera-smart-city`.
   - **Need**: Dedicated commercial landing page at `/plots-for-sale-in-phulera` targeting the DFC Freight Corridor, railway junction, and affordable residential/commercial investment.
3. **`plots on Jaipur Khatu Shyam Ji Highway`**:
   - High search volume corridor keyword. Can either be consolidated with the Khatu Shyam Ji hub or given a focused route `/plots-on-jaipur-khatu-shyam-highway`.

### 5.2. Shivani Vatika 11th Project Page (`/projects/shivani-vatika-11th`) Weaknesses

1. **Missing Visible FAQ Section**: AEO bots (ChatGPT, Perplexity, Google SGE) prioritize structured Q&A on project pages. `/projects/shivani-vatika-11th` has gallery, stats, and amenities, but **no visible FAQ accordion or FAQPage JSON-LD schema**.
2. **Connectivity Table**: While nearby places exist, a concise, high-impact **Transit & Distance Matrix** (e.g. Khatu Shyam Ji Temple: 20 mins, Renwal Station: 5 mins, Phulera Junction: 35 mins, Jaipur: 45 mins) is needed for instant extraction by AI search engines.
3. **Payment Plan & Price Clarity**: Lacks clear installment/payment schedule breakdown on the page.

### 5.3. Blog & Informational Content Gaps (Tier 3 Keywords)

The blog library (`src/lib/blog.ts`) has excellent guides, but needs specific coverage for:

- _"Is Phulera good for property investment? Comprehensive 2026 Analysis"_
- _"Plots near Khatu Shyam Ji: Why Pilgrimage Corridors Yield 2x Capital Growth"_

---

## 6. Schema & Structured Data Optimization Needs

1. **Project Detail Schema**: Upgrade `RealEstateListingSchema` on `/projects/shivani-vatika-11th` to include structured pricing, geo-coordinates, and `FAQPage` schema.
2. **Breadcrumb Consistency**: Ensure all new landing pages and project pages have exact matching JSON-LD Breadcrumbs (`Home → Projects → Shivani Vatika 11th` or `Home → Locations → Phulera`).
3. **LocalBusiness / RealEstateAgent Schema**: Add NAP (Name, Address, Phone) consistency with official Noida headquarters and Jaipur site office.

---

## 7. Action Plan & Phased Roadmap

| Phase       | Task                                                                                                                          | Impact                                                       |
| :---------- | :---------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **Phase 1** | **Audit & Keyword Map Documentation** (`SEO_AUDIT.md`, `KEYWORD_MAP.md`)                                                      | Establishes source of truth and keyword targeting.           |
| **Phase 2** | **Data Consistency Fixes** (Eliminate loose RERA references in area metadata, confirm 230 plots everywhere)                   | 100% legal compliance & factual consistency.                 |
| **Phase 3** | **Shivani Vatika 11th Enhancement** (Add AEO FAQ section, FAQPage Schema, verified distance table, payment options)           | Skyrockets project keyword rankings & AI overview citations. |
| **Phase 4** | **Create Missing High-Intent Landing Pages**: <br>1. `/plots-for-sale-near-khatu-shyam-ji`<br>2. `/plots-for-sale-in-phulera` | Captures Tier 1 commercial buyer queries.                    |
| **Phase 5** | **Tier 3 AEO Blog Additions & Internal Link Mesh**: Link blogs ↔ corridor pages ↔ Shivani Vatika 11th.                        | Builds full topical authority cluster.                       |
| **Phase 6** | **Sitemap, IndexNow & Build Verification**: Test SSR, schema validity, and push.                                              | Instant indexation and zero build errors.                    |
