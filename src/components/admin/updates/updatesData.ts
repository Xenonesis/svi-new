import { SystemUpdateRelease, RoadmapItem } from './types';

export const SYSTEM_UPDATES: SystemUpdateRelease[] = [
  {
    id: 'rel-2026-09-24',
    date: '2026-09-24',
    formattedDate: '24 September 2026',
    version: 'v2.5.0',
    title: 'Next.js DevTools Multi-Layer Stacking & Seamless Drag Ergonomics',
    summary:
      'Resolved z-index layering conflicts across fixed footer contact badges, PWA status bars, and Cookie Consent banners, allowing unrestricted corner dragging and instant menu opening.',
    category: 'Security & Platform',
    isLatest: true,
    items: [
      {
        title: 'High-Priority DevTools Portal Stacking',
        description:
          'Elevated Next.js diagnostic portal to maximum fixed viewport layer (z-index: 2147483647), preventing pointer event interception from fixed badges, floating action buttons, and consent banners.',
        benefit:
          'Ensures the developer diagnostic menu triggers immediately on 100% of clicks without hit-test blockage.',
        tag: 'Fix',
      },
      {
        title: '4-Corner Fluid Snap & Drag Positioning',
        description:
          'Enabled unrestricted smooth dragging across all four viewport corners (top-left, top-right, bottom-left, bottom-right) to keep all workspace UI elements visible during development.',
        benefit: 'Eliminates inspection clutter and adapts to any custom layout workflow.',
        tag: 'Improvement',
      },
    ],
  },
  {
    id: 'rel-2026-09-23-b',
    date: '2026-09-23',
    formattedDate: '23 September 2026',
    version: 'v2.4.0',
    title: 'Quiet Luxury Interactions, Responsive Touch Feedback & Navigation Polish',
    summary:
      'Implemented comprehensive Quiet Luxury interaction system across public and admin interfaces: dynamic header clearance, elegant title-case typography, and 44px mobile touch ergonomics.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Dynamic Header Height Clearance & Badge Safety',
        description:
          'Equipped hero and top-level sections with CSS variable-driven dynamic top padding (calc(var(--header-height) + 2rem)), completely eliminating badge clipping and visual collision under sticky navigation.',
        benefit:
          'Flawless visual balance and luxury breathing room across all screen sizes and announcement banner states.',
        tag: 'Design & Speed',
      },
      {
        title: 'Quiet Luxury Navigation & Typography Hierarchy',
        description:
          'Transitioned loud all-caps navigation menus to refined font-medium Title Case typography, subtle lottery draw indicator pills, and sleek logo capsule branding.',
        benefit:
          'Delivers a prestigious, calm real estate brand presence matching ultra-luxury standards.',
        tag: 'Design & Speed',
      },
      {
        title: 'Tactile Mobile Dock & 44px Minimum Touch Targets',
        description:
          'Unified mobile bottom navigation dock with minimum 44px x 44px tap zones, active compression feedback, safe-area inset cushioning, and hover-protection guards on touch devices.',
        benefit:
          'Prevents accidental taps and provides instant native-like feedback for 99% mobile traffic.',
        tag: 'Improvement',
      },
      {
        title: 'Mobile Card Transformation for IVR Leads & Attendance',
        description:
          'Replaced horizontal table scrolling with responsive, high-density touch cards for IVR telephony records and employee attendance logs on smartphones.',
        benefit:
          'Field managers and sales executives can triage records effortlessly on mobile screens.',
        tag: 'New Feature',
      },
    ],
  },
  {
    id: 'rel-2026-09-23-a',
    date: '2026-09-23',
    formattedDate: '23 September 2026',
    version: 'v2.3.0',
    title: 'Executive Command Cockpit, Spotlight Search & Payment Dues Radar',
    summary:
      'Launched real-time executive cockpit analytics, spotlight command palette search, automated PDF dossier generation, and proactive Payment Dues Radar in notification center.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Payment Dues Radar & 1-Click WhatsApp Reminders',
        description:
          'Integrated intelligent Payment Dues Radar into notifications dropdown with 7-day overdue tracking, client debt summary, and direct 1-click WhatsApp payment reminder dispatch.',
        benefit:
          'Accelerates accounts receivable collections and gives instantaneous visibility into pending cash flows.',
        tag: 'New Feature',
      },
      {
        title: 'Spotlight Command Palette Search (Ctrl/Cmd + K)',
        description:
          'Universal command palette search modal across leads, plots, buyers, employees, and quick system actions with instant keyboard navigation.',
        benefit:
          'Jump to any client or administrative record in under 2 seconds without navigating menus.',
        tag: 'New Feature',
      },
      {
        title: 'Executive PDF Dossier Export & Bento KPIs',
        description:
          'One-click automated executive briefing PDF generation with authentic real-time DB aggregations, target pacing meters, and inventory pulse telemetry.',
        benefit:
          'High-level board-ready performance reports ready for immediate printing or sharing.',
        tag: 'New Feature',
      },
      {
        title: 'Enhanced Users Table with Role Segmentation Tabs',
        description:
          'Segmented user directory into dedicated Admin, Sales, Customer, and Staff tabs with distinct luxury themes, contextual status badges, and 500-user deep pagination.',
        benefit:
          'Ensures executive and administrative accounts remain visible and effortlessly manageable.',
        tag: 'Improvement',
      },
    ],
  },
  {
    id: 'rel-2026-09-22',
    date: '2026-09-22',
    formattedDate: '22 September 2026',
    version: 'v2.2.0',
    title: 'High-Concurrence Caching Architecture, Luxury Web Audio & Database Hardening',
    summary:
      'Engineered multi-layer in-memory server caching, lazy-loaded export suites, luxury Web Audio notifications, and PostgreSQL security & composite index hardening.',
    category: 'Security & Platform',
    items: [
      {
        title: 'Multi-Layer Server In-Memory Caching & RPC Acceleration',
        description:
          'Introduced 60-second in-memory server caching with mutation-triggered cache invalidation across Settings, Analytics, and Leads Hub endpoints, coupled with database RPC lead stat aggregations.',
        benefit:
          'Slashes database query load by up to 85% and eliminates page load latency across heavy management hubs.',
        tag: 'Design & Speed',
      },
      {
        title: 'Luxury Web Audio Chime Suite & Outside-Click Handling',
        description:
          'Engineered 6 distinct luxury Web Audio tones (Subtle Ping, Luxury Bell, Modern Pop, Executive Glass, Digital Soft, Minimal Tap) with live preview and persistent client selection, plus resilient outside-click closing.',
        benefit:
          'Delivers a refined sensory audio experience for incoming alerts without jarring the user.',
        tag: 'New Feature',
      },
      {
        title: 'Heavy Library Bundle Optimization (ExcelJS & jsPDF)',
        description:
          'Converted heavy document generation dependencies (exceljs, jspdf) to dynamic on-demand imports and tuned development buffer parameters.',
        benefit:
          'Reduced initial JavaScript bundle footprint and significantly boosted first-page render speeds.',
        tag: 'Design & Speed',
      },
      {
        title: 'PostgreSQL Column-Level Grants & Security Hardening',
        description:
          'Hardened database security migrations with column-level permissions, view support, non-destructive composite indexes, and cached announcement bar proxy.',
        benefit:
          'Guarantees enterprise data security while accelerating complex multi-table queries.',
        tag: 'Security',
      },
    ],
  },
  {
    id: 'rel-2026-09-21',
    date: '2026-09-21',
    formattedDate: '21 September 2026',
    version: 'v2.1.0',
    title: 'Architectural Deconstruction, Resilient AI Email Engine & Allotment Workflows',
    summary:
      'Decomposed monolithic system modules into isolated units, upgraded the AI email generation engine with strict contrast guards, and enhanced plot allotment candidate approvals.',
    category: 'Email & Marketing',
    items: [
      {
        title: 'Two-Step Resilient AI Email Compose Architecture',
        description:
          'Separated variable extraction from HTML assembly into a 2-step pipeline, eliminated ghost text contrast issues, unescaped raw entities, and hardened TipTap editor integration.',
        benefit:
          'Produces clean, perfectly formatted client emails without formatting corruption or send failures.',
        tag: 'Improvement',
      },
      {
        title: 'Monolithic Codebase Deconstruction (Vibe Audit Remediation)',
        description:
          'Refactored oversized routes and monolithic components across Email Center, IVR Leads Hub, Blog, Employee Login, and Workforce into modular hooks, subcomponents, and routers.',
        benefit:
          'Greatly increases system reliability, maintainability, and test coverage across all administrative modules.',
        tag: 'Improvement',
      },
      {
        title: 'Plot Allotments Candidate Approval & Ledger Reconciliation',
        description:
          'Added paginated candidate resolution, BSP-based deal value calculations, refund status indicators, and automated ledger sync against Excel payment statements.',
        benefit:
          'Prevents financial calculation discrepancies and streamlines candidate plot booking verifications.',
        tag: 'New Feature',
      },
      {
        title: 'Nearby Places Proxy Rate Limiting & Query Validation',
        description:
          'Implemented strict query validation and rate limiting on Google Places proxy endpoints with authentic landmark image fallbacks.',
        benefit:
          'Guards against external API abuse and ensures zero visual breakage on project showcase pages.',
        tag: 'Security',
      },
    ],
  },
  {
    id: 'rel-2026-09-16',
    date: '2026-09-16',
    formattedDate: '16 September 2026',
    version: 'v2.0.0',
    title: 'Master IVR Telephony Hub, Telecalling Suite & Vector Icon Standardization',
    summary:
      'Launched automated IVR call ingestion, smart CSV deduplication, live telecalling CRM cockpit, and standardized 100% professional vector iconography across the platform.',
    category: 'WhatsApp Sales',
    items: [
      {
        title: 'Automated IVR Telephony Ingestion & Smart Deduplication',
        description:
          'Engineered streaming CSV ingestion for telephony logs with phone number normalization, DTMF key scoring, and intelligent auto-deduplication.',
        benefit:
          'Eliminates duplicate follow-ups and captures 100% of customer inbound call records effortlessly.',
        tag: 'New Feature',
      },
      {
        title: 'Telecalling Command Center & Custom Export Studio',
        description:
          'Created dedicated telecalling telemetry dashboard with call answer ratios, top-3 advisor podium, and customizable Excel/PDF/CSV export studio.',
        benefit: 'Empowers sales directors with real-time conversion KPIs and clean audit reports.',
        tag: 'New Feature',
      },
      {
        title: 'Corporate Vector Icon Standardization (Anti-Slop Initiative)',
        description:
          'Systematically purged casual emojis across all administrative tables, PDF exports, notification chimes, and email templates, replacing them with crisp Lucide vector icons.',
        benefit:
          'Projects an authoritative, premium institutional brand standard across all touchpoints.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-08-29-b',
    date: '2026-08-29',
    formattedDate: '29 August 2026',
    version: 'v1.8.5',
    title: 'Mobile-First Responsive System, Unified Navigation & 1-Tap Action Contacts',
    summary:
      'Engineered a comprehensive mobile-first design overhaul across the entire platform, featuring unified responsive navigation, 1-tap phone calling, direct WhatsApp chatting, and adaptive touch cards.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Unified Smart Navigation & Clean Luxury Sidebar',
        description:
          'Replaced floating border buttons with a single adaptive control that acts as a mobile slide-out drawer on phones and an elegant sidebar toggle on desktop. Features a crisp gold SVI monogram emblem in collapsed mode.',
        benefit:
          'Completely eliminates visual obstruction and provides a clean, modern SaaS navigation experience.',
        tag: 'Design & Speed',
      },
      {
        title: '1-Tap Direct Action Contact Pills (Call, WhatsApp & Email)',
        description:
          'Transformed static phone numbers and emails in the user directory into interactive touch pills with instant phone dialer launch (tel:), direct WhatsApp chat opening (wa.me), and one-click clipboard copying with live toast feedback.',
        benefit:
          'Enables administrators and sales managers to contact buyers and team members in 1 second.',
        tag: 'New Feature',
      },
      {
        title: 'Adaptive Table-to-Card Mobile Interface',
        description:
          'Eliminated horizontal table scroll fatigue on mobile screens by automatically rendering high-density touch cards displaying customer profiles, roles, contact pills, and quick-action buttons.',
        benefit: 'Effortless viewing and record management on any smartphone or tablet.',
        tag: 'Improvement',
      },
      {
        title: 'Mobile Touch Ergonomics & Safe Area Optimization',
        description:
          'Implemented dynamic viewport heights (dvh), notch-safe padding (pb-safe/pt-safe), tactile active scale touch feedback, and 16px font enforcement to prevent iOS input auto-zooming.',
        benefit:
          'Delivers a native app feel in both mobile web browsers and installed Android apps.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-08-29-a',
    date: '2026-08-29',
    formattedDate: '29 August 2026',
    version: 'v1.8.0',
    title: 'Unified Workforce Directory, Live Attendance Filters & Bulk Operations',
    summary:
      'Launched bulk CSV/Excel employee onboarding, live attendance filter chips, KPI statistics strip, directory Excel export, and dual card/table layout modes.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Bulk CSV & Excel Employee Import with Templates',
        description:
          'Added bulk onboarding modal with downloadable CSV and Excel templates, drag-and-drop file upload, real-time validation preview, and single-click batch employee creation.',
        benefit: 'Onboard an entire company department of 50+ staff in under 30 seconds.',
        tag: 'New Feature',
      },
      {
        title: 'Live Attendance Filter Chips & Status Badges',
        description:
          'Interactive filter chips for Present, Late, Absent, On Leave, and Not Punched staff with live auto-refreshing attendance status badges and role pills.',
        benefit: 'Provides instant real-time visibility into workforce office presence.',
        tag: 'New Feature',
      },
      {
        title: 'Interactive KPI Metric Cards & Mini Stats Pills',
        description:
          'Top metric cards strip displaying active staff count, today attendance rate, and pending regularizations, along with individual KPI stats pills on employee cards.',
        benefit: 'Gives management immediate high-level workforce performance indicators.',
        tag: 'Improvement',
      },
      {
        title: 'Directory Excel & CSV Data Export',
        description:
          'Added 1-click full export of employee records, departments, designations, salary info, and contact details to formatted Excel and CSV spreadsheets.',
        benefit: 'Simplifies monthly HR reporting, compliance audits, and payroll exports.',
        tag: 'New Feature',
      },
      {
        title: 'Compact Table & Card Layout Switcher',
        description:
          'Dual-view mode allowing administrators to toggle between rich executive cards and a high-density tabular view with sticky headers.',
        benefit: 'Supports both quick visual scanning and dense data operations.',
        tag: 'Improvement',
      },
    ],
  },
  {
    id: 'rel-2026-08-27',
    date: '2026-08-27',
    formattedDate: '27 August 2026',
    version: 'v1.7.0',
    title: 'Dual-App Android Architecture, Biometric Quick-Punch & Offline Sync',
    summary:
      'Configured dedicated Android product flavors separating Admin and Employee apps, biometric quick-punch, offline queue with background sync, and integrated payroll engine.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Dual-App Android Architecture Configuration',
        description:
          'Configured dedicated Android product flavors separating Admin App (com.svi.infrasolutions) and Employee Workspace App (com.svi.infrasolutions.employee) with dedicated app icons and splash screens.',
        benefit: 'Keeps employee workspace workflows independent from administrative tools.',
        tag: 'New Feature',
      },
      {
        title: 'Biometric Quick-Punch & Fingerprint Verification',
        description:
          'Support for biometric authentication (fingerprint / face unlock) for fast, secure, tamper-resistant attendance punching.',
        benefit: 'Cuts attendance punch time to 1 second while preventing buddy punching.',
        tag: 'New Feature',
      },
      {
        title: 'Offline Punch Queue with Automatic Background Sync',
        description:
          'Implemented an offline-first punch queue that safely caches attendance punches during poor network conditions and automatically syncs upon reconnection.',
        benefit: 'Ensures zero missed attendance logs during network dropouts.',
        tag: 'Improvement',
      },
      {
        title: 'Comprehensive Payroll & Salary Structure Engine',
        description:
          'Integrated salary setup drawer with base pay, HRA, special allowances, PF, ESIC, professional tax deductions, and automated monthly payslip generation.',
        benefit: 'Full end-to-end statutory payroll calculations inside the Workforce hub.',
        tag: 'New Feature',
      },
      {
        title: 'Unified Workforce HR Hub Consolidation',
        description:
          'Consolidated separate Employee, Attendance, and Payroll pages into a single high-performance Workforce Hub with seamless sub-tab navigation.',
        benefit: 'Streamlines daily HR operations into a single cohesive interface.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-08-26',
    date: '2026-08-26',
    formattedDate: '26 August 2026',
    version: 'v1.6.5',
    title: 'Employee Leads CRM, Site Visit Tracking & Digital Staff ID Card',
    summary:
      'Introduced lead assignment tracking for sales staff, GPS geofenced site visits, and digital employee ID cards with QR code verification.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Employee Lead Management & Follow-Up Tracker',
        description:
          'Sales executives can manage assigned customer leads, record interaction notes, schedule follow-ups, and update lead status directly from their mobile portal.',
        benefit: 'Increases sales follow-up velocity and prevents lead leakage.',
        tag: 'New Feature',
      },
      {
        title: 'On-Site GPS Geofenced Check-In',
        description:
          'Field staff can log location-verified check-ins during on-site customer property tours and site visits.',
        benefit: 'Provides accurate timestamped records of customer property viewings.',
        tag: 'New Feature',
      },
      {
        title: 'Digital Employee ID Card with QR Verification',
        description:
          'Official digital identity card in employee portal featuring employee photo, designation, official corporate email, and scannable verification QR code.',
        benefit:
          'Professional digital staff identity for field sales executives and site engineers.',
        tag: 'New Feature',
      },
    ],
  },
  {
    id: 'rel-2026-08-20',
    date: '2026-08-20',
    formattedDate: '20 August 2026',
    version: 'v1.6.0',
    title: 'Luxury Corporate Email Branding & AI Speed Engine',
    summary:
      'Launched official SVI Infra luxury corporate email templates, high-speed AI letter generator with live timing, and flexible blank-mode editing.',
    category: 'Email & Marketing',
    items: [
      {
        title: 'Official SVI Luxury Corporate Email Templates',
        description:
          'All outbound emails and AI-composed drafts now automatically use the official gold-and-navy executive template with high-resolution company branding, structured tables, and gold action buttons.',
        benefit: 'Creates a polished, premium brand impression on high-value property buyers.',
        tag: 'New Feature',
      },
      {
        title: 'Live AI Stopwatch & Instant Generation',
        description:
          'When generating an email with AI, the system now displays a real-time live timer showing exact generation speed (typically 2 to 3 seconds).',
        benefit: 'Provides transparent progress and confirms lightning-fast generation.',
        tag: 'Improvement',
      },
      {
        title: 'Template Deselect & Blank Mode Option',
        description:
          'Added a clear "Deselect Template" button and "None (Blank Editor)" option in the template selector dropdown so staff can easily switch between branded templates and standard plain messages.',
        benefit: 'Gives full flexibility to write custom quick notes without extra formatting.',
        tag: 'New Feature',
      },
      {
        title: 'Crystal Clear Email Previews (Mobile & Desktop)',
        description:
          'Upgraded the preview window to show exact desktop and mobile screen layouts without dark-mode color distortions or background color leakage.',
        benefit: 'Ensures what you see in the editor is exactly what clients see on their phones.',
        tag: 'Fix',
      },
      {
        title: 'System Performance & Speed Optimization',
        description:
          'Decomposed large administrative pages into lightweight modular components, reducing page weight and speeding up load times across all dashboards.',
        benefit: 'Snappy page switching with zero lag during daily office operations.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-08-16',
    date: '2026-08-16',
    formattedDate: '16 August 2026',
    version: 'v1.5.0',
    title: 'WhatsApp Sales Operations Center & Automated Takeover',
    summary:
      'Introduced a unified WhatsApp management portal connecting inbound client inquiries directly to AI assistance and sales staff.',
    category: 'WhatsApp Sales',
    items: [
      {
        title: 'Centralized WhatsApp Sales Inbox',
        description:
          'Sales staff can now view all incoming customer WhatsApp conversations from a single dashboard, with clear indicators of buyer interest and preferred properties.',
        benefit: 'Ensures no client inquiry goes missed or delayed.',
        tag: 'New Feature',
      },
      {
        title: '1-Click Agent Takeover & AI Handoff',
        description:
          'Staff can take over any active AI conversation with one click to send personalized messages, and hand back control to AI whenever needed.',
        benefit: 'Seamless balance between instant automated replies and personal human touch.',
        tag: 'New Feature',
      },
      {
        title: 'Customer Consent & Opt-Out Guard',
        description:
          'Built-in compliance checking prevents unwanted automated messages to clients who requested opt-out, maintaining high sender reputation.',
        benefit: 'Protects business reputation and avoids WhatsApp phone number penalties.',
        tag: 'Improvement',
      },
      {
        title: 'Direct Site Visit Scheduling',
        description:
          'Clients requesting site visits via WhatsApp are immediately highlighted with their requested date and project name in the side panel.',
        benefit: 'Accelerates lead-to-site-visit conversions for sales executives.',
        tag: 'New Feature',
      },
    ],
  },
  {
    id: 'rel-2026-08-12',
    date: '2026-08-12',
    formattedDate: '12 August 2026',
    version: 'v1.4.5',
    title: 'Visual Assets Refresh & Mobile Navigation Polish',
    summary:
      'High-resolution branding assets update, mobile header navigation improvements, and real-time error monitoring.',
    category: 'Security & Platform',
    items: [
      {
        title: 'High-Definition Company Logos & App Icons',
        description:
          'Updated all app icons, browser tab favicons, and corporate header crests to crystal-clear high-definition vector assets.',
        benefit: 'Crisp, professional appearance across all desktop monitors and mobile devices.',
        tag: 'Design & Speed',
      },
      {
        title: 'Mobile Header Touch Improvements',
        description:
          'Refined mobile header sticky behavior and touch responsiveness for smoother scrolling and effortless menu navigation on phones.',
        benefit: 'Smooth mobile browsing experience for on-the-go clients.',
        tag: 'Improvement',
      },
      {
        title: 'Proactive Error Logging & Monitoring',
        description:
          'Implemented 24/7 background error monitoring to detect and resolve any rare website issues before they affect end users.',
        benefit: 'Maintains uninterrupted platform availability and zero customer downtime.',
        tag: 'Security',
      },
    ],
  },
  {
    id: 'rel-2026-08-10',
    date: '2026-08-10',
    formattedDate: '10 August 2026',
    version: 'v1.4.0',
    title: 'Bilingual Legal Document Engine (English & Hindi)',
    summary:
      'Complete bilingual generation for Allotment Letters, Builder-Buyer Agreements (BBA), Offer Letters, and Quotations.',
    category: 'Documents & Legal',
    items: [
      {
        title: 'Bilingual Builder-Buyer Agreement (BBA)',
        description:
          'Full legal agreement generation with court-compliant wording available in both Hindi (भारतीय कानूनी प्रारूप) and English with automatic payment milestone schedules.',
        benefit: 'Reduces legal drafting time from hours to under 30 seconds.',
        tag: 'New Feature',
      },
      {
        title: '1-Click High-Quality PDF & Image Export',
        description:
          'All generated documents can be exported as print-ready PDF files or high-definition images with official company seals and signature spaces.',
        benefit: 'Instant delivery to buyers via email or printed for in-person handovers.',
        tag: 'Improvement',
      },
      {
        title: 'Digital Allotment & Offer Letter Records',
        description:
          'Searchable central archive of all issued customer allotment letters with complete revision history and customer contact details.',
        benefit: 'Eliminates lost paperwork and simplifies record auditing.',
        tag: 'Improvement',
      },
      {
        title: 'Ultra-Fast Data Compression Engine',
        description:
          'Enabled high-speed data compression across all administrative records, making large record lists open 3x faster.',
        benefit: 'Instant loading of extensive customer lists even on mobile data connections.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-08-08',
    date: '2026-08-08',
    formattedDate: '08 August 2026',
    version: 'v1.3.0',
    title: 'Telecaller Performance Targets & Offer Letter Terms',
    summary:
      'Added customizable monthly meeting targets for telecallers, refined sales performance clauses, and accelerated admin sign-in.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Customizable Monthly Meeting Targets for Telecallers',
        description:
          'Managers can set and track monthly client meeting targets for calling staff with live progress indicators.',
        benefit: 'Motivates telecalling team and provides clear visibility on daily targets.',
        tag: 'New Feature',
      },
      {
        title: 'Flexible Offer Letter Clauses & Relocation Terms',
        description:
          'Customizable employee performance clauses and office location relocation terms configurable per job role directly from the offer letter creator.',
        benefit: 'Tailored HR agreements matching specific sales and operations roles.',
        tag: 'Improvement',
      },
      {
        title: 'Accelerated Admin Dashboard Sign-In',
        description:
          'Streamlined authentication flow to eliminate login delays and give instant access to administrative tools.',
        benefit: 'Staff gets straight to work without waiting for dashboard loads.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-08-04',
    date: '2026-08-04',
    formattedDate: '04 August 2026',
    version: 'v1.2.5',
    title: 'Interactive Broker Commission & Exclusive Offers Suite',
    summary:
      'Launched modern broker engagement tools with real-time payout calculators and clear tier-based reward schedules.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Interactive Commission Calculator',
        description:
          'Brokers can adjust plot sizes and estimated sales values to immediately see their exact commission payout in Indian Rupees (INR).',
        benefit: 'Builds trust and transparency with external channel partners and brokers.',
        tag: 'New Feature',
      },
      {
        title: 'Direct WhatsApp Commission Claiming',
        description:
          'Pre-fills a customized WhatsApp message with plot dimensions and estimated payout when a broker clicks to claim their reward.',
        benefit: 'Shortens partner onboarding time and increases deal closing speed.',
        tag: 'Improvement',
      },
      {
        title: 'Shivani Vatika 11th Digital Township Showcase',
        description:
          'Launched interactive digital presentation showcasing project highlights, proximity to Khatu Shyam Ji / RIICO, and flexible 1 to 2-year no-cost EMI plans.',
        benefit: 'Empowers sales reps to present high-converting visuals on tablets or phones.',
        tag: 'New Feature',
      },
    ],
  },
  {
    id: 'rel-2026-08-01',
    date: '2026-08-01',
    formattedDate: '01 August 2026',
    version: 'v1.2.0',
    title: 'System Security Hardening & Calculator Enhancements',
    summary:
      'Comprehensive database permission lockdown, encryption upgrade, and accurate EMI calculation algorithms.',
    category: 'Security & Platform',
    items: [
      {
        title: 'High-Level Data Permission Security',
        description:
          'Secured all customer contact inquiries, grievances, and document records behind encrypted administrative verification.',
        benefit: '100% protection of client contact data from unauthorized external access.',
        tag: 'Security',
      },
      {
        title: 'Accurate Home Loan & EMI Estimator',
        description:
          'Updated the client-facing loan calculation engine with exact interest rate compounding and flexible loan tenures.',
        benefit: 'Gives prospective land buyers precise monthly financial estimates.',
        tag: 'Improvement',
      },
      {
        title: 'Fluid Theme & Bilingual Language Switcher',
        description:
          'Instant 1-click toggling between Hindi and English with full dark mode / light mode memory across all browser tabs.',
        benefit: 'Personalized reading comfort for both English and Hindi-speaking customers.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-07-28',
    date: '2026-07-28',
    formattedDate: '28 July 2026',
    version: 'v1.1.0',
    title: 'Transparent Lottery & Lucky Draw Engine',
    summary:
      'Automated plot lottery system for fair, randomized customer giveaways and special promotional events.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Admin Lottery Creation Wizard',
        description:
          'Step-by-step manager to create new property lottery events, set eligibility dates, and allocate giveaway plot numbers.',
        benefit: 'Enables marketing team to run high-engagement customer campaigns easily.',
        tag: 'New Feature',
      },
      {
        title: 'Live Draw & Winner Verification',
        description:
          'Visual randomizer that transparently draws winning ticket numbers with immediate SMS/WhatsApp status confirmation.',
        benefit: 'Ensures 100% fairness and builds unmatched customer trust.',
        tag: 'New Feature',
      },
      {
        title: 'Automated Token Number Generation',
        description:
          'Registered participants automatically receive unique verified tokens with instant receipt generation.',
        benefit: 'Smooth event management without physical token printing bottlenecks.',
        tag: 'Improvement',
      },
    ],
  },
  {
    id: 'rel-2026-07-12',
    date: '2026-07-12',
    formattedDate: '12 July 2026',
    version: 'v1.0.0',
    title: 'Official Production Release: SVI Platform v1.0.0',
    summary:
      'Official milestone release locking in production routing stability, internationalization architecture, and core customer dashboards.',
    category: 'Security & Platform',
    items: [
      {
        title: 'Production Infrastructure & Unified Routing',
        description:
          'Hardened all website routing and multi-language handling to deliver flawless, instant page transitions without redirect overhead.',
        benefit: 'Rock-solid stability for all visitor traffic and online inquiries.',
        tag: 'Improvement',
      },
      {
        title: 'Admin Command & Control Architecture',
        description:
          'Unified the 30+ admin operational views under a single authenticated dashboard with real-time sync.',
        benefit: 'Central point of management for all company operations.',
        tag: 'New Feature',
      },
    ],
  },
  {
    id: 'rel-2026-05-28',
    date: '2026-05-28',
    formattedDate: '28 May 2026',
    version: 'v0.9.8',
    title: 'Email Center Hub & Smart Payment Scanner',
    summary:
      'Introduced central administrative email management and 3D acrylic UPI payment scanner modal.',
    category: 'Email & Marketing',
    items: [
      {
        title: 'Dedicated Admin Email Center',
        description:
          'Full-featured email client with inbox, sent history, drafts auto-save, trash recovery, and contact groups.',
        benefit: 'Streamlines all corporate email correspondence directly within the admin portal.',
        tag: 'New Feature',
      },
      {
        title: 'Official Bank Details & 3D UPI Payment Scanner',
        description:
          'Interactive payment modal with official IDBI bank accounts and scan-and-pay UPI QR code for direct application booking fees.',
        benefit: 'Simplifies instant token payments for land plot bookings.',
        tag: 'New Feature',
      },
    ],
  },
  {
    id: 'rel-2026-05-19',
    date: '2026-05-19',
    formattedDate: '19 May 2026',
    version: 'v0.9.5',
    title: 'Document Generator & Staff Attendance Management',
    summary:
      'Automated generation of official payment receipts with amount-to-words conversion and staff attendance logging.',
    category: 'Documents & Legal',
    items: [
      {
        title: 'Instant Payment Receipts with Number-to-Words',
        description:
          'Generates official receipts with automatic conversion of numerical Rupees to words (e.g. ₹5,00,000 -> Five Lakh Rupees Only).',
        benefit: 'Prevents manual human calculation mistakes on customer payment receipts.',
        tag: 'New Feature',
      },
      {
        title: 'Staff Daily Attendance Management',
        description:
          'Interactive attendance tracker with team-level analytics, monthly summaries, and punctuality monitoring.',
        benefit: 'Eliminates paper registers and simplifies payroll review.',
        tag: 'New Feature',
      },
      {
        title: 'Progressive Web App (PWA) Offline Access',
        description:
          'Installed progressive web app support allowing staff to install the portal onto phone home screens for offline viewing.',
        benefit: 'Quick 1-tap mobile launch just like a native mobile app.',
        tag: 'Improvement',
      },
    ],
  },
  {
    id: 'rel-2026-05-15',
    date: '2026-05-15',
    formattedDate: '15 May 2026',
    version: 'v0.9.0',
    title: 'Foundation Launch: SVI Infra Solutions Corporate Platform',
    summary:
      'Inaugural launch of the next-generation bilingual real estate portal, customer inquiry system, and admin control suite.',
    category: 'Security & Platform',
    items: [
      {
        title: 'Next-Generation Bilingual Portal (Hindi & English)',
        description:
          'Comprehensive real estate website showcasing ongoing & completed projects (Shivani Vatika, Shyam Aangan) with bilingual content.',
        benefit: 'Broadens audience reach across Rajasthan, Delhi-NCR, and North India.',
        tag: 'New Feature',
      },
      {
        title: 'Interactive Leadership Hierarchy Chart',
        description:
          'Executive presentation of company founders Mr. Illas Ali and Mr. Vinod Kumar with interactive company structure.',
        benefit: 'Builds strong investor confidence and corporate credibility.',
        tag: 'New Feature',
      },
      {
        title: '24/7 AI Chatbot & Lead Capture',
        description:
          'Smart bilingual assistant that greets website visitors, answers project queries, and securely captures phone numbers.',
        benefit: 'Captures hot buyer leads 24/7 even after office hours.',
        tag: 'New Feature',
      },
    ],
  },
];

export const UPCOMING_ROADMAP: RoadmapItem[] = [
  {
    title: 'Automated WhatsApp Campaign Broadcasts',
    targetQuarter: 'Q4 2026',
    category: 'WhatsApp Sales',
    description:
      'Schedule bulk personalized WhatsApp updates to pre-qualified buyer lists with image brochures and direct callback options.',
    status: 'In Development',
  },
  {
    title: 'Client Portal 3D Site Navigation',
    targetQuarter: 'Q4 2026',
    category: 'Staff & Operations',
    description:
      'Interactive 3D plot map where buyers can check sold vs. available plots in real time with sun-orientation indicators.',
    status: 'In Development',
  },
  {
    title: 'Smart Payment Installment Reminders',
    targetQuarter: 'Q4 2026',
    category: 'Documents & Legal',
    description:
      'Automated gentle SMS and email reminders sent 7 days before plot installment due dates with direct online payment links.',
    status: 'Testing',
  },
  {
    title: 'Advanced Sales Executive Performance Analytics',
    targetQuarter: 'Q1 2027',
    category: 'Staff & Operations',
    description:
      'Visual breakdown of site visits completed, conversion ratios, and average closing times per team member.',
    status: 'Planned',
  },
];
