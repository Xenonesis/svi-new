# Technology Stack

## Core Framework

- **Next.js (16.2.12):** App Router, SSR, ISR, API routes
- **React (19.2.8):** UI library
- **TypeScript (6.0.3):** Strict mode, type safety
- **Tailwind CSS (4.3.3):** Utility-first styling
- **Turbopack / Webpack:** Bundling
- **Node.js (22.x):** Backend runtime (utilizes native `node:zlib` and Web `CompressionStream` for API response compression)

## Data & State

- **Supabase JS (2.110.8):** Database client, auth, admin functions, realtime subscriptions
- **Supabase SSR (0.12.3):** Server-side auth cookies
- **TanStack React Query (5.101.4):** Server state, caching, mutations
- **TanStack React Table (8.21.3):** Data tables, sorting, filtering
- **Zustand (5.0.14):** Client state (auth, UI)
- **Zod (4.4.3):** Schema validation

## UI & Animation

- **Motion (framer-motion 12.42.2):** Page transitions, micro-interactions
- **Lucide React (1.27.0):** Icon library
- **Radix UI:** Dialog, DropdownMenu, Tooltip
- **Sonner (2.0.7):** Toast notifications
- **clsx + tailwind-merge:** Conditional class merging

## AI & Communication

- **Vercel AI SDK (7.0.37):** Chatbot integration
- **@ai-sdk/groq (4.0.13):** LLM provider for fast inference
- **@google/genai (2.4.0):** Server-side content generation
- **Resend (6.18.0):** Transactional and marketing email API
- **Meta WhatsApp Cloud API:** Direct server-side provider integration with signed webhooks, mock-send mode, test allowlist, approved templates, and durable cron processing
- **TipTap (3.29.1):** Rich text email editor

## Maps, Charts & Media

- **MapLibre GL (5.24.0):** Property location maps
- **Recharts (3.10.1):** Admin dashboard charts
- **canvas-confetti (1.9.4):** Lottery draw celebration
- **html2canvas-pro & jsPDF:** PDF generation and screenshots
- **exceljs:** Excel data exports

## PWA & Infrastructure

- **Service Worker / PWA:** Serwist (9.5.12), Web Push API, Background Sync
- **Infrastructure:** Vercel (Hosting, Edge, Cron), Supabase (Postgres Database, Auth, Storage)
- **Monitoring:** Sentry (10.68.0)
- **Native Android (Capacitor 8.5.0):** Dual-App Multi-Flavor architecture utilizing Gradle product flavors (`admin` -> `com.svi.infrasolutions` "SVI Admin", `employee` -> `com.svi.infrasolutions.employee` "SVI Workspace"), dynamic target switching via `CAP_APP_TARGET` in `capacitor.config.ts`, standalone flavor configs (`capacitor.admin.config.ts`, `capacitor.employee.config.ts`), and dedicated npm build/sync scripts (`cap:admin:*`, `cap:employee:*`)
- **Biometrics & Hardware Auth:** WebAuthn / Passkey API for biometric fingerprint and facial recognition authentication
- **Offline Storage & Resilience:** LocalStorage / IndexedDB queue for offline attendance punch caching and automatic background resynchronization
- **Testing:** Playwright (E2E), Vitest (Unit)
- **Code Intelligence & Graph Analysis:** GitNexus (1.6.10) — local LadybugDB knowledge graph indexing AST symbols, execution flows, call chains, and blast radius impact analysis
- **Code Quality:** Husky, lint-staged, commitlint, ESLint, Prettier
