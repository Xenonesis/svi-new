# Design Specification: Mobile Conversion Dock & Interactive Master Plan

**Date:** 2026-10-06  
**Status:** Approved by User  
**Target Architecture:** Next.js 15 (App Router, bilingual `next-intl`), Tailwind CSS v4, Framer Motion, Supabase  
**Author:** AI Assistant & SVI Infra Engineering

---

## 1. Executive Summary & Problem Statement

Plotted township real estate in India (specifically the Jaipur, Phulera, and Khatu Shyam Ji corridors) requires high-trust, low-friction digital buyer experiences:

1. **85%+ Mobile Traffic with High Friction:** Buyers discovering SVI Infra townships via Meta Ads, Google Ads, or WhatsApp campaigns currently land on mobile pages where contact channels are buried behind long scrolls or competing floating widgets (`SiteVisitPill`, `ChatLauncher`, `FloatingContact`), leading to high bounce rates.
2. **Missing Township Plot Transparency:** On the project detail page for _Shivani Vatika 11th_, buyers cannot see which specific plots are available, their exact dimensions (80, 100, 150 Sq. Yds.), facing, or pricing estimates. Allotment data exists only in the admin ERP (`allotments` table), leaving public buyers without an interactive layout exploration tool.

This design delivers two focused, decoupled subsystems to solve these problems:

- **Subsystem 1:** A sleek, mobile-only sticky bottom conversion dock (`MobileConversionDock`) with an integrated 1-click "Book Free Site Visit (Free AC Cab)" slide-up bottom sheet modal.
- **Subsystem 2:** An interactive master plan & live plot availability grid (`ShivaniVatika11MasterPlan`) featuring a dual-view experience (interactive blueprint visual + searchable/filterable plot matrix) with real-time Supabase allotment synchronization and 1-click WhatsApp plot reservations.

---

## 2. Subsystem 1: Mobile Bottom Sticky Conversion Dock & Site Visit Engine

### 2.1 Architectural Placement & Viewport Boundaries

- **Target Surface:** Rendered exclusively on mobile viewports (`< 768px`, using `md:hidden`). On desktop screens (`>= 768px`), the component is unmounted or hidden (`display: none`), preserving desktop layout integrity.
- **Positioning & Safe Areas:**
  - CSS: `fixed bottom-0 left-0 right-0 z-40 bg-[#080b11]/95 backdrop-blur-xl border-t border-[#d4af37]/20`
  - Safe Area Inset: `padding-bottom: max(12px, env(safe-area-inset-bottom, 12px))` to ensure physical home bars on iOS and Android devices never obscure touch targets.
- **Consolidation & Anti-Clutter Rule:**
  - Deprecate mobile rendering of duplicate floating buttons (`SiteVisitPill` on mobile) so the dock is the single authoritative mobile conversion surface.
  - Desktop floating widgets (`ChatLauncher`, desktop WhatsApp pill) remain active above `md:`.

### 2.2 Three-Pillar Action Dock Specification

The dock distributes touch targets across a 3-button flex layout with a minimum touch height of 52px (exceeding WCAG 44px standards):

1. **Pillar 1: Call Advisor (`flex-1`)**
   - **Label & Icon:** Phone icon + "Call Advisor" (HI: "कॉल करें")
   - **Action:** Deep link `tel:+919218300589`
   - **Analytics:** Fires `trackContact('call_advisor_dock')`
2. **Pillar 2: WhatsApp Brochure (`flex-1`)**
   - **Label & Icon:** WhatsApp brand icon + "Brochure" (HI: "ब्रोशर")
   - **Action:** Deep link `https://wa.me/919218300589?text=...` with context-aware pre-fill:
     - On project pages: _"Namaste SVI Infra, please send me the official brochure and price list for [Project Title]."_
     - On generic pages: _"Namaste SVI Infra, please send me the brochure and available plot details."_
   - **Analytics:** Fires `trackContact('whatsapp_brochure_dock')`
3. **Pillar 3: Free Site Visit (`flex-1.2`, Luxury Warm Gold Accent)**
   - **Styling:** Elevated solid Warm Gold button (`bg-[#d4af37] text-[#080b11] font-bold shadow-lg shadow-[#d4af37]/20`)
   - **Label & Icon:** Car / Calendar icon + "Free Cab Visit" (HI: "फ्री कैब विजिट")
   - **Action:** Opens the `SiteVisitModal` bottom sheet.

### 2.3 Frictionless "Book Free Site Visit (Free AC Cab)" Bottom Sheet Modal

- **Trigger:** Initiated from Pillar 3 or directly from Plot Detail Drawers.
- **Form Fields (Zero Friction - 3 Required Fields):**
  1. `fullName`: Text input, minimum 2 characters.
  2. `phone`: Tel input, strictly validated against 10-digit Indian mobile format (`^[6-9]\d{9}$`).
  3. `visitDate`: Date picker defaulting to tomorrow, minimum selectable date: today.
  4. `pickupCity`: Dropdown selection (Jaipur / Ringas / Sikar / Delhi-NCR / Other).
  5. `prefilledPlot`: Optional hidden or displayed badge if invoked from a specific plot (e.g., "Visiting Plot #32").
- **Lead Submission & Pipeline Integration:**
  - Endpoint: `POST /api/site-visit`
  - Payload:
    ```json
    {
      "name": "Ramesh Kumar",
      "phone": "9876543210",
      "project": "Shivani Vatika 11th",
      "visit_date": "2026-10-08",
      "pickup_location": "Jaipur",
      "notes": "Booked via Mobile Conversion Dock. Free AC Cab requested. Interested in Plot #32."
    }
    ```
  - Database Storage: Inserts into Supabase `chat_leads` with `lead_score: 'hot'`, `status: 'New'`, and automated Telecalling CRM assignment.
- **Feedback & Success Stage:**
  - Instant modal transition to confirmation screen with gold shield icon, booking reference, and direct 1-tap WhatsApp link to dispatch team.

---

## 3. Subsystem 2: Interactive Master Plan & Live Plot Layout Grid

### 3.1 Township Asset Foundation & Layout Structure

- **Asset Ground Truth:** Derived from approved society master blueprint `public/Shivani Vatika 11/SA 11 TH  FINAL MAP.pdf` and `master-plan-layout.webp`.
- **Project Scope:** _Shivani Vatika 11th_ at Harsoli Stand, Jaipur to Khatu Shyam Ji Road, Tehsil Kishangarh Renwal.
- **Total Demarcated Units:** **230 Units**
  - **Main Residential Sector (Plots 1 to 198):** Including numbered sequence with variants (`1A`–`9A`, `110A`, `144A`, `147A`, `148A`) and compound plots (`94,95`, `120,121`, `170,171`, `172,173`, `174,175`).
  - **A-Block Sector (Plots A-1 to A-50):** 50 premium units clustered near central green boulevard (100–250 sq. yds.).
  - **Commercial Highway Strip (Shops 1 to 12):** 12 frontage retail plots along the 160'-0" wide Khatu Shyam Ji highway corridor.
- **Road Margins:** 160'-0" Highway Frontage, 40'-0" Main Boulevard entrance, 30'-0" Internal Paver Avenues.

### 3.2 Dual-View Layout Component Architecture

Mounted on `/projects/shivani-vatika-11th` under a dedicated section `ShivaniVatika11MasterPlan.tsx`:

```
┌──────────────────────────────────────────────────────────────────┐
│ Header: Interactive Master Plan & Live Availability             │
│ Subtitle: Explore 230 demarcated residential & commercial units  │
├──────────────────────────────────────────────────────────────────┤
│ Mode Toggle: [ 🗺️ Blueprint View ] | [ 📋 Plot Grid Matrix (230) ]│
├──────────────────────────────────────────────────────────────────┤
│ Filter Bar (Grid Mode):                                          │
│ [Block: All | Res | A-Block | Shops] [Size: All | 80 | 100 | 150+]│
│ [Status: All | 🟢 Available | 🔴 Booked | 🟡 Reserved] [Search #] │
├──────────────────────────────────────────────────────────────────┤
│ Main Canvas Area:                                                │
│ - View A: Zoomable SVG / Blueprint with clickable hotspots       │
│ - View B: 230-Item Responsive Plot Card Matrix (Chunked/Virtual) │
├──────────────────────────────────────────────────────────────────┤
│ Slide-Over Drawer: PlotDetailDrawer (Specs + WhatsApp + Free Cab)│
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 Plot Data Model & Normalization (`shivaniVatika11Plots.ts`)

```typescript
export type PlotBlock = 'Residential' | 'A-Block' | 'Commercial';
export type PlotStatus = 'AVAILABLE' | 'BOOKED' | 'RESERVED';

export interface PlotData {
  plotNo: string; // e.g., "32", "A-15", "Shop-4"
  block: PlotBlock;
  sizeSqYd: number; // e.g., 50, 60, 64, 80, 100, 144, 200, 250
  dimensions: string; // e.g., "20'-0\" x 36'-0\""
  facing: 'East' | 'North' | 'West' | 'South' | 'Park Facing' | 'Corner' | 'Highway';
  roadWidth: string; // "160 Ft Highway" | "40 Ft Main Spine" | "30 Ft Internal"
  status: PlotStatus; // Default based on baseline dataset, hydrated by Supabase
  priceEstimate?: number; // e.g., sizeSqYd * 7500
}
```

### 3.4 Live Database Synchronization Bridge

- **Supabase Query:**
  ```typescript
  const { data: allotments } = await supabase
    .from('allotments')
    .select('unit_no, status')
    .eq('property_id', 'e154bd4e-eecb-4dc0-ac44-b017cb61a6f0');
  ```
- **Unit Matching & Normalization Rules:**
  - Strip prefix strings (`Plot`, `Unit`, `#`, spaces).
  - Handle compound strings: `'126+127'` or `'94,95'` maps to both individual plots `126` and `127`.
  - Status Mapping:
    - `'Allotted'` / `'Registered'` ➔ `BOOKED` (🔴 Red)
    - `'Pending'` ➔ `RESERVED` (🟡 Amber)
    - Unmatched ➔ `AVAILABLE` (🟢 Green)
- **Resilience:** If network fails or user is offline, the component renders the baseline 230-plot dataset without breaking layout or blocking user interaction.

### 3.5 Plot Detail Slide-Over Drawer (`PlotDetailDrawer.tsx`)

Clicking any plot card or blueprint hotspot triggers an accessible slide-over sheet:

1. **Plot Header:** Large badge `Plot #32` with Block tag and live status indicator.
2. **Dimension Table:**
   - Plot Area: `80.00 Sq. Yds.` (approx. `720 Sq. Ft.` / `80 Gaj`)
   - Dimensions: `20'-0" x 36'-0"`
   - Road Width: `30 Ft Interlocking Paver Road`
   - Facing: `Park Facing / East`
3. **Transparent Price & Token Breakdown:**
   - Base Deal Value Estimate: `₹6,00,000` (at ₹7,500/sq.yd)
   - Booking Token: `₹21,000` minimal reservation
   - Installment Option: `24-Month Milestone Plan Available`
4. **Action 1: 1-Click WhatsApp Reservation**
   - Deep link: `https://wa.me/919218300589?text=Namaste%20SVI%20Infra,%20I%20want%20to%20reserve%20Plot%20%2332%20(80%20Sq.Yds)%20in%20Shivani%20Vatika%2011th.%20Please%20share%20allotment%20process.`
5. **Action 2: Free Site Visit for This Plot**
   - Launches `SiteVisitModal` with `Plot #32` automatically pre-selected.

---

## 4. File Structure & Component Boundaries

```
src/
├── components/
│   ├── layout/
│   │   ├── MobileConversionDock.tsx        # Global mobile sticky bar (<768px)
│   │   └── SiteVisitModal.tsx              # Frictionless 3-field AC Cab booking modal
│   └── projects/
│       └── shivani-vatika-11/
│           ├── ShivaniVatika11MasterPlan.tsx # Master container with view toggles
│           ├── BlueprintMapView.tsx          # Zoomable interactive blueprint view
│           ├── PlotMatrixGrid.tsx            # Filterable 230-plot card matrix
│           ├── PlotCard.tsx                  # Individual plot card component
│           └── PlotDetailDrawer.tsx          # Slide-over plot specs & actions
├── data/
│   └── shivaniVatika11Plots.ts              # Complete 230-plot dataset & normalizer
└── lib/
    └── hooks/
        └── useLivePlotStatus.ts             # Supabase allotments sync hook
```

---

## 5. Error Handling & Edge Cases

| Scenario                            | Risk                                                    | Mitigation                                                                                                                |
| :---------------------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------ |
| **iOS / Android Home Bar Overlap**  | Floating dock covers or gets covered by system gestures | Explicit `pb-[max(12px,env(safe-area-inset-bottom))]` applied to dock wrapper.                                            |
| **Supabase Query Delay or Failure** | Master plan hangs waiting for network query             | Initial render uses static baseline plot dataset immediately; Supabase hook updates state non-blockingly upon resolution. |
| **Compound Plot Strings in DB**     | DB has `'126+127'` which fails simple equality check    | Regex normalizer splits compound strings (`+`, `,`, `&`) and updates all constituent plot records.                        |
| **Invalid Mobile Phone Input**      | Bad leads submitted to Telecalling CRM                  | Client-side strict 10-digit Indian phone regex validation (`^[6-9]\d{9}$`) before submitting.                             |
| **Multiple Modal Collisions**       | Site visit modal opens over mobile dock                 | Modal renders with `z-50` backdrop, locking body scroll; dock remains at `z-40`.                                          |

---

## 6. Verification & Testing Plan

1. **Unit & Integration Tests (Vitest + React Testing Library):**
   - `__tests__/components/layout/MobileConversionDock.test.tsx`:
     - Verifies 3 action buttons render with correct `tel:`, `wa.me:`, and modal triggers.
     - Confirms hiding on desktop viewport.
   - `__tests__/components/layout/SiteVisitModal.test.tsx`:
     - Tests Indian mobile number validation (rejects invalid, accepts 10 digits).
     - Verifies API call dispatch and success screen.
   - `__tests__/data/shivaniVatika11Plots.test.ts`:
     - Verifies total plot count equals 230.
     - Tests unit number normalization across compound strings (`'126+127'`, `'Plot #32'`).
   - `__tests__/components/projects/PlotMatrixGrid.test.tsx`:
     - Tests block, size, status, and search filters.
2. **End-to-End TypeScript Validation:**
   - Run `npx tsc --noEmit` to ensure zero type errors across new interfaces.
3. **Browser Smoke Verification:**
   - Launch real headless browser to verify mobile dock layout, drawer slide-over animation, and responsive plot grid scrolling.
