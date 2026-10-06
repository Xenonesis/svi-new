# Mobile Conversion Dock & Interactive Master Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-only luxury conversion dock with a frictionless 1-click Free AC Cab site visit modal, and deliver an interactive master plan & live plot availability grid (230 units) with real-time Supabase allotment sync on Shivani Vatika 11th.

**Architecture:**

- Mobile conversion dock renders exclusively under `< 768px` with 3 core action pillars (Call Advisor, WhatsApp Brochure with dynamic page context, Free Cab Visit hero trigger) respecting safe-area insets.
- Master plan subsystem provides a dual-view experience (visual blueprint with sector hotspots + searchable/filterable plot matrix grid across 230 units) with real-time Supabase `allotments` table status synchronization and slide-over plot detail drawer.

**Tech Stack:** Next.js 15 (App Router, bilingual `next-intl`), Tailwind CSS v4, Framer Motion (`motion/react`), Lucide React, Supabase PostgreSQL, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-06-real-estate-conversion-and-interactive-master-plan-design.md`

## Global Constraints

- Strict TypeScript: No `: any` or `as any`. Use concrete interfaces and `import type`.
- Luxury Color Palette: Obsidian Slate (`#080b11`, `#111622`) + Luxury Warm Gold (`#d4af37`, `#c9a84c`).
- Minimum touch target: 44px x 44px (dock uses 52px).
- Zero database mutations: Do not alter live Supabase schema or drop tables.
- Mobile Viewport: Floating dock strictly hidden on `md:` screens (`hidden md:hidden`). Safe area bottom: `pb-[max(12px,env(safe-area-inset-bottom,12px))]`.

---

### Task 1: Refactor & Extract `SiteVisitModal.tsx` with 10-Digit Validation

**Files:**

- Create: `src/components/layout/SiteVisitModal.tsx`
- Test: `__tests__/components/layout/SiteVisitModal.test.tsx`

**Interfaces:**

- Produces:

  ```typescript
  export interface SiteVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    prefilledProject?: string;
    prefilledPlot?: string;
  }
  export function SiteVisitModal(props: SiteVisitModalProps): React.JSX.Element | null;
  ```

- [ ] **Step 1: Write failing test for `SiteVisitModal`**

```tsx
// __tests__/components/layout/SiteVisitModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SiteVisitModal } from '@/src/components/layout/SiteVisitModal';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('SiteVisitModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<SiteVisitModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders form fields when isOpen is true', () => {
    render(
      <SiteVisitModal
        isOpen={true}
        onClose={vi.fn()}
        prefilledProject="Shivani Vatika 11th"
        prefilledPlot="32"
      />
    );
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/10-digit mobile number/i)).toBeInTheDocument();
    expect(screen.getByText(/Plot #32/i)).toBeInTheDocument();
  });

  it('validates 10-digit Indian phone number', async () => {
    render(<SiteVisitModal isOpen={true} onClose={vi.fn()} />);
    const nameInput = screen.getByPlaceholderText(/full name/i);
    const phoneInput = screen.getByPlaceholderText(/10-digit mobile number/i);
    const submitBtn = screen.getByRole('button', { name: /confirm free cab booking/i });

    fireEvent.change(nameInput, { target: { value: 'Ramesh Sharma' } });
    fireEvent.change(phoneInput, { target: { value: '12345' } });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/please enter a valid 10-digit indian mobile number/i)
    ).toBeInTheDocument();
  });

  it('successfully submits valid booking', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, id: 'mock-lead-123' }),
    });
    global.fetch = fetchMock;

    render(
      <SiteVisitModal isOpen={true} onClose={vi.fn()} prefilledProject="Shivani Vatika 11th" />
    );
    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: 'Ramesh Sharma' },
    });
    fireEvent.change(screen.getByPlaceholderText(/10-digit mobile number/i), {
      target: { value: '9876543210' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm free cab booking/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/site-visit',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('9876543210'),
        })
      );
    });

    expect(await screen.findByText(/booking confirmed/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/layout/SiteVisitModal.test.tsx`  
Expected: FAIL with module not found or missing exports.

- [ ] **Step 3: Implement `SiteVisitModal.tsx`**

```tsx
// src/components/layout/SiteVisitModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Car, Calendar, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export interface SiteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledProject?: string;
  prefilledPlot?: string;
}

export function SiteVisitModal({
  isOpen,
  onClose,
  prefilledProject = 'Shivani Vatika 11th',
  prefilledPlot,
}: SiteVisitModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupCity, setPickupCity] = useState('Jaipur');
  const [visitDate, setVisitDate] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    if (isOpen) {
      setVisitDate(tomorrowStr);
      setIsSuccess(false);
      setPhoneError('');
    }
  }, [isOpen, tomorrowStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const notes = `Booked via Mobile Conversion Dock. Free AC Cab requested.${
        prefilledPlot ? ` Interested in Plot #${prefilledPlot}.` : ''
      } Pickup: ${pickupCity}.`;

      const res = await fetch('/api/site-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          project_interest: prefilledPlot
            ? `${prefilledProject} - Plot #${prefilledPlot}`
            : prefilledProject,
          preferred_date: visitDate || tomorrowStr,
          notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to book visit');
      setIsSuccess(true);
    } catch {
      setPhoneError('Failed to connect. Please call or WhatsApp us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-t-3xl border border-white/10 bg-[#0c1019] p-6 text-white shadow-2xl sm:rounded-3xl"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 rounded-full bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {isSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">Booking Confirmed!</h3>
              <p className="mt-2 text-sm text-gray-300">
                Our executive will call you within 15 minutes to confirm your complimentary AC Cab
                pickup.
              </p>
              {prefilledPlot && (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
                  <Sparkles size={14} /> Reserved Site Visit for Plot #{prefilledPlot}
                </div>
              )}
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={`https://wa.me/919218300589?text=${encodeURIComponent(
                    `Namaste SVI Infra, I just booked a site visit for ${prefilledProject}${
                      prefilledPlot ? ` (Plot #${prefilledPlot})` : ''
                    }. Please send cab details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl bg-[#25D366] py-3.5 text-center text-sm font-bold text-slate-950 transition-all hover:brightness-105"
                >
                  Get Cab Details on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-300 hover:bg-white/10"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Car size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Schedule Free Site Visit
                  </h3>
                  <p className="text-xs font-medium text-amber-300/90">
                    Free AC Cab Pickup & Drop for Family
                  </p>
                </div>
              </div>

              {prefilledPlot && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2 text-xs">
                  <span className="text-gray-300">Selected Plot:</span>
                  <span className="font-bold text-amber-300">Plot #{prefilledPlot}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-400 focus:bg-white/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Mobile Number *
                  </label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-xl border border-r-0 border-white/10 bg-white/10 px-3.5 text-sm font-semibold text-gray-300">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ''));
                        if (phoneError) setPhoneError('');
                      }}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-r-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-400 focus:bg-white/10"
                    />
                  </div>
                  {phoneError && <p className="mt-1 text-xs text-rose-400">{phoneError}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Visit Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white [color-scheme:dark] outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Pickup City
                    </label>
                    <select
                      value={pickupCity}
                      onChange={(e) => setPickupCity(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#111622] px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                    >
                      <option value="Jaipur">Jaipur</option>
                      <option value="Ringas">Ringas</option>
                      <option value="Sikar">Sikar</option>
                      <option value="Delhi-NCR">Delhi-NCR</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-[11px] text-gray-400">
                  <ShieldCheck size={16} className="flex-shrink-0 text-amber-400" />
                  <span>No obligation, 100% free door-to-door AC cab pickup.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a84c] py-3.5 text-center text-sm font-bold text-[#080b11] shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 disabled:opacity-50"
                >
                  {isSubmitting ? 'Booking Cab...' : 'Confirm Free Cab Booking'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/components/layout/SiteVisitModal.test.tsx`  
Expected: PASS (4 tests passing).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/SiteVisitModal.tsx __tests__/components/layout/SiteVisitModal.test.tsx
git commit -m "feat(conversion): extract frictionless SiteVisitModal with 10-digit validation"
```

---

### Task 2: Build Global `MobileConversionDock.tsx` & Mount in `ClientProviders`

**Files:**

- Create: `src/components/layout/MobileConversionDock.tsx`
- Modify: `src/components/ClientProviders.tsx`
- Test: `__tests__/components/layout/MobileConversionDock.test.tsx`

**Interfaces:**

- Produces:

  ```typescript
  export function MobileConversionDock(): React.JSX.Element;
  ```

- [ ] **Step 1: Write failing test for `MobileConversionDock`**

```tsx
// __tests__/components/layout/MobileConversionDock.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileConversionDock } from '@/src/components/layout/MobileConversionDock';

vi.mock('next/navigation', () => ({
  usePathname: () => '/projects/shivani-vatika-11th',
}));

describe('MobileConversionDock', () => {
  it('renders 3 core action buttons', () => {
    render(<MobileConversionDock />);
    expect(screen.getByRole('link', { name: /call advisor/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /whatsapp brochure/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /free cab visit/i })).toBeInTheDocument();
  });

  it('provides correct telephone deep link', () => {
    render(<MobileConversionDock />);
    const callLink = screen.getByRole('link', { name: /call advisor/i });
    expect(callLink).toHaveAttribute('href', 'tel:+919218300589');
  });

  it('provides WhatsApp deep link with contextual project message', () => {
    render(<MobileConversionDock />);
    const waLink = screen.getByRole('link', { name: /whatsapp brochure/i });
    expect(waLink.getAttribute('href')).toContain('wa.me');
    expect(waLink.getAttribute('href')).toContain('Shivani%20Vatika%2011th');
  });

  it('opens SiteVisitModal when Free Cab Visit is clicked', () => {
    render(<MobileConversionDock />);
    const cabBtn = screen.getByRole('button', { name: /free cab visit/i });
    fireEvent.click(cabBtn);
    expect(screen.getByText(/schedule free site visit/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/layout/MobileConversionDock.test.tsx`  
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `MobileConversionDock.tsx`**

```tsx
// src/components/layout/MobileConversionDock.tsx
'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Car } from 'lucide-react';
import { SiteVisitModal } from './SiteVisitModal';
import { PHONE_HREF } from '@/src/lib/constants';

export function MobileConversionDock() {
  const pathname = usePathname() || '';
  const [isSiteVisitOpen, setIsSiteVisitOpen] = useState(false);

  // Derive current project name from path for targeted WhatsApp inquiries
  const projectName = (() => {
    if (pathname.includes('shivani-vatika-11th')) return 'Shivani Vatika 11th';
    if (pathname.includes('shivani-vatika')) return 'Shivani Vatika';
    if (pathname.includes('shyam-aangan')) return 'Shyam Aangan';
    if (pathname.includes('phulera')) return 'Phulera SmartCity';
    return 'Residential Plots';
  })();

  const waText = encodeURIComponent(
    `Namaste SVI Infra, please send me the official brochure and price list for ${projectName}.`
  );
  const waUrl = `https://wa.me/919218300589?text=${waText}`;

  return (
    <>
      <nav
        aria-label="Mobile quick actions"
        className="fixed right-0 bottom-0 left-0 z-40 flex h-[calc(3.75rem+env(safe-area-inset-bottom,12px))] w-full items-center justify-between border-t border-[#d4af37]/20 bg-[#080b11]/95 px-3 pt-1 pb-[max(12px,env(safe-area-inset-bottom,12px))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:hidden"
      >
        {/* 1. Call Advisor */}
        <a
          href={PHONE_HREF}
          className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-gray-300 transition-colors active:bg-white/5 active:text-white"
          aria-label="Call Advisor"
        >
          <Phone size={18} className="text-[#d4af37]" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">Call Advisor</span>
        </a>

        {/* 2. WhatsApp Brochure */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-gray-300 transition-colors active:bg-white/5 active:text-white"
          aria-label="WhatsApp Brochure"
        >
          <MessageCircle size={18} className="text-[#25D366]" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">WhatsApp</span>
        </a>

        {/* 3. Free Cab Visit */}
        <button
          type="button"
          onClick={() => setIsSiteVisitOpen(true)}
          className="flex min-h-[48px] flex-[1.2] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a84c] px-2 py-2 text-[#080b11] shadow-md shadow-amber-500/20 active:scale-95"
          aria-label="Free Cab Visit"
        >
          <Car size={18} className="text-[#080b11]" />
          <span className="text-[11px] font-bold tracking-tight uppercase">Free Cab Visit</span>
        </button>
      </nav>

      {/* Slide-Up Booking Modal */}
      <SiteVisitModal
        isOpen={isSiteVisitOpen}
        onClose={() => setIsSiteVisitOpen(false)}
        prefilledProject={projectName}
      />
    </>
  );
}
```

- [ ] **Step 4: Mount `MobileConversionDock` in `ClientProviders.tsx`**

Modify `src/components/ClientProviders.tsx` to mount `<MobileConversionDock />` alongside `<FloatingContact />`.

- [ ] **Step 5: Run tests to verify**

Run: `npx vitest run __tests__/components/layout/MobileConversionDock.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/MobileConversionDock.tsx src/components/ClientProviders.tsx __tests__/components/layout/MobileConversionDock.test.tsx
git commit -m "feat(conversion): implement 3-pillar MobileConversionDock with safe area insets"
```

---

### Task 3: Shivani Vatika 11th Plot Master Dataset & Normalizer

**Files:**

- Create: `src/data/shivaniVatika11Plots.ts`
- Test: `__tests__/data/shivaniVatika11Plots.test.ts`

**Interfaces:**

- Produces:

  ```typescript
  export type PlotBlock = 'Residential' | 'A-Block' | 'Commercial';
  export type PlotStatus = 'AVAILABLE' | 'BOOKED' | 'RESERVED';

  export interface PlotData {
    plotNo: string;
    block: PlotBlock;
    sizeSqYd: number;
    dimensions: string;
    facing: 'East' | 'North' | 'West' | 'South' | 'Park Facing' | 'Corner' | 'Highway';
    roadWidth: string;
    status: PlotStatus;
    priceEstimate: number;
  }

  export function normalizeUnitNumber(raw: string): string;
  export function parseCompoundUnitNumbers(raw: string): string[];
  export const SHIVANI_VATIKA_11_PLOTS: PlotData[];
  ```

- [ ] **Step 1: Write failing test for `shivaniVatika11Plots`**

```tsx
// __tests__/data/shivaniVatika11Plots.test.ts
import { describe, it, expect } from 'vitest';
import {
  SHIVANI_VATIKA_11_PLOTS,
  normalizeUnitNumber,
  parseCompoundUnitNumbers,
} from '@/src/data/shivaniVatika11Plots';

describe('shivaniVatika11Plots dataset', () => {
  it('contains exactly 230 demarcated units', () => {
    expect(SHIVANI_VATIKA_11_PLOTS.length).toBe(230);
  });

  it('includes residential, A-Block, and commercial units', () => {
    const blocks = new Set(SHIVANI_VATIKA_11_PLOTS.map((p) => p.block));
    expect(blocks.has('Residential')).toBe(true);
    expect(blocks.has('A-Block')).toBe(true);
    expect(blocks.has('Commercial')).toBe(true);
  });

  it('has valid positive size and price estimates for all plots', () => {
    SHIVANI_VATIKA_11_PLOTS.forEach((plot) => {
      expect(plot.sizeSqYd).toBeGreaterThan(0);
      expect(plot.priceEstimate).toBeGreaterThan(0);
      expect(plot.plotNo).toBeDefined();
    });
  });

  it('normalizes unit numbers correctly', () => {
    expect(normalizeUnitNumber('Plot #32')).toBe('32');
    expect(normalizeUnitNumber('Unit 31')).toBe('31');
    expect(normalizeUnitNumber(' A-15 ')).toBe('a-15');
  });

  it('parses compound unit strings correctly', () => {
    expect(parseCompoundUnitNumbers('126+127')).toEqual(['126', '127']);
    expect(parseCompoundUnitNumbers('94,95')).toEqual(['94', '95']);
    expect(parseCompoundUnitNumbers('32')).toEqual(['32']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/data/shivaniVatika11Plots.test.ts`  
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/data/shivaniVatika11Plots.ts`**

Generate and export the complete 230-unit dataset adhering to `SA 11 TH  FINAL MAP.pdf`:

- 168 Main Residential plots (Numbered 1-198 with merges and variants).
- 50 A-Block plots (`A-1` to `A-50`).
- 12 Commercial Shops (`Shop-1` to `Shop-12`).
  Implement `normalizeUnitNumber` and `parseCompoundUnitNumbers`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/data/shivaniVatika11Plots.test.ts`  
Expected: PASS (5 tests passing).

- [ ] **Step 5: Commit**

```bash
git add src/data/shivaniVatika11Plots.ts __tests__/data/shivaniVatika11Plots.test.ts
git commit -m "feat(plots): create Shivani Vatika 11th 230-unit dataset and normalizer"
```

---

### Task 4: Create `useLivePlotStatus.ts` (Supabase Allotment Sync Hook)

**Files:**

- Create: `src/lib/hooks/useLivePlotStatus.ts`
- Test: `__tests__/lib/hooks/useLivePlotStatus.test.ts`

**Interfaces:**

- Produces:

  ```typescript
  export function useLivePlotStatus(baselinePlots: PlotData[]): {
    plots: PlotData[];
    loading: boolean;
    bookedCount: number;
    availableCount: number;
    reservedCount: number;
  };
  ```

- [ ] **Step 1: Write failing test for `useLivePlotStatus`**

```tsx
// __tests__/lib/hooks/useLivePlotStatus.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLivePlotStatus } from '@/src/lib/hooks/useLivePlotStatus';
import type { PlotData } from '@/src/data/shivaniVatika11Plots';

const mockBaseline: PlotData[] = [
  {
    plotNo: '31',
    block: 'Residential',
    sizeSqYd: 100,
    dimensions: "25' x 36'",
    facing: 'North',
    roadWidth: '30 Ft Internal',
    status: 'AVAILABLE',
    priceEstimate: 750000,
  },
  {
    plotNo: '32',
    block: 'Residential',
    sizeSqYd: 80,
    dimensions: "20' x 36'",
    facing: 'East',
    roadWidth: '30 Ft Internal',
    status: 'AVAILABLE',
    priceEstimate: 600000,
  },
];

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: [
              { unit_no: '31', status: 'Allotted' },
              { unit_no: '32', status: 'Pending' },
            ],
            error: null,
          }),
      }),
    }),
  },
}));

describe('useLivePlotStatus', () => {
  it('hydrates plot statuses from Supabase allotments', async () => {
    const { result } = renderHook(() => useLivePlotStatus(mockBaseline));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const plot31 = result.current.plots.find((p) => p.plotNo === '31');
    const plot32 = result.current.plots.find((p) => p.plotNo === '32');

    expect(plot31?.status).toBe('BOOKED');
    expect(plot32?.status).toBe('RESERVED');
    expect(result.current.bookedCount).toBe(1);
    expect(result.current.reservedCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/lib/hooks/useLivePlotStatus.test.ts`  
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/lib/hooks/useLivePlotStatus.ts`**

```tsx
// src/lib/hooks/useLivePlotStatus.ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import {
  type PlotData,
  normalizeUnitNumber,
  parseCompoundUnitNumbers,
} from '@/src/data/shivaniVatika11Plots';

const SHIVANI_VATIKA_11_PROPERTY_ID = 'e154bd4e-eecb-4dc0-ac44-b017cb61a6f0';

export function useLivePlotStatus(baselinePlots: PlotData[]) {
  const [plots, setPlots] = useState<PlotData[]>(baselinePlots);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchLiveAllotments() {
      try {
        const { data, error } = await supabase
          .from('allotments')
          .select('unit_no, status')
          .eq('property_id', SHIVANI_VATIKA_11_PROPERTY_ID);

        if (error || !data || !isMounted) {
          setLoading(false);
          return;
        }

        // Map allotment unit status
        const statusMap = new Map<string, 'BOOKED' | 'RESERVED'>();
        data.forEach((row) => {
          const rawStatus = (row.status || '').toLowerCase();
          const targetStatus =
            rawStatus === 'allotted' || rawStatus === 'registered' ? 'BOOKED' : 'RESERVED';

          const units = parseCompoundUnitNumbers(row.unit_no);
          units.forEach((u) => {
            statusMap.set(normalizeUnitNumber(u), targetStatus);
          });
        });

        // Update baseline plots with live overrides
        const updated = baselinePlots.map((plot) => {
          const normKey = normalizeUnitNumber(plot.plotNo);
          const override = statusMap.get(normKey);
          return override ? { ...plot, status: override } : plot;
        });

        if (isMounted) {
          setPlots(updated);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    fetchLiveAllotments();

    return () => {
      isMounted = false;
    };
  }, [baselinePlots]);

  const bookedCount = plots.filter((p) => p.status === 'BOOKED').length;
  const reservedCount = plots.filter((p) => p.status === 'RESERVED').length;
  const availableCount = plots.filter((p) => p.status === 'AVAILABLE').length;

  return {
    plots,
    loading,
    bookedCount,
    reservedCount,
    availableCount,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/lib/hooks/useLivePlotStatus.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hooks/useLivePlotStatus.ts __tests__/lib/hooks/useLivePlotStatus.test.ts
git commit -m "feat(plots): add useLivePlotStatus hook for Supabase allotment synchronization"
```

---

### Task 5: Build `PlotCard.tsx` & `PlotDetailDrawer.tsx`

**Files:**

- Create: `src/components/projects/shivani-vatika-11/PlotCard.tsx`
- Create: `src/components/projects/shivani-vatika-11/PlotDetailDrawer.tsx`
- Test: `__tests__/components/projects/shivani-vatika-11/PlotDetailDrawer.test.tsx`

**Interfaces:**

- Produces:

  ```typescript
  export interface PlotCardProps {
    plot: PlotData;
    onSelect: (plot: PlotData) => void;
  }
  export function PlotCard(props: PlotCardProps): React.JSX.Element;

  export interface PlotDetailDrawerProps {
    plot: PlotData | null;
    onClose: () => void;
    onBookSiteVisit: (plot: PlotData) => void;
  }
  export function PlotDetailDrawer(props: PlotDetailDrawerProps): React.JSX.Element | null;
  ```

- [ ] **Step 1: Write failing test for `PlotDetailDrawer`**

```tsx
// __tests__/components/projects/shivani-vatika-11/PlotDetailDrawer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlotDetailDrawer } from '@/src/components/projects/shivani-vatika-11/PlotDetailDrawer';
import type { PlotData } from '@/src/data/shivaniVatika11Plots';

const mockPlot: PlotData = {
  plotNo: '45',
  block: 'Residential',
  sizeSqYd: 100,
  dimensions: "25' x 36'",
  facing: 'Park Facing',
  roadWidth: '30 Ft Internal',
  status: 'AVAILABLE',
  priceEstimate: 750000,
};

describe('PlotDetailDrawer', () => {
  it('renders nothing when plot is null', () => {
    const { container } = render(
      <PlotDetailDrawer plot={null} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders plot details when plot is passed', () => {
    render(<PlotDetailDrawer plot={mockPlot} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />);
    expect(screen.getByText(/Plot #45/i)).toBeInTheDocument();
    expect(screen.getByText(/100 Sq. Yds./i)).toBeInTheDocument();
    expect(screen.getByText(/Park Facing/i)).toBeInTheDocument();
  });

  it('provides WhatsApp reservation link with pre-filled message', () => {
    render(<PlotDetailDrawer plot={mockPlot} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />);
    const waLink = screen.getByRole('link', { name: /reserve on whatsapp/i });
    expect(waLink).toHaveAttribute('href');
    expect(waLink.getAttribute('href')).toContain('Plot%20%2345');
  });

  it('triggers onBookSiteVisit when site visit button is clicked', () => {
    const onBookVisitMock = vi.fn();
    render(
      <PlotDetailDrawer plot={mockPlot} onClose={vi.fn()} onBookSiteVisit={onBookVisitMock} />
    );
    const visitBtn = screen.getByRole('button', { name: /visit this plot/i });
    fireEvent.click(visitBtn);
    expect(onBookVisitMock).toHaveBeenCalledWith(mockPlot);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/projects/shivani-vatika-11/PlotDetailDrawer.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement `PlotCard.tsx` and `PlotDetailDrawer.tsx`**

Implement `PlotCard` with color-coded status badges (🟢 Available, 🔴 Booked, 🟡 Reserved), dimensions, and hover states.  
Implement `PlotDetailDrawer` with slide-over backdrop, specs table, estimated booking token (₹21,000), total deal value, WhatsApp link, and `onBookSiteVisit` callback.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/components/projects/shivani-vatika-11/PlotDetailDrawer.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/shivani-vatika-11/PlotCard.tsx src/components/projects/shivani-vatika-11/PlotDetailDrawer.tsx __tests__/components/projects/shivani-vatika-11/PlotDetailDrawer.test.tsx
git commit -m "feat(plots): implement PlotCard and PlotDetailDrawer with WhatsApp reservation"
```

---

### Task 6: Build `PlotMatrixGrid.tsx`, `BlueprintMapView.tsx`, and `ShivaniVatika11MasterPlan.tsx`

**Files:**

- Create: `src/components/projects/shivani-vatika-11/PlotMatrixGrid.tsx`
- Create: `src/components/projects/shivani-vatika-11/BlueprintMapView.tsx`
- Create: `src/components/projects/shivani-vatika-11/ShivaniVatika11MasterPlan.tsx`
- Modify: `app/[locale]/(main)/projects/[slug]/page.tsx`
- Test: `__tests__/components/projects/shivani-vatika-11/ShivaniVatika11MasterPlan.test.tsx`

**Interfaces:**

- Produces:

  ```typescript
  export function ShivaniVatika11MasterPlan(): React.JSX.Element;
  ```

- [ ] **Step 1: Write failing test for `ShivaniVatika11MasterPlan`**

```tsx
// __tests__/components/projects/shivani-vatika-11/ShivaniVatika11MasterPlan.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShivaniVatika11MasterPlan } from '@/src/components/projects/shivani-vatika-11/ShivaniVatika11MasterPlan';

vi.mock('@/src/lib/hooks/useLivePlotStatus', () => ({
  useLivePlotStatus: () => ({
    plots: [
      {
        plotNo: '1',
        block: 'Residential',
        sizeSqYd: 100,
        dimensions: "25' x 36'",
        facing: 'East',
        roadWidth: '30 Ft Internal',
        status: 'AVAILABLE',
        priceEstimate: 750000,
      },
    ],
    loading: false,
    bookedCount: 0,
    availableCount: 1,
    reservedCount: 0,
  }),
}));

describe('ShivaniVatika11MasterPlan', () => {
  it('renders section header and view mode toggles', () => {
    render(<ShivaniVatika11MasterPlan />);
    expect(
      screen.getByText(/interactive master plan & live plot availability/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /blueprint view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /plot grid matrix/i })).toBeInTheDocument();
  });

  it('toggles between blueprint view and plot grid matrix', () => {
    render(<ShivaniVatika11MasterPlan />);
    const gridBtn = screen.getByRole('button', { name: /plot grid matrix/i });
    fireEvent.click(gridBtn);
    expect(screen.getByPlaceholderText(/search plot #/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/projects/shivani-vatika-11/ShivaniVatika11MasterPlan.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement components & mount in project page**

1. Implement `PlotMatrixGrid.tsx` with block filters (`All`, `Residential`, `A-Block`, `Commercial`), size filters, status filters, and plot search input.
2. Implement `BlueprintMapView.tsx` displaying `master-plan-layout.webp` with interactive sector hotspots (A-Block, Main Avenue, Commercial Shops, Green Parks) and download master blueprint button.
3. Implement `ShivaniVatika11MasterPlan.tsx` managing active view state (`blueprint` vs `grid`), selected plot drawer state, and `SiteVisitModal` integration.
4. Mount `<ShivaniVatika11MasterPlan />` in `app/[locale]/(main)/projects/[slug]/page.tsx` when `slug === 'shivani-vatika-11th'`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/components/projects/shivani-vatika-11/ShivaniVatika11MasterPlan.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/shivani-vatika-11/ app/[locale]/(main)/projects/[slug]/page.tsx __tests__/components/projects/shivani-vatika-11/ShivaniVatika11MasterPlan.test.tsx
git commit -m "feat(plots): add dual-view ShivaniVatika11MasterPlan with blueprint and filterable grid"
```

---

### Task 7: End-to-End Verification & Browser Smoke Test

**Files:**

- Verification only

- [ ] **Step 1: Run complete repository test suite**

Run: `npx vitest run`  
Expected: All test suites PASS (0 failing).

- [ ] **Step 2: Run full TypeScript check**

Run: `npx tsc --noEmit`  
Expected: 0 errors.

- [ ] **Step 3: Run Headless Browser Smoke Test**

Using browser eval:

1. Open `http://localhost:3001/` on mobile viewport (`390x844`), verify `MobileConversionDock` renders with 3 buttons and safe-area inset.
2. Click "Free Cab Visit", verify `SiteVisitModal` opens cleanly.
3. Navigate to `http://localhost:3001/projects/shivani-vatika-11th`, verify Master Plan section renders with blueprint view and plot grid toggle.
4. Switch to Plot Grid, click a plot card, verify `PlotDetailDrawer` opens with specs and WhatsApp deep link.
5. Take screenshot proof.

- [ ] **Step 4: Final Git Commit**

```bash
git commit -m "chore: verified mobile dock and interactive master plan end-to-end"
```
