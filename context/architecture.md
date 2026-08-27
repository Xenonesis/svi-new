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
│  │  ├─ workforce/                  # Unified Workforce & HR Hub (Employees, Attendance, Approvals, Payroll)
│  │  ├─ payroll/                    # Payroll & Salary Management (redirects to /admin/workforce?tab=payroll)
│  │  ├─ updates/                    # System updates & non-technical changelog
│  │  └─ page.tsx                    # Admin overview
│  ├─ employee/                       # Employee Workspace (Mobile-first app)
│  │  ├─ login/                       # Employee login screen
│  │  ├─ dashboard/                   # Punch Radar, today overview & quick stats
│  │  ├─ attendance/                  # Punch in/out action, geofencing radar
│  │  │  ├─ history/                  # Monthly attendance calendar & hours summary
│  │  │  └─ leaves/                   # Leave balances & application portal
│  │  ├─ work/                        # Work & Task Tracker
│  │  │  ├─ tasks/                    # Kanban/List to-dos & priority items
│  │  │  ├─ site-visits/              # Assigned customer site visits
│  │  │  └─ leads/                    # Assigned chatbot & WhatsApp leads
│  │  ├─ payroll/                      # My Compensation & Gated Payslip Downloads
│  │  ├─ profile/                     # Employee badge, team info, settings & logout
│  │  └─ layout.tsx                   # Mobile app shell with bottom navigation bar
│  │
│  ├─ api/                           # 75+ REST API routes
│  │  ├─ admin/                      # Admin APIs (secured via verifyAdmin guard)
│  │  ├─ employee/                   # Employee APIs (attendance, work, tasks, leaves)
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
- **Unified Workforce & HR Console:** `/admin/workforce` serves as the centralized enterprise hub consolidating Employee Directory, Attendance, Approvals, and Payroll into a single workspace (`?tab=directory|attendance|approvals|payroll|reports|settings`). Legacy routes (`/admin/employees`, `/admin/attendance`, `/admin/payroll`) feature seamless, instant client-side redirects that preserve query parameters.
- **Admin Attendance & Timesheet Management:** Accessible via `/admin/workforce?tab=attendance` (with legacy `/admin/attendance` redirecting here), this module features an interactive workspace: Overview (analytics & live radar), Master Timesheet (granular punch logs, geofence radius metrics, client call counts, site visits, and admin manual override), Approvals (pending employee leave requests & punch regularization requests with real-time badges), Reports (filterable summaries), and Configuration (shift timing rules, multiple office geofence locations, and team management).
- **Employee Directory & Performance Tracking:** Admin manages the complete employee lifecycle and views individual performance dashboards via `/admin/workforce?tab=directory` (legacy `/admin/employees` redirects here), tracking KPIs for attendance, punctuality, conversion rate, site visits, and assigned leads with chronological interaction timelines. On the employee side, `/employee/work` provides rapid lead creation (`AddLeadModal`), stage-by-stage pipeline tracking with interaction logs (`LeadTrackerDrawer`), native Web Audio melodic chime reminders (`followUpAudio`), and automated Admin notification dispatching when follow-ups are scheduled.
- **Payroll & Salary Management:** Admin manages employee compensation structures, calculates monthly payroll runs linked directly to attendance (calculating LOP deductions from absent shifts and adding performance incentives), and strictly controls payslip releases via single-tap employee switches or master bulk release via `/admin/workforce?tab=payroll` (legacy `/admin/payroll` redirects here). On the employee side, `/employee/payroll` provides transparent compensation breakdowns, but payslip PDF downloads remain strictly locked and gated until the Admin explicitly allows download.
- **WhatsApp MVP:** `src/lib/whatsapp/` contains the server-only Meta provider, raw-body signature validation, deterministic messaging policy, allowlisted AI tools, durable persistence, and job processors. `/api/whatsapp/webhook` verifies and persists provider events then uses Next.js `after()` to drain immediate background work; `/api/cron/whatsapp` runs daily on Vercel Hobby as a safety sweep (or periodically via Supabase `pg_cron`); `/api/admin/whatsapp` protects inbox reads and mutations with `verifyAdmin`.
- **Android Multi-Flavor Architecture:** Dual-App native Android configuration powered by Capacitor (8.5.0) and Gradle `productFlavors` (`flavorDimensions "default"`):
  - **Admin App (`admin` flavor):** Package `com.svi.infrasolutions`, App label "SVI Admin", target URL `/admin`, custom scheme `com.svi.infrasolutions`, dark theme background `#0a0a0a`.
  - **Employee Workspace App (`employee` flavor):** Package `com.svi.infrasolutions.employee`, App label "SVI Workspace", target URL `/employee/dashboard`, custom scheme `com.svi.infrasolutions.employee`, deep slate background `#020617`.
  - **Target Configuration & Build Scripts:** Driven by `CAP_APP_TARGET=admin|employee` in `capacitor.config.ts` (with standalone configs `capacitor.admin.config.ts` and `capacitor.employee.config.ts`), managed via dedicated npm scripts (`cap:admin:sync`, `cap:admin:open`, `cap:admin:run`, `cap:admin:build`, `cap:employee:sync`, `cap:employee:open`, `cap:employee:run`, `cap:employee:build`).
- **Employee Mobile Portal & Field Capabilities:** A dedicated mobile-first workspace (`/employee/*`) for staff and on-field sales agents:
  - _Live Radar Punch Terminal with Geofencing:_ Real-time GPS coordinate acquisition comparing user position against configured office geofences (`/employee/attendance` & `/employee/dashboard`), visualizing proximity, accuracy radius, and in-bounds status before punch submission.
  - _Offline Punch Queue & Auto-Sync:_ Robust offline punch subsystem (`src/lib/punch-queue/`) storing attendance events locally in browser storage when offline or experiencing poor network conditions. Automatically recovers interrupted syncing punches and replays queued punches with chronological order preserved as soon as connectivity resumes (`window.addEventListener('online')`), featuring live badge indicators (`PunchQueueBadge`).
  - _Biometric Quick-Punch (WebAuthn / Passkey):_ Hardware-backed biometric authentication (`src/lib/auth/webauthn.ts`) enabling employees to punch in/out instantly via fingerprint, Face ID, or system biometrics, toggleable per employee via `/employee/profile` settings.
  - _Field Work & On-Site Tracking:_ `/employee/work/site-visits` provides on-site GPS check-in capturing live coordinates, calculating distance to the scheduled property development site, and validating physical arrival for client property tours. `/employee/work/leads` provides 1-tap phone calling (`tel:`) and WhatsApp direct messaging (`https://wa.me/`) with automatic interaction logging and follow-up scheduling.
