# Project Overview

**SVI Infra Solutions** is a modern, bilingual real estate platform and administrative portal.

## Key Statistics

- **Source files:** ~591 TS/TSX files
- **Page routes:** 59 (22 public, 31+ admin & employee)
- **API routes:** 68 REST endpoints
- **React components:** 285+
- **DB migrations:** 52
- **Locales:** English & Hindi (951+ translation keys)

## Core Features

1. **Public Site (Bilingual):** Hero, features, project listings, calculators, FAQ, chatbot, and lottery/giveaway system. Includes property pages, portals, and registration forms.
2. **Admin Dashboard:** A robust 31-page admin panel managing all aspects of the business:
   - **Records Management:** Allotment letters, Builder-Buyer Agreements (BBA), offer letters.
   - **Email Center:** Full email client with AI compose, templates, drafts, campaigns, and contact groups.
   - **Lottery System:** Admin wizard to schedule and run property lotteries.
   - **Unified Workforce & HR Hub:** Centralized enterprise console (`/admin/workforce`) consolidating Employee Directory & Performance, Live Attendance Radar & Master Timesheets, Leave & Regularization Approvals, Attendance-linked Monthly Payroll, and HR Settings with seamless backward-compatible redirects from legacy routes (`/admin/employees`, `/admin/attendance`, `/admin/payroll`).
   - **Careers:** Job postings and recruitment management.
   - **Settings & Config:** 9-tab settings panel for platform config.
3. **PWA Support:** Installable, offline-capable (via Service Worker), and supports push notifications.
4. **Document Generation:** Produces PDF documents (allotment letters, offer letters, BBA) in both English and Hindi.
5. **AI Integration:** Chatbot lead capture (Groq/Vercel AI) and smart email composing.
6. **WhatsApp Sales MVP:** Official Meta Cloud API integration code for inbound assistance, project-level matching, consent and opt-out enforcement, requested site visits, human takeover, durable retries, and a protected admin inbox. Production sending remains disabled until account-owner setup is complete.
7. **SVI Workspace Mobile App (Employee Portal):** A dedicated, standalone Android mobile application (`com.svi.infrasolutions.employee` / "SVI Workspace") and mobile-first PWA alongside the SVI Admin App:
   - **Live Radar Punch Terminal:** Geofenced attendance tracking with real-time GPS proximity validation against configured office boundaries.
   - **Offline Punch Queue & Auto-Sync:** Zero-data-loss punch submission queue storing punches locally during offline periods or network drops, automatically syncing to the server upon reconnection with visual queue badges.
   - **Biometric Quick-Punch:** WebAuthn / Passkey integration allowing fast, secure biometric punch-in via device fingerprint, Face ID, or system biometrics with an easy settings toggle.
   - **Field & Sales Operations:** On-site GPS check-in for customer property site visits (calculating real-time distance to the development site) and 1-tap direct phone calls (`tel:`) and WhatsApp chats (`wa.me`) for assigned leads with automatic activity logging.
   - **Work & Compensation Center:** Mobile task boards, leave application portal, and transparent compensation breakdowns with gated payslip PDF downloads.
