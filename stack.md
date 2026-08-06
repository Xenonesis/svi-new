# SVI Infra Solutions — Full Project Analysis & Roadmap

> Generated: 2026-08-05 (refresh)
> Stack: Next.js 16 + React 19 + TypeScript 6 + Tailwind CSS 4 + Supabase + Sentry

---

## 1. Project Profile

| Metric           | Value                                         |
| ---------------- | --------------------------------------------- |
| Source files     | ~591 TS/TSX files (excl. node_modules, .next) |
| Page routes      | 58 page.tsx (22 public + 30 admin + employee) |
| API routes       | 68 route.ts (REST endpoints)                  |
| React components | 285 in src/components/                        |
| DB migrations    | 51 (Supabase / PostgreSQL)                    |
| Locales          | 2 (English, Hindi) — 951+ translation keys    |
| Node             | 22.x (pinned via engines)                     |

---

## 2. Tech Stack

### Core Framework

| Technology          | Version | Purpose                          |
| ------------------- | ------- | -------------------------------- |
| Next.js             | 16.2.12 | App Router, SSR, ISR, API routes |
| React               | 19.2.8  | UI library                       |
| TypeScript          | 6.0.3   | Strict mode, type safety         |
| Tailwind CSS        | 4.3.3   | Utility-first styling            |
| Turbopack / Webpack | —       | Bundling (Turbopack build)       |

### Data & State

| Technology           | Version | Purpose                          |
| -------------------- | ------- | -------------------------------- |
| Supabase JS          | 2.110.8 | Database client, auth, admin     |
| Supabase SSR         | 0.12.3  | Server-side auth cookies         |
| TanStack React Query | 5.101.4 | Server state, caching, mutations |
| TanStack React Table | 8.21.3  | Data tables, sorting, filtering  |
| Zustand              | 5.0.14  | Client state (auth, UI)          |
| Zod                  | 4.4.3   | Schema validation                |

### UI & Animation

| Technology             | Version | Purpose                              |
| ---------------------- | ------- | ------------------------------------ |
| Motion (framer-motion) | 12.42.2 | Page transitions, micro-interactions |
| Lucide React           | 1.27.0  | Icon library                         |
| Radix UI               | —       | Dialog, DropdownMenu, Tooltip        |
| Sonner                 | 2.0.7   | Toast notifications                  |
| clsx + tailwind-merge  | —       | Conditional class merging            |

### AI & Communication

| Technology    | Version | Purpose                        |
| ------------- | ------- | ------------------------------ |
| Vercel AI SDK | 7.0.37  | Chatbot integration            |
| @ai-sdk/groq  | 4.0.13  | LLM provider (fast inference)  |
| @google/genai | 2.4.0   | Server-side content generation |
| Resend        | 6.18.0  | Transactional email API        |
| TipTap        | 3.29.1  | Rich text email editor         |

### Maps, Charts & Media

| Technology      | Version | Purpose                  |
| --------------- | ------- | ------------------------ |
| MapLibre GL     | 5.24.0  | Property location maps   |
| Recharts        | 3.10.1  | Admin dashboard charts   |
| canvas-confetti | 1.9.4   | Lottery draw celebration |
| html2canvas-pro | 2.3.2   | PDF screenshot capture   |
| jsPDF           | 4.2.1   | PDF document generation  |
| exceljs         | 4.4.0   | Excel export             |

### PWA

| Technology      | Purpose                                 |
| --------------- | --------------------------------------- |
| Service Worker  | Offline caching, stale-while-revalidate |
| Web Push API    | Push notifications                      |
| Background Sync | Offline queue                           |
| Manifest        | Installable PWA                         |
| Share Target    | Native share handling                   |

### Infrastructure

| Technology          | Purpose                             |
| ------------------- | ----------------------------------- |
| Vercel              | Hosting, edge functions, cron jobs  |
| Supabase            | Postgres DB, auth, RLS, realtime    |
| Sentry              | Error monitoring (nextjs 10.68.0)   |
| Capacitor           | Native Android runtime (8.4.2)      |
| Serwist             | Service worker / PWA (9.5.12)       |
| Husky + lint-staged | Git hooks (pre-commit lint, format) |
| commitlint          | Conventional commits                |
| ESLint + Prettier   | Code quality                        |
| Playwright          | E2E browser tests                   |
| Vitest              | Unit tests                          |

---

## 3. Architecture Map

```
svi-infra/
│
├─ app/                              # Next.js App Router
│  ├─ [locale]/(main)/               # Public site (bilingual)
│  │  ├─ about/
│  │  ├─ areas/                      # Area pages ([slug])
│  │  ├─ blog/
│  │  ├─ brochure/                   # Project brochures (shivani-vatika-11)
│  │  ├─ calculators/
│  │  ├─ careers/
│  │  ├─ changelog/                  # Release changelog page
│  │  ├─ contact/
│  │  ├─ exclusive-offers/
│  │  ├─ faq/
│  │  ├─ grievance/
│  │  ├─ leadership/
│  │  ├─ login/
│  │  ├─ lottery/                    # Public lottery / giveaway
│  │  ├─ payment/
│  │  ├─ portal/                     # Customer portal
│  │  ├─ projects/
│  │  ├─ registration/
│  │  ├─ thank-you/
│  │  └─ page.tsx                    # Homepage (hero, features, projects, CTA)
│  │
│  ├─ admin/                         # Admin dashboard (30 pages)
│  │  ├─ allotment-letter/ & records/
│  │  ├─ attendance/
│  │  ├─ bba/ & bba-records/
│  │  ├─ careers/
│  │  ├─ chat-logs/
│  │  ├─ dashboard/
│  │  ├─ email/                      # Full email center
│  │  ├─ employees/
│  │  ├─ ivr/                        # IVR call management
│  │  ├─ lottery/                    # Admin lottery management
│  │  ├─ notifications/
│  │  ├─ offer-letter/ & records/
│  │  ├─ payment-plan/ & receipts/
│  │  ├─ portal-allotments/
│  │  ├─ properties/
│  │  ├─ registrations/
│  │  ├─ settings/                   # 9-tab settings panel
│  │  ├─ site-visits/
│  │  └─ page.tsx                    # Admin overview
│  │
│  ├─ api/                           # 68 REST API routes
│  │  ├─ admin/                      # Admin APIs (verifyAdmin guard)
│  │  │  ├─ activities/
│  │  │  ├─ analytics/
│  │  │  ├─ campaigns/
│  │  │  ├─ careers/
│  │  │  ├─ contact-groups/ & contacts/
│  │  │  ├─ documents/
│  │  │  ├─ email/ (status, route)
│  │  │  ├─ employees/
│  │  │  ├─ ivr/
│  │  │  ├─ notifications/
│  │  │  ├─ properties/
│  │  │  ├─ registrations/
│  │  │  ├─ settings/
│  │  │  └─ users/
│  │  ├─ changelog/
│  │  ├─ chat/ (route, leads, log)
│  │  ├─ contact/
│  │  ├─ cron/ (campaigns, cleanup, lottery, scheduled-emails)
│  │  ├─ employee/ (attendance)
│  │  ├─ grievance/
│  │  ├─ lottery/
│  │  ├─ map-tiles/ (z/x/y)
│  │  ├─ monitoring/                 # Sentry tunnel
│  │  ├─ nearby-places/
│  │  ├─ project-images/
│  │  ├─ properties/
│  │  ├─ push/ (subscribe, unsubscribe)
│  │  ├─ registration/
│  │  ├─ site-visit/
│  │  ├─ webhooks/ (resend/incoming)
│  │  └─ share/
│  │
│  └─ (system files)
│     ├─ layout.tsx
│     ├─ error.tsx / global-error.tsx
│     ├─ loading.tsx
│     ├─ not-found.tsx
│     ├─ sitemap.ts
│     ├─ robots.ts
│     ├─ opengraph-image.tsx
│     └─ manifest.json
│
├─ src/
│  ├─ components/                    # 157 components
│  │  ├─ admin/                      # Admin panel (largest module)
│  │  │  ├─ bba/legal/               # Builder-Buyer Agreement
│  │  │  ├─ bba/legal-hindi/         # BBA legal pages (Hindi) + preview
│  │  │  ├─ ChartComponents/         # Dashboard charts (Attendance, Documents, Users)
│  │  │  ├─ DocumentGenerator/       # PDF: Allotment, Offer, BBA
│  │  │  ├─ email/                   # FULL EMAIL CENTER
│  │  │  │  ├─ compose/              # AI compose, template picker, attachments,
│  │  │  │  │                        #   ContactPicker, RecipientInput, ContactGroupsDialog
│  │  │  │  ├─ hooks/                # useDrafts, useSent, useScheduled, useAI
│  │  │  │  ├─ sections/             # EmailDetailPanel, ListItem, Toolbar, Sentiment
│  │  │  │  ├─ campaigns/            # Campaign management
│  │  │  │  ├─ ComposeTab, DraftsTab, SentTab, ScheduledTab, CampaignsTab
│  │  │  │  ├─ TemplatesTab, DomainsTab, DeletedTab, RepliesTab, SettingsTab
│  │  │  │  └─ ResendUsageDashboard
│  │  │  ├─ lottery/                 # Admin lottery
│  │  │  │  ├─ hooks/                # useLotteryData, useParticipants, useSchedule
│  │  │  │  ├─ modals/               # BulkEmail, DeleteConfirm, EditCampaign
│  │  │  │  ├─ wizard/               # Lottery creation wizard
│  │  │  │  └─ DashboardPanel, HistoryTable, ScheduleDrawPanel
│  │  │  ├─ registrations/           # Registration management
│  │  │  │  ├─ useRegistrations.ts   # React Query + optimistic updates
│  │  │  │  └─ Analytics, Table, Filter, DetailModal, StatusBadge
│  │  │  ├─ settings/                # Settings panel
│  │  │  │  ├─ hooks/useSettings.ts  # Centralized state hook
│  │  │  │  └─ 9 tab components
│  │  │  ├─ modals/                  # Shared admin modals
│  │  │  ├─ Shared/                  # AdminSkeleton, AdminStatsCard, Modal
│  │  │  ├─ helpers/                 # Badge, formStyles, propertyLabels
│  │  │  └─ AdminHeader, AdminSidebar, QuickActions, etc.
│  │  │
│  │  ├─ changelog/                  # ChangelogTimeline, ReleaseMarkdown
│  │  ├─ home/                       # Public homepage
│  │  │  ├─ HeroSection.tsx
│  │  │  ├─ AboutSection.tsx
│  │  │  ├─ FeaturesSection.tsx
│  │  │  ├─ ProjectsSection.tsx
│  │  │  ├─ CTASection.tsx
│  │  │  ├─ TimelineSection.tsx
│  │  │  ├─ LeadershipSection.tsx
│  │  │  ├─ HomeFAQ.tsx
│  │  │  ├─ ChatBot.tsx              # AI chatbot
│  │  │  ├─ LeadCapture.tsx
│  │  │  └─ ...
│  │  │
│  │  ├─ layout/                     # Layout components
│  │  │  ├─ Header.tsx (DesktopNav + MobileNav)
│  │  │  ├─ MoreDropdown.tsx         # "More" mega-menu in nav
│  │  │  ├─ Footer.tsx
│  │  │  ├─ FloatingContact.tsx
│  │  │  └─ ProjectDropdown.tsx
│  │  │
│  │  ├─ lottery/                    # Public lottery (2,024 lines)
│  │  │  ├─ hooks/useLotteryDraw.ts
│  │  │  ├─ sections/ (DrawArenaModal, CountdownBanner, WinnerCarousel, HallOfFame)
│  │  │  └─ LotteryClientSection, LotteryDrawSection, LotteryCTA
│  │  │
│  │  ├─ portal/                     # Customer portal sidebar
│  │  ├─ projects/                   # Project listing components
│  │  ├─ properties/                 # Property map, calculator
│  │  ├─ registration/               # Public registration form
│  │  ├─ contact/                    # Contact form + map
│  │  ├─ faq/                        # FAQ sections
│  │  ├─ ui/                         # Reusable primitives
│  │  │  ├─ ErrorBoundary, Breadcrumbs, BackToTop
│  │  │  ├─ LanguageToggle, ThemeToggle
│  │  │  ├─ AnalyticsTracker, DynamicSkeleton
│  │  │  ├─ StatsCounter, AnimatedSection
│  │  │  └─ HoverZoomImage, ReadingProgress
│  │  └─ common/                     # Analytics, CookieConsent, Schema
│  │
│  ├─ lib/                           # Core logic (3,640 lines)
│  │  ├─ api/                        # Error handling, rate limiting, validation
│  │  ├─ supabase/                   # Client, server, admin, auth, notifications
│  │  ├─ repositories/               # Data access layer (activity, attendance, lottery, property, user)
│  │  ├─ pwa/                        # Service worker, push notifications
│  │  ├─ utils/                      # Document exporter, template parser, escape
│  │  ├─ hooks/                      # Customer portal, lottery visibility
│  │  ├─ blog.ts                     # Blog data source
│  │  ├─ chat-context.ts             # Chatbot context builder
│  │  ├─ constants.ts
│  │  ├─ email-templates.ts
│  │  ├─ seo.ts
│  │  └─ utils.ts
│  │
│  ├─ stores/                        # Zustand stores
│  │  ├─ authStore.ts                # Auth state (token, userId, role)
│  │  └─ uiStore.ts                  # UI state
│  │
│  ├─ i18n/                          # Internationalization
│  │  ├─ routing.ts
│  │  ├─ request.ts
│  │  └─ navigation.ts
│  │
│  ├─ actions/                       # Server actions
│  └─ data/                          # Static data (FAQ)
│
├─ supabase/migrations/              # 30 database migrations
├─ scripts/                          # Utility scripts (seed, test, admin)
├─ e2e/                              # Playwright end-to-end tests
└─ public/                           # Static assets
   ├─ icons/
   ├─ images/
   └─ manifest.json
```

---

## 4. Database Schema

51 Supabase migrations covering:

| Table                      | Purpose                    |
| -------------------------- | -------------------------- |
| `profiles`                 | User/admin accounts        |
| `portal_settings`          | Key-value config store     |
| `properties`               | Property listings          |
| `project_images`           | Image gallery              |
| `registrations`            | Customer registrations     |
| `email_drafts`             | Saved email drafts         |
| `scheduled_emails`         | Scheduled send queue       |
| `activity_logs`            | Admin audit trail          |
| `chat_leads`               | Chatbot lead captures      |
| `push_subscriptions`       | PWA push notification subs |
| `campaigns`                | Email campaign management  |
| `contact_groups`           | Email contact groups       |
| `careers`                  | Job openings               |
| `employees`                | Employee records           |
| `attendance`               | Employee attendance        |
| `lottery_campaigns`        | Lottery/giveaway campaigns |
| `participants`             | Lottery participants       |
| `notifications`            | In-app notifications       |
| `documents`                | Generated PDF documents    |
| `allotment_records`        | Allotment records          |
| `bba_records`              | BBA records                |
| `offer_letter_records`     | Offer letter records       |
| `site_visits`              | Visit scheduling           |
| _(plus supporting tables)_ |                            |

---

## 5. Health Assessment

### ✅ Strong Areas

| Area                    | Detail                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Modern stack**        | Next.js 16 + React 19 + TypeScript 6 + Tailwind 4 — cutting edge                                                         |
| **Bilingual**           | Full English/Hindi parity with next-intl + Hindi BBA legal documents                                                     |
| **Supabase maturity**   | 51 migrations, RLS policies, admin client, SSR auth                                                                      |
| **Email system**        | Full email center (compose, templates, drafts, sent, scheduled, campaigns, AI compose, contact picker/groups, analytics) |
| **Document generation** | PDF exporter for allotment letters, offer letters, BBA — English + Hindi                                                 |
| **PWA ready**           | Service worker, manifest, push notifications, share target, background sync                                              |
| **AI integration**      | Chatbot (Groq), AI email compose, smart template suggestions                                                             |
| **Error handling**      | Centralized AppError + handleApiError pattern, rate limiting, Zod validation                                             |
| **Error monitoring**    | Sentry (nextjs) with tunnel route /monitoring                                                                            |
| **Code quality**        | Husky hooks, ESLint, Prettier, commitlint, lint-staged — all enforced pre-commit                                         |
| **Animations**          | Motion React throughout — premium feel                                                                                   |

### ⚠️ Areas Needing Attention

| Area                    | Issue                                               | Impact                      |
| ----------------------- | --------------------------------------------------- | --------------------------- |
| **Test coverage**       | Low coverage for large codebase                     | Any refactor risks breakage |
| **admin/email module**  | Large directory tree                                | Hard to maintain, slow IDE  |
| **Analytics**           | `@vercel/analytics` present but no event tracking   | No conversion data          |
| **Bundle size**         | `@next/bundle-analyzer` configured but rarely run   | Unknown bloat               |
| **Performance metrics** | Lighthouse scores never measured                    | Potential mobile issues     |
| **Service worker**      | Manual caching (Serwist)                            | Fragile, edge-case prone    |
| **Public-site tests**   | No e2e for homepage → registration → payment flow   | Critical path untested      |
| **Code debt**           | some `any` types remain                             | Known shortcuts             |
| **SEO structure**       | No Schema.org JSON-LD on property/FAQ pages         | Misses rich search results  |
| **Social sharing**      | OG image set up but no per-page meta tags           | Generic link previews       |
| **Font loading**        | Hindi fonts likely full Unicode set — no subsetting | Slower load                 |

---

## 6. Improvement Roadmap

### Tier 1 — High Impact, Low Effort (2 hours – 1 day each)

| #   | Improvement                                      | Why                                                    | Est. Time |
| --- | ------------------------------------------------ | ------------------------------------------------------ | --------- |
| 1   | **Schema.org JSON-LD markup**                    | Rich search results for properties, FAQ, articles      | ½ day     |
| 2   | **Lazy-load chatbot component**                  | Saves ~150KB JS on every non-chat page load            | ½ day     |
| 3   | **WhatsApp click-to-chat button**                | India's #1 messenger — converts 2-3x better than forms | 2 hours   |
| 4   | **EMI calculator widget on property pages**      | #1 high-intent engagement tool for real estate         | 1 day     |
| 5   | **Per-page Open Graph meta tags**                | Social shares show proper title, image, description    | ½ day     |
| 6   | **Page-level exit-intent popup**                 | Capture leads before they bounce                       | 1 day     |
| 7   | **Skeleton loaders for property/project cards**  | Shimmer placeholders vs content flash                  | ½ day     |
| 8   | **Animated stats counters on homepage**          | "500+ Families" count-up builds trust                  | ½ day     |
| 9   | ~~Dark mode persistence (localStorage)~~ ✅ done | Theme survives page refresh                            | 2 hours   |
| 10  | **Add `next/font` with subsetting for Hindi**    | Smaller font file = faster paint                       | ½ day     |

### Tier 2 — Medium Impact, Medium Effort (1-3 days each)

| #   | Improvement                                           | Why                                                        | Est. Time |
| --- | ----------------------------------------------------- | ---------------------------------------------------------- | --------- |
| 11  | ~~Add Sentry error tracking~~ ✅ done                 | See every crash, trace root cause                          | ½ day     |
| 12  | **Chatbot lead qualification flow**                   | Ask budget, timeline, location → score + route leads       | 2 days    |
| 13  | **Property comparison tool**                          | Side-by-side compare drives qualified leads                | 2-3 days  |
| 14  | **Bundle analysis with webpack-analyzer**             | Find & cut unused JS, reduce bundle                        | 1 day     |
| 15  | **CDN caching headers in next.config**                | Long cache TTLs for static assets = faster repeat visits   | ½ day     |
| 16  | **"Schedule Site Visit" booking**                     | Live calendar integration for property tours               | 2 days    |
| 17  | **E2E tests for critical paths**                      | Homepage → Registration → Payment → Thank-you              | 2-3 days  |
| 18  | **WebP/AVIF image pipeline**                          | Auto-convert uploaded images to modern formats             | 1 day     |
| 19  | **Chat handoff to sales agent**                       | "Talk to sales" → auto-create lead + notify agent          | 1 day     |
| 20  | **Add neighborhood/area content pages**               | Rank for "properties in Noida" etc.                        | 2-3 days  |
| 21  | **Service Worker via Workbox**                        | Replace manual SW with tested, reliable Workbox strategies | 1 day     |
| 22  | **Chatbot chat history in admin panel**               | See what visitors asked                                    | 1 day     |
| 23  | **Automatic lead scoring for registrations**          | Score leads by budget, timeline, property interest         | 1-2 days  |
| 24  | **Add real-time notifications for new registrations** | Toast alert when someone registers                         | ½ day     |

### Tier 3 — High Impact, Higher Effort (1-2 weeks each)

| #   | Improvement                                  | Why                                                  | Est. Time |
| --- | -------------------------------------------- | ---------------------------------------------------- | --------- |
| 25  | **Split admin/email module**                 | 10k lines → maintainable sub-modules                 | 1 week    |
| 26  | **Partial Prerendering on public pages**     | Static shell + dynamic data = faster TTFB            | 2-3 days  |
| 27  | **360° / virtual tour support**              | Embed Matterport or similar — 2026 buyer expectation | 1 week    |
| 28  | **Full e2e test suite (all critical paths)** | Catch regressions before deploy                      | 1-2 weeks |
| 29  | **Property newsletter + campaign analytics** | Automated follow-up sequences                        | 1 week    |
| 30  | **Add Property IDX/MLS feed**                | Auto-sync with listing portals                       | 1-2 weeks |

---

## 7. Top 10 Picks (Recommendation Order)

Ranked by **impact ÷ effort**:

```
 1.  Schema.org JSON-LD           ★★★★★   ½ day     — free SEO lift
 2.  WhatsApp click-to-chat       ★★★★★   2 hours   — India #1 messenger, 2-3x conversion
 3.  Chatbot lead qualification   ★★★★☆   2 days    — transforms FAQ bot into lead gen
 4.  ~~Add Sentry~~ ✅             ★★★★☆   ½ day     — done (Sentry 10.68 via @sentry/nextjs)
 5.  EMI calculator widget        ★★★★☆   1 day     — high-intent engagement
 6.  Per-page OG meta             ★★★★☆   ½ day     — social sharing from generic → specific
 7.  Property comparison tool     ★★★★☆   2-3 days  — drives qualified leads
 8.  Exit-intent popup            ★★★☆☆   1 day     — recapture leaving visitors
 9.  Bundle analysis              ★★★☆☆   1 day     — find and fix bloat
```

---

## 8. Quick Wins (Could Ship Today)

These are minimal-code changes you can implement and push same-day:

1. **`<BreadcrumbSchema />`** — add JSON-LD BreadcrumbList to every page
2. **`<LocalBusinessSchema />`** — extract Organization schema on homepage
3. **OG description per route** — `generateMetadata()` with page-specific description
4. **Font subset config** — update `next.config.mjs` with `AdjustFontFallbacks` + Google Fonts subset
