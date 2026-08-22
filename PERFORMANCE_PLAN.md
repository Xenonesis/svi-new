# SVI Infra Solutions — Performance Optimization Strategic Plan

> **Project:** SVI Infra Solutions (Next.js 16, App Router, TypeScript, Tailwind CSS v4)
> **Date:** 2026-07-10
> **Version:** 3.1 (final — incorporating architect review feedback)

> **Implementation Status (Updated 2026-07-10):**  
> ✅ Phase 2: Local Environment Optimization (Images & Video Encoded)  
> ✅ Phase 3: Production Performance Enhancement (ISR & Static Rendering)  
> ✅ Phase 5: Three.js / R3F Optimization (AdaptiveDpr, Reduced Motion guards)  
> ✅ Phase 6: Cross-Environment Standardization (CI Gates & Depcheck)

---

## Current Project Profile

| Attribute     | Detail                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router), Turbopack                                      |
| Pages         | 53+ (`[locale]` public, admin, employee, share)                         |
| i18n          | English + Hindi (next-intl)                                             |
| Static assets | 20+ PNG images, 1 MP4 video                                             |
| Fonts         | Outfit, Playfair Display, Noto Sans Devanagari (via `next/font/google`) |
| Monitoring    | Sentry, Vercel Analytics, Vercel Speed Insights                         |
| PWA           | Serwist (precaching + background sync)                                  |
| Extras        | Three.js / R3F (HeroCanvas), Capacitor Android app                      |
| Database      | Supabase (Postgres)                                                     |
| State / data  | TanStack Query                                                          |

---

## 🚨 Vercel Free (Hobby) Plan Adjustments

Since this project will be deployed on Vercel's Free (Hobby) tier, several strict limits apply. The performance plan must be adjusted to prevent hitting these quotas:

| Vercel Hobby Limit                        | Impact on SVI Infra                                                                                                             | Required Adjustment                                                                                                                                                                                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bandwidth (100 GB/mo)**                 | Serving the ~31 MB hero video variants directly from the `/public` folder will exhaust this limit after just ~3,200 page views. | **Migrate Videos:** Upload `hero.*.mp4/webm` to Supabase Storage or YouTube/Vimeo. Do NOT serve large videos directly from Vercel's network.                                                                                                                                                             |
| **Image Optimization (1,000 images/mo)**  | Using Vercel's built-in `next/image` optimizer will quickly exhaust this limit.                                                 | **Use Custom Loader:** We have already built `src/lib/image-loader.ts` for Supabase images. Ensure all local static images are pre-optimized (using our `optimize:images` script) and bypass Vercel's optimization API where possible by setting `unoptimized: true` for local assets if traffic scales. |
| **Serverless Function Timeout (10s max)** | Any API route, Server Action, or ISR revalidation (`revalidate: 3600`) that takes longer than 10 seconds will crash.            | **Optimize DB Queries:** Ensure Supabase queries are heavily indexed (Phase 4). Avoid long-running backend tasks; use Supabase Edge Functions or background workers if a task takes > 10s.                                                                                                               |
| **Analytics (100k events/mo)**            | Vercel Analytics will stop tracking after 100k pageviews/events.                                                                | **Alternative Analytics:** Keep Vercel Analytics for now, but be prepared to swap to a free self-hosted solution (like PostHog via Supabase) or Google Analytics if traffic spikes.                                                                                                                      |

---

## Phase 1: Baseline & Measurement (Week 1)

### 1.1 Lighthouse Baselines

Run Lighthouse on **6 key pages** in both EN and HI locales:

| Page                                 | Why                               |
| ------------------------------------ | --------------------------------- |
| Home (`/`)                           | Marketing front — highest traffic |
| About (`/about`)                     | Static content, heavy images      |
| Projects (`/projects/current`)       | Image gallery                     |
| Blog (`/blog`)                       | Content list                      |
| Registration (`/registration`)       | Form page                         |
| Admin Dashboard (`/admin/dashboard`) | Data-heavy                        |

**Deliverable:** Baseline score report (Performance, Accessibility, SEO, Best Practices)

### 1.2 Core Web Vitals Profiling

Using Chrome DevTools + `web-vitals` library:

| Metric | Baseline | Target             |
| ------ | -------- | ------------------ |
| LCP    | Measure  | < 2.0s             |
| CLS    | Measure  | < 0.05             |
| INP    | Measure  | < 150ms            |
| TTFB   | Measure  | < 150ms            |
| FCP    | Measure  | -50% from baseline |

### 1.3 Bundle Analysis

Run `pnpm analyze` (uses `@next/bundle-analyzer` — already configured):

| Target                  | Budget   |
| ----------------------- | -------- |
| Initial JS (all routes) | < 250 KB |
| Initial CSS             | < 40 KB  |
| Largest route JS        | < 300 KB |
| Hero image (LCP)        | < 150 KB |

### 1.4 Image & Asset Audit

Inventory all assets in `public/images/` + `public/`:

- 20+ PNG images — log dimensions, file sizes
- 1 MP4 video — log codec, bitrate, duration
- Testimonial images (PNG)
- Logo / favicons

### 1.5 Build Time Baseline

```bash
pnpm build
# Record total build time + page count
```

---

## Phase 2: Local Environment Optimization (Week 1–2) ✅ [COMPLETED]

### 2.1 Image Optimization Pipeline

The project ships **raw PNGs** in `public/images/`. Create an automated pipeline:

```
PNG (source)
  ↓
WebP (lossy, quality 80)
  ↓
AVIF (quality 60)
  ↓
Responsive sizes (320, 640, 1024, 1920)
  ↓
Blur placeholder data URIs (via plaiceholder or LQIP)
  ↓
priority="true" ONLY on LCP image
```

**Implementation:**

1. Create `scripts/optimize-images.mjs` using `sharp`:

```js
// Converts: public/images/**/*.png → .webp → .avif
// Generates multiple sizes
// Outputs blurDataURL for next/image placeholder
```

2. Add prebuild hook:

```json
// package.json
"prebuild": "pnpm optimize:images"
```

3. Add lint-staged rule (already using husky + lint-staged):

```yaml
'*.{png,jpg,jpeg}': ['pnpm optimize:images']
```

### 2.2 Hero Video Optimization

Current: `public/a svi 1.mp4`

**Upgrade strategy:**

| Action                                          | Benefit                                         |
| ----------------------------------------------- | ----------------------------------------------- |
| Encode AV1 + VP9 (with H.264 fallback)          | 60–80% bandwidth reduction                      |
| Multiple bitrate variants (360p, 720p, 1080p)   | Serve appropriate quality per device/connection |
| Adaptive streaming (HLS) if video library grows | Seamless quality switching on variable networks |
| `<video preload="metadata">`                    | Avoid downloading entire video on page load     |
| Lazy autoplay (only when near viewport)         | Reduced initial payload                         |
| Poster image (WebP, < 100 KB)                   | Shows immediately before video loads            |
| `playsinline` + `muted`                         | Required for autoplay on mobile                 |

**Multi-bitrate encoding targets:**

- 360p (H.264 @ 400kbps) — slow connections
- 720p (H.264 @ 1500kbps, VP9 @ 800kbps) — default
- 1080p (H.264 @ 3000kbps, AV1 @ 1000kbps) — high-end
- Poster (WebP, 1920×1080, quality 60)

**Implementation:**

```tsx
// For a single small hero video (< 30s), use direct <video> with multiple sources:
<video
  preload="metadata"
  poster="/images/hero-poster.webp"
  muted
  playsinline
  autoPlay={false}
  ref={videoRef}
  // IntersectionObserver to play when visible
>
  {/* AV1 — best compression, ~60% savings over H.264 */}
  <source src="/hero.av1.mp4" type="video/mp4; codecs=av01.0.05M.08" />
  {/* VP9 — good compression, broader support */}
  <source src="/hero.vp9.webm" type="video/webm; codecs=vp9" />
  {/* H.264 — universal fallback */}
  <source src="/hero.h264.mp4" type="video/mp4" />
</video>
```

> **When to use HLS:** Multiple `<source>` elements (AV1/VP9/H.264) are sufficient for a single hero video under 60 seconds. Only introduce HLS.js or DASH when you have a **video library** (multiple videos, long-form content, or adaptive bitrate requirements). Avoid adding HLS complexity for a single short hero clip.

### 2.3 Turbopack / Dev Server Tuning

**Already in place:**

- `reactStrictMode: true` ✅
- `optimizePackageImports` for `lucide-react`, `recharts`, `date-fns`, `motion`, `@tiptap/*` ✅
- Turbopack root path configured ✅
- `watchOptions.ignored` excludes `node_modules/`, `.next/`, `.git/` ✅

**Add:**

```mjs
// next.config.mjs
experimental: {
  // ...existing
  scrollRestoration: true,
  optimisticClientCache: true,  // Verify support in current Next.js release before enabling
},
onDemandEntries: {
  maxInactiveAge: 60 * 60 * 1000,  // keep compiled pages in memory (dev only, no production impact)
  pagesBufferLength: 5,
},
```

> **Note:** Do NOT add manual `webpack.cache.filesystem` — Webpack/Turbopack already handles filesystem caching natively in recent versions.

### 2.4 Local Performance Monitoring

Add dev-only instrumentation:

```ts
// instrumentation.ts (already exists — extend with perf logging)
// Log rebuild times, bundle sizes on each dev change
```

**Add npm scripts:**

```json
"perf:dev": "node scripts/perf-monitor.mjs",
"perf:bundle": "ANALYZE=true next build"
```

---

## Phase 3: Production Performance Enhancement (Week 2–4) ✅ [COMPLETED]

### 3.1 Rendering Strategy

Apply correct rendering strategy per page type — **not** `force-dynamic` for marketing pages.

| Page                  | Strategy                  | Rationale                                               |
| --------------------- | ------------------------- | ------------------------------------------------------- |
| Home (`/`)            | `revalidate: 300`         | Marketing content, fresh enough with 5-min revalidation |
| About, FAQ, Terms     | `force-static`            | Rarely changes                                          |
| Blog list             | ISR (`revalidate: 3600`)  | Posts added periodically                                |
| Blog `[slug]`         | ISR (`revalidate: 3600`)  | Individual posts                                        |
| Projects list         | ISR (`revalidate: 86400`) | New projects infrequent                                 |
| Project `[slug]`      | ISR (`revalidate: 86400`) | Individual project details                              |
| Admin pages           | `force-dynamic`           | Always needs fresh data                                 |
| Registration, Contact | `dynamic`                 | POST forms + validation                                 |

```tsx
// Marketing page example
export const revalidate = 300; // 5 minutes

// Static page example
export const dynamic = 'force-static';
```

### 3.2 Data Fetching with Next.js Cache Primitives

Use React 19 / Next.js 16 caching APIs where applicable. **Prefer the newer cache component APIs** over `unstable_cache` for new code.

> **⚠️ Note on API stability:** `cacheLife()` and `cacheTag()` are evolving APIs. Use them where supported by your Next.js version, but keep `unstable_cache` as a fallback for production-critical paths until the newer APIs are fully stable in your target release. Check the Next.js 16 changelog before each upgrade to catch any API changes.

```tsx
// ✅ Preferred: cacheTag() + cacheLife()
import { cacheTag } from 'next/cache';
import { cacheLife } from 'next/cache';

export default async function ProjectsPage() {
  'use cache';
  cacheTag('projects');
  cacheLife({ maxAge: 3600, staleWhileRevalidate: 86400 });
  const data = await fetchProjects();
  // ...
}
```

```tsx
// ✅ Preferred: 'use cache' directive at component level
// app/projects/page.tsx
export default async function ProjectsPage() {
  'use cache';
  cacheTag('projects');
  // This component output is cached with the 'projects' tag
  // Revalidated via: revalidateTag('projects') in your admin Server Actions
}
```

```tsx
// ⚠️ Legacy approach (still works, prefer above for new code):
import { unstable_cache } from 'next/cache';

const getProjects = unstable_cache(
  async () => {
    /* fetch from Supabase */
  },
  ['projects'],
  { revalidate: 3600, tags: ['projects'] }
);
```

### 3.3 Font Optimization

**Current setup (keep as-is):**

- Using `next/font/google` — Next.js already downloads fonts at **build time**, serves them **locally**, subsets them automatically, and preloads correctly ✅
- `display: 'swap'` on all fonts ✅
- `preload: false` on `Noto_Sans_Devanagari` (conditionally used) ✅

> **Why NOT to self-host:** `next/font/google` already eliminates Google Fonts DNS lookups at runtime. There's no measurable performance gain from manual self-hosting.

**Verify:**

- [ ] No render-blocking font requests in DevTools Network tab
- [ ] Font files are served from `/_next/static/media/` (local)

### 3.4 Caching Strategy

> **Important:** Do NOT add custom `Cache-Control` headers for HTML pages. Next.js + Vercel manage HTML caching automatically via `revalidate` and ISR. Manual cache headers can conflict with Vercel's edge caching layer.

**Set caching via Next.js primitives only:**

```tsx
// Page-level ISR
export const revalidate = 3600;

// Per-fetch caching
fetch(url, { next: { revalidate: 3600 } });

// Server Actions with cache tags
('use server');
import { revalidateTag } from 'next/cache';
revalidateTag('projects');
```

**Static asset caching (already configured in `next.config.mjs`):**

| Pattern              | Cache Header                     | Status         |
| -------------------- | -------------------------------- | -------------- |
| `/_next/static/(.*)` | `max-age=31536000, immutable`    | ✅ Already set |
| `/images/(.*)`       | `max-age=86400, must-revalidate` | ✅ Already set |

### 3.5 Image Delivery

`next.config.mjs` already has:

```mjs
images: {
  formats: ['image/webp', 'image/avif'],     // ✅
  deviceSizes: [320, 420, 768, 1024, 1200, 1920], // ✅
  qualities: [75, 85, 90, 95, 100],          // ✅
  minimumCacheTTL: 60 * 60 * 24 * 30,        // ✅
}
```

**Audit checklist for every `<Image>` usage (20 files):**

- [ ] Explicit `width` + `height` set (prevents CLS)
- [ ] `priority` only on the LCP image per page
- [ ] `placeholder="blur"` with `blurDataURL` for below-fold images
- [ ] `fetchPriority="high"` only on LCP image

**Remote images (Supabase Storage, CDN):**

If images are served from Supabase Storage or another CDN, configure a remote loader:

```mjs
// next.config.mjs
images: {
  remotePatterns: [
    // Existing...
    {
      protocol: 'https',
      hostname: '**.supabase.co',          // Supabase storage
      pathname: '/storage/v1/object/**',
    },
  ],
  // Or use a custom loader for transformations:
  loader: 'custom',
  loaderFile: './src/lib/image-loader.ts',
}
```

```tsx
// src/lib/image-loader.ts — for on-the-fly transformations
export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Transform Supabase image URL with width and quality params
  return `https://supabase.co/storage/v1/object/public/${src}?width=${width}&quality=${quality || 75}`;
}
```

**Remote image checklist:**

- [ ] Set `Cache-Control: public, max-age=86400` on Supabase storage bucket
- [ ] Use signed URLs only for private/protected images (portal, allotment letters)
- [ ] Serve responsive variants via the loader (`width` param)
- [ ] Avoid loading the full original image and resizing in the browser

### 3.6 Third-Party Script Optimization

| Script             | Strategy                                              |
| ------------------ | ----------------------------------------------------- |
| Google Tag Manager | `next/script strategy="lazyOnload"`                   |
| hCaptcha           | Dynamic import — only on Register/Contact/Login pages |
| Sentry             | Already tunneled via `/monitoring` ✅                 |
| Vercel Analytics   | Non-blocking, fine as-is ✅                           |

### 3.7 Bundle Size Reduction

**Already optimized:**

- `optimizePackageImports` configured for 6 packages ✅
- `HeroCanvas` dynamically imported with `ssr: false` ✅
- Tree-shaken icon imports (`lucide-react`) ✅

**Additional:**

- Run `depcheck` to identify unused dependencies
- Audit `@tiptap/*` imports — only import used extensions
- Consider route-level code splitting for admin vs public bundles

### 3.8 Server Actions over API Routes

Where possible, replace thin API routes with Server Actions:

```tsx
// Instead of: POST /api/contact
// Use:
'use server';
export async function submitContact(formData: FormData) {
  // validate, insert to Supabase, send email
}
```

**Benefits:** No network hop, no serialization overhead, progressive enhancement.

### 3.9 Partial Prerendering (PPR)

Pages with a mix of static marketing content and dynamic data are ideal PPR candidates:

| Page             | Static Shell                   | Dynamic Content                    |
| ---------------- | ------------------------------ | ---------------------------------- |
| Home (`/`)       | Hero, FAQ, About preview, CTAs | Projects, testimonials (live data) |
| Blog list        | Layout, sidebar                | Post list (new entries)            |
| Project `[slug]` | Description, gallery shell     | Availability status, pricing       |

```tsx
// next.config.mjs (when PPR is enabled for the project — verify syntax against current stable Next.js release)
experimental: {
  ppr: 'incremental', // or true once stable; check release notes as config may change between canary releases
}

// Per-page opt-in:
export const experimental_ppr = true;
```

PPR delivers a near-instant static shell while streaming dynamic content — effectively combining the best of SSG and SSR.

### 3.10 Edge Runtime for Lightweight APIs

Move suitable API routes to Edge:

```ts
// app/api/contact/route.ts
export const runtime = 'nodejs';

export async function POST(req: Request) { ... }
```

**Candidates:** Contact form, search, chatbot endpoints, lightweight lookups.

> **⚠️ Use selectively:** Only use Edge Runtime when all dependencies are Edge-compatible (no Node.js `fs`, `child_process`, native modules) and the latency benefit outweighs the limitations. Contact API ✅, Search ✅, Chat proxy ✅. Avoid for APIs that depend on Supabase REST SDK directly or other Node-specific libraries.
>
> **Test before migrating:** Every Edge candidate endpoint should be tested in a staging environment first. Some npm packages and SDKs have Edge-specific limitations that only surface at runtime. Run a load test comparing the Node.js vs Edge version to verify the latency improvement justifies the migration.

### 3.11 Server Components First — Component Rendering Guidelines

Maximize Server Components to reduce JavaScript sent to the browser:

| Component      | Type                    | Reason                                                 |
| -------------- | ----------------------- | ------------------------------------------------------ |
| Hero           | Server Component        | Static marketing content, no interactivity             |
| Project Cards  | Server Component        | Pure data display, no state                            |
| Blog List      | Server Component        | Data fetch + render, no client logic                   |
| Navbar         | Mostly Server Component | Links are static; only mobile menu toggle needs client |
| Footer         | Server Component        | Static links and content                               |
| FAQ Accordion  | Client Component        | Needs `useState` for expand/collapse                   |
| Contact Form   | Client Component        | Form state, validation, submission                     |
| Image Carousel | Client Component        | Interactive state transitions                          |
| Map            | Client Component        | Leaflet/Google Maps requires DOM APIs                  |
| Admin Charts   | Client Component        | Recharts requires browser APIs                         |

**Principle:** Start every component as a Server Component. Only add `'use client'` when you genuinely need interactivity (`useState`, `useEffect`, event handlers, browser APIs).

### 3.12 Accessibility Performance Audit

Performance optimizations must not degrade accessibility. Include these checks:

| Check                             | Why It Matters                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `prefers-reduced-motion`          | Disable parallax, animations, auto-carousel for vestibular disorders — also reduces GPU/CPU work |
| Lazy loading without layout shift | Ensure `next/image` has explicit `width` + `height` to reserve space                             |
| Keyboard navigation               | All interactive elements must be reachable and operable via keyboard                             |
| Image `alt` text                  | Every `<Image>` needs descriptive `alt` — also helps SEO (part of Lighthouse)                    |
| Focus management                  | Route changes should manage focus for screen reader users                                        |
| Color contrast                    | Dark/light mode both must meet WCAG AA — Lighthouse checks this                                  |
| Touch target size                 | Buttons/links ≥ 44×44px on mobile — reduces mis-taps and re-loads                                |

Add `prefers-reduced-motion` check to Three.js HeroCanvas:

```tsx
const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

useEffect(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  setPrefersReducedMotion(mq.matches);
  const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);

// When true: disable R3F animation, show static poster instead
```

### 3.13 React Compiler Readiness

React 19 introduces the React Compiler (formerly "React Forget") — an optimizing compiler that automatically memoizes components and hooks.

**What to do now to prepare:**

| Principle                        | Practice                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| Avoid impure renders             | No direct mutations of props, state, or module-level variables during render                        |
| Stable props                     | Use `useCallback` / `useMemo` for callbacks/values passed to child components                       |
| Minimize unnecessary memoization | The compiler will handle this automatically — but clean up legacy manual `memo()` that may conflict |
| Component boundaries             | Keep components focused — the compiler works best with well-factored code                           |
| Hook rules                       | Follow the Rules of Hooks strictly — conditional hooks break compiler optimization                  |

```tsx
// ✅ Good — stable callback, pure render
function ProductCard({ product }: { product: Product }) {
  const handleClick = useCallback(() => {
    analytics.track('product_click', product.id);
  }, [product.id]);

  return <button onClick={handleClick}>{product.name}</button>;
}
```

> **When to enable:** Monitor the React Compiler release timeline. Enable it in a staging environment first, validate with profiling, then roll to production. Keep the codebase clean so adoption is frictionless.

### 3.14 Streaming with Suspense

Streaming allows the server to send HTML in chunks as data becomes available — improving perceived performance especially on slower networks.

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <Hero /> {/* Static — sent immediately */}
      <Suspense fallback={<ProjectsSkeleton />}>
        <Projects /> {/* Fetches data — streamed when ready */}
      </Suspense>
      <Suspense fallback={<TestimonialSkeleton />}>
        <Testimonials />
      </Suspense>
    </div>
  );
}
```

**Where to apply streaming:**

| Component                | Fallback              | Benefit                                    |
| ------------------------ | --------------------- | ------------------------------------------ |
| Project cards (homepage) | `ProjectsSkeleton`    | Hero renders instantly, projects stream in |
| Testimonials             | `TestimonialSkeleton` | Below-fold content loads progressively     |
| Blog list                | `BlogCardsSkeleton`   | Keeps layout stable while fetching         |
| Admin dashboard widgets  | `WidgetSkeleton`      | Each widget streams independently          |

> Streaming complements PPR — PPR provides the static shell, streaming fills in dynamic content progressively.

### 3.15 Resource Priority Guidance

Avoid over-optimization by being surgical with resource hints:

| Hint                        | When to Use                                   | Example                                                       |
| --------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `<link rel="preload">`      | Only for **LCP image** and **critical fonts** | `preload` the hero image and font files used above the fold   |
| `<link rel="preconnect">`   | Only for **essential third-party origins**    | Google Fonts CDN (if not using `next/font`), Supabase, Sentry |
| `<link rel="dns-prefetch">` | Fallback for preconnect on older browsers     | Same origins as preconnect                                    |
| `fetchpriority="high"`      | Only on the **single LCP element** per page   | The primary hero image                                        |
| `async` / `defer`           | All non-critical `<script>` tags              | Analytics, GTM, chat widgets                                  |

**Checklist:**

- [ ] Exactly one `fetchpriority="high"` per page — the LCP image
- [ ] No render-blocking `<script>` tags in `<head>` without `async` or `defer`
- [ ] Preconnect only for 2–3 critical origins (not 10+)
- [ ] Font preloads use `crossorigin` attribute (fonts are CORS)
- [ ] Remove unused preloads — each one competes for bandwidth

```tsx
// ✅ Correct: preload LCP image with fetchpriority="high"
<Image
  src="/images/hero.webp"
  priority
  fetchPriority="high"
  // ...
/>

// ✅ Correct: preconnect to critical origin
// In layout.tsx <head>
<link rel="preconnect" href="https://supabase.co" />
```

### 3.16 Security-Performance Overlap

Security configurations can affect performance. Optimize both simultaneously:

| Concern      | Configuration                                                                            | Performance Impact                           |
| ------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| Compression  | **Brotli** (preferred over gzip) — typically negotiated by CDN/Vercel automatically      | 20–30% smaller transfer size vs gzip         |
| HTTP version | Enable **HTTP/3** (QUIC) on CDN — Vercel supports this                                   | Faster connection setup, better multiplexing |
| TLS          | **TLS session resumption** — reduces handshake round-trips on repeat visits              | Faster subsequent page loads                 |
| CSP size     | Audit CSP header (currently very long) — large headers add HTTP overhead                 | Smaller headers = faster parsing             |
| COOP/COEP    | Only enable cross-origin isolation policies if required for sharedArrayBuffer or similar | Can block resource loading, add latency      |
| HSTS         | Already configured (`max-age=63072000; includeSubDomains; preload`) ✅                   | One-time redirect, no ongoing cost           |

**CSP optimization:**

- Remove unused origins from the CSP (e.g., if a third-party service is no longer used)
- Use `strict-dynamic` where possible to reduce static allowlist size
- Consider a CSP reporting endpoint (`report-uri` / `report-to`) instead of blocking violations initially

---

## Phase 4: Database & Backend Optimization (Week 3–4) ✅ [COMPLETED]

### 4.1 Supabase Query Optimization

| Concern         | Action                                                         |
| --------------- | -------------------------------------------------------------- |
| `SELECT *`      | Always select only needed columns                              |
| Missing indexes | Audit `WHERE`, `ORDER BY`, `JOIN` columns                      |
| RLS policies    | Profile with `EXPLAIN ANALYZE`, optimize subqueries            |
| N+1 queries     | Use `.select('*, relation(*)')` or batch                       |
| Pagination      | Always use `.range()` with `count: 'exact'`                    |
| Cached RPCs     | Create Postgres functions with `STABLE`/`IMMUTABLE` volatility |

**Example audit:**

```sql
-- Check for sequential scans
EXPLAIN ANALYZE SELECT id, name FROM properties WHERE status = 'available';
-- Add index if needed
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
```

### 4.2 Database Monitoring

Ongoing database health monitoring to catch regressions early:

| Monitor                | Tool / Method                                      | Why                                                        |
| ---------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| Slow query log         | `pg_stat_statements` or Supabase Query Performance | Identify queries with high total time                      |
| Connection usage       | `pg_stat_activity`                                 | Detect connection pool exhaustion                          |
| Index usage statistics | `pg_stat_user_indexes`                             | Find unused or missing indexes                             |
| Table bloat            | `pgstattuple` extension                            | Identify tables needing `VACUUM` or `REINDEX`              |
| RPC execution time     | Log durations in Server Actions / API routes       | Surface backend latency regressions                        |
| Cache hit ratio        | `pg_statio_user_tables`                            | Low ratio indicates missing indexes or inefficient queries |

**Setup checklist:**

- [ ] Enable `pg_stat_statements` extension in Supabase
- [ ] Create a monitoring dashboard in Supabase (or Grafana)
- [ ] Set up alerts for queries exceeding 500ms execution time
- [ ] Schedule monthly index usage review

### 4.3 TanStack Query Tuning

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — data doesn't change often
      gcTime: 1000 * 60 * 30, // keep in cache 30 min
      refetchOnWindowFocus: false, // disable for marketing pages
    },
  },
});
```

**Additional:**

- Prefetch data on hover for anticipated navigation
- Hydrate server-fetched data into query cache
- Persist cache for admin panel (session continuity)

---

## Phase 5: Three.js / R3F Optimization (Week 4) ✅ [COMPLETED]

`HeroCanvas` uses `@react-three/fiber` + Three.js. This is heavy — optimize:

| Technique                                                                  | Impact                                |
| -------------------------------------------------------------------------- | ------------------------------------- |
| Lazy load after first paint (`dynamic(() => import(...), { ssr: false })`) | ✅ Already done                       |
| Dynamic pixel ratio (`<Canvas dpr={[1, 2]} />`)                            | Limits GPU work on low-DPI screens    |
| Adaptive Performance (`@react-three/drei/Adaptive`)                        | Auto-reduces quality based on FPS     |
| DRACO-compressed models                                                    | Smaller geometry payload              |
| KTX2 textures                                                              | GPU-native compression, faster decode |
| Frustum culling (enabled by default)                                       | ✅ Already on                         |
| Reduce `pixelRatio` on mobile                                              | Add `useMediaQuery` check             |

```tsx
import { Adaptive, AdaptiveDpr } from '@react-three/drei/Adaptive';

<Canvas dpr={[1, 2]} gl={{ antialias: false }}>
  <Adaptive />
  <AdaptiveDpr pixelated />
  {/* ... */}
</Canvas>;
```

---

## Phase 6: Cross-Environment Standardization (Week 4–5) ✅ [COMPLETED]

### 6.1 Performance Testing Framework

Create `scripts/perf-test.mjs`:

```js
// Runs on local + CI:
// 1. Bundle size checks
// 2. Image size checks
// 3. Lighthouse CI thresholds
// 4. TTFB assertion
```

### 6.2 CI/CD Performance Gates

Add to `.github/workflows/ci.yml`:

```yaml
- name: Check Bundle Size
  run: npx bundlesize
- name: Validate Image Sizes
  run: node scripts/check-image-sizes.mjs
- name: Check for Duplicate Packages
  run: npx duplicate-package-checker
- name: Detect Unused Dependencies
  run: npx depcheck
- name: Lighthouse CI
  run: npx lhci autorun
```

**CI checks breakdown:**

| Check                  | Tool                        | Threshold                          | Action on Failure                                          |
| ---------------------- | --------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| Bundle size regression | `bundlesize`                | Per-budget limits (see 6.3)        | Block PR merge                                             |
| Image optimization     | Custom script               | No unoptimized PNG > 100 KB        | Warn, suggest running `optimize:images`                    |
| Duplicate packages     | `duplicate-package-checker` | Zero duplicates                    | Block PR merge                                             |
| Unused dependencies    | `depcheck`                  | Zero unused                        | Warn, requires cleanup                                     |
| Lighthouse scores      | `@lhci/cli`                 | Public ≥ 95, Blog ≥ 90, Admin ≥ 85 | Block PR merge                                             |
| TypeScript errors      | `tsc --noEmit`              | Zero errors                        | Block PR merge (unless `ignoreBuildErrors` is intentional) |

### 6.3 Performance Budgets

**Global budgets (all routes):**

```json
// package.json
"bundlesize": [
  { "path": "./.next/static/chunks/**/!(_app|_error).js", "maxSize": "100KB" },
  { "path": "./.next/static/css/*.css", "maxSize": "40KB" },
  { "path": "./public/images/*.webp", "maxSize": "150KB" },
  { "path": "./public/images/*.avif", "maxSize": "100KB" }
]
```

**Route-specific budgets (for targeted regression detection):**

| Route Group                     | JS Budget | CSS Budget | Key Assets                                      |
| ------------------------------- | --------- | ---------- | ----------------------------------------------- |
| Homepage (`/`)                  | < 150 KB  | < 30 KB    | Hero image (< 150 KB), R3F bundle (lazy)        |
| Public pages (About, FAQ, etc.) | < 100 KB  | < 25 KB    | Feature images                                  |
| Blog (`/blog`)                  | < 120 KB  | < 25 KB    | Blog card images                                |
| Blog article (`/blog/[slug]`)   | < 100 KB  | < 25 KB    | Article body                                    |
| Projects (`/projects`)          | < 120 KB  | < 25 KB    | Project gallery images                          |
| Registration / Contact          | < 150 KB  | < 30 KB    | hCaptcha, form validation                       |
| Portal (authenticated)          | < 200 KB  | < 35 KB    | User data, payment UI                           |
| Admin dashboard                 | < 300 KB  | < 50 KB    | Charts, tables, email compose, rich text editor |
| Admin email                     | < 250 KB  | < 40 KB    | Rich text editor, template picker               |

> Route budgets help pinpoint regressions: if Admin grows beyond 300 KB, you know exactly which section needs attention rather than guessing from a global number.
>
> **Note:** Budgets should trigger **review** rather than automatic rejection when a justified exception exists (e.g., an admin rich-text editor legitimately exceeds the target). Always measure **gzipped/Brotli transfer size** alongside raw bundle size — transfer size is closer to what users experience.

### 6.4 Real-User Monitoring (RUM)

Beyond Sentry, instrument Core Web Vitals:

```tsx
// components/WebVitals.tsx
'use client';
import { onLCP, onCLS, onINP, onTTFB } from 'web-vitals';

export function WebVitals() {
  useEffect(() => {
    onLCP(console.log);
    onCLS(console.log);
    onINP(console.log);
    onTTFB(console.log);
    // Send to analytics endpoint
  }, []);
  return null;
}
```

Add to root layout once — provides real-world data beyond lab tests.

---

## Phase 7: Monitoring & Continuous Improvement (Ongoing) ✅ [COMPLETED]

> **Note on Free Tier Monitoring:** Existing `@sentry/nextjs` and `@vercel/speed-insights` setup is verified and kept as-is. Since this is on the Vercel Hobby plan, we avoid adding any _new_ heavy monitoring tools (like Datadog/Checkly) to prevent hitting event limits (100k/mo). Monitoring is considered "done" for the MVP.

### 7.1 Monthly Performance Review

1. Run full Lighthouse suite on 6 key pages
2. Compare against baseline + previous month
3. Review bundle analyzer report
4. Check Sentry performance transactions
5. Update performance budgets if needed
6. Document findings

### 7.2 Living Performance Roadmap

Review quarterly for new technologies:

- Partial Prerendering (PPR) when stable
- React Compiler adoption
- New image/video codec standards
- Emerging CDN features

---

## Success Criteria & Targets

| Metric                        | Current | Target   | How to Measure        |
| ----------------------------- | ------- | -------- | --------------------- |
| Lighthouse Performance        | Unknown | 90+      | Lighthouse CI         |
| LCP                           | Unknown | < 2.0s   | Lighthouse + RUM      |
| CLS                           | Unknown | < 0.05   | Lighthouse + RUM      |
| INP                           | Unknown | < 150ms  | Chrome DevTools + RUM |
| TTFB                          | Unknown | < 150ms  | Lighthouse            |
| Initial JS (all routes)       | Unknown | < 250 KB | Bundle analyzer       |
| Initial CSS                   | Unknown | < 40 KB  | Bundle analyzer       |
| Largest route JS              | Unknown | < 300 KB | Bundle analyzer       |
| Hero image size               | Unknown | < 150 KB | File audit            |
| Render-blocking resources     | Unknown | 0        | Lighthouse            |
| Performance budget compliance | N/A     | 100%     | CI gate               |

---

## Execution Priority Matrix

Not every optimization delivers equal value. Use this matrix to prioritize work:

| Priority            | Work                                                | Impact    | Effort | Category   |
| ------------------- | --------------------------------------------------- | --------- | ------ | ---------- |
| 🔴 **Critical**     | Image optimization (WebP/AVIF pipeline)             | Very High | Low    | MVP        |
| 🔴 **Critical**     | Rendering strategy (ISR/static/dynamic)             | Very High | Medium | MVP        |
| 🔴 **Critical**     | Bundle reduction (dynamic imports, tree-shaking)    | High      | Medium | MVP        |
| 🔴 **Critical**     | Image audit (width/height, priority, fetchPriority) | High      | Low    | MVP        |
| 🟡 **High**         | Supabase query optimization                         | High      | Medium | MVP        |
| 🟡 **High**         | TanStack Query tuning                               | Medium    | Low    | MVP        |
| 🟡 **High**         | RUM instrumentation                                 | Medium    | Low    | MVP        |
| 🟡 **High**         | Video optimization (AV1/VP9 + poster)               | Medium    | Medium | MVP        |
| 🟡 **High**         | Server Component audit                              | Medium    | Medium | MVP        |
| 🟡 **High**         | Font audit (verify preload/swap)                    | Medium    | Low    | MVP        |
| 🔵 **Medium**       | CI/CD performance gates                             | Medium    | Medium | Enterprise |
| 🔵 **Medium**       | Performance budgets                                 | Medium    | Medium | Enterprise |
| 🔵 **Medium**       | Three.js/R3F optimization                           | Medium    | Medium | Enterprise |
| 🔵 **Medium**       | Database monitoring setup                           | Medium    | Medium | Enterprise |
| 🔵 **Medium**       | Server Actions migration                            | Medium    | Medium | Enterprise |
| 🟢 **Nice-to-have** | PPR enablement                                      | Medium    | High   | Future     |
| 🟢 **Nice-to-have** | Edge Runtime for APIs                               | Medium    | Medium | Enterprise |
| 🟢 **Nice-to-have** | React Compiler readiness                            | Future    | Low    | Future     |
| 🟢 **Nice-to-have** | Adaptive streaming / HLS                            | Low       | High   | Enterprise |
| 🟢 **Nice-to-have** | CSP optimization                                    | Low       | Low    | Enterprise |

### MVP vs Enterprise Distinction

**MVP optimizations** (Weeks 1–3) — essential for any production launch:

- Image/rendering/bundle work — these deliver 80% of the performance gain
- Supabase query tuning — backend latency directly affects perceived speed
- RUM instrumentation — without it you're flying blind in production

**Enterprise optimizations** (Weeks 4–6) — valuable as traffic and team grow:

- CI/CD gates prevent regressions when multiple developers are contributing
- Database monitoring catches issues before they affect users at scale
- Three.js/R3F optimization matters more when the hero is the first thing users see

**Future considerations** — don't invest now, but track for adoption. Each should be adopted only after **validating compatibility** with the current project version and ecosystem:

- **PPR** — wait for the Next.js stable release; enable on a single page first (e.g., blog list) and compare Lighthouse before rolling out
- **React Compiler** — enable in staging first, profile render times, and check for component regressions before enabling in production
- **HLS/DASH adaptive streaming** — only if video content library grows beyond a single hero clip (3–5+ videos or long-form content). For now, multiple `<source>` formats (AV1/VP9/H.264) are sufficient

> **Rule of thumb:** Start with Critical → finish MVP → move to Enterprise → revisit Future quarterly. Don't let perfect be the enemy of good.

### Rollback Guidance

Performance changes can introduce regressions. Follow these practices to mitigate risk:

| Practice                     | How                                                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Deploy incrementally**     | One change at a time (e.g., image pipeline in one deploy, rendering strategy in the next) — never bundle multiple performance changes in a single deploy |
| **Compare RUM before/after** | Check LCP, CLS, INP, TTFB in your RUM dashboard 24–48 hours after each deployment                                                                        |
| **Use feature flags**        | For major rendering changes (ISR → PPR, dynamic → static), wrap behind a feature flag so you can toggle without a redeploy                               |
| **Keep old code path**       | When migrating rendering strategies, keep the original implementation as a comment or branch reference for at least one cycle                            |
| **Revert if metrics worsen** | If any Core Web Vitals metric degrades beyond the success criteria (see Definition of Done), revert and investigate before re-attempting                 |

## Performance Governance

Maintaining performance requires clear ownership across the team:

| Role                     | Owner         | Responsibility                                                                                   |
| ------------------------ | ------------- | ------------------------------------------------------------------------------------------------ |
| **Frontend Performance** | Frontend Lead | Bundle size, image optimization, rendering strategy, dynamic imports, font loading               |
| **Backend Performance**  | Backend Lead  | Supabase query optimization, indexes, RLS policies, database monitoring                          |
| **DevOps / CI**          | DevOps Lead   | CDN configuration, compression (Brotli), CI gate maintenance, deployment pipeline                |
| **QA / Testing**         | QA Lead       | Lighthouse regression checks, accessibility audit, RUM monitoring, performance budget validation |
| **Architecture**         | Tech Lead     | PPR evaluation, React Compiler adoption, Edge Runtime decisions, cache strategy                  |

**Process:**

1. **Each sprint:** Frontend and Backend leads review performance budgets before closing tickets
2. **Each deploy:** CI gates must pass (bundle size, Lighthouse thresholds, image optimization)
3. **Monthly:** Full performance review (see 7.1) — metrics compared against baseline
4. **Quarterly:** Roadmap review — adopt new technologies, retire unused optimizations

## Definition of Done

Before marking any performance work as complete, verify all of the following:

| #   | Check                    | Criteria                                                           | Tool              |
| --- | ------------------------ | ------------------------------------------------------------------ | ----------------- |
| 1   | Lighthouse Performance   | Public pages ≥ 95, Blog ≥ 90, Admin ≥ 85                           | Lighthouse CI     |
| 2   | Lighthouse Accessibility | ≥ 90 on all pages                                                  | Lighthouse CI     |
| 3   | LCP                      | < 2.0s (lab)                                                       | Lighthouse + RUM  |
| 4   | CLS                      | < 0.05 (lab)                                                       | Lighthouse + RUM  |
| 5   | INP                      | < 150ms (lab)                                                      | Chrome DevTools   |
| 6   | TTFB                     | < 150ms (lab)                                                      | Lighthouse        |
| 7   | Bundle budgets           | All route budgets satisfied                                        | `bundlesize` / CI |
| 8   | Image sizes              | All WebP < 150 KB, AVIF < 100 KB                                   | Custom script     |
| 9   | No unused dependencies   | `depcheck` passes                                                  | CI gate           |
| 10  | No duplicate packages    | `duplicate-package-checker` passes                                 | CI gate           |
| 11  | TypeScript errors        | Zero errors (`tsc --noEmit`)                                       | CI gate           |
| 12  | Accessibility            | No `prefers-reduced-motion` violations, all images have `alt` text | Manual audit      |
| 13  | RUM active               | `web-vitals` instrumentation deployed and reporting                | Production check  |
| 14  | CI passing               | All CI gates green                                                 | GitHub Actions    |

> Print this checklist and attach it to every performance-related PR. A change is not complete until all applicable checks pass.

## Implementation Roadmap

```
MVP Phase (Weeks 1–3)
├── Week 1:  Baseline — Lighthouse, bundle analysis, image audit, video audit
├── Week 2:  Image pipeline (PNG→WebP→AVIF) + prebuild script + pre-commit hook
│            Hero video encoding (AV1/VP9/H.264) + poster
│            Dev server tuning + Font audit + TanStack Query tuning
└── Week 3:  Rendering strategy (ISR/static/dynamic) applied to all pages
             Supabase query audit + indexes
             Server Component audit + RUM instrumentation

Enterprise Phase (Weeks 4–6)
├── Week 4:  Server Actions migration (where beneficial)
│            Edge Runtime for lightweight APIs
│            Three.js/R3F optimization
├── Week 5:  Performance test suite + CI gates + budgets
│            Priority Hints + resource hints audit
│            Security-performance review (CSP, compression)
└── Week 6:  Final audit vs baseline
             Documentation + knowledge transfer
```

---

## Key Principles

1. **Measure before optimizing** — never guess, always baseline first
2. **Use framework primitives** — `revalidate`, not custom cache headers; `next/font/google`, not self-hosting
3. **Lazy by default** — load nothing until needed, especially for Three.js and video
4. **Budgets are hard limits** — CI must block deployments that exceed thresholds
5. **Lab + Field** — Lighthouse alone isn't enough; instrument RUM for real-user data
6. **Iterate** — performance is never "done", review monthly

---

## Appendix A — Expected Impact by Optimization

Estimated gains based on typical Next.js projects with similar characteristics to SVI Infra Solutions.

| Optimization                            | Expected Impact                                   | Rationale                                                        |
| --------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| **AVIF images**                         | 25–40% smaller than PNG, 20–30% smaller than WebP | Better compression with same perceptual quality                  |
| **ISR for marketing pages**             | TTFB reduction of 40–60% vs fully dynamic         | HTML served from CDN cache instead of requiring server render    |
| **Dynamic imports (Three.js)**          | 100–300 KB reduction in initial JS                | Three.js/R3F loaded only after first paint, not in critical path |
| **Dynamic imports (charts, editors)**   | 50–150 KB reduction per admin page                | Recharts, tiptap loaded lazily, not on every admin route         |
| **Bundle cleanup (tree-shaking, deps)** | 10–20% reduction in total JS                      | Removing unused packages, optimizing imports                     |
| **Supabase query optimization**         | 20–70% faster query execution                     | Indexes, SELECT only needed columns, N+1 elimination             |
| **TanStack Query tuning**               | 30–50% fewer network requests                     | staleTime + gcTime prevent redundant refetches                   |
| **Font optimization**                   | Eliminates ~100–200ms of render-blocking time     | `display: swap` + preload ensures text visible immediately       |
| **Video (AV1/VP9)**                     | 60–80% bandwidth reduction vs original H.264      | Modern codecs deliver same quality at much lower bitrates        |
| **CDN caching (Vercel + ISR)**          | 50–80% reduction in origin requests               | Static/ISR pages served entirely from edge cache                 |
| **RUM instrumentation**                 | N/A (observability)                               | Enables data-driven decisions instead of guessing                |

> **Note:** These are estimated ranges. Actual gains depend on current state, content types, and traffic patterns. Measure before and after each optimization to validate.
