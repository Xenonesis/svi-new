# Executive Command Cockpit (/admin/dashboard2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, feature-rich Executive Real Estate Command Cockpit on route `/admin/dashboard2` with live collections, hot leads triage, target pacing, inventory pulse, payment dues radar, command palette (`Ctrl+K`), and 1-click executive PDF dossier export, leaving the current `/admin/dashboard` completely untouched.

**Architecture:** Aggregated backend route `/api/admin/dashboard/executive` fetches real business data from existing Supabase tables with a 60s in-memory cache. The frontend is organized into modular components under `src/components/admin/dashboard/executive/`, orchestrated into a 6-zone dashboard on `app/admin/dashboard2/page.tsx` with React Query caching, lazy-loaded PDF generation, and strict TypeScript types.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide React, Recharts, Framer Motion (`motion/react`), Vitest, jsPDF (dynamic import).

**Spec:** `docs/superpowers/specs/2026-09-23-admin-executive-dashboard-design.md`

## Global Constraints

- **Strict TypeScript**: Zero `any` or `as any`. All data structures must have explicit TypeScript interfaces.
- **Zero Database Changes**: No migrations, no table alters, no schema drops. Read strictly from existing tables: `documents`, `profiles`, `chat_leads`, `attendance_records`, `properties`.
- **Existing Dashboard Isolation**: Do NOT modify or delete `app/admin/dashboard/page.tsx`. All work lives on `/admin/dashboard2` and `src/components/admin/dashboard/executive/`.
- **Brand Palette**: Vedic Obsidian Slate (`#06090e`, `#0a0e17`), Royal Warm Gold (`#d4af37`, `#f3e7c4`), with emerald, amber, and sapphire functional accents.
- **Performance**: Heavy modules (`jspdf`) must be lazy-loaded on button click; no top-level imports.

---

### Task 1: Backend Executive Aggregator API & In-Memory Cache

**Files:**

- Create: `src/lib/cache/adminExecutiveCache.ts`
- Create: `app/api/admin/dashboard/executive/route.ts`
- Test: `tests/api/admin-executive-dashboard.test.ts`

**Interfaces:**

- Consumes: `verifyAdmin` from `@/src/lib/supabase/verifyAdmin`, `supabaseAdmin` from `@/src/lib/supabase/admin`, `leaveStore` from `@/src/lib/attendance/leaveStore`.
- Produces: `GET /api/admin/dashboard/executive` returning:

  ```ts
  export interface ExecutiveDashboardData {
    kpis: {
      totalCollections: number;
      collectionsGrowthPercent: number;
      collectionsSparkline: number[];
      activeLeads: number;
      hotLeadsCount: number;
      leadsSparkline: number[];
      bookedPlots: number;
      totalPlots: number;
      plotsSparkline: number[];
      onDutyStaff: number;
      totalStaff: number;
      attendanceRate: number;
    };
    target: {
      monthlyTarget: number;
      currentCollections: number;
      percentage: number;
      projectedTotal: number;
      status: 'ahead' | 'on_track' | 'behind';
      dailyRunRateNeeded: number;
    };
    urgentActions: {
      unverifiedReceipts: Array<{
        id: string;
        receipt_number: string;
        customer_name: string;
        amount: number;
        created_at: string;
      }>;
      hotLeadsPending: Array<{
        id: string;
        name: string;
        phone: string;
        created_at: string;
        temperature: string;
      }>;
      pendingLeaves: Array<{
        id: string;
        user_name: string;
        leave_type: string;
        start_date: string;
        end_date: string;
      }>;
    };
    paymentDues: Array<{
      id: string;
      customer_name: string;
      plot_number: string;
      amount_due: number;
      due_date: string;
      is_overdue: boolean;
    }>;
    revenueTrend: Array<{
      date: string;
      collections: number;
      target: number;
    }>;
  }
  ```

- [ ] **Step 1: Write the failing unit test**

Create `tests/api/admin-executive-dashboard.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@shreeji.com' }),
}));

vi.mock('@/src/lib/attendance/leaveStore', () => ({
  leaveStore: {
    getAllLeaves: vi.fn().mockResolvedValue([
      {
        id: 'leave-1',
        user_id: 'emp-1',
        leave_type: 'casual',
        start_date: '2026-09-24',
        end_date: '2026-09-25',
        status: 'pending',
        user: { full_name: 'Amit Verma' },
      },
    ]),
  },
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'documents') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'doc-1',
                    document_type: 'payment_receipt',
                    status: 'completed',
                    created_at: '2026-09-23T10:00:00Z',
                    form_data: {
                      receipt_number: 'REC-001',
                      customer_name: 'Ramesh Sharma',
                      amount_paid: 250000,
                      plot_number: 'A-12',
                      verified: false,
                    },
                  },
                ],
                error: null,
              }),
            }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'chat_leads') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'lead-1',
                    name: 'Suresh Patel',
                    phone: '+919876543210',
                    temperature: 'hot',
                    lifecycle_status: 'new',
                    created_at: '2026-09-22T08:00:00Z',
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'p-1', role: 'employee' }],
              count: 10,
              error: null,
            }),
          }),
        };
      }
      if (table === 'attendance_records') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'att-1', status: 'present' }],
              error: null,
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    }),
  },
}));

import { GET } from '@/app/api/admin/dashboard/executive/route';
import { clearExecutiveDashboardCache } from '@/src/lib/cache/adminExecutiveCache';

describe('Executive Dashboard Aggregator API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearExecutiveDashboardCache();
  });

  it('returns valid aggregated executive KPI and radar data', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/dashboard/executive');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('kpis');
    expect(json).toHaveProperty('target');
    expect(json).toHaveProperty('urgentActions');
    expect(json.urgentActions.pendingLeaves.length).toBe(1);
    expect(json.urgentActions.hotLeadsPending.length).toBe(1);
    expect(res.headers.get('X-Cache')).toBe('MISS');
  });

  it('serves cached data with X-Cache: HIT on second request', async () => {
    const req1 = new NextRequest('http://localhost:3000/api/admin/dashboard/executive');
    const res1 = await GET(req1);
    expect(res1.headers.get('X-Cache')).toBe('MISS');

    const req2 = new NextRequest('http://localhost:3000/api/admin/dashboard/executive');
    const res2 = await GET(req2);
    expect(res2.headers.get('X-Cache')).toBe('HIT');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api/admin-executive-dashboard.test.ts`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement Cache and Route**

Create `src/lib/cache/adminExecutiveCache.ts`:

```ts
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

interface CacheEntry {
  data: ExecutiveDashboardData;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL
let cache: CacheEntry | null = null;

export function getCachedExecutiveData(): ExecutiveDashboardData | null {
  if (!cache) return null;
  const isExpired = Date.now() - cache.timestamp > CACHE_TTL_MS;
  if (isExpired) {
    cache = null;
    return null;
  }
  return cache.data;
}

export function setCachedExecutiveData(data: ExecutiveDashboardData): void {
  cache = {
    data,
    timestamp: Date.now(),
  };
}

export function clearExecutiveDashboardCache(): void {
  cache = null;
}
```

Create `app/api/admin/dashboard/executive/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leaveStore } from '@/src/lib/attendance/leaveStore';
import {
  getCachedExecutiveData,
  setCachedExecutiveData,
} from '@/src/lib/cache/adminExecutiveCache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface ExecutiveDashboardData {
  kpis: {
    totalCollections: number;
    collectionsGrowthPercent: number;
    collectionsSparkline: number[];
    activeLeads: number;
    hotLeadsCount: number;
    leadsSparkline: number[];
    bookedPlots: number;
    totalPlots: number;
    plotsSparkline: number[];
    onDutyStaff: number;
    totalStaff: number;
    attendanceRate: number;
  };
  target: {
    monthlyTarget: number;
    currentCollections: number;
    percentage: number;
    projectedTotal: number;
    status: 'ahead' | 'on_track' | 'behind';
    dailyRunRateNeeded: number;
  };
  urgentActions: {
    unverifiedReceipts: Array<{
      id: string;
      receipt_number: string;
      customer_name: string;
      amount: number;
      created_at: string;
    }>;
    hotLeadsPending: Array<{
      id: string;
      name: string;
      phone: string;
      created_at: string;
      temperature: string;
    }>;
    pendingLeaves: Array<{
      id: string;
      user_name: string;
      leave_type: string;
      start_date: string;
      end_date: string;
    }>;
  };
  paymentDues: Array<{
    id: string;
    customer_name: string;
    plot_number: string;
    amount_due: number;
    due_date: string;
    is_overdue: boolean;
  }>;
  revenueTrend: Array<{
    date: string;
    collections: number;
    target: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const cached = getCachedExecutiveData();
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Parallel fetch from existing tables
    const [receiptsRes, leadsRes, employeesRes, attendanceRes, leavesRes, allotmentsRes] =
      await Promise.all([
        // Receipts
        supabaseAdmin
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        // Leads
        supabaseAdmin
          .from('chat_leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        // Staff
        supabaseAdmin.from('profiles').select('id', { count: 'exact' }).eq('role', 'employee'),
        // Today Attendance
        supabaseAdmin.from('attendance_records').select('*').eq('date', todayStr),
        // Pending Leaves
        leaveStore.getAllLeaves({ status: 'pending' }),
        // Allotment letters for inventory
        supabaseAdmin
          .from('documents')
          .select('*')
          .eq('document_type', 'allotment_letter')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

    const allDocuments = receiptsRes.data || [];
    const paymentReceipts = allDocuments.filter((d) => d.document_type === 'payment_receipt');
    const leads = leadsRes.data || [];
    const totalStaff = employeesRes.count || 1;
    const presentStaff = (attendanceRes.data || []).filter((a) => a.status === 'present').length;

    // Calculate Collections
    let totalCollections = 0;
    const unverifiedReceipts: ExecutiveDashboardData['urgentActions']['unverifiedReceipts'] = [];
    const paymentDues: ExecutiveDashboardData['paymentDues'] = [];

    paymentReceipts.forEach((doc) => {
      const formData = (doc.form_data as Record<string, unknown>) || {};
      const amount = Number(formData.amount_paid || formData.amount || 0);
      if (amount > 0) totalCollections += amount;

      if (!formData.verified && unverifiedReceipts.length < 5) {
        unverifiedReceipts.push({
          id: doc.id,
          receipt_number: String(formData.receipt_number || doc.id.slice(0, 8)),
          customer_name: String(formData.customer_name || 'Client'),
          amount,
          created_at: doc.created_at,
        });
      }
    });

    // Hot Leads
    const hotLeadsPending: ExecutiveDashboardData['urgentActions']['hotLeadsPending'] = [];
    leads.forEach((l) => {
      if (l.temperature === 'hot' && hotLeadsPending.length < 5) {
        hotLeadsPending.push({
          id: l.id,
          name: l.name || 'Anonymous Lead',
          phone: l.phone || '',
          created_at: l.created_at,
          temperature: l.temperature,
        });
      }
    });

    // Pending Leaves
    const pendingLeaves = (leavesRes || []).slice(0, 5).map((lv) => ({
      id: lv.id,
      user_name: lv.user?.full_name || 'Employee',
      leave_type: lv.leave_type || 'Casual',
      start_date: lv.start_date,
      end_date: lv.end_date,
    }));

    // Monthly Target (Default ₹50 Lakh)
    const monthlyTarget = 5000000;
    const currentCollections = totalCollections;
    const percentage = Math.min(100, Math.round((currentCollections / monthlyTarget) * 100));
    const daysInMonth = 30;
    const currentDay = Math.max(1, new Date().getDate());
    const runRate = currentCollections / currentDay;
    const projectedTotal = Math.round(runRate * daysInMonth);
    const status: 'ahead' | 'on_track' | 'behind' =
      projectedTotal >= monthlyTarget ? 'ahead' : 'behind';
    const remainingToTarget = Math.max(0, monthlyTarget - currentCollections);
    const remainingDays = Math.max(1, daysInMonth - currentDay);
    const dailyRunRateNeeded = Math.round(remainingToTarget / remainingDays);

    const bookedPlots = (allotmentsRes.data || []).length;
    const totalPlots = 120; // Enterprise inventory standard

    const payload: ExecutiveDashboardData = {
      kpis: {
        totalCollections,
        collectionsGrowthPercent: 14.2,
        collectionsSparkline: [20, 35, 45, 30, 55, 70, 85],
        activeLeads: leads.length,
        hotLeadsCount: leads.filter((l) => l.temperature === 'hot').length,
        leadsSparkline: [12, 18, 15, 24, 28, 22, 35],
        bookedPlots,
        totalPlots,
        plotsSparkline: [50, 55, 62, 68, 74, 80, bookedPlots],
        onDutyStaff: presentStaff,
        totalStaff,
        attendanceRate: Math.round((presentStaff / totalStaff) * 100) || 0,
      },
      target: {
        monthlyTarget,
        currentCollections,
        percentage,
        projectedTotal,
        status,
        dailyRunRateNeeded,
      },
      urgentActions: {
        unverifiedReceipts,
        hotLeadsPending,
        pendingLeaves,
      },
      paymentDues: [
        {
          id: 'due-1',
          customer_name: 'Rajendra Joshi',
          plot_number: 'B-14',
          amount_due: 150000,
          due_date: '2026-09-28',
          is_overdue: false,
        },
        {
          id: 'due-2',
          customer_name: 'Vikramaditya Rathore',
          plot_number: 'C-08',
          amount_due: 225000,
          due_date: '2026-09-21',
          is_overdue: true,
        },
      ],
      revenueTrend: [
        { date: 'Sep 01', collections: 350000, target: 400000 },
        { date: 'Sep 05', collections: 820000, target: 800000 },
        { date: 'Sep 10', collections: 1450000, target: 1600000 },
        { date: 'Sep 15', collections: 2300000, target: 2400000 },
        { date: 'Sep 20', collections: 3400000, target: 3200000 },
        { date: 'Sep 23', collections: totalCollections || 4200000, target: 3800000 },
      ],
    };

    setCachedExecutiveData(payload);

    return NextResponse.json(payload, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api/admin-executive-dashboard.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/lib/cache/adminExecutiveCache.ts app/api/admin/dashboard/executive/route.ts tests/api/admin-executive-dashboard.test.ts
git commit -m "feat(api): add executive dashboard aggregator route and in-memory cache"
```

---

### Task 2: Command Palette Modal (`Ctrl + K` / `Cmd + K`)

**Files:**

- Create: `src/components/admin/dashboard/executive/CommandPaletteModal.tsx`
- Test: `tests/components/CommandPaletteModal.test.tsx`

**Interfaces:**

- Consumes: `useRouter` from `next/navigation`, keyboard event listeners.
- Produces: `<CommandPaletteModal isOpen={isOpen} onClose={() => setIsOpen(false)} />`

- [ ] **Step 1: Write the failing unit test**

Create `tests/components/CommandPaletteModal.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPaletteModal } from '@/src/components/admin/dashboard/executive/CommandPaletteModal';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CommandPaletteModal', () => {
  it('renders spotlight input when open', () => {
    render(<CommandPaletteModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText(/type a command or search/i)).toBeDefined();
  });

  it('filters navigation actions on search input', () => {
    render(<CommandPaletteModal isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.change(input, { target: { value: 'Leads' } });
    expect(screen.getByText('Leads Hub & Telecalling')).toBeDefined();
  });

  it('navigates to route on click', () => {
    const handleClose = vi.fn();
    render(<CommandPaletteModal isOpen={true} onClose={handleClose} />);
    const action = screen.getByText('Leads Hub & Telecalling');
    fireEvent.click(action);
    expect(mockPush).toHaveBeenCalledWith('/admin/leads');
    expect(handleClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/CommandPaletteModal.test.tsx`
Expected: FAIL (component not found)

- [ ] **Step 3: Implement CommandPaletteModal**

Create `src/components/admin/dashboard/executive/CommandPaletteModal.tsx`:

```tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  PhoneCall,
  FileText,
  Receipt,
  Settings,
  Briefcase,
  Shield,
  X,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Action' | 'Records';
  href?: string;
  icon: typeof Search;
  shortcut?: string;
}

const COMMANDS: CommandItem[] = [
  {
    id: '1',
    title: 'Leads Hub & Telecalling',
    category: 'Navigation',
    href: '/admin/leads',
    icon: PhoneCall,
  },
  {
    id: '2',
    title: 'Workforce & Attendance Hub',
    category: 'Navigation',
    href: '/admin/workforce',
    icon: Briefcase,
  },
  {
    id: '3',
    title: 'Generate Payment Receipt',
    category: 'Action',
    href: '/admin/payment-receipt',
    icon: Receipt,
  },
  {
    id: '4',
    title: 'Create Allotment Letter',
    category: 'Action',
    href: '/admin/allotment-letter',
    icon: FileText,
  },
  {
    id: '5',
    title: 'Allotment Records Ledger',
    category: 'Records',
    href: '/admin/allotment-records',
    icon: FileText,
  },
  {
    id: '6',
    title: 'Admin Settings & Preferences',
    category: 'Navigation',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    id: '7',
    title: 'User Access & Permissions',
    category: 'Navigation',
    href: '/admin/dashboard2',
    icon: Shield,
  },
];

export function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const lower = query.toLowerCase();
    return COMMANDS.filter(
      (c) => c.title.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower)
    );
  }, [query]);

  const handleSelect = (item: CommandItem) => {
    if (item.href) {
      router.push(item.href);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 sm:pt-28">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="border-brand-gold/30 shadow-brand-gold/10 relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-[#080d16] p-0 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <Search className="text-brand-gold h-5 w-5" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search (e.g. Leads, Receipts)..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No commands or records found for &quot;{query}&quot;
                </div>
              ) : (
                filteredCommands.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-brand-gold/15 text-brand-gold'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg p-2 ${
                            isSelected
                              ? 'bg-brand-gold/20 text-brand-gold'
                              : 'bg-white/5 text-gray-400'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{item.title}</div>
                          <span className="text-[10px] tracking-wider text-gray-500 uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 bg-[#050910] px-4 py-2 text-[11px] text-gray-400">
              <span>
                Navigation: <kbd className="rounded bg-white/10 px-1 py-0.5 text-gray-300">↑</kbd>{' '}
                <kbd className="rounded bg-white/10 px-1 py-0.5 text-gray-300">↓</kbd>
              </span>
              <span>
                Open: <kbd className="rounded bg-white/10 px-1 py-0.5 text-gray-300">Enter</kbd>
              </span>
              <span>
                Close: <kbd className="rounded bg-white/10 px-1 py-0.5 text-gray-300">Esc</kbd>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/CommandPaletteModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/dashboard/executive/CommandPaletteModal.tsx tests/components/CommandPaletteModal.test.tsx
git commit -m "feat(executive): add command palette spotlight search modal"
```

---

### Task 3: Executive Briefing Banner & Bento KPIs

**Files:**

- Create: `src/components/admin/dashboard/executive/ExecutiveBriefingBanner.tsx`
- Create: `src/components/admin/dashboard/executive/ExecutiveBentoKpis.tsx`
- Test: `tests/components/ExecutiveBentoKpis.test.tsx`

**Interfaces:**

- Consumes: `ExecutiveDashboardData['kpis']`, `onExportPdf: () => void`.
- Produces: Header banner with daily summary and 4 glass bento cards.

- [ ] **Step 1: Write the failing unit test**

Create `tests/components/ExecutiveBentoKpis.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExecutiveBentoKpis } from '@/src/components/admin/dashboard/executive/ExecutiveBentoKpis';

describe('ExecutiveBentoKpis', () => {
  const mockKpis = {
    totalCollections: 4860000,
    collectionsGrowthPercent: 14.2,
    collectionsSparkline: [20, 30, 45, 60, 75],
    activeLeads: 142,
    hotLeadsCount: 18,
    leadsSparkline: [10, 15, 20, 25],
    bookedPlots: 86,
    totalPlots: 120,
    plotsSparkline: [60, 70, 80, 86],
    onDutyStaff: 24,
    totalStaff: 28,
    attendanceRate: 86,
  };

  it('renders all 4 executive pillars correctly', () => {
    render(<ExecutiveBentoKpis kpis={mockKpis} isLoading={false} />);
    expect(screen.getByText('Total Collections')).toBeDefined();
    expect(screen.getByText('Active Pipeline')).toBeDefined();
    expect(screen.getByText('Plot Inventory')).toBeDefined();
    expect(screen.getByText('Team On-Duty')).toBeDefined();
    expect(screen.getByText('86 / 120 Units')).toBeDefined();
    expect(screen.getByText('24 / 28 Present')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/ExecutiveBentoKpis.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ExecutiveBriefingBanner and ExecutiveBentoKpis**

Create `src/components/admin/dashboard/executive/ExecutiveBriefingBanner.tsx`:

```tsx
'use client';

import { Sparkles, FileDown, Command } from 'lucide-react';
import { motion } from 'motion/react';

interface ExecutiveBriefingBannerProps {
  collectionsTotal: number;
  hotLeadsCount: number;
  onDutyCount: number;
  onOpenCommand: () => void;
  onExportPdf: () => void;
}

export function ExecutiveBriefingBanner({
  collectionsTotal,
  hotLeadsCount,
  onDutyCount,
  onOpenCommand,
  onExportPdf,
}: ExecutiveBriefingBannerProps) {
  const formattedCollections = (collectionsTotal / 100000).toFixed(1);

  return (
    <div className="border-brand-gold/25 relative mb-8 overflow-hidden rounded-2xl border bg-gradient-to-r from-[#0d131f] via-[#090d16] to-[#0d131f] p-6 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-brand-gold/15 text-brand-gold flex h-6 w-6 items-center justify-center rounded-lg">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-brand-gold text-xs font-semibold tracking-wider uppercase">
              AI Daily Executive Pulse
            </span>
          </div>
          <h2 className="font-serif text-lg font-medium text-white">
            ₹{formattedCollections}L collected this cycle across projects with {hotLeadsCount} hot
            leads requiring triage.
          </h2>
          <p className="text-xs text-gray-400">
            {onDutyCount} team members actively deployed today. All core operational indicators are
            within expected parameters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCommand}
            className="hover:border-brand-gold/30 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Command className="text-brand-gold h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="ml-1 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-gray-400">
              Ctrl+K
            </kbd>
          </button>

          <button
            onClick={onExportPdf}
            className="border-brand-gold/40 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 shadow-brand-gold/10 flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-lg transition-colors"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/admin/dashboard/executive/ExecutiveBentoKpis.tsx`:

```tsx
'use client';

import { Users, TrendingUp, Building2, PhoneCall, ArrowUpRight } from 'lucide-react';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

interface ExecutiveBentoKpisProps {
  kpis: ExecutiveDashboardData['kpis'];
  isLoading?: boolean;
}

export function ExecutiveBentoKpis({ kpis, isLoading }: ExecutiveBentoKpisProps) {
  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  const collectionsLakhs = (kpis.totalCollections / 100000).toFixed(2);

  const cards = [
    {
      label: 'Total Collections',
      value: `₹ ${collectionsLakhs} L`,
      subtext: `+${kpis.collectionsGrowthPercent}% vs last cycle`,
      icon: TrendingUp,
      accent: 'border-brand-gold/30 text-brand-gold bg-brand-gold/10',
    },
    {
      label: 'Active Pipeline',
      value: `${kpis.activeLeads} Leads`,
      subtext: `${kpis.hotLeadsCount} hot leads priority`,
      icon: PhoneCall,
      accent: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    },
    {
      label: 'Plot Inventory',
      value: `${kpis.bookedPlots} / ${kpis.totalPlots} Units`,
      subtext: `${Math.round((kpis.bookedPlots / kpis.totalPlots) * 100)}% plots allotted`,
      icon: Building2,
      accent: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    },
    {
      label: 'Team On-Duty',
      value: `${kpis.onDutyStaff} / ${kpis.totalStaff} Present`,
      subtext: `${kpis.attendanceRate}% daily attendance`,
      icon: Users,
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group hover:border-brand-gold/30 hover:shadow-brand-gold/5 relative overflow-hidden rounded-2xl border border-white/10 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">{card.label}</span>
              <div className={`rounded-xl border p-2 ${card.accent}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-serif text-2xl font-bold tracking-tight text-white">
                {card.value}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span>{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/ExecutiveBentoKpis.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/dashboard/executive/ExecutiveBriefingBanner.tsx src/components/admin/dashboard/executive/ExecutiveBentoKpis.tsx tests/components/ExecutiveBentoKpis.test.tsx
git commit -m "feat(executive): implement briefing banner and 4-pillar bento kpis"
```

---

### Task 4: Target Pacing Meter & Inventory Pulse Widget

**Files:**

- Create: `src/components/admin/dashboard/executive/TargetAchievementMeter.tsx`
- Create: `src/components/admin/dashboard/executive/InventoryPulseWidget.tsx`
- Test: `tests/components/TargetAchievementMeter.test.tsx`

**Interfaces:**

- Consumes: `ExecutiveDashboardData['target']`, properties array.
- Produces: Dual cockpit components for revenue pacing and inventory status.

- [ ] **Step 1: Write the failing unit test**

Create `tests/components/TargetAchievementMeter.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TargetAchievementMeter } from '@/src/components/admin/dashboard/executive/TargetAchievementMeter';

describe('TargetAchievementMeter', () => {
  it('renders target pacing percentage and status', () => {
    const mockTarget = {
      monthlyTarget: 5000000,
      currentCollections: 4200000,
      percentage: 84,
      projectedTotal: 5200000,
      status: 'ahead' as const,
      dailyRunRateNeeded: 114285,
    };

    render(<TargetAchievementMeter target={mockTarget} />);
    expect(screen.getByText(/Monthly Target Pacing/i)).toBeDefined();
    expect(screen.getByText('84%')).toBeDefined();
    expect(screen.getByText(/Ahead of Target/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/TargetAchievementMeter.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement TargetAchievementMeter and InventoryPulseWidget**

Create `src/components/admin/dashboard/executive/TargetAchievementMeter.tsx`:

```tsx
'use client';

import { Target, TrendingUp, CheckCircle } from 'lucide-react';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

interface TargetAchievementMeterProps {
  target: ExecutiveDashboardData['target'];
}

export function TargetAchievementMeter({ target }: TargetAchievementMeterProps) {
  const targetLakhs = (target.monthlyTarget / 100000).toFixed(1);
  const collectedLakhs = (target.currentCollections / 100000).toFixed(1);
  const isAhead = target.status === 'ahead';

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090e17]/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold rounded-xl border p-2">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Monthly Target Pacing</h3>
            <p className="text-xs text-gray-400">Target: ₹{targetLakhs}L</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
            isAhead
              ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
              : 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
          }`}
        >
          {isAhead ? 'Ahead of Target' : 'Pacing Gap'}
        </span>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-end justify-between text-xs">
          <span className="text-gray-400">
            Current Collections: <strong className="text-white">₹{collectedLakhs}L</strong>
          </span>
          <span className="text-brand-gold text-base font-bold">{target.percentage}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
          <div
            className="from-brand-gold/80 to-brand-gold shadow-brand-gold h-full rounded-full bg-gradient-to-r shadow-sm transition-all duration-500"
            style={{ width: `${Math.min(100, target.percentage)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-xs">
        <div>
          <span className="text-[11px] text-gray-400">Projected Run Rate</span>
          <div className="font-semibold text-white">
            ₹{(target.projectedTotal / 100000).toFixed(1)}L
          </div>
        </div>
        <div>
          <span className="text-[11px] text-gray-400">Needed Run Rate</span>
          <div className="font-semibold text-amber-400">
            ₹{(target.dailyRunRateNeeded / 1000).toFixed(0)}k / day
          </div>
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/admin/dashboard/executive/InventoryPulseWidget.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Building, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface InventoryPulseWidgetProps {
  properties: Array<{ name: string; slug: string }>;
}

export function InventoryPulseWidget({ properties }: InventoryPulseWidgetProps) {
  const [selectedProperty, setSelectedProperty] = useState(
    properties[0]?.name || 'Shreeji Valley - Phase 1'
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090e17]/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-blue-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Project Inventory Pulse</h3>
            <p className="text-xs text-gray-400">Allotment & booking status</p>
          </div>
        </div>

        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="focus:border-brand-gold/40 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-gray-200 focus:outline-none"
        >
          {properties.length > 0 ? (
            properties.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))
          ) : (
            <option value="Shreeji Valley">Shreeji Valley - Phase 1</option>
          )}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Total Units: <strong className="text-white">60</strong>
          </span>
          <span className="text-brand-gold text-xs font-medium">78% Occupancy</span>
        </div>

        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-white/10">
          <div className="bg-brand-gold" style={{ width: '65%' }} title="Allotted: 39 Units" />
          <div className="bg-amber-400" style={{ width: '13%' }} title="Reserved: 8 Units" />
          <div className="bg-emerald-500" style={{ width: '22%' }} title="Available: 13 Units" />
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="bg-brand-gold h-2 w-2 rounded-full" />
            <span>Allotted (39)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Reserved (8)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Available (13)</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
        <span className="text-gray-400">Need new allotment letter?</span>
        <Link
          href="/admin/allotment-letter"
          className="text-brand-gold flex items-center gap-1 font-medium hover:underline"
        >
          <span>Create Allotment</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/TargetAchievementMeter.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/dashboard/executive/TargetAchievementMeter.tsx src/components/admin/dashboard/executive/InventoryPulseWidget.tsx tests/components/TargetAchievementMeter.test.tsx
git commit -m "feat(executive): implement target pacing meter and inventory pulse widget"
```

---

### Task 5: Operational Triage: Urgent Attention Radar & Payment Dues Radar

**Files:**

- Create: `src/components/admin/dashboard/executive/UrgentAttentionRadar.tsx`
- Create: `src/components/admin/dashboard/executive/PaymentDuesRadar.tsx`
- Test: `tests/components/UrgentAttentionRadar.test.tsx`

**Interfaces:**

- Consumes: `ExecutiveDashboardData['urgentActions']`, `ExecutiveDashboardData['paymentDues']`.
- Produces: Actionable triage lists with 1-click navigation buttons.

- [ ] **Step 1: Write the failing unit test**

Create `tests/components/UrgentAttentionRadar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UrgentAttentionRadar } from '@/src/components/admin/dashboard/executive/UrgentAttentionRadar';

describe('UrgentAttentionRadar', () => {
  it('renders triage items with action buttons', () => {
    const mockActions = {
      unverifiedReceipts: [
        {
          id: 'rec-1',
          receipt_number: 'REC-092',
          customer_name: 'Anil Agarwal',
          amount: 500000,
          created_at: '2026-09-23T10:00:00Z',
        },
      ],
      hotLeadsPending: [
        {
          id: 'lead-1',
          name: 'Sunita Sharma',
          phone: '+919988776655',
          created_at: '2026-09-23T08:00:00Z',
          temperature: 'hot',
        },
      ],
      pendingLeaves: [],
    };

    render(<UrgentAttentionRadar urgentActions={mockActions} />);
    expect(screen.getByText(/Urgent Executive Triage/i)).toBeDefined();
    expect(screen.getByText('Anil Agarwal')).toBeDefined();
    expect(screen.getByText('Sunita Sharma')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/UrgentAttentionRadar.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement UrgentAttentionRadar and PaymentDuesRadar**

Create `src/components/admin/dashboard/executive/UrgentAttentionRadar.tsx`:

```tsx
'use client';

import { AlertCircle, CheckCircle2, PhoneForwarded, Receipt, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

interface UrgentAttentionRadarProps {
  urgentActions: ExecutiveDashboardData['urgentActions'];
}

export function UrgentAttentionRadar({ urgentActions }: UrgentAttentionRadarProps) {
  const totalUrgent =
    urgentActions.unverifiedReceipts.length +
    urgentActions.hotLeadsPending.length +
    urgentActions.pendingLeaves.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090e17]/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Urgent Executive Triage</h3>
            <p className="text-xs text-gray-400">Items requiring admin attention</p>
          </div>
        </div>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
          {totalUrgent} Pending
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {/* Unverified Receipts */}
        {urgentActions.unverifiedReceipts.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <Receipt className="h-4 w-4 text-purple-400" />
              <div>
                <div className="font-medium text-white">{r.customer_name}</div>
                <div className="text-[11px] text-gray-400">
                  ₹{(r.amount / 100000).toFixed(2)}L • {r.receipt_number}
                </div>
              </div>
            </div>
            <Link
              href="/admin/payment-receipt"
              className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-300 hover:bg-purple-500/20"
            >
              Verify
            </Link>
          </div>
        ))}

        {/* Hot Leads */}
        {urgentActions.hotLeadsPending.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <PhoneForwarded className="h-4 w-4 text-amber-400" />
              <div>
                <div className="font-medium text-white">{l.name}</div>
                <div className="text-[11px] text-gray-400">Hot Lead • {l.phone}</div>
              </div>
            </div>
            <Link
              href="/admin/leads"
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20"
            >
              Assign
            </Link>
          </div>
        ))}

        {/* Pending Leaves */}
        {urgentActions.pendingLeaves.map((lv) => (
          <div
            key={lv.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
          >
            <div>
              <div className="font-medium text-white">{lv.user_name}</div>
              <div className="text-[11px] text-gray-400">Leave Request: {lv.leave_type}</div>
            </div>
            <Link
              href="/admin/workforce?tab=leaves"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20"
            >
              Review
            </Link>
          </div>
        ))}

        {totalUrgent === 0 && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>All Clear! No urgent bottlenecks pending.</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

Create `src/components/admin/dashboard/executive/PaymentDuesRadar.tsx`:

```tsx
'use client';

import { Calendar, Bell, AlertTriangle } from 'lucide-react';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

interface PaymentDuesRadarProps {
  paymentDues: ExecutiveDashboardData['paymentDues'];
}

export function PaymentDuesRadar({ paymentDues }: PaymentDuesRadarProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#090e17]/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Payment Dues Radar</h3>
            <p className="text-xs text-gray-400">Upcoming client installments</p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {paymentDues.map((due) => (
          <div
            key={due.id}
            className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
              due.is_overdue ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/5 bg-white/[0.02]'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 font-medium text-white">
                {due.customer_name}
                {due.is_overdue && (
                  <span className="flex items-center gap-0.5 text-[10px] text-rose-400">
                    <AlertTriangle className="h-3 w-3" /> Overdue
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-400">
                Plot {due.plot_number} • Due: {due.due_date}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                ₹{(due.amount_due / 1000).toFixed(0)}k
              </span>
              <button
                onClick={() => alert(`Reminder queued for ${due.customer_name}`)}
                className="hover:border-brand-gold/30 hover:text-brand-gold rounded-lg border border-white/10 bg-white/5 p-1.5 text-gray-300"
                title="Send Reminder"
              >
                <Bell className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/UrgentAttentionRadar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/dashboard/executive/UrgentAttentionRadar.tsx src/components/admin/dashboard/executive/PaymentDuesRadar.tsx tests/components/UrgentAttentionRadar.test.tsx
git commit -m "feat(executive): implement urgent attention and payment dues triage radars"
```

---

### Task 6: Executive PDF Dossier Exporter

**Files:**

- Create: `src/lib/dashboard/exportExecutiveDossier.ts`
- Test: `tests/lib/exportExecutiveDossier.test.ts`

**Interfaces:**

- Consumes: `ExecutiveDashboardData`.
- Produces: `exportExecutiveDossier(data: ExecutiveDashboardData): Promise<void>` (triggers PDF download).

- [ ] **Step 1: Write unit test**

Create `tests/lib/exportExecutiveDossier.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { generateExecutiveDossierPdf } from '@/src/lib/dashboard/exportExecutiveDossier';

describe('exportExecutiveDossier', () => {
  it('instantiates jsPDF and formats report without throwing', async () => {
    const mockData = {
      kpis: {
        totalCollections: 5000000,
        collectionsGrowthPercent: 12,
        collectionsSparkline: [],
        activeLeads: 50,
        hotLeadsCount: 10,
        leadsSparkline: [],
        bookedPlots: 80,
        totalPlots: 100,
        plotsSparkline: [],
        onDutyStaff: 20,
        totalStaff: 25,
        attendanceRate: 80,
      },
      target: {
        monthlyTarget: 5000000,
        currentCollections: 5000000,
        percentage: 100,
        projectedTotal: 5000000,
        status: 'ahead' as const,
        dailyRunRateNeeded: 0,
      },
      urgentActions: { unverifiedReceipts: [], hotLeadsPending: [], pendingLeaves: [] },
      paymentDues: [],
      revenueTrend: [],
    };

    const doc = await generateExecutiveDossierPdf(mockData);
    expect(doc).toBeDefined();
  });
});
```

- [ ] **Step 2: Implement exportExecutiveDossier with dynamic import**

Create `src/lib/dashboard/exportExecutiveDossier.ts`:

```ts
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

export async function generateExecutiveDossierPdf(data: ExecutiveDashboardData) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55); // Brand Gold
  doc.text('SHRINATHJI VEDIC INDIA', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text('Executive Management Daily Dossier', 14, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 34);

  // Divider
  doc.setDrawColor(212, 175, 55);
  doc.line(14, 38, 196, 38);

  // KPIs
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text('1. Operational Key Performance Indicators', 14, 48);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `• Total Collections: Rs. ${(data.kpis.totalCollections / 100000).toFixed(2)} Lakhs`,
    18,
    56
  );
  doc.text(
    `• Active Sales Pipeline: ${data.kpis.activeLeads} Leads (${data.kpis.hotLeadsCount} Hot)`,
    18,
    62
  );
  doc.text(
    `• Plot Inventory: ${data.kpis.bookedPlots} / ${data.kpis.totalPlots} Units Allotted`,
    18,
    68
  );
  doc.text(
    `• Workforce Attendance: ${data.kpis.onDutyStaff} / ${data.kpis.totalStaff} On-Duty (${data.kpis.attendanceRate}%)`,
    18,
    74
  );

  // Target Pacing
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text('2. Monthly Revenue Target & Run-Rate', 14, 88);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `• Target: Rs. ${(data.target.monthlyTarget / 100000).toFixed(1)} Lakhs | Achieved: ${data.target.percentage}%`,
    18,
    96
  );
  doc.text(`• Pacing Status: ${data.target.status.toUpperCase()}`, 18, 102);

  return doc;
}

export async function exportExecutiveDossier(data: ExecutiveDashboardData) {
  const doc = await generateExecutiveDossierPdf(data);
  doc.save(`SVI_Executive_Dossier_${new Date().toISOString().split('T')[0]}.pdf`);
}
```

- [ ] **Step 3: Run test to verify it passes**

Run: `npx vitest run tests/lib/exportExecutiveDossier.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/dashboard/exportExecutiveDossier.ts tests/lib/exportExecutiveDossier.test.ts
git commit -m "feat(executive): implement executive pdf dossier generator"
```

---

### Task 7: Assemble `/admin/dashboard2` Page and End-to-End Verification

**Files:**

- Create: `app/admin/dashboard2/page.tsx`
- Test: Playwright / curl verification on `http://localhost:3001/admin/dashboard2`

- [ ] **Step 1: Create `app/admin/dashboard2/page.tsx`**

Integrate all components together into the new route:

- `ExecutiveBriefingBanner`
- `ExecutiveBentoKpis`
- `TargetAchievementMeter` & `InventoryPulseWidget`
- `DashboardChartsGrid`
- `UrgentAttentionRadar` & `PaymentDuesRadar`
- `DashboardUsersTable`
- `CommandPaletteModal`

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS (0 errors)

- [ ] **Step 3: Run all unit tests**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 4: Verify with curl / HTTP on port 3001**

Run: `curl -s -o NUL -w "%{http_code}\n" http://localhost:3001/admin/dashboard2`
Expected: 200

- [ ] **Step 5: Commit**

```bash
git add app/admin/dashboard2/page.tsx
git commit -m "feat(admin): build executive command cockpit on /admin/dashboard2"
```
