# Refactor Big Pages into Focused Modular Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the remaining monolithic pages (>300 lines) across the public site and admin portal into focused, single-responsibility components and headless hooks without breaking any user-facing or backend functionality, and delete all unused imports and unreferenced files.

**Architecture:** Decompose monolithic Next.js pages into clean presentational UI primitives, domain-specific subcomponents, and headless React hooks. Extract inline JSON-LD schemas, KPI cards, complex multi-tier layouts, and modal orchestrations into isolated modules within `src/components/` and `src/hooks/`. Each `page.tsx` file is reduced to a concise, declarative coordinator (typically under 70–85 lines).

**Tech Stack:** Next.js 16 (App Router / RSC / Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion (Framer Motion), Supabase, TanStack Query, Sonner, Vitest, Testing Library.

**Spec:** User prompt: "plan to Refactor big pages into smaller focused components without breaking any functionality. Make sure to delete any unused imports or files after the operation is done."

---

## Global Constraints

- **Zero Functional Regression**: All existing form states, real-time sync listeners, Supabase DB mutations, download exports, and navigation pathways must behave identically.
- **Brand Standards**: Maintain official SVI corporate branding (`/logo.png`), clean Lucide vector icons, and corporate color palette (Gold `#d98b40` / `#D4AF37`, Navy `#003366`, Slate).
- **TypeScript Strictness**: `npx tsc --noEmit` must pass with 0 errors after every single task.
- **Test Integrity**: All Vitest test suites must pass at every verification checkpoint.
- **Dead Code Cleanup**: Delete unreferenced files, remove orphaned imports, and prune unused local variables/functions immediately after refactoring each page.
- **Impact Analysis**: Run GitNexus impact analysis before modifying any shared symbol.

---

## Task Breakdown

### Task 1: Refactor `app/[locale]/(main)/leadership/page.tsx` (352 lines → ~60 lines)

**Target:** Extract the Person JSON-LD schema, hero section, expandable multi-level hierarchy cards, and CTA section from `leadership/page.tsx` into modular components under `src/components/leadership/`.

**Files:**

- Create: `src/components/leadership/LeadershipSchema.tsx`
- Create: `src/components/leadership/LeadershipHero.tsx`
- Create: `src/components/leadership/LeadershipHierarchy.tsx`
- Create: `src/components/leadership/LeadershipCTA.tsx`
- Create: `__tests__/components/leadership/LeadershipSchema.test.tsx`
- Modify: `app/[locale]/(main)/leadership/page.tsx`

**Interfaces:**

- Produces `LeadershipSchema`:
  ```tsx
  export interface LeadershipMember {
    name: string;
    role: string;
    bio?: string;
  }
  export function LeadershipSchema({
    directors,
  }: {
    directors: LeadershipMember[];
  }): React.JSX.Element;
  ```
- Produces `LeadershipHero`:
  ```tsx
  export function LeadershipHero(): React.JSX.Element;
  ```
- Produces `LeadershipHierarchy`:
  ```tsx
  export interface HierarchyData {
    directors: Array<{ name: string; role: string; bio: string }>;
    areaManagers: Array<{ name: string; role: string }>;
    hrManager: { name: string; role: string };
    teamLead: { name: string; role: string };
    staff: Array<{ role: string }>;
  }
  export function LeadershipHierarchy({
    hierarchy,
  }: {
    hierarchy: HierarchyData;
  }): React.JSX.Element;
  ```
- Produces `LeadershipCTA`:

  ```tsx
  export function LeadershipCTA(): React.JSX.Element;
  ```

- [ ] **Step 1: Write the unit test for `LeadershipSchema`**

Create `__tests__/components/leadership/LeadershipSchema.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { LeadershipSchema } from '@/src/components/leadership/LeadershipSchema';

describe('LeadershipSchema', () => {
  it('renders valid application/ld+json script for directors', () => {
    const directors = [
      { name: 'Iliyas Ali', role: 'Managing Director', bio: 'Visionary leader' },
      { name: 'Vinod Kumar', role: 'Executive Director', bio: 'Operations specialist' },
    ];
    const { container } = render(<LeadershipSchema directors={directors} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent || '{}');
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph']).toHaveLength(2);
    expect(parsed['@graph'][0].name).toBe('Iliyas Ali');
    expect(parsed['@graph'][1].name).toBe('Vinod Kumar');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/leadership/LeadershipSchema.test.tsx`
Expected: FAIL (`LeadershipSchema` module not found).

- [ ] **Step 3: Implement leadership subcomponents**

1. Create `src/components/leadership/LeadershipSchema.tsx`:
   - Renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />`.
2. Create `src/components/leadership/LeadershipHero.tsx`:
   - Renders the Navy hero banner with badge `SVI INFRA LEADERSHIP`, gold gradient title, and subtitle.
3. Create `src/components/leadership/LeadershipHierarchy.tsx`:
   - Contains state `maxVisibleLevel`, `getNextLevelName`, and the 5 hierarchy levels:
     - Level 1: Board of Directors
     - Level 2: Area Managers
     - Level 3: HR Department
     - Level 4: Sales Team Lead
     - Level 5: On-Ground Field Staff
   - Includes the "Explore / Collapse Structure" toggle button with icons.
4. Create `src/components/leadership/LeadershipCTA.tsx`:
   - Renders "Join Our Growing Team" card with Careers and Contact links.

- [ ] **Step 4: Refactor `app/[locale]/(main)/leadership/page.tsx`**

Replace the 352-line implementation with:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import LeadershipFAQ from '@/src/components/faq/AboutFAQ';
import { LeadershipSchema } from '@/src/components/leadership/LeadershipSchema';
import { LeadershipHero } from '@/src/components/leadership/LeadershipHero';
import { LeadershipHierarchy } from '@/src/components/leadership/LeadershipHierarchy';
import { LeadershipCTA } from '@/src/components/leadership/LeadershipCTA';

export default function Leadership() {
  const t = useTranslations('pages.leadership');

  const hierarchy = {
    directors: [
      {
        name: t('data.iliyasAli.name'),
        role: t('data.iliyasAli.role'),
        bio: t('data.iliyasAli.bio'),
      },
      {
        name: t('data.vinodKumar.name'),
        role: t('data.vinodKumar.role'),
        bio: t('data.vinodKumar.bio'),
      },
    ],
    areaManagers: [
      {
        name: t('data.radheShyam.name'),
        role: t('data.radheShyam.role'),
      },
      {
        name: t('data.kailash.name'),
        role: t('data.kailash.role'),
      },
    ],
    hrManager: {
      name: t('data.hrManager.name'),
      role: t('data.hrManager.role'),
    },
    teamLead: {
      name: t('data.teamLead.name'),
      role: t('data.teamLead.role'),
    },
    staff: [
      { role: t('data.bde.role') },
      { role: t('data.bdm.role') },
      { role: t('data.telecaller.role') },
    ],
  };

  return (
    <div className="page-transition min-h-screen bg-gray-50 pt-20 pb-16 dark:bg-gray-900">
      <LeadershipSchema directors={hierarchy.directors} />
      <LeadershipHero />
      <LeadershipHierarchy hierarchy={hierarchy} />
      <LeadershipCTA />
      <LeadershipFAQ />
    </div>
  );
}
```

Delete all unused imports from `app/[locale]/(main)/leadership/page.tsx`.

- [ ] **Step 5: Run tests and typecheck**

Run: `npx tsc --noEmit && npx vitest run __tests__/components/leadership/LeadershipSchema.test.tsx`
Expected: PASS with 0 errors.

---

### Task 2: Refactor `app/[locale]/(main)/contact/page.tsx` (330 lines → ~70 lines)

**Target:** Decompose the contact page into `ContactSchema.tsx`, `ContactHero.tsx`, and `ContactInfoSection.tsx` (with the live IST `isOfficeOpen()` calculation).

**Files:**

- Create: `src/components/contact/ContactSchema.tsx`
- Create: `src/components/contact/ContactHero.tsx`
- Create: `src/components/contact/ContactInfoSection.tsx`
- Create: `__tests__/components/contact/ContactInfoSection.test.tsx`
- Modify: `app/[locale]/(main)/contact/page.tsx`

**Interfaces:**

- Produces `ContactSchema`:
  ```tsx
  export function ContactSchema(): React.JSX.Element;
  ```
- Produces `ContactHero`:
  ```tsx
  export function ContactHero({
    title,
    subtitle,
    badge,
  }: {
    title: string;
    subtitle: string;
    badge: string;
  }): React.JSX.Element;
  ```
- Produces `ContactInfoSection`:

  ```tsx
  export function ContactInfoSection(): React.JSX.Element;
  ```

- [ ] **Step 1: Write the unit test for `ContactSchema` and `ContactInfoSection`**

Create `__tests__/components/contact/ContactInfoSection.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ContactSchema } from '@/src/components/contact/ContactSchema';
import { ContactInfoSection } from '@/src/components/contact/ContactInfoSection';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      'info.address.title': 'Corporate Office',
      'info.address.line1': 'Block E-220, 2nd Floor',
      'info.address.line2': 'Sector 63, Noida, UP 201309',
      'info.phone.title': 'Call Us',
      'info.email.title': 'Email Us',
      'info.hours.title': 'Working Hours',
      'info.hours.weekdays': 'Mon - Fri: 9:00 AM - 7:00 PM',
      'info.hours.saturday': 'Saturday: 9:00 AM - 5:00 PM',
      'info.hours.sunday': 'Sunday: 10:00 AM - 4:00 PM',
      'info.hours.open': 'Office Open Now',
      'info.hours.closed': 'Closed Now',
    };
    return messages[key] || key;
  },
}));

describe('Contact Components', () => {
  it('renders RealEstateAgent JSON-LD schema', () => {
    const { container } = render(<ContactSchema />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent || '{}');
    expect(data['@type']).toBe('RealEstateAgent');
    expect(data.telephone).toBe('+91-73000-07643');
  });

  it('renders Corporate Office address and phone cards', () => {
    render(<ContactInfoSection />);
    expect(screen.getByText('Corporate Office')).toBeDefined();
    expect(screen.getByText('Call Us')).toBeDefined();
    expect(screen.getByText('+91-73000-07643')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/contact/ContactInfoSection.test.tsx`
Expected: FAIL (`ContactSchema` / `ContactInfoSection` not found).

- [ ] **Step 3: Implement contact subcomponents**

1. Create `src/components/contact/ContactSchema.tsx`:
   - Renders `<script type="application/ld+json">` with `localBusinessJsonLd` metadata.
2. Create `src/components/contact/ContactHero.tsx`:
   - Renders the contact hero title, subtitle, and badge with gold gradients.
3. Create `src/components/contact/ContactInfoSection.tsx`:
   - Encapsulates `isOfficeOpen()` IST timezone helper.
   - Renders 4 primary info cards (Office Address, Phone, Email, Working Hours with live open/closed pill).
   - Renders 3 direct-connect action cards (Sales Enquiry, Careers & HR, WhatsApp Support).

- [ ] **Step 4: Refactor `app/[locale]/(main)/contact/page.tsx`**

Replace monolithic page layout with:

```tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import ContactMapWrapper from '@/src/components/contact/ContactMapWrapper';
import { ContactSchema } from '@/src/components/contact/ContactSchema';
import { ContactHero } from '@/src/components/contact/ContactHero';
import { ContactInfoSection } from '@/src/components/contact/ContactInfoSection';

const ContactFAQ = dynamic(() => import('@/src/components/faq/ContactFAQ'), {
  loading: () => (
    <div className="py-16 text-center">
      <div className="mx-auto h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  ),
});

const ContactForm = dynamic(() => import('@/src/components/contact/ContactForm'), {
  loading: () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto mb-6 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  ),
});

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  return createMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/contact',
    keywords: [
      'contact SVI Infra',
      'real estate Noida office',
      'Jaipur township enquiry',
      'property consultation',
    ],
  });
}

export default async function Contact(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return (
    <div className="page-transition min-h-screen bg-gray-50 pt-20 pb-16 dark:bg-gray-900">
      <ContactSchema />
      <ContactHero badge={t('hero.badge')} title={t('hero.title')} subtitle={t('hero.subtitle')} />

      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <ContactInfoSection />

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <ContactForm />
          </div>
          <div>
            <Suspense
              fallback={
                <div className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              }
            >
              <ContactFAQ />
            </Suspense>
          </div>
        </div>

        <div className="mt-16">
          <ContactMapWrapper />
        </div>
      </div>
    </div>
  );
}
```

Delete unused icons (`MapPin`, `PhoneIcon`, `Mail`, `Clock`, `ArrowUpRight`) and all unused constants from `app/[locale]/(main)/contact/page.tsx`.

- [ ] **Step 5: Run tests and typecheck**

Run: `npx tsc --noEmit && npx vitest run __tests__/components/contact/ContactInfoSection.test.tsx`
Expected: PASS with 0 errors.

---

### Task 3: Refactor `app/[locale]/(main)/admin/portal-allotments/page.tsx` (410 lines → ~85 lines)

**Target:** Extract the financial stats overview grid, tab bar, candidates view, and active allotments table view into modular components under `src/components/admin/portal-allotments/`.

**Files:**

- Create: `src/components/admin/portal-allotments/PortalAllotmentsHeader.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentsStatsGrid.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentsTabsNav.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentsPendingView.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentsActiveView.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentsModalsContainer.tsx`
- Create: `__tests__/components/admin/portal-allotments/PortalAllotmentsStatsGrid.test.tsx`
- Modify: `app/[locale]/(main)/admin/portal-allotments/page.tsx`

**Interfaces:**

- Produces `PortalAllotmentsStatsGrid`:
  ```tsx
  export interface SalesRevenueStats {
    totalSalesRevenue: number;
    totalRevenueCollected: number;
    totalBalanceDue: number;
    realizationRate: number;
    activeAccountsCount: number;
  }
  export function PortalAllotmentsStatsGrid({
    stats,
    onOpenLedgersModal,
  }: {
    stats: SalesRevenueStats;
    onOpenLedgersModal: () => void;
  }): React.JSX.Element;
  ```
- Produces `PortalAllotmentsModalsContainer`:

  ```tsx
  export function PortalAllotmentsModalsContainer(
    props: PortalAllotmentsModalsProps
  ): React.JSX.Element;
  ```

- [ ] **Step 1: Write the unit test for `PortalAllotmentsStatsGrid`**

Create `__tests__/components/admin/portal-allotments/PortalAllotmentsStatsGrid.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PortalAllotmentsStatsGrid } from '@/src/components/admin/portal-allotments/PortalAllotmentsStatsGrid';

describe('PortalAllotmentsStatsGrid', () => {
  it('renders all 4 financial KPI values and triggers ledger modal', () => {
    const onOpen = vi.fn();
    const stats = {
      totalSalesRevenue: 15000000,
      totalRevenueCollected: 12000000,
      totalBalanceDue: 3000000,
      realizationRate: 80,
      activeAccountsCount: 24,
    };
    render(<PortalAllotmentsStatsGrid stats={stats} onOpenLedgersModal={onOpen} />);
    expect(screen.getByText('Total Sales Revenue')).toBeDefined();
    expect(screen.getByText('Collected Revenue')).toBeDefined();
    expect(screen.getByText('Pending Receivables')).toBeDefined();
    expect(screen.getByText('80%')).toBeDefined();

    const ledgerBtn = screen.getByText('Master Ledger Overview');
    fireEvent.click(ledgerBtn);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/admin/portal-allotments/PortalAllotmentsStatsGrid.test.tsx`
Expected: FAIL (`PortalAllotmentsStatsGrid` not found).

- [ ] **Step 3: Implement portal allotments subcomponents**

1. Create `PortalAllotmentsHeader.tsx`:
   - Contains Title, Subtitle, Overall Ledger badge button, Approve All button (when candidates exist), and "Add Allotment" button.
2. Create `PortalAllotmentsStatsGrid.tsx`:
   - Renders the 4 KPI cards (Total Sales Revenue, Collected Revenue, Pending Receivables, Realization Rate with progress bar & Master Ledger button).
3. Create `PortalAllotmentsTabsNav.tsx`:
   - Renders tab triggers for "Pending Approvals" (with count badge) and "Active Allotments".
4. Create `PortalAllotmentsPendingView.tsx`:
   - Renders search input and list of `PortalAllotmentPendingCard` with approve actions, or clean empty state.
5. Create `PortalAllotmentsActiveView.tsx`:
   - Renders search bar, table header, table body rows (`PortalAllotmentTableRow`), and empty state.
6. Create `PortalAllotmentsModalsContainer.tsx`:
   - Encapsulates `PortalAllotmentFormModal`, `PortalAllotmentScheduleDrawer`, `ReceiptViewModal`, `ReceiptWhatsAppModal`, `ReceiptLedgerDrawer`, `ReceiptLedgersModal`.

- [ ] **Step 4: Refactor `app/[locale]/(main)/admin/portal-allotments/page.tsx`**

Integrate the newly created components with `usePortalAllotmentsAdmin()`.
Delete all unreferenced imports (`CheckCircle2`, `Clock`, `Loader2`, `ShieldCheck`, `TrendingUp`, `Wallet`, etc.).

- [ ] **Step 5: Run tests and typecheck**

Run: `npx tsc --noEmit && npx vitest run __tests__/components/admin/portal-allotments/PortalAllotmentsStatsGrid.test.tsx`
Expected: PASS with 0 errors.

---

### Task 4: Refactor `app/admin/dashboard/page.tsx` (339 lines → ~75 lines)

**Target:** Modularize the Admin Dashboard page by extracting background lighting effects, the dashboard welcome header, user action mutations hook, and the 5 modal dialogs container.

**Files:**

- Create: `src/components/admin/dashboard/DashboardBackground.tsx`
- Create: `src/components/admin/dashboard/DashboardHeader.tsx`
- Create: `src/components/admin/dashboard/DashboardModalsContainer.tsx`
- Create: `src/components/admin/dashboard/useDashboardUserActions.ts`
- Create: `__tests__/components/admin/dashboard/DashboardHeader.test.tsx`
- Modify: `app/admin/dashboard/page.tsx`

**Interfaces:**

- Produces `useDashboardUserActions()`:
  ```ts
  export interface UseDashboardUserActionsReturn {
    deleteLoading: boolean;
    roleLoading: Record<string, boolean>;
    activeLoading: Record<string, boolean>;
    handleDelete: (target: UserProfile, onSuccess: () => void) => Promise<void>;
    handleRoleChange: (user: UserProfile, newRole: string, onSuccess: () => void) => Promise<void>;
    handleToggleActive: (user: UserProfile, onSuccess: () => void) => Promise<void>;
  }
  ```
- Produces `DashboardModalsContainer`:

  ```tsx
  export interface DashboardModalsProps {
    token: string;
    properties: Array<{ name: string; slug: string }>;
    showCreate: boolean;
    onCloseCreate: () => void;
    editTarget: UserProfile | null;
    onCloseEdit: () => void;
    deleteTarget: UserProfile | null;
    onCloseDelete: () => void;
    onConfirmDelete: () => void;
    deleteLoading: boolean;
    showAddEmployee: boolean;
    onCloseAddEmployee: () => void;
    showAdvisorSettings: boolean;
    onCloseAdvisorSettings: () => void;
    onSuccess: (message: string) => void;
  }
  export function DashboardModalsContainer(props: DashboardModalsProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write the unit test for `DashboardHeader`**

Create `__tests__/components/admin/dashboard/DashboardHeader.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DashboardHeader } from '@/src/components/admin/dashboard/DashboardHeader';

describe('DashboardHeader', () => {
  it('renders system dashboard title and subtitle', () => {
    render(<DashboardHeader />);
    expect(screen.getByText('System')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(
      screen.getByText(
        /Manage authorized user accounts and monitor administrative access permissions/
      )
    ).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/admin/dashboard/DashboardHeader.test.tsx`
Expected: FAIL (`DashboardHeader` not found).

- [ ] **Step 3: Implement dashboard modular components and hook**

1. Create `DashboardBackground.tsx`: Renders ambient lighting circles and radial gold grid pattern.
2. Create `DashboardHeader.tsx`: Renders header title with gold background pan animation and explanatory subtitle.
3. Create `useDashboardUserActions.ts`: Encapsulates delete, role change, and active toggle mutations with sonner toast notifications and error extraction.
4. Create `DashboardModalsContainer.tsx`: Renders `<AnimatePresence>` wrapping `CreateUserModal`, `EditUserModal`, `DeleteConfirm`, `AddEmployeeModal`, and `AdvisorSettingsModal`.

- [ ] **Step 4: Refactor `app/admin/dashboard/page.tsx`**

Integrate `DashboardBackground`, `DashboardHeader`, `useDashboardUserActions`, and `DashboardModalsContainer`.
Delete all orphaned imports and redundant state declarations.

- [ ] **Step 5: Run tests and typecheck**

Run: `npx tsc --noEmit && npx vitest run __tests__/components/admin/dashboard/DashboardHeader.test.tsx`
Expected: PASS with 0 errors.

---

### Task 5: Refactor `app/admin/leads/page.tsx` (458 lines → ~85 lines)

**Target:** Decompose the Admin Leads Command Center into a headless management hook, IVR summary stats grid, advisor leaderboard grid, and tab navigation bar.

**Files:**

- Create: `src/components/admin/leads/useIvrLeadsManagement.ts`
- Create: `src/components/admin/leads/IvrStatsKpiGrid.tsx`
- Create: `src/components/admin/leads/AdvisorLeaderboardGrid.tsx`
- Create: `src/components/admin/leads/LeadsTabNav.tsx`
- Create: `__tests__/components/admin/leads/IvrStatsKpiGrid.test.tsx`
- Modify: `app/admin/leads/page.tsx`

**Interfaces:**

- Produces `useIvrLeadsManagement()`:
  ```ts
  export interface UseIvrLeadsManagementReturn {
    ivrRecords: IvrRecordItem[];
    ivrTotalCount: number;
    ivrPage: number;
    setIvrPage: (page: number) => void;
    ivrLoading: boolean;
    ivrFilters: IvrFilterState;
    handleFilterChange: (newFilters: Partial<IvrFilterState>) => void;
    summary: {
      total_calls: number;
      answered_calls: number;
      missed_calls: number;
      hot_count: number;
      warm_count: number;
      cold_count: number;
    };
    employees: Employee[];
    fetchIvrRecords: (targetPage?: number, currentFilters?: IvrFilterState) => Promise<void>;
    handleTemperatureChange: (
      recordId: string,
      phone: string,
      temp: 'hot' | 'warm' | 'cold'
    ) => Promise<void>;
    handleReassignAdvisor: (recordId: string, phone: string, advisorId: string) => Promise<void>;
  }
  ```
- Produces `IvrStatsKpiGrid`:

  ```tsx
  export function IvrStatsKpiGrid({
    summary,
  }: {
    summary: UseIvrLeadsManagementReturn['summary'];
  }): React.JSX.Element;
  ```

- [ ] **Step 1: Write the unit test for `IvrStatsKpiGrid`**

Create `__tests__/components/admin/leads/IvrStatsKpiGrid.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { IvrStatsKpiGrid } from '@/src/components/admin/leads/IvrStatsKpiGrid';

describe('IvrStatsKpiGrid', () => {
  it('renders all 4 summary KPI cards correctly', () => {
    const summary = {
      total_calls: 1200,
      answered_calls: 900,
      missed_calls: 300,
      hot_count: 150,
      warm_count: 200,
      cold_count: 550,
    };
    render(<IvrStatsKpiGrid summary={summary} />);
    expect(screen.getByText('Total Calls')).toBeDefined();
    expect(screen.getByText('1,200')).toBeDefined();
    expect(screen.getByText('Answered')).toBeDefined();
    expect(screen.getByText('900')).toBeDefined();
    expect(screen.getByText('75% connection rate')).toBeDefined();
    expect(screen.getByText('Not Answered')).toBeDefined();
    expect(screen.getByText('300')).toBeDefined();
    expect(screen.getByText('Hot Intent')).toBeDefined();
    expect(screen.getByText('150')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/admin/leads/IvrStatsKpiGrid.test.tsx`
Expected: FAIL (`IvrStatsKpiGrid` not found).

- [ ] **Step 3: Implement leads subcomponents and hook**

1. Create `src/components/admin/leads/useIvrLeadsManagement.ts`:
   - Encapsulates state for IVR records, total count, page, filters, summary, and advisor employees list.
   - Houses `fetchIvrRecords`, `handleFilterChange`, `handleTemperatureChange` (with optimistic updates), and `handleReassignAdvisor`.
2. Create `src/components/admin/leads/IvrStatsKpiGrid.tsx`:
   - Renders Total Calls, Answered (with connection rate %), Missed, and Hot Intent cards.
3. Create `src/components/admin/leads/AdvisorLeaderboardGrid.tsx`:
   - Renders the telecaller performance rank cards.
4. Create `src/components/admin/leads/LeadsTabNav.tsx`:
   - Renders tab buttons for Telecalling Dashboard, IVR Records, Chatbot Leads, and All Leads with live badges.

- [ ] **Step 4: Refactor `app/admin/leads/page.tsx`**

Integrate `useIvrLeadsManagement()`, `IvrStatsKpiGrid`, `AdvisorLeaderboardGrid`, and `LeadsTabNav`.
Prune all unused icons and inline state logic from `app/admin/leads/page.tsx`.

- [ ] **Step 5: Run tests and typecheck**

Run: `npx tsc --noEmit && npx vitest run __tests__/components/admin/leads/IvrStatsKpiGrid.test.tsx`
Expected: PASS with 0 errors.

---

### Task 6: Refactor `app/admin/page.tsx` (Admin Login - 322 lines → ~60 lines)

**Target:** Decompose the Admin Login page into `useAdminLogin.ts`, `AdminLoginBackground.tsx`, `AdminLoginHeader.tsx`, and `AdminLoginForm.tsx`.

**Files:**

- Create: `src/components/admin/login/useAdminLogin.ts`
- Create: `src/components/admin/login/AdminLoginBackground.tsx`
- Create: `src/components/admin/login/AdminLoginHeader.tsx`
- Create: `src/components/admin/login/AdminLoginForm.tsx`
- Create: `__tests__/components/admin/login/AdminLoginHeader.test.tsx`
- Modify: `app/admin/page.tsx`

**Interfaces:**

- Produces `useAdminLogin()`:
  ```ts
  export interface UseAdminLoginReturn {
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    showPass: boolean;
    setShowPass: (show: boolean) => void;
    loading: boolean;
    error: string;
    success: boolean;
    emailTouched: boolean;
    setEmailTouched: (touched: boolean) => void;
    passwordTouched: boolean;
    setPasswordTouched: (touched: boolean) => void;
    shake: boolean;
    setShake: (shake: boolean) => void;
    showEmailError: boolean;
    showPasswordError: boolean;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  }
  ```
- Produces `AdminLoginHeader`:
  ```tsx
  export function AdminLoginHeader(): React.JSX.Element;
  ```
- Produces `AdminLoginForm`:

  ```tsx
  export function AdminLoginForm(props: UseAdminLoginReturn): React.JSX.Element;
  ```

- [ ] **Step 1: Write the unit test for `AdminLoginHeader`**

Create `__tests__/components/admin/login/AdminLoginHeader.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AdminLoginHeader } from '@/src/components/admin/login/AdminLoginHeader';

describe('AdminLoginHeader', () => {
  it('renders Admin Portal title and restricted access badge', () => {
    render(<AdminLoginHeader />);
    expect(screen.getByText('Admin')).toBeDefined();
    expect(screen.getByText('Portal')).toBeDefined();
    expect(screen.getByText('SVI Infra Solutions — Restricted Access')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/admin/login/AdminLoginHeader.test.tsx`
Expected: FAIL (`AdminLoginHeader` not found).

- [ ] **Step 3: Implement admin login subcomponents and hook**

1. Create `src/components/admin/login/useAdminLogin.ts`:
   - Houses form state, validation, shake trigger, Supabase auth sign-in, admin role check, and redirection to `/admin/dashboard`.
2. Create `src/components/admin/login/AdminLoginBackground.tsx`:
   - Renders ambient gold glows and subtle dot grid overlay.
3. Create `src/components/admin/login/AdminLoginHeader.tsx`:
   - Renders the ShieldCheck badge, "Admin Portal" heading, and restricted access pill.
4. Create `src/components/admin/login/AdminLoginForm.tsx`:
   - Renders the email input, password input with toggle button, validation error text, and submit button.
   - Includes the "Access Granted" overlay when `success === true`.

- [ ] **Step 4: Refactor `app/admin/page.tsx`**

Compose `AdminLogin` using `useAdminLogin()`, `AdminLoginBackground`, `AdminLoginHeader`, and `AdminLoginForm`.
Delete all unused imports from `app/admin/page.tsx`.

- [ ] **Step 5: Run tests and typecheck**

Run: `npx tsc --noEmit && npx vitest run __tests__/components/admin/login/AdminLoginHeader.test.tsx`
Expected: PASS with 0 errors.

---

### Task 7: Comprehensive Pruning & Verification Gate

**Target:** Ensure zero leftover unused imports, verify that all modified pages compile cleanly, run the complete Vitest test suite, and run GitNexus change detection.

- [ ] **Step 1: Search for unused imports across refactored pages and components**

Run: `npx eslint app/[locale]/(main)/leadership/page.tsx app/[locale]/(main)/contact/page.tsx app/[locale]/(main)/admin/portal-allotments/page.tsx app/admin/dashboard/page.tsx app/admin/leads/page.tsx app/admin/page.tsx`
Expected: 0 errors/warnings.

- [ ] **Step 2: Run TypeScript compiler check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run full Vitest suite**

Run: `npx vitest run`
Expected: 286+ tests files passed, 0 failures.

- [ ] **Step 4: Run GitNexus detect-changes**

Run: `node .gitnexus/run.cjs detect-changes --scope all --repo .`
Expected: Low risk, 0 broken processes.

- [ ] **Step 5: Commit complete refactoring**

Commit message: `refactor(pages): decompose monolithic pages into focused modular components`
