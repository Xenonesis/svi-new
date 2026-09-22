# Executive Real Estate Command Cockpit — Admin Dashboard Architecture & Design Spec

- **Date**: 2026-09-23
- **Scope**: Complete transformation of `/admin/dashboard` into an Executive Real Estate Cockpit
- **Target Audience**: System Administrators, Managing Directors, Sales & Operations Leadership
- **Design Language**: Vedic Obsidian Slate (`#06090e`, `#0a0e17`) + Royal Warm Champagne Gold (`#d4af37`, `#f3e7c4`) + Frosted Glass Surfaces (`backdrop-blur-xl`, `border-white/[0.08]`)

---

## 1. Executive Summary & Purpose

The existing `/admin/dashboard` currently provides only user-account level metrics (total users, clients, employees, admins) alongside basic charts and a user list. For a high-velocity real estate enterprise (Shrinathji Vedic India), leadership requires immediate visibility into revenue flow, hot sales leads, plot inventory velocity, pending approvals, and workforce attendance.

This specification defines the architecture, visual system, data pipelines, and interaction models for an **Executive Real Estate Command Cockpit** featuring 8 key capabilities:

1. **AI Daily Executive Briefing Banner**: Actionable daily briefing summarizing key wins, revenue, and urgent actions.
2. **4-Pillar Executive Bento KPIs**: Live financial collections, hot leads pipeline, plot inventory progress, and workforce on-duty metrics with 7-day sparklines.
3. **Monthly Target vs Achievement Meter**: Real-time sales pacing indicator comparing current collections against monthly targets.
4. **Interactive Multi-Domain Analytics Hub**: Tabbed Recharts visualizations (Revenue & Cash Flow, Lead Funnel Velocity, System Activity).
5. **Inventory & Plot Allotment Pulse**: Project-wise booked vs reserved vs available inventory status with dynamic project selector.
6. **Urgent Attention Radar (Executive Triage)**: Direct inline actions for unverified payment receipts, hot callback leads, and pending employee leave approvals.
7. **Upcoming Payment Dues & Milestone Radar**: Highlighting imminent and overdue customer installments with 1-click notification trigger.
8. **Command Palette (`Ctrl + K` / `Cmd + K`)**: Global spotlight modal for keyboard-driven instant search across Users, Leads, Allotments, and Receipts.
9. **One-Click Executive PDF Briefing Export**: High-fidelity branded daily executive dossier export for leadership meetings.

---

## 2. Information Architecture & Layout Grid

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP COMMAND BAR: Page Title, Date Range Selector (Today | 7D | 30D | YTD), Quick Action Bar, [Ctrl+K]  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. AI EXECUTIVE BRIEFING BANNER (Smart Day Overview, Key Wins, & 2-Line Action Focus)                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. EXECUTIVE 4-PILLAR BENTO GRID:                                                                      │
│   [💰 Total Collections & Cashflow]  [🎯 Active Leads & Hot Pipeline]                                  │
│   [🏗️ Project Inventory Booked]     [👥 Workforce On-Duty Today]                                      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. TARGET PACING & INVENTORY DUAL COCKPIT (50/50 Split):                                               │
│   - Column A: Monthly Revenue Target vs Achievement Pacing Meter                                       │
│   - Column B: Interactive Plot Inventory & Phase Pulse (Selector by Property)                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. INTERACTIVE ANALYTICS & TELECALLING PULSE:                                                          │
│   - Left (2/3): Tabbed Charts [Revenue Velocity | Lead Funnel | Document Output]                       │
│   - Right (1/3): Live Telecalling & IVR Ticker + Quick Action Grid                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. OPERATIONAL TRIAGE RADAR (2 Columns):                                                               │
│   - Column A: Urgent Attention Radar (Unverified Receipts, Hot Callbacks, Leave Approvals)             │
│   - Column B: Payment Dues & Upcoming Installments (Due in 7 Days, Overdue Alerts)                     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 6. AUTHORIZED ACCOUNTS & WORKFORCE MANAGEMENT:                                                         │
│   - Modernized User Management Table (Search, Filter by Role, Status Toggle, Actions)                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Architecture

All new modular components will live in `src/components/admin/dashboard/executive/`:

### 3.1. `ExecutiveBriefingBanner.tsx`

- **Purpose**: Welcomes the admin with time-aware salutation and delivers a concise 2-sentence executive summary.
- **Data Source**: Aggregated from `useExecutiveSummary()` hook.
- **UI Details**:
  - Obsidian glass container with a subtle oscillating gold ambient glow.
  - Sparkle icon in warm gold.
  - Fast bullet metrics: Total collections today, hot leads waiting for callback, on-duty team percentage.
  - "Download Executive PDF" button at top-right with PDF icon.

### 3.2. `ExecutiveBentoKpis.tsx`

- **Pillar 1: Gross Collections (₹ INR)**
  - Value: Formatted Indian currency (e.g., `₹ 48.60 L`).
  - Subtext: Compared to previous 30-day window (`+14.2%`).
  - Mini Sparkline: 7-day collections bar/area.
- **Pillar 2: Sales Pipeline & Hot Leads**
  - Value: Active leads count + Hot triage badge.
  - Subtext: Conversion rate from IVR/Chatbot.
  - Mini Sparkline: Daily new lead acquisition volume.
- **Pillar 3: Plot Allotment & Inventory Sold**
  - Value: Cumulative booked plots / total plots (e.g., `86 / 120 Units`).
  - Subtext: Percentage occupancy (`71.6% Sold Out`).
  - Mini Sparkline: Monthly booking momentum.
- **Pillar 4: Workforce On-Duty**
  - Value: Present employees / Total employees (e.g., `24 / 28 Present`).
  - Subtext: On-time vs Late vs Leave breakdown.
  - Live pulse indicator (Green ping animation).

### 3.3. `TargetAchievementMeter.tsx`

- **Purpose**: Visual feedback on company revenue target vs current actuals for the calendar month.
- **Inputs**: Monthly Target (configurable or default ₹50,00,000) and Month-to-date collections.
- **UI Details**:
  - Luxury radial gauge or linear segmented gold progress bar.
  - Projected end-of-month achievement calculation based on daily run rate.
  - Pacing status: _"Ahead of Target"_ (Emerald) or _"Need ₹X/day to bridge gap"_ (Amber).

### 3.4. `InventoryPulseWidget.tsx`

- **Purpose**: Gives real estate inventory breakdown per property without navigating away.
- **Data Source**: `properties` table + `documents` (filtered by `document_type = 'allotment_letter'`).
- **Features**:
  - Property Dropdown selector (e.g. _Shreeji Valley - Phase 1_, _Phase 2_, _Vedic Greens_).
  - Visual stacked breakdown: Booked (Gold), Reserved (Amber), Available (Emerald).
  - Quick action: "Generate Allotment Letter" pre-linked with selected project.

### 3.5. `UrgentAttentionRadar.tsx`

- **Purpose**: One-stop actionable triage station for items blocking business operations.
- **Sections**:
  1. **Unverified Payment Receipts**: Recent receipts awaiting admin sign-off with 1-click "Verify & Send Receipt" or "View Details".
  2. **Hot Leads Pending Callback**: High-temperature leads uncontacted for > 24 hours with 1-click "Assign Telecaller" modal.
  3. **Pending Leave Requests**: Staff leave applications awaiting decision with inline "Approve" / "Reject" triggers.
- **Empty State**: Elegant champagne shield icon with _"All Clear — No urgent bottlenecks pending."_

### 3.6. `PaymentDuesRadar.tsx`

- **Purpose**: Proactively protects cashflow by tracking client installments.
- **Features**:
  - Filter toggle: _Due in 7 Days_ vs _Overdue_.
  - Client Name, Plot Number, Amount Due, Due Date.
  - Action: "Send Reminder" (triggers WhatsApp/SMS notification preview).

### 3.7. `CommandPaletteModal.tsx` (`Ctrl + K` / `Cmd + K`)

- **Trigger**: Global hotkey listener or clicking the Search pill in header.
- **Search Scope**:
  - Client Profiles & Contacts (by name, phone, email).
  - Allotment Letters (by document ID, plot number, client name).
  - Payment Receipts (by receipt number, transaction ID).
  - Quick Navigation routes (`/admin/workforce`, `/admin/leads`, `/admin/settings`, etc.).
- **Keyboard Navigation**: Arrow keys to navigate, `Enter` to open, `Escape` to dismiss.

### 3.8. `ExecutivePdfExport.ts`

- **Implementation**: Lazy-loaded `await import('jspdf')` with canvas generation.
- **Content**:
  - Shrinathji Vedic India official gold logo and letterhead.
  - Date stamp & Generated By signature.
  - Executive KPI summary table (Collections, Lead Velocity, Inventory, Staff).
  - Top 5 critical pending action items.
  - Monthly pacing projection.

---

## 4. Data Fetching & Performance Strategy

1. **Unified Endpoint `/api/admin/dashboard/executive`**:
   - Single aggregated GET route returning:
     - `kpis`: revenue, leads count, inventory counts, attendance stats.
     - `target`: current target, pacing percentage, projected total.
     - `urgentActions`: unverified receipts, hot unassigned leads, pending leaves.
     - `paymentDues`: upcoming/overdue installments.
     - `revenueTrend`: 30-day daily collections dataset for the chart.
   - **In-Memory Cache**: 60-second TTL in-memory cache to prevent database hammering during multi-admin concurrent viewing.
   - **Cache Invalidation**: Automatically invalidated upon receipt creation or lead status change.

2. **React Query Integration**:
   - Query Key: `['admin', 'executive', timeframe]`
   - `staleTime`: 45 seconds.
   - Background re-fetch on window refocus.

3. **Zero Heavy Imports on Initial Render**:
   - Chart components dynamic with `ssr: false`.
   - PDF exporter dynamically imported only when user clicks "Export PDF".

---

## 5. Security & Permission Constraints

- Route guarded by `verifyAdmin(request)`. Non-admin sessions receive HTTP 401 Unauthorized.
- Sensitive financial metrics and contact info masked or sanitized for non-admin viewers.
- Zero DB schema changes: queries will read strictly from existing tables (`documents`, `profiles`, `chat_leads`, `attendance_records`, `properties`).

---

## 6. Implementation Stages (For writing-plans)

- **Stage 1**: Backend API Aggregator (`/api/admin/dashboard/executive`) & Cache.
- **Stage 2**: Command Palette Component (`CommandPaletteModal.tsx`).
- **Stage 3**: Executive KPIs Bento & Target Achievement Pacing Meter.
- **Stage 4**: Urgent Attention Radar & Payment Dues Radar.
- **Stage 5**: Inventory Pulse Widget & Executive Briefing Banner.
- **Stage 6**: Executive PDF Generator (`ExecutivePdfExport.ts`).
- **Stage 7**: Integration into `app/admin/dashboard/page.tsx` & End-to-End Verification.
