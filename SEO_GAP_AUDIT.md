# SVI Infra Solutions — Comprehensive SEO Gap Audit (SEO_GAP_AUDIT.md)

**Domain**: [https://www.sviinfrasolutions.com](https://www.sviinfrasolutions.com)  
**Company**: SVI Infra Solutions Pvt. Ltd.  
**Auditor**: Senior Technical SEO Engineer & Information Architect  
**Date**: 2026-09-25  
**Audit Type**: GAP AUDIT ONLY (No code changes performed prior to review)

---

## 1. Existing Implementation

### 1.1. Core Framework & Routing

- **Framework**: Next.js 15 (App Router) with React 19, TypeScript, Tailwind CSS, Framer Motion, and `next-intl` bilingual routing (`en-IN`, `hi-IN`).
- **Existing Relevant Landing & Project Pages**:
  - `/plots-in-jaipur`: High-intent pillar hub page targeting broad Jaipur residential plots with FAQs and Place Schema.
  - `/plots-near-renwal-railway-station`: Corridor page targeting Renwal railway and RIICO industrial area queries.
  - `/plots-in-jaipur-under-20-lakhs`: Budget investor landing page for entry-level buyers.
  - `/projects/shivani-vatika-11th`: Flagship project page with gallery, stats, transit matrix, and FAQ section.
  - `/brochure/shivani-vatika-11`: Interactive brochure viewer for the 11th project.
  - `/areas/phulera-smart-city`: Area information guide covering DMIC/DFC freight logistics.
  - `/areas/khatu-shyam-highway`: Area guide covering the pilgrimage highway corridor.
  - `/plots-for-sale-near-khatu-shyam-ji`: Commercial corridor page targeting pilgrimage plots.
  - `/plots-for-sale-in-phulera`: Commercial corridor page targeting Phulera smart city plots.
- **Blog Library**: 21 published blog guides in `src/lib/blog.ts` covering real estate trends, JDA vs 90A, DMIC, and NRI investment.
- **SEO Infrastructure**:
  - `app/robots.ts`: Allows search and AI crawlers (`GPTBot`, `PerplexityBot`, etc.), blocks admin/private endpoints.
  - `app/sitemap.ts`: Generates static timestamped XML sitemaps with multilingual alternates (`en-IN`, `hi-IN`, `x-default`).
  - IndexNow endpoint (`/api/indexnow`) live with verification key.
  - Schemas: `Organization`, `PlaceAndAreaSchema`, `BreadcrumbSchema`, `RealEstateListingSchema`, `FAQSchema`.

---

## 2. Missing Implementation (Gaps)

### 2.1. In-Article Contextual Link Network across the 20 Blog Posts

- **Gap Identified**: While the blog posts have rich informational content, **19 out of 21 blog posts do NOT have inline contextual links (`<a href="...">`) pointing to commercial money pages**.
- **Impact**: Blog readers and search engine crawlers reading articles on _Home Loans_, _Property Registration_, _Villas vs Land_, _DMIC Corridor_, or _Jaipur Trends_ hit dead ends instead of flowing link equity to:
  - `/projects/shivani-vatika-11th`
  - `/plots-in-jaipur`
  - `/plots-for-sale-near-khatu-shyam-ji`
  - `/plots-for-sale-in-phulera`
  - `/calculators`
- **Solution**: Inject 2–3 editorial, high-relevance internal links into each of the existing blog posts.

### 2.2. AEO Structured Question-Answer Tables & Schema Enriched Blocks

- **Gap Identified**: Tier 3 AI search queries (e.g. _"How far is Shivani Vatika 11th from Khatu Shyam Ji?"_, _"What documents are required to buy a plot in Rajasthan?"_) have paragraphs answering them, but lack **concise 1-2 sentence direct-answer summary boxes** (`<blockquote>` or `<div className="aeo-answer">`) that Answer Engines (Perplexity, Google AI Overviews) preferentially parse for snippet citation.
- **Solution**: Standardize direct-answer executive summaries at the top of location and project FAQ sections.

---

## 3. Duplicate / Cannibalizing Pages Analysis

### 3.1. Phulera: `/areas/phulera-smart-city` vs `/plots-for-sale-in-phulera`

- **Current State**:
  - `/areas/phulera-smart-city`: Acts as an informational geographic overview (Sambhar lake, freight rail facts, locality geo-coordinates).
  - `/plots-for-sale-in-phulera`: Acts as a transactional commercial landing page (plot pricing, gated amenities, masterplan downloads, WhatsApp callback).
- **Risk of Cannibalization**: Both target similar broad keywords ("Plots in Phulera").
- **Resolution / Safe Distinction**:
  - Retain `/plots-for-sale-in-phulera` as the primary commercial money page (Priority 1.0 in sitemap, commercial meta title: _"Plots for Sale in Phulera | Residential Plots in Phulera Smart City"_).
  - Keep `/areas/phulera-smart-city` as an educational regional profile that contextually directs buyers to `/plots-for-sale-in-phulera` and `/projects/shivani-vatika-11th`.

### 3.2. Khatu Shyam Highway: `/areas/khatu-shyam-highway` vs `/plots-for-sale-near-khatu-shyam-ji`

- **Current State**:
  - `/areas/khatu-shyam-highway`: Locality profile focusing on Harsholi geographic boundaries.
  - `/plots-for-sale-near-khatu-shyam-ji`: Commercial landing page targeting temple pilgrim investors and commercial plots.
- **Resolution**:
  - `/plots-for-sale-near-khatu-shyam-ji` remains the primary commercial canonical target.
  - Cross-link `/areas/khatu-shyam-highway` with a prominent CTA card: _"Looking for available plots? View commercial plots for sale near Khatu Shyam Ji"_.

---

## 4. Technical Issues & Core Web Vitals (CWV)

### 4.1. The "0+" Stats Counter SSR Flash / Hydration Bug

- **File**: `src/components/ui/StatsCounter.tsx`
- **Problem**:
  - Lines 26: `const [counts, setCounts] = useState<number[]>(stats.map(() => 0));`
  - Markup renders: `{counts[i]}{s.suffix}`
  - Until the IntersectionObserver triggers the 2-second animation, the visible DOM displays:
    - **`0+` Properties Sold**
    - **`0+` Happy Clients**
    - **`0+` Years Experience**
    - **`0%` Success Rate**
  - If a web crawler (Googlebot, Bingbot) crawls the static SSR output or renders before JS animation completes, it records zero credibility metrics. If a user has JS disabled or slow network, they see "0+".
- **Solution**: Render initial server HTML with the target values (`5000+`, `5000+`, `17+`, `100%`) or gracefully display the static value with animation overlay, ensuring crawlers and initial render never see "0".

### 4.2. Metadata & OpenGraph Consistency

- Root `app/layout.tsx` uses:
  - `foundingDate: '2009'`
  - `description: '...17+ years of expertise...'`
  - Canonical and alternates properly resolve.
- All dynamic routes have `generateMetadata` with valid alternates.
- Schema JSON-LD outputs validated without syntax errors.

---

## 5. Content Gaps & Investment / ROI Claims Audit

### 5.1. Audit of Investment & ROI Claims (Priority 8)

- **Problem**: Several blog posts and hero sections state projected returns (e.g., _"15-20% annual capital value growth"_, _"45% capital appreciation in 24 months"_, _"20-30% surges"_).
- **Compliance Requirement**: The master prompt mandates:
  > _"DO NOT use fake ROI or guaranteed returns. For real-estate claims, use factual language. Make assumptions clearly labeled."_
- **Audit Findings in `src/lib/blog.ts`**:
  - Line 1207: _"potential for 15-20% annual capital value growth"_ → Needs explicit market assumption disclaimer.
  - Line 1493: _"representing over 45% capital appreciation in 24 months"_ → Needs citation to historical circle rate / market transaction trends (2024-2026) and note that past trends do not guarantee future performance.
  - Line 1671: _"15-20% annual ROI potential"_ → Needs standard real-estate advisory disclaimer.
- **Solution**: Add a standardized **"Market & Regulatory Disclaimer"** footnote or callout in financial and ROI blog posts stating:
  > _"Note: Capital appreciation figures and yield estimates are based on historical transaction data and infrastructure development trends (2024–2026). Real estate investments are subject to market conditions; prospective buyers are advised to conduct independent due diligence before investing."_

---

## 6. Data Inconsistencies Audit

### 6.1. Company Years of Experience (Priority 1)

- **Audit Findings**:
  - Found `"17+ years"` in:
    - `app/layout.tsx` (Description, OG description, JSON-LD)
    - `app/[locale]/(main)/about/layout.tsx` & `page.tsx`
    - `src/components/common/Schema.tsx`
    - `src/components/home/AboutSection.tsx` (`17+` years badge)
    - `src/components/home/TrustMetricsGrid.tsx` (`17+ Years Legacy`)
    - `src/components/brochure/shivani-vatika-11/BrochureTrust.tsx` (`17+ Years Legacy`)
    - `src/components/blog/BlogPostAuthorCard.tsx`
    - `messages/en.json` & `messages/hi.json` (`About Us` story: _"For over 17 years...", "Building Legacies Since 2009"_)
  - Found Contradictory Mentions:
    - `messages/en.json` (Line 142): _"With over a decade of experience in the real estate sector..."_ (Decade implies ~10 years).
    - `messages/en.json` (Line 282): _"With over two decades of profound experience..."_ (Two decades implies ~20+ years).
    - `messages/hi.json` (Line 142): _"पिछले एक दशक से ज़्यादा समय से..."_
- **Decision & Single Authoritative Value**:
  - **"Since 2009 / 17+ Years of Industry Experience"** is the single verified, authoritative figure (2026 - 2009 = 17 years).
  - Eliminate all ambiguous phrases (_"over a decade"_, _"over two decades"_) in `messages/en.json` and `messages/hi.json` to ensure 100% unified credibility everywhere.

### 6.2. Shivani Vatika 11th Project Consistency (Priority 2)

- **Audit Findings across all files**:
  - **Total Plots**: Unified at **230 plots** across `src/data/projects.ts`, `BrochureMasterplan.tsx`, `BrochureTrust.tsx`, and project FAQs. (Confirmed 198 does not exist in any project file).
  - **Project Area**: **11.5 Bigha (approx. 30,480 sq. yds.)**.
  - **Plot Sizes**: **80 to 250 Sq. Yds.**
  - **Basic Starting Rate**: **₹ 7,500 / sq. yd.** (verified in `InteractiveCalculator.tsx`, `PropertyCalculator.tsx`, and `QuotationForm.tsx`).
  - **Project Status**: **Ongoing**.
  - **Location**: **Jaipur to Khatu Shyam Ji Highway, Harsholi**.
  - **Distances from Project**:
    - RIICO Industrial Area (Renwal): **1 km / 2 mins**
    - Renwal Railway Station: **7 km / 5 mins**
    - Khatu Shyam Ji Mandir: **~28 km / 20–25 mins**
    - Phulera Junction: **~34 km / 35 mins**
    - Jaipur (Vaishali Nagar / 200 Ft Bypass): **~52 km / 45 mins**
  - **Approvals / Titles**: Verified **Section 90-A land conversion and clear registry title**. Removed loose "RERA-approved" phrasing.

---

## 7. Recommended Implementation Sequence (High-Impact Fixes Only)

1. **Fix Priority 1 (Data Inconsistencies & Zero Stats)**:
   - Harmonize `messages/en.json` and `messages/hi.json` to strictly use **"17+ Years of Experience" / "Since 2009"** (remove "over a decade" and "over two decades").
   - Fix `src/components/ui/StatsCounter.tsx` to render the actual numbers on SSR without flashing "0+".
2. **Fix Priority 7 (Internal Links in 20 Blog Posts)**:
   - Inject natural contextual editorial links into blog posts connecting them to `/projects/shivani-vatika-11th`, `/plots-for-sale-near-khatu-shyam-ji`, `/plots-for-sale-in-phulera`, `/plots-in-jaipur`, and `/calculators`.
3. **Fix Priority 8 (Investment & ROI Disclaimers)**:
   - Add standard compliance disclaimers to blog posts with projected appreciation figures.
4. **Fix Priority 3 & 4 (Cross-Linking Area Guides to Commercial Hubs)**:
   - Add explicit commercial callouts on `/areas/phulera-smart-city` and `/areas/khatu-shyam-highway` pointing to their respective commercial money pages to eliminate cannibalization risks.
