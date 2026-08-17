# SEO Audit: sviinfrasolutions.com

**Date:** 2026-08-16 · **Method:** Firecrawl map + scrape (12 pages, rawHtml), live HEAD/GET status checks, sitemap/robots fetch, codebase review (`src/lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, route `generateMetadata`), Firecrawl SERP sampling.

## Executive Summary

The site has good bones — clean URLs, rich JSON-LD, full alt coverage, working http→https/www redirect chain, `llms.txt`, a real blog. But four structural defects currently suppress it in search:

1. **Money pages canonicalize to the wrong URL.** `/calculators`, `/exclusive-offers`, all `/areas/*` pages canonicalize to the homepage `/`; project detail pages (`/projects/shivani-vatika-11th`) canonicalize to `/projects`. Google reads this as "these are duplicates — index the target instead." The exact pages that should rank are telling Google not to rank them. _(Technical, verified live.)_
2. **hreflang is systematically broken.** `createMetadata` points `en-IN`/`x-default` at `/en/*` URLs that 307-redirect (next-intl `localePrefix: 'never'`); canonical and hreflang contradict each other; sitemap uses codes `en`/`hi` while pages emit `en-IN`/`hi-IN`; homepage and `/hi` omit `hi-IN` entirely. Bilingual targeting signals are effectively void. _(Technical, verified live + in code.)_
3. **The apex domain is dead over HTTPS.** `https://sviinfrasolutions.com` fails TLS (`SEC_E_WRONG_PRINCIPAL` — cert doesn't cover apex); `http://apex` 308s into that failure. Every apex-typed visit and apex backlink is lost. _(Technical, verified.)_
4. **The best keyword-targeted pages are undiscoverable.** The 3 `/areas/*` landing pages (Tonk Road, Nayla, Phulera Smart City) have **zero internal links** from nav, footer, or any other page, and are **absent from the sitemap** — along with all `/projects/[slug]` pages and `/exclusive-offers`. _(Technical, verified via grep + sitemap.)_

SERP reality: portals (MagicBricks, 99acres, RealEstateIndia) own transactional head terms. Even for the brand's own project query ("shivani vatika jaipur"), the site's Facebook/Instagram posts outrank sviinfrasolutions.com. The winnable ground is niche locality (Phulera Smart City, DMIC corridor, Khatu Shyam corridor) + Hindi-language content + owning brand/project SERPs — all of which requires fixes 1–4 first.

## Site Structure

- **71 URLs** discovered via Firecrawl map; **68 URLs** in `sitemap.xml` (32 static + 36 blog, EN/HI pairs).
- URL quality: clean, lowercase, hyphenated, `trailingSlash: false`. Good.
- Locale model: root path = English, `/hi/*` = Hindi; `/en/*` 307-redirects to root (correct behavior, but head tags still point at `/en/*` — see On-Page).
- **Sitemap gaps (indexable 200 pages missing):** `/areas/tonk-road-jaipur`, `/areas/nayla-jaipur`, `/areas/phulera-smart-city` (×2 locales), `/projects/shivani-vatika-11th`, `/projects/shyam-aangan`, `/projects/shivani-vatika` (×2), `/exclusive-offers`, `/brochure/shivani-vatika-11`.
- **lastmod:** all 32 static entries share one build-time stamp (`2026-08-16T06:15:30.234Z`, `app/sitemap.ts:6` `new Date()`); blog posts correctly use post dates.
- **Orphan pages:** `/areas/*` is referenced nowhere except its own file (`AREAS_DATA` consumed only in `app/[locale]/(main)/areas/[slug]/page.tsx`). Not in nav, footer, project pages, or sitemap → likely never crawled.
- **Slug mismatch:** project slug is `shivani-vatika-11th` but brochure route is `brochure/shivani-vatika-11`; `/brochure/shivani-vatika-11th` → 404.
- **robots.txt defect:** the `Googlebot`-specific group (`app/robots.ts:20-23`) contains only `allow: '/'`. Robots rules are group-exclusive: the most specific matching group wins, so for Googlebot the `*` disallows (`/admin/`, `/api/`, `/login`, `/payment`, `/thank-you`) do **not** apply.
- Redirect hygiene: `http://www` → 308 → `https://www` ✓; unknown URLs → 404 ✓; `/hi/brochure/...` → 307 → EN path ✓.
- Positives: `vercel.json` sets `noindex,nofollow` on `/api/admin/*`; immutable cache headers for `/_next/static` and `/images`; `llms.txt` present.

## On-Page SEO

| Page                              | Title (len)                                                                                         | Issues                                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/`                               | "SVI Infra Solutions - Premium Real Estate Developer \| Jaipur & Noida \| SVI Infra Solutions" (94) | Brand duplicated by `%s \| SVI Infra Solutions` template; hreflang lists only `en-IN`+`x-default` (no `hi-IN`)                |
| `/hi`                             | Hindi, 87 chars                                                                                     | Same double-brand; **meta description is English** (identical to EN); `og:locale=en_IN` on a `lang=hi` page; no self-hreflang |
| `/projects/current`               | "Current Projects - SVI Infra Solutions \| SVI Infra Solutions" (60)                                | Double brand; JSON-LD uses `@graph` wrapper with no top-level `@type` (RealEstateListing inside)                              |
| `/projects/completed`             | Double brand (62)                                                                                   | Same as above                                                                                                                 |
| `/projects/shivani-vatika-11th`   | Double brand                                                                                        | **Canonical → `/projects`** (not self); hreflang → redirecting `/en/projects`; **3 duplicate BreadcrumbList blocks**          |
| `/areas/tonk-road-jaipur`         | Double brand                                                                                        | **Canonical → `/`**; orphan page                                                                                              |
| `/calculators`, `/hi/calculators` | OK                                                                                                  | **Canonical → `/`**                                                                                                           |
| `/exclusive-offers`               | OK (38)                                                                                             | **Canonical → `/`**; meta desc only 47 chars                                                                                  |
| `/contact`                        | "Contact SVI Infra Solutions \| Get in Touch \| SVI Infra Solutions" (64)                           | Double brand                                                                                                                  |
| `/registration`                   | Double brand (79)                                                                                   | Too long                                                                                                                      |
| `/blog`                           | OK                                                                                                  | Canonical → `/en/blog` (307-redirecting URL); sitemap lists `/blog`                                                           |
| Blog post (DMIC)                  | Post title + "\| Our Latest Updates \| SVI Infra Solutions" (~128)                                  | Canonical → `/en/blog/...` (redirecting); Article schema ✓ (author "SVI Market Research", datePublished ✓); ~730 words        |

Root causes in code:

- `src/lib/seo.ts:38-62` `createMetadata`: canonical = `absoluteUrl(path)` with default `path='/'` → any page that omits `path` canonicalizes to homepage; hreflang languages hardcode `/en${path}` which 307-redirects; title template `%s | SVI Infra Solutions` double-brands titles that already contain the brand.
- `src/lib/seo.ts:13-27` `getAlternateLinks` (blog/changelog): canonical = `/${locale}${path}` = `/en/...` redirecting URL.
- `app/[locale]/(main)/projects/layout.tsx` + page + `Breadcrumbs` component each emit a BreadcrumbList → 2–3 per page site-wide.

Content depth (word counts from scraped text): homepage 1,318 (EN) / 1,489 (HI); all other pages 390–610; blog posts ~730. Thin vs. portal category pages (thousands of words + inventory). Headings: single H1 per page ✓; homepage H1 "Where Dreams Take Address" is brand-y, not keyword-bearing (acceptable for a homepage, but area/project pages carry the keyword load).

Images: **0 missing alt** across all scraped pages ✓; but gallery alts are generic ("Gallery image 1", "Thumbnail 2"). Custom loader (`src/lib/image-loader.ts`) rewrites PNG→pre-generated WebP (3.9MB PNGs ship as ~344–538KB WebP) ✓; however widths >1024 and all `hero*` images serve full-size files (`?w=` is a no-op on static hosting), and no 1920w variants exist.

Performance signals (not a Lighthouse run): homepage HTML 253KB, 28 external scripts, 3 CSS files, TTFB ~770ms from test machine, hero preloaded. Heavy JS payload is the main CWV risk on mobile — verify with Lighthouse/CrUX before claiming pass.

## Keyword Opportunities

_Technical gap fixes first (above); the following are content-strategy recommendations [inference from SERP sampling + site content]:_

1. **Phulera Smart City / DMIC corridor** — the site's strongest differentiator; `/areas/phulera-smart-city` exists, is well-titled, and is completely undiscoverable. SERP for "phulera smart city plots" is beatable: 99acres category page, estatebull.com single project page, AM Realty project page, plus FB/IG posts. No authoritative developer hub page exists.
2. **Khatu Shyam corridor** — Shivani Vatika 11th is "Near Khatu Shyam Ji" (high-volume devotional + investment traffic); no page targets "plots near Khatu Shyam Ji" despite the project sitting there.
3. **Own the brand/project SERP** — "shivani vatika" currently returns RealEstateIndia's listing and SVI's own social posts ahead of the official site. Fixing canonical + sitemap + internal links for `/projects/shivani-vatika-11th` is the cheapest ranking win available.
4. **Missing intent pages:** "JDA approved plots Jaipur", "DMIC plots Rajasthan investment", "plots under ₹20 lakh Jaipur", Noida-side content (HQ is Sector 65 Noida but zero Noida property content), Hindi-script queries (जयपुर में प्लॉट) as first-class `/hi` content, not translations.
5. **Blog cadence:** 18–20 posts all published June 27–July 4, 2026 — burst, not cadence. Sustained 1–2/week with area-specific topics (registry process, conversion rules, corridor price trends) compounds; burst publishing decays.

## Competitor/SERP Comparison

| Query                      | Ranking                                                                                   | SVI position    | Why they win                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| "plots in jaipur"          | MagicBricks (5,975 listings), 99acres                                                     | Absent          | Inventory depth + domain authority; not winnable head-on                                                |
| "phulera smart city plots" | 99acres, estatebull.com/project page, amrealtysolutions.com, RealEstateIndia, FB/IG posts | Absent          | Competitors ship one dedicated project page each; SVI's equivalent page is orphaned + mis-canonicalized |
| "shivani vatika jaipur"    | RealEstateIndia project page, SVI's own FB/IG posts                                       | Absent from top | Official project page canonicalizes to `/projects` and isn't in sitemap                                 |

Pattern: portal wins = inventory + authority; small-developer wins (estatebull, AM Realty) = dedicated, self-canonical, internally-linked project/area pages with schema — exactly what SVI has built but mis-wired.

## Prioritized Recommendations

### High impact (fix week 1)

1. **Self-canonicals everywhere.** In `src/lib/seo.ts`, make `createMetadata` require/derive the real path; pass `path` in `areas/[slug]/page.tsx` (`/areas/${slug}`), `projects/[slug]` pages (`/projects/${slug}`), calculators, exclusive-offers. Change `getAlternateLinks` canonical to root path (no `/en` prefix). Verify: `curl` each page, canonical = own URL.
2. **Rebuild hreflang.** Languages must point at serving URLs: `en-IN`/`x-default` → root path, `hi-IN` → `/hi${path}`. Emit on homepage + `/hi` too (currently missing `hi-IN`). Align `app/sitemap.ts` codes to `en-IN`/`hi-IN` (or both to `en`/`hi` — but they must match). Verify with hreflang checker after deploy.
3. **Fix apex TLS.** In Vercel project domains, add `sviinfrasolutions.com` so a cert is issued for it (apex currently resolves to 216.198.79.1 with a www-only cert). Alternative: DNS-level apex→www redirect. Verify: `curl -I https://sviinfrasolutions.com` → 200/308.
4. **Complete the sitemap.** Add `/areas/*`, `/projects/[slug]`, `/exclusive-offers`, `/brochure/shivani-vatika-11` (both locales); replace build-time `new Date()` with real content dates. Resubmit in Search Console.
5. **De-orphan area pages.** Link each `/areas/*` page from the relevant project page, homepage locations section, and footer. (Zero links today — verified by grep.)
6. **Remove `aggregateRating` from Organization schema** (`app/layout.tsx:194-198`). Self-serving org ratings violate Google's structured-data policy and risk a manual spam action; 5,000 unverifiable reviews on a developer site is also a trust liability.
7. **Fix titles.** Strip brand suffixes from page-level titles (template already appends it). Target ≤60 chars: "Current Projects in Jaipur & Noida", "Plots in Phulera Smart City | DMIC Corridor". Blog: drop the "| Our Latest Updates" middle suffix.

### Medium impact (weeks 2–3)

8. **robots.txt:** delete the Googlebot-only group (`app/robots.ts:20-23`) so the `*` disallows apply to Googlebot too.
9. **Hindi metadata:** translate `/hi` meta description to Hindi; set `og:locale: hi_IN` on `/hi` pages.
10. **Deduplicate BreadcrumbList:** emit once per page (keep `Breadcrumbs` component instance or layout schema, not both; currently 2–3 per page).
11. **`/projects/current|completed` schema:** give the `@graph` wrapper an explicit `@type` (e.g., `ItemList` of `RealEstateListing`) or emit flat nodes; validate in Rich Results Test.
12. **Brochure redirect:** `/brochure/shivani-vatika-11th` → `/brochure/shivani-vatika-11` (slug parity with project).
13. **Image alts:** replace "Gallery image N" with descriptive alts ("Shivani Vatika 11th township layout plan"); generate 1920w WebP variants or cap gallery render width at 1024.
14. **Search Console + Bing Webmaster** verification and sitemap submission if not already done (no evidence either way — confirm).

### Low impact / ongoing (content & authority)

15. **Expand area pages to 1,000+ words:** location economics, price/sq.yd. trends, connectivity (Phulera Junction, Sambhar Lake, DMIC node), approval status (JDA/RERA), FAQ with FAQPage schema.
16. **New intent pages** per Keyword Opportunities §2–4; one page per corridor/project, self-canonical, in sitemap, internally linked.
17. **Blog cadence:** 1–2 posts/week sustained; interlink posts ↔ area ↔ project pages.
18. **Local citations:** Google Business Profiles for Jaipur and Noida entities, RERA number on every project page (also a trust/legal requirement), NAP consistency with Organization schema.
19. **CWV:** run Lighthouse mobile on `/` and a project page; the 28-script payload is the likely LCP/INP bottleneck — defer non-critical widgets (maps, QR, analytics) pending that data.

## Sources

- Scraped (Firecrawl, rawHtml+links+images, cached in `.firecrawl/`): `/`, `/hi`, `/about`, `/projects/current`, `/projects/completed`, `/blog`, `/contact`, `/faq`, `/registration`, `/exclusive-offers`, `/calculators` (retry), `/projects/shivani-vatika-11th`, `/areas/tonk-road-jaipur`, `/areas/phulera-smart-city`, `/areas/nayla-jaipur`, `/blog/dmic-corridor-real-estate-investment`, `/hi/*` variants.
- Live checks: HTTP status + redirect chains for `/en/about`, `/hi/brochure/...`, apex/apex-http, 404 control; `sitemap.xml` (68 URLs, hreflang codes, lastmod distribution); `robots.txt`; `llms.txt`; DNS (apex A 216.198.79.1, www CNAME → Vercel); TLS error on apex.
- Code: `src/lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx:116-247`, `app/[locale]/(main)/projects/layout.tsx`, `app/[locale]/(main)/areas/[slug]/page.tsx`, `src/lib/image-loader.ts`, `src/components/common/Schema.tsx`, `src/data/projects.ts`, `src/data/areas.ts`, `src/lib/blog.ts`, `next.config.mjs`, `vercel.json`, nav/footer link inventory.
- SERPs (Firecrawl search): "plots in jaipur", "phulera smart city plots", "shivani vatika jaipur".
- Not verified (flagged where used): Lighthouse/CrUX scores, Search Console indexation status, GMB presence.

## Rerun Inputs

```
workflow: firecrawl-seo-audit
site: https://www.sviinfrasolutions.com
keywords: plots in jaipur, plots in phulera smart city, dmic corridor plots, shivani vatika jaipur, jda approved plots jaipur, plots near khatu shyam ji, नोएडा प्लॉट, जयपुर प्लॉट
output: markdown
```
