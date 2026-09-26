# Project Overview

**SVI Infra Solutions** is a modern, bilingual real estate platform and administrative portal.

## Key Statistics

- **Source files:** ~620 TS/TSX files
- **Page routes:** 67+ (including new commercial AEO corridor hubs & buyer guides)
- **API routes:** 69 REST endpoints (including programmatic IndexNow real-time search engine pinging)
- **React components:** 290+
- **DB migrations:** 52
- **Locales:** English & Hindi (951+ translation keys)

## Core Features

1. **Public Site (Bilingual):** Hero, features, project listings, calculators, FAQ, chatbot, lottery/giveaway system, comprehensive high-intent commercial landing corridors (`/plots-in-jaipur`, `/plots-for-sale-near-khatu-shyam-ji`, `/plots-for-sale-in-phulera`, `/plots-near-renwal-railway-station`, `/plots-in-jaipur-under-20-lakhs`), and 29+ in-depth AEO buyer guides & topical authority articles with complete structured JSON-LD schemas.
2. **Admin Dashboard:** A robust 31-page admin panel managing all aspects of the business:
   - **Records Management:** Allotment letters, Builder-Buyer Agreements (BBA), offer letters.
   - **Portal Allotments & Financial Ledgers:** Complete allotment tracking (`/admin/portal-allotments`) with live Sales Revenue KPI metrics (Booked Revenue, Collected Revenue, Receivables, Realization Rate), per-client financial ledgers & payment statement drawers with database-persisted agreed deal values and automatic rate per sq. yard calculations, and master overall ledger overview (`ReceiptLedgersModal`).
   - **Email Center:** Full email client with AI compose, templates, drafts, campaigns, and contact groups.
   - **Lottery System:** Admin wizard to schedule and run property lotteries.
   - **Unified Workforce & HR Hub:** Centralized enterprise console (`/admin/workforce`) consolidating Employee Directory & Performance, Inbound Chat Leads Pipeline (`?tab=leads`), Live Attendance Radar & Master Timesheets, Leave & Regularization Approvals, Attendance-linked Monthly Payroll, and HR Settings with seamless backward-compatible redirects from legacy routes (`/admin/employees`, `/admin/attendance`, `/admin/payroll`).
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
8. **Master Leads Hub & Telephony IVR Engine (`/admin/leads`):** Unified multi-channel sales command center consolidating high-throughput IVR campaign ingestion (supporting multi-thousand-row dialer CDR reports with under 100ms streaming parse), granular `ivr_call_records` storage, automatic advisor matching (Shivam Yadav, Shikha Tomar, Khushi Pal, Manish Sharma), prominent Answered vs Not Answered call tracking, duration meter bars, and automated Hot/Warm/Cold lead scoring. Upgraded with an end-to-end **Real Estate CRM Suite**:
   - **Follow-up Scheduler & Callback Reminders:** Time-stamped callback scheduling with proactive overdue/due-today status badges.
   - **1-Click WhatsApp Quick Templates:** Direct wa.me integration with pre-drafted Hindi/English messages for Shivani Vatika Brochure & Google Map Pin, Free Site Visit Invitations (AC Cab), and Plot Sizes & Price Lists.
   - **Slide-Over Lead Profile & Activity Timeline Drawer (`LeadDrawer`):** Non-intrusive drawer with real estate pipeline stage stepper (`New` -> `Contacted` -> `Visit Scheduled` -> `Visited` -> `Negotiation` -> `Booked`), customer info, note logging, and reverse-chronological interaction feed.
   - **Site Visit Booking Engine:** Interactive appointment booking linking customer leads with development projects and transport logistics.
   - **Bulk Actions & Client CSV Exporter:** Multi-select table checkboxes with a floating bottom action dock for instant bulk advisor reassignment, bulk stage changes, and client-side formatted CSV downloads.
   - **Advisor Telecalling Performance & Leaderboard Banner (`LeaderboardCard`):** Real-time analytics banner tracking handled outbound volume, connected call rates, total talk time, hot leads generated, and advisor conversion rankings.
   - **Dedicated Telecalling & Conversion Command Center Dashboard (`/admin/leads/dashboard` & `?tab=dashboard`):** 100% functional live performance dashboard with executive KPI meters (Total calls handled, talk time hours, connection efficiency %, hot leads count), interactive time range filters (All Time, Today, 7 Days, 30 Days), multi-page batch aggregation across 8,000+ dialer CDR records, campaign breakdowns, and a full advisor leaderboard with 1-click filtered leads navigation, direct WhatsApp/phone actions, and CSV export.
