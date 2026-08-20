# Architecture Map

## Directory Structure

```
svi-infra/
│
├─ app/                              # Next.js App Router
│  ├─ [locale]/(main)/               # Public site (bilingual)
│  │  ├─ about/
│  │  ├─ areas/                      # Area pages ([slug])
│  │  ├─ lottery/                    # Public lottery / giveaway
│  │  ├─ portal/                     # Customer portal
│  │  ├─ projects/
│  │  └─ page.tsx                    # Homepage
│  │
│  ├─ admin/                         # Admin dashboard (31 pages)
│  │  ├─ allotment-letter/
│  │  ├─ bba/                        # Builder-Buyer Agreement
│  │  ├─ email/                      # Full email center
│  │  ├─ lottery/                    # Admin lottery management
│  │  ├─ registrations/
│  │  ├─ settings/                   # Settings panel
│  │  ├─ updates/                    # System updates & non-technical changelog
│  │  └─ page.tsx                    # Admin overview
│  │
│  ├─ api/                           # 68 REST API routes
│  │  ├─ admin/                      # Admin APIs (secured via verifyAdmin guard)
│  │  ├─ chat/                       # Chatbot APIs
│  │  ├─ cron/                       # Scheduled tasks (lottery, campaigns, emails)
│  │  └─ webhooks/
│  │
│  └─ (system files)                 # layout.tsx, error.tsx, sitemap.ts, etc.
│
├─ src/
│  ├─ components/                    # 175+ React components
│  │  ├─ admin/                      # Admin panel components (largest module)
│  │  │  ├─ email/                   # Full email client UI
│  │  │  ├─ lottery/                 # Lottery creation wizard, modals
│  │  │  ├─ quotation-records/       # Stats grid, filter bar, table, delete modal
│  │  │  ├─ updates/                 # System updates timeline, stats, filters
│  │  │  ├─ whatsapp/                # Conversation list, chat panel, lead drawer
│  │  │  └─ DocumentGenerator/       # PDF generators for letters
│  │  ├─ brochure/                   # Luxury township brochure modular sections
│  │  ├─ exclusive-offers/           # Exclusive broker offers, calculator, benefits
│  │  ├─ home/                       # Public homepage blocks (Hero, Features, ChatBot)
│  │  └─ ui/                         # Reusable primitives (Buttons, Modal, Inputs)
│  │
│  ├─ lib/                           # Core logic
│  │  ├─ api/                        # API handlers, rate limiting
│  │  ├─ supabase/                   # Supabase clients (browser, server, admin)
│  │  ├─ repositories/               # Data access layer
│  │  └─ utils/                      # Utilities, document exporters
│  │
│  ├─ stores/                        # Zustand state (authStore.ts, uiStore.ts)
│  ├─ i18n/                          # Internationalization routing/navigation
│  ├─ actions/                       # Next.js Server Actions
│  └─ data/                          # Static data files
│
├─ supabase/migrations/              # Database schema migrations
├─ scripts/                          # Utility scripts (seed, optimization)
├─ e2e/                              # Playwright tests
└─ public/                           # Static assets, manifest.json
```

## Application Flow & Patterns

- **Server/Client Boundary:** React Server Components (RSC) heavily utilized in `app/`. Interactive parts (forms, tables, complex UI) pushed to client components (`'use client'`) inside `src/components/`. API responses (especially Admin endpoints via `withAdminAuth`) are automatically compressed using Brotli/Gzip for payloads over 1KB via `src/lib/api/compression.ts`.
- **Data Fetching:** For public pages, mostly direct DB access or RSC fetches. In the admin panel, **React Query** (`@tanstack/react-query`) is used for fetching, caching, and optimistic UI updates. Clients negotiate compression via `Accept-Encoding` header in `src/lib/api/fetcher.ts`.
- **State Management:** **Zustand** is used for global client-side state (e.g., Auth, UI themes), reducing unnecessary context providers.
- **Database Access:** The codebase follows a **Repository Pattern** (`src/lib/repositories/`) to abstract Supabase queries and keep logic clean.
- **Authentication:** Managed by Supabase (SSR cookies). A central `useAuthStore` tracks session status to prevent duplicate roundtrips on route changes.
- **WhatsApp MVP:** `src/lib/whatsapp/` contains the server-only Meta provider, raw-body signature validation, deterministic messaging policy, allowlisted AI tools, durable persistence, and job processors. `/api/whatsapp/webhook` only verifies and persists provider events; `/api/cron/whatsapp` performs recoverable AI/follow-up work; `/api/admin/whatsapp` protects inbox reads and mutations with `verifyAdmin`.
