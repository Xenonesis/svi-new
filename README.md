<div align="center">

# 🏗️ SVI Infra Solutions

### _Where Dreams Take Address_

A premium real estate development platform — modern public website, full-featured admin portal, employee workspace, AI-powered chatbot, and an end-to-end document/email/lottery suite.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/license-Private-red)](#-license)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Screenshots](#-screenshots) • [Deploy](#-deployment)

</div>

---

## 📑 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
  - [Public Website](#-public-website)
  - [Admin Portal](#-admin-portal)
  - [Employee Portal](#-employee-portal)
  - [AI & Automation](#-ai--automation)
- [🏗️ Tech Stack](#-tech-stack)
- [🧱 Architecture](#-architecture)
- [🗂️ Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔐 Environment Variables](#-environment-variables)
- [📜 Available Scripts](#-available-scripts)
- [🌐 Routing Reference](#-routing-reference)
- [🧩 Component Library](#-component-library)
- [🗃️ Database Migrations](#-database-migrations)
- [🎨 Design System](#-design-system)
- [🧪 Testing](#-testing)
- [🔧 Development Workflow](#-development-workflow)
- [🚀 Deployment](#-deployment)
- [🤝 Third-Party Integrations](#-third-party-integrations)
- [🛠️ Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Overview

**SVI Infra Solutions Pvt. Ltd.** is a 15+ year old real estate developer with **15+ delivered projects** and **5,000+ happy families** across **Noida, Jaipur, and Phulera Smart City** (DMIC/DFC corridors).

This repository hosts the company's full digital platform — a **public marketing website** combined with a **role-based admin portal** and **employee workspace**, built on Next.js 16 with React Server Components, Supabase authentication, and an AI chatbot.

> **Brand promise:** _Where Dreams Take Address_ — building trust through quality construction, strategic locations, and exceptional customer service.

### Why this project stands out

| Area              | What makes it production-grade                                         |
| ----------------- | ---------------------------------------------------------------------- |
| **Rendering**     | Hybrid RSC + selective client islands via `"use client"` boundary      |
| **Data**          | Server-side Supabase queries, optimistic updates via TanStack Query    |
| **i18n**          | Native locale routing with `next-intl` (English/Hindi, auto-detection) |
| **Auth**          | Cookie-based Supabase SSR + middleware role-gating for `/admin`        |
| **Documents**     | Client-side jsPDF generation (BBA, invoices, allotment, offer letters) |
| **State**         | Zustand stores with `persist` middleware for theme & auth              |
| **UI**            | Tailwind v4, Motion animations, MapLibre GL maps, 3D Three.js scenes   |
| **AI**            | Streaming Groq (Llama 4) chatbot + Gemini content generation           |
| **Email**         | Resend transactional + Tiptap-powered campaign editor                  |
| **Quality gates** | Husky pre-commit (lint+format), Commitlint, Vitest, Playwright e2e     |

---

## ✨ Features

### 🏠 Public Website

- **Landing page** — Hero with Motion entrance animations, animated stats counter, scroll-triggered reveals
- **Project showcase** — Current and completed projects with **MapLibre GL** interactive maps
- **Company pages** — About, Leadership (team profiles), Careers, Blog (`/[slug]` dynamic posts)
- **AI Chatbot** — Floating streaming chat widget powered by **Groq Llama 4** via Vercel AI SDK
- **Lottery page** — Feature-flagged via `portal_settings.lottery_page_visible`; live draws, hall of fame, winner carousel
- **Forms** — Contact, Registration, Grievance, Payment (all with hCaptcha + Resend delivery)
- **Multi-language** — 🇬🇧 English / 🇮🇳 Hindi via `next-intl` locale routing
- **Theme** — Light/dark/system with `localStorage` persistence and FOUC-free init
- **Legal & consent** — Privacy Policy, Terms & Conditions, GDPR-style cookie banner
- **UX polish** — Reading progress bar, breadcrumbs, back-to-top, WhatsApp button, error boundary, skeletons

### 🛠️ Admin Portal

> Protected by `middleware.ts` — Supabase SSR session + `profiles.role = 'admin'` check

- **Dashboard** — Recharts analytics (User Growth, Attendance Status, Attendance Trend, Document Stats), KPI cards, activity timeline, quick actions
- **User management** — Full CRUD, role assignment, advisor linking
- **Attendance** — Daily check-in/out, monthly reports, teams with nested member management
- **Document generator** — Dynamic PDFs for:
  - 📄 **Allotment Letter**
  - 📄 **Builder Buyer Agreement (BBA)**
  - 📄 **Offer Letter** (with sales compensation slabs)
  - 📄 **Payment Plan**
  - 📄 **Payment Receipt** / Invoice
  - All with **PDF and PNG image** download options
- **Property management** — CRUD for real estate listings with image management
- **Registration manager** — View, filter, assign advisors
- **Email suite** — Tiptap rich text composer, sent history with replies, **templates**, **domains**, **marketing campaigns**, deleted messages, **Resend usage dashboard**
- **Lottery management** — Schedule draws, upload participants, edit campaigns, bulk email, winner history
- **Notifications** — Real-time dropdown in admin header, create/read/dismiss workflow
- **Settings** — Tabbed interface: Profile · Company · Appearance · Notifications · Security · Email · Properties · Logs
- **Chat logs** — Conversation history for the AI chatbot

### 👥 Employee Portal

- **Employee login** at `/employee/login` (separate route group)
- **Attendance** at `/(employee)/attendance` — dedicated staff check-in/out surface
- Distinct auth boundary from admin and clients

### 🤖 AI & Automation

- **Streaming chatbot** (`/api/chat`) — Vercel AI SDK + `@ai-sdk/groq` (Llama 4)
- **Content generation** — `@google/genai` for server-side content
- **Admin chat logs** — Review conversations for support & compliance
- **Cron endpoints** (`/api/cron/*`) — Scheduled task runners (e.g., draw execution)

---

## 🏗️ Tech Stack

### Core Framework

| Layer      | Technology            | Version   | Why we chose it                         |
| ---------- | --------------------- | --------- | --------------------------------------- |
| Framework  | **Next.js**           | `^16.2.6` | App Router, RSC, route handlers         |
| UI library | **React**             | `^19.0.1` | Server Components, `use()` hook         |
| Language   | **TypeScript**        | `^6.0.3`  | Strict mode, end-to-end type safety     |
| Bundler    | **Webpack** (default) | bundled   | Stable build, full Next.js plugin chain |

### Styling & UI

| Technology                 | Version             | Purpose                               |
| -------------------------- | ------------------- | ------------------------------------- |
| **Tailwind CSS**           | `^4.1.14`           | Utility-first CSS                     |
| **Motion (Framer Motion)** | `^12.39.0`          | Scroll-reveal & micro-interactions    |
| **Lucide React**           | `^1.16.0`           | Open-source icon set                  |
| **Recharts**               | `^3.8.1`            | Composable charts for admin dashboard |
| **Sonner**                 | `^2.0.7`            | Toast notifications                   |
| **canvas-confetti**        | `^1.9.4`            | Confetti for lottery wins             |
| **clsx / tailwind-merge**  | `^2.1.1` / `^3.6.0` | Conditional class composition         |

### State, Data & 3D

| Technology               | Version    | Purpose                                     |
| ------------------------ | ---------- | ------------------------------------------- |
| **Zustand**              | `^5.0.14`  | Lightweight stores (`authStore`, `uiStore`) |
| **TanStack React Query** | `^5.101.0` | Server-state caching, optimistic updates    |
| **@react-three/fiber**   | `^9.6.1`   | 3D scene rendering                          |
| **@react-three/drei**    | `^10.7.7`  | Useful 3D helpers                           |
| **three**                | `^0.184.0` | 3D engine                                   |
| **date-fns**             | `^4.4.0`   | Date formatting                             |

### Backend, Auth & Database

| Technology        | Version    | Purpose                                |
| ----------------- | ---------- | -------------------------------------- |
| **Supabase JS**   | `^2.106.1` | PostgreSQL + auth + storage + realtime |
| **@supabase/ssr** | `^0.12.0`  | Cookie-based SSR sessions              |
| **next-intl**     | `^4.13.0`  | Locale routing (en/hi) + translations  |

### AI Providers

| Technology        | Version    | Purpose                        |
| ----------------- | ---------- | ------------------------------ |
| **ai (Vercel)**   | `^6.0.198` | Streaming chat & generative UI |
| **@ai-sdk/groq**  | `^3.0.39`  | Llama 4 inference              |
| **@ai-sdk/react** | `^3.0.200` | React hooks for AI SDK         |
| **@google/genai** | `^2.4.0`   | Server-side content generation |

### Documents, Forms & Email

| Technology          | Version   | Purpose                                                          |
| ------------------- | --------- | ---------------------------------------------------------------- |
| **jsPDF**           | `^4.2.1`  | Client-side PDF generation                                       |
| **html2canvas-pro** | `^2.0.2`  | HTML → canvas for PDF content                                    |
| **ExcelJS**         | `^4.4.0`  | Excel parsing & export                                           |
| **Resend**          | `^6.12.3` | Transactional + marketing email                                  |
| **TipTap**          | `^3.24.0` | Rich text editor (compose, link, image, color, highlight, align) |
| **heic-convert**    | `^2.1.0`  | HEIC → JPEG/PNG in browser                                       |
| **Zod**             | `^4.4.3`  | Schema validation for API payloads                               |
| **maplibre-gl**     | `^5.24.0` | Open-source vector map rendering (no API key)                    |

### Analytics, Testing & Tooling

| Technology                  | Version              | Purpose                         |
| --------------------------- | -------------------- | ------------------------------- |
| **@vercel/analytics**       | `^2.0.1`             | Page-view & visitor tracking    |
| **@vercel/speed-insights**  | `^2.0.0`             | Real-user Core Web Vitals       |
| **Vitest** + **jsdom**      | `^4.1.7` / `^29.1.1` | Unit & integration tests        |
| **Playwright**              | `^1.60.0`            | End-to-end browser tests        |
| **ESLint** (flat config)    | `^9.39.4`            | Type-aware linting              |
| **Prettier**                | `^3.8.3`             | Formatter + Tailwind class sort |
| **Husky** + **lint-staged** | `^9.1.7` / `^17.0.5` | Git hooks                       |
| **Commitlint**              | `^21.0.1`            | Conventional commit enforcement |
| **@next/bundle-analyzer**   | `^16.2.7`            | Bundle size inspection          |

---

## 🧱 Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          Next.js 16 App Router                     │
│                                                                    │
│   ┌──────────────┐   ┌──────────────┐   ┌────────────────────┐     │
│   │   /[locale]  │   │   /admin/*   │   │  /employee +        │    │
│   │  public site │   │  (protected) │   │  /(employee)        │    │
│   └──────┬───────┘   └──────┬───────┘   └─────────┬──────────┘     │
│          │                  │                     │                │
│          ▼                  ▼                     ▼                │
│   ┌──────────────┐   ┌──────────────┐   ┌────────────────────┐     │
│   │  RSC +       │   │  AdminSession│   │  Employee session   │    │
│   │  Motion/Map  │   │  Provider    │   │  Provider           │    │
│   └──────┬───────┘   └──────┬───────┘   └─────────┬──────────┘     │
│          └──────────┬───────┴───────────┬─────────┘                │
│                     ▼                   ▼                          │
│            ┌─────────────────┐  ┌──────────────────┐               │
│            │ middleware.ts   │  │  Zustand stores  │               │
│            │  (auth + role)  │  │  auth + ui       │               │
│            └────────┬────────┘  └──────────────────┘               │
│                     ▼                                              │
│      ┌──────────────────────────────┐                              │
│      │   /api route handlers        │  ← chat, contact, admin/*   │
│      └──────────┬───────────────────┘                              │
│                 ▼                                                  │
│      ┌──────────────────────────────┐                              │
│      │  Supabase (Postgres+Auth+RT) │  ← profiles, properties,    │
│      │                              │     notifications, lottery,  │
│      │                              │     campaigns, attendance   │
│      └──────────────────────────────┘                              │
└────────────────────────────────────────────────────────────────────┘
```

### Key architectural decisions

1. **Hybrid RSC** — Server Components by default; `"use client"` islands for maps, animations, admin interactivity
2. **Locale-first routing** — `app/[locale]/(main)/...` with `next-intl` for English/Hindi
3. **Layered role groups** — `app/admin` (admin), `app/employee` (staff), `app/(employee)` (grouped route)
4. **Cookie-based SSR auth** — `@supabase/ssr` + middleware guard on `/admin/:path*`
5. **Client-side PDF** — jsPDF + html2canvas-pro to avoid server CPU cost; templates live in `src/lib/bba/`
6. **Centralized SEO** — `src/lib/seo.ts` exposes `createMetadata()` with OG, Twitter, canonical, robots
7. **Optimistic UI** — TanStack Query wraps admin mutations; Zustand persists theme + auth slice
8. **No API key for maps** — MapLibre GL uses open vector tiles
9. **Feature flags in DB** — `portal_settings` table drives lottery visibility, etc.

---

## 🗂️ Project Structure

```
svi-new/
├── app/
│   ├── [locale]/                  # Locale-routed public site
│   │   ├── (main)/                #   Public route group
│   │   │   ├── about/             #   /about
│   │   │   ├── blog/[slug]/       #   /blog + dynamic posts
│   │   │   ├── careers/           #   /careers
│   │   │   ├── contact/           #   /contact
│   │   │   ├── faq/               #   /faq
│   │   │   ├── grievance/         #   /grievance
│   │   │   ├── leadership/        #   /leadership
│   │   │   ├── login/             #   /login (client portal)
│   │   │   ├── lottery/           #   /lottery (feature-flagged)
│   │   │   ├── payment/           #   /payment
│   │   │   ├── privacy-policy/    #   /privacy-policy
│   │   │   ├── projects/{current,completed}/
│   │   │   ├── registration/      #   /registration
│   │   │   ├── terms-conditions/  #   /terms
│   │   │   ├── thank-you/         #   /thank-you
│   │   │   ├── layout.tsx         #   Public layout (Header/Footer)
│   │   │   └── page.tsx           #   Landing page
│   │   └── layout.tsx             # Locale layout
│   ├── admin/                     # Admin portal (middleware-protected)
│   │   ├── allotment-letter/      #   Allotment letter PDF generator
│   │   ├── allotment-records/     #   Allotment record management
│   │   ├── attendance/            #   Employee check-in + reports
│   │   ├── bba/                   #   Builder Buyer Agreement
│   │   ├── bba-records/           #   BBA records
│   │   ├── chat-logs/             #   AI chatbot conversation history
│   │   ├── dashboard/             #   Analytics & KPIs
│   │   ├── email/                 #   Email suite (compose, campaigns, templates...)
│   │   ├── employees/             #   Employee directory
│   │   ├── lottery/               #   Lottery draw management
│   │   ├── notifications/         #   Notification center
│   │   ├── offer-letter/          #   Offer letter PDF
│   │   ├── offer-letter-records/  #   Offer letter records
│   │   ├── payment-plan/          #   Payment plan PDF
│   │   ├── payment-receipt/       #   Payment receipt PDF
│   │   ├── payment-receipts/      #   Payment receipt records
│   │   ├── portal-allotments/     #   Client-facing allotments
│   │   ├── properties/            #   Property CRUD
│   │   ├── registrations/         #   User registration management
│   │   ├── settings/              #   Tabbed system configuration
│   │   ├── layout.tsx             #   Admin layout (sidebar + header)
│   │   └── page.tsx               #   Admin login
│   ├── employee/                  # Employee portal
│   │   └── login/                 #   /employee/login
│   ├── (employee)/                # Employee route group
│   │   └── attendance/            #   Staff attendance surface
│   ├── api/                       # Route handlers
│   │   ├── admin/                 #   admin/* CRUD endpoints
│   │   ├── chat/                  #   Streaming AI chat
│   │   ├── contact/               #   Contact form
│   │   ├── cron/                  #   Scheduled tasks
│   │   ├── employee/              #   Employee endpoints
│   │   ├── grievance/             #   Grievance form
│   │   ├── lottery/               #   Public lottery data
│   │   ├── project-images/        #   Image serving
│   │   ├── properties/            #   Public listings
│   │   ├── registration/          #   User registration
│   │   └── webhooks/              #   External integrations
│   ├── layout.tsx                 # Root layout (ClientProviders)
│   ├── error.tsx / global-error.tsx
│   ├── loading.tsx                # Suspense fallback
│   ├── not-found.tsx              # Custom 404
│   ├── opengraph-image.tsx        # Dynamic OG image
│   ├── robots.ts                  # robots.txt
│   ├── sitemap.ts                 # Dynamic sitemap
│   └── globals.css                # Tailwind v4 + tokens
├── src/
│   ├── components/
│   │   ├── common/                # Reusable UI primitives
│   │   │   ├── ui/                #   Atomic UI (BackToTop, ErrorBoundary,
│   │   │   │                       #   ThemeToggle, LanguageToggle, ...)
│   │   │   └── AnalyticsTracker.tsx
│   │   ├── admin/                 # Admin-specific widgets
│   │   │   ├── attendance/, ChartComponents/, DocumentGenerator/,
│   │   │   ├── email/, helpers/, lottery/, modals/, OfferLetter/,
│   │   │   └── registrations/, settings/, Shared/
│   │   ├── home/                  # Landing page sections
│   │   ├── layout/                # Header, Footer, nav
│   │   ├── lottery/               # Public lottery client
│   │   ├── portal/                # Client portal (PortalSidebar, ...)
│   │   ├── properties/            # Property widgets
│   │   ├── Captcha.tsx
│   │   ├── ClientProviders.tsx    # Theme + Query providers
│   │   ├── QueryProvider.tsx
│   │   └── ThemeProvider.tsx
│   ├── data/                      # company_settings.json, email-templates.json, faq/
│   ├── hooks/                     # useMounted, useLotteryVisibility, ...
│   ├── i18n/                      # next-intl routing, navigation, request
│   ├── lib/
│   │   ├── api/                   # rateLimit, Zod schemas, withAdminAuth
│   │   ├── bba/                   # BBA helper utilities
│   │   ├── hooks/                 # Cross-cutting hooks
│   │   ├── lottery/               # Campaign helpers
│   │   ├── repositories/          # Server data access
│   │   ├── supabase/              # client / admin / server / types
│   │   ├── utils/                 # documentExporter, templateParser
│   │   ├── blog.ts                # Typed blog posts
│   │   ├── chat-context.ts
│   │   ├── email-templates.ts
│   │   ├── nearby-places.ts
│   │   ├── seo.ts                 # createMetadata() helper
│   │   └── utils.ts
│   ├── services/                  # API service wrappers
│   ├── stores/                    # Zustand stores (authStore, uiStore)
│   └── index.css
├── e2e/                           # Playwright e2e tests
├── public/                        # Static assets
├── scripts/                       # Node/TS scripts (icons, etc.)
├── supabase/                      # Migrations & config
├── __tests__/                     # Vitest unit/integration tests
├── messages/                      # i18n message catalogs
├── types/                         # Ambient type declarations
├── proxy.ts                       # Reverse-proxy helpers
├── next.config.mjs
├── eslint.config.js
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites

| Tool          | Version  | Notes                                        |
| ------------- | -------- | -------------------------------------------- |
| **Node.js**   | `v20+`   | LTS recommended                              |
| **npm**       | bundled  | pnpm/yarn work too                           |
| **Supabase**  | account  | Database, auth, storage                      |
| **Groq**      | API key  | [console.groq.com](https://console.groq.com) |
| **Google AI** | API key  | Optional — Gemini content generation         |
| **Resend**    | API key  | Transactional & campaign email               |
| **hCaptcha**  | site key | Form spam protection                         |

### Installation

```bash
# 1. Clone
git clone https://github.com/Xenonesis/svi-new.git
cd svi-new

# 2. Install
npm install

# 3. Environment
cp .env.example .env.local
# Edit .env.local with your keys (see "Environment Variables" below)

# 4. Database migrations
# Create a Supabase project, then run in order:
#   migration.sql, forms-migration.sql, attendance-migration.sql,
#   notifications-setup.sql, performance-indexes.sql,
#   campaigns-migration.sql, scheduled-draw-migration.sql,
#   supabase/migrations/*.sql (timestamp order)

# 5. Dev server
npm run dev          # → http://localhost:3000
```

---

## 🔐 Environment Variables

```bash
# ── Application ───────────────────────────────────
APP_URL="http://localhost:3000"
NEXT_PUBLIC_ANALYTICS_ID=""

# ── Supabase ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# ── AI Providers ─────────────────────────────────
GROQ_API_KEY="gsk_your_groq_api_key_here"     # Chatbot (Llama 4)
GEMINI_API_KEY="your_gemini_api_key_here"      # Server-side content

# ── Resend (Email) ────────────────────────────────
RESEND_API_KEY="re_your_resend_api_key"
ADMIN_EMAIL="admin@yourdomain.com"

# ── hCaptcha (use test key locally) ──────────────
NEXT_PUBLIC_HCAPTCHA_SITE_KEY="10000000-ffff-ffff-ffff-000000000001"
```

---

## 📜 Available Scripts

| Script           | Command                                                  | Purpose                 |
| ---------------- | -------------------------------------------------------- | ----------------------- |
| `dev`            | `next dev --webpack --port 3000`                         | Dev server with HMR     |
| `build`          | `next build`                                             | Production build        |
| `analyze`        | `ANALYZE=true next build`                                | Inspect bundle size     |
| `start`          | `next start`                                             | Serve production build  |
| `lint`           | `eslint . --ext .ts,.tsx,.js,.jsx`                       | Static analysis         |
| `lint:fix`       | `eslint . --ext .ts,.tsx,.js,.jsx --fix`                 | Auto-fix lint issues    |
| `format`         | `prettier --write .`                                     | Format all files        |
| `format:check`   | `prettier --check .`                                     | Verify formatting       |
| `editorconfig`   | `editorconfig-checker`                                   | Editorconfig compliance |
| `test`           | `vitest run`                                             | Unit/integration tests  |
| `test:watch`     | `vitest`                                                 | Watch mode              |
| `test:e2e`       | `playwright test --config=e2e/playwright.config.ts`      | End-to-end tests        |
| `test:e2e:ui`    | `playwright test --ui --config=e2e/playwright.config.ts` | Playwright UI debugger  |
| `generate-icons` | `node scripts/generate-icons.js`                         | Regenerate app icons    |
| `clean`          | `rm -rf .next`                                           | Wipe build artifacts    |

---

## 🌐 Routing Reference

### Public (`/`, `/{locale}/`)

| Route                 | Description                               |
| --------------------- | ----------------------------------------- |
| `/`                   | Landing page — hero, projects, AI chatbot |
| `/about`              | Company history, mission, vision, values  |
| `/blog`               | Market insights & company news            |
| `/blog/[slug]`        | Dynamic blog posts                        |
| `/careers`            | Job openings                              |
| `/contact`            | Inquiry form → Resend                     |
| `/faq`                | Data-driven FAQ accordion                 |
| `/grievance`          | Complaint submission with tracking        |
| `/leadership`         | Management team profiles                  |
| `/login`              | Client portal login                       |
| `/lottery`            | Feature-flagged lottery                   |
| `/payment`            | Online payment portal                     |
| `/privacy-policy`     | Data protection                           |
| `/projects/current`   | Ongoing developments                      |
| `/projects/completed` | Delivered projects + MapLibre GL map      |
| `/registration`       | New user registration                     |
| `/terms-conditions`   | Terms of service                          |
| `/thank-you`          | Post-submission confirmation              |

### Admin (middleware-protected)

| Route                         | Description                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `/admin`                      | Admin login                                                                           |
| `/admin/dashboard`            | Analytics, KPIs, activity timeline                                                    |
| `/admin/attendance`           | Check-in/out, reports, teams                                                          |
| `/admin/allotment-letter`     | Allotment letter PDF                                                                  |
| `/admin/allotment-records`    | Allotment records                                                                     |
| `/admin/bba`                  | Builder Buyer Agreement                                                               |
| `/admin/bba-records`          | BBA records                                                                           |
| `/admin/chat-logs`            | AI chatbot conversation history                                                       |
| `/admin/email`                | Compose, sent, templates, domains, campaigns                                          |
| `/admin/employees`            | Employee directory                                                                    |
| `/admin/lottery`              | Draw management & scheduling                                                          |
| `/admin/notifications`        | Notification center                                                                   |
| `/admin/offer-letter`         | Offer letter PDF                                                                      |
| `/admin/offer-letter-records` | Offer letter records                                                                  |
| `/admin/payment-plan`         | Payment plan PDF                                                                      |
| `/admin/payment-receipt`      | Payment receipt PDF                                                                   |
| `/admin/payment-receipts`     | Payment receipt records                                                               |
| `/admin/portal-allotments`    | Client-facing allotments                                                              |
| `/admin/properties`           | Property CRUD                                                                         |
| `/admin/registrations`        | Registration management                                                               |
| `/admin/settings`             | Profile · Company · Appearance · Notifications · Security · Email · Properties · Logs |

### Employee

| Route                    | Description                      |
| ------------------------ | -------------------------------- |
| `/employee/login`        | Staff authentication             |
| `/(employee)/attendance` | Staff check-in/out (route group) |

### API

#### Public

| Route                 | Method | Description         |
| --------------------- | ------ | ------------------- |
| `/api/chat`           | POST   | Streaming AI chat   |
| `/api/contact`        | POST   | Contact form        |
| `/api/cron`           | POST   | Scheduled tasks     |
| `/api/grievance`      | POST   | Grievance form      |
| `/api/lottery`        | GET    | Public lottery data |
| `/api/project-images` | GET    | Image serving       |
| `/api/properties`     | GET    | Public listings     |
| `/api/registration`   | POST   | User registration   |
| `/api/webhooks`       | POST   | External webhooks   |

#### Admin

| Route                                                        | Description             |
| ------------------------------------------------------------ | ----------------------- |
| `/api/admin/activities`                                      | Activity log CRUD       |
| `/api/admin/analytics`                                       | Analytics endpoints     |
| `/api/admin/attendance/{records,analytics,report,teams}/...` | Attendance suite        |
| `/api/admin/bba`                                             | BBA management          |
| `/api/admin/campaigns`                                       | Email campaigns         |
| `/api/admin/documents` (+ `[id]`)                            | Document CRUD           |
| `/api/admin/email`                                           | Email sending           |
| `/api/admin/employee`                                        | Employee endpoints      |
| `/api/admin/lottery`                                         | Draw management         |
| `/api/admin/notifications` (+ `[id]`)                        | Notification CRUD       |
| `/api/admin/properties`                                      | Property CRUD           |
| `/api/admin/registrations`                                   | Registration management |
| `/api/admin/settings`                                        | Portal settings         |
| `/api/admin/users` (+ `[id]`)                                | User CRUD               |

---

## 🧩 Component Library

### Provider hierarchy (`ClientProviders.tsx`)

```
QueryProvider              ← TanStack Query (devtools on client)
  └─ ThemeProvider         ← Light/dark/system with localStorage
       └─ AnalyticsTracker ← Vercel Analytics + Speed Insights
```

Admin layout additionally wraps children in `AdminSessionProvider`.

### Public UI primitives (`src/components/common/ui`)

| Component              | Description                             |
| ---------------------- | --------------------------------------- |
| `AnimatedSection`      | Scroll-reveal via `motion` `useInView`  |
| `BackToTop`            | Floating scroll-to-top                  |
| `Breadcrumbs`          | Auto-generated from URL path            |
| `CookieConsent`        | GDPR consent banner w/ localStorage     |
| `DynamicSkeleton`      | Loading placeholders                    |
| `ErrorBoundary`        | React error boundary + fallback         |
| `HoverZoomImage`       | CSS transform zoom on hover             |
| `LanguageToggle`       | EN / हिं switcher                       |
| `ReadingProgress`      | Top-of-page scroll indicator            |
| `ScrollToTop`          | Auto-scroll on route change             |
| `StatsCounter`         | Spring-physics count-up on scroll       |
| `ThemeToggle`          | Light/dark/system switcher              |
| `AnalyticsTracker`     | Vercel Analytics + Speed Insights mount |
| `stagger-testimonials` | Staggered motion variants               |

### Home (`src/components/home/`)

`HeroSection`, `AboutSection`, `FeaturesSection`, `ProjectsSection`, `CTASection`, `ChatBot`, `HomeFAQ`, `HomeSections` (orchestrator)

### Admin (`src/components/admin/`)

- `AdminHeader`, `AdminSidebar`, `AdminSessionProvider`
- `ActivityTimeline`, `NotificationDropdown`, `QuickActions`
- `attendance/`, `ChartComponents/`, `DocumentGenerator/`, `OfferLetter/`
- `email/` — compose, campaigns, templates, domains, settings
- `lottery/` — dashboard, history, schedule-draw, wizard, modals, hooks
- `modals/` — advisor, create-user, delete-confirm, edit-user
- `registrations/` — table, filters, detail modals, status badges
- `settings/` — Profile · Company · Appearance · Notifications · Security · Email · Logs · Properties
- `helpers/` — badge, property interest tags, property labels
- `Shared/Modal`

### Portal & lottery

- `portal/PortalSidebar` — client-portal navigation
- `lottery/LotteryClientSection`, `LotteryCTA`, `LotteryDrawSection`
- `lottery/sections/` — `CountdownBanner`, `DrawArenaModal`, `HallOfFame`, `WinnerCarousel`
- `lottery/hooks/useLotteryDraw`

### Data, hooks, lib

- `data/company_settings.json` — name, address, GST, RERA, bank
- `data/email-templates.json` — email template definitions
- `data/faq/general.ts` — FAQ content
- `lib/seo.ts` — `createMetadata()` helper
- `lib/blog.ts` — typed `BlogPost[]` with slug map
- `lib/api/{rateLimit,schemas,withAdminAuth}.ts`
- `lib/supabase/{client,admin,server,types}.ts`
- `lib/utils/{documentExporter,templateParser}.ts`
- `lib/email-templates.ts`, `lib/nearby-places.ts`, `lib/chat-context.ts`
- `stores/{authStore,uiStore}.ts` (Zustand + persist)
- `hooks/useMounted`, `hooks/useLotteryVisibility`

---

## 🗃️ Database Migrations

Run in order against a fresh Supabase project:

| File / Migration                                               | Purpose                       |
| -------------------------------------------------------------- | ----------------------------- |
| `migration.sql`                                                | Core schema (users, projects) |
| `forms-migration.sql`                                          | Form submission tables        |
| `attendance-migration.sql`                                     | Attendance tracking           |
| `notifications-setup.sql`                                      | Notifications system          |
| `performance-indexes.sql`                                      | Strategic indexes             |
| `campaigns-migration.sql`                                      | Email campaigns               |
| `scheduled-draw-migration.sql`                                 | Lottery scheduled draws       |
| `migrations/20260520120000_forms_tables.sql`                   | Forms                         |
| `migrations/20260520130000_attendance_tables.sql`              | Attendance                    |
| `migrations/20260520140000_activity_logs_check_constraint.sql` | Activity log constraint       |
| `migrations/20260520150000_fix_notifications_trigger.sql`      | Notification trigger fix      |
| `migrations/20260522130000_create_portal_settings.sql`         | Portal settings               |
| `migrations/20260528150000_create_lotteries_table.sql`         | Lottery system                |
| `migrations/20260528180000_lottery_visibility_policy.sql`      | Lottery visibility RLS        |
| `migrations/20260602100001_create_email_stars_table.sql`       | Email star/favorite           |
| `migrations/20260602100002_create_email_inbox_table.sql`       | Email inbox/threading         |
| `migrations/20260602100003_create_email_deletions_table.sql`   | Email deletion tracking       |
| `migrations/20260602100004_add_email_data_to_deletions.sql`    | Email data in deletions       |

---

## 🎨 Design System

| Token           | Choice                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| **Framework**   | Tailwind v4 with CSS variables (`@theme` block in `globals.css`)         |
| **Type**        | System font stack via `next/font` (no external font requests)            |
| **Color**       | Brand `primary` + semantic tokens; light/dark via `prefers-color-scheme` |
| **Motion**      | `motion` (Framer Motion 12) for entrances & scroll-reveal                |
| **Iconography** | `lucide-react` (1.16) — consistent stroke weight                         |
| **Spacing**     | Tailwind scale (4px base)                                                |
| **Radius**      | Tailwind `rounded-{sm,md,lg,xl,2xl,3xl,full}`                            |
| **Shadow**      | Layered `shadow-{sm,md,lg,xl}` for elevation                             |
| **Breakpoints** | Tailwind defaults — `sm` 640, `md` 768, `lg` 1024, `xl` 1280             |

### Animation catalogue

| Element          | Animation                                     |
| ---------------- | --------------------------------------------- |
| Hero section     | Fade-in + scale entrance on load              |
| Scroll reveal    | `AnimatedSection` + `useInView` upward fade   |
| Stats counter    | Spring-physics count-up                       |
| Nav hover        | Gold underline slides in from left            |
| Header           | Transparent → solid + backdrop blur on scroll |
| Theme switch     | Cross-fade light/dark                         |
| FAQ accordion    | Smooth height + opacity                       |
| Project cards    | Lift + shadow on hover                        |
| Reading progress | Top bar tracking scroll position              |
| Lottery win      | Confetti burst via `canvas-confetti`          |

---

## 🧪 Testing

- **Vitest** + **jsdom** — unit & integration
- **Playwright** — end-to-end browser tests (`e2e/`)

```
__tests__/
├── api/
│   ├── admin/           # analytics, attendance, documents, teams, users
│   ├── registration.test.ts
├── bba/
├── utils/
│   └── templateParser.test.ts
```

```bash
npm test            # all unit/integration
npm run test:watch  # watch mode
npm run test:e2e    # Playwright
npm run test:e2e:ui # interactive UI
```

---

## 🔧 Development Workflow

### Git hooks (Husky)

| Hook         | Action                                                |
| ------------ | ----------------------------------------------------- |
| `pre-commit` | `lint-staged` → ESLint fix + Prettier on staged files |
| `commit-msg` | Commitlint validates conventional commit format       |

### Commit convention

```
<type>(<scope>): <description>

feat(admin): add attendance check-in/out UI
fix(header): resolve mobile menu overflow on iOS
chore(deps): bump next to 16.2.6
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Lint-staged targets

| Glob                   | Checks                |
| ---------------------- | --------------------- |
| `*.{ts,tsx,js,jsx}`    | ESLint fix + Prettier |
| `*.{json,md,yml,yaml}` | Prettier              |

### Next.js config highlights

- React Strict Mode **on**
- Compression **on**
- Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo off)
- Image optimization: WebP/AVIF, responsive sizes, 30-day cache TTL

---

## 🚀 Deployment

### Vercel (recommended)

```bash
# One-time
vercel link

# Set env vars in Vercel project settings, then:
git push origin main    # auto-deploys via GitHub integration
```

`vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Other platforms

- **AWS** — Amplify or ECS/Fargate
- **Google Cloud Run** — wrap with a Dockerfile (`npm run build && npm run start`)
- **Azure** — Static Web Apps
- **Self-hosted** — `node` server running `npm run start`

---

## 🤝 Third-Party Integrations

| Service                   | Usage                                                   |
| ------------------------- | ------------------------------------------------------- |
| **Groq (Llama 4)**        | Streaming chatbot via Vercel AI SDK                     |
| **Google Gemini**         | Server-side content generation                          |
| **MapLibre GL**           | Open-source project location maps (no API key)          |
| **hCaptcha**              | Form spam protection on contact & registration          |
| **Resend**                | Transactional email + marketing campaigns + domain mgmt |
| **TipTap**                | Rich text editor for email composer                     |
| **Vercel Analytics**      | Privacy-friendly traffic tracking                       |
| **Vercel Speed Insights** | Real-user Core Web Vitals (LCP, INP, CLS)               |
| **Supabase Realtime**     | WebSocket updates for notifications & activity feed     |
| **ExcelJS**               | Excel parsing & export                                  |
| **Sonner**                | Toast notifications                                     |
| **canvas-confetti**       | Lottery win celebrations                                |
| **Zod**                   | API payload validation                                  |

---

## 🛠️ Troubleshooting

| Issue                      | Fix                                                                              |
| -------------------------- | -------------------------------------------------------------------------------- |
| Dev server won't start     | Node 20+; `rm -rf node_modules .next && npm install`; `npm run clean`            |
| Supabase connection errors | Verify `.env.local` keys; check project is active; review IP allowlist           |
| Auth not working           | Run **all** migrations in order; enable email/password in Supabase; set site URL |
| MapLibre not rendering     | Check browser console for CORS; verify tile CDN reachable                        |
| AI chatbot not responding  | Confirm `GROQ_API_KEY`; check Quota page on Groq                                 |
| Emails not sending         | Verify `RESEND_API_KEY`; check sender domain verification status                 |
| Lottery page not visible   | `portal_settings.lottery_page_visible` must be `true`                            |
| Build failures             | `npm run clean`; `npx tsc --noEmit`; ensure all env vars are set                 |
| Admin redirect loop        | Clear cookies; verify `profiles.role = 'admin'`; check middleware config         |
| Locale not switching       | Confirm `next-intl` config in `src/i18n/routing.ts`; clear `NEXT_LOCALE` cookie  |
| 3D scene not loading       | Check `three`/`@react-three/fiber` versions; look for WebGL errors               |

---

## 🤝 Contributing

1. Fork & branch: `git checkout -b feat/your-feature`
2. Code with TypeScript strict + tests for new behavior
3. Quality gates: `npm test && npm run lint && npm run format:check`
4. Commit conventionally: `feat(scope): description`
5. Push & open a PR

### Code style

- TypeScript strict mode, explicit types
- Prefer Server Components; use `"use client"` only for islands
- `@/` path alias for imports (e.g. `@/src/components/common/BackToTop`)
- Reusable UI → `src/components/common/`, feature UI co-located
- Page metadata via `createMetadata()` from `src/lib/seo.ts`
- Use `clsx` + `tailwind-merge` for conditional classes
- Trust Prettier's auto-sorted Tailwind class order
- Always run migrations in timestamp order

---

## 📄 License

**Private** — © 2026 SVI Infra Solutions Pvt. Ltd. All rights reserved.

Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited without prior written permission.

---

<div align="center">

[⬆ Back to top](#-svi-infra-solutions)

Made with ❤️ by the SVI Infra Solutions engineering team

</div>
