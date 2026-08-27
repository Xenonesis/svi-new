# Employee Mobile App & Dual-App Android Architecture (SVI Workspace) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully autonomous, production-grade Android App for employees (`com.svi.infrasolutions.employee` / "SVI Workspace") that co-exists with the Admin App on the same phone, featuring GPS geofenced attendance punching, an offline punch queue with auto-sync, biometric verification, and on-site work/lead tracking.

**Architecture:** Utilize Capacitor 8 with Android Gradle Product Flavors (`admin` vs `employee`) to output independent APK packages with distinct application IDs, icons, and entry routes. On the frontend, provide a mobile-first app shell (`app/employee/*`) featuring a live radar punch terminal, offline IndexedDB/LocalStorage queueing with network event listeners, and direct WhatsApp/Phone integrations for field executives.

**Tech Stack:** Next.js 16.2 (App Router), Capacitor 8.5 (Android), TypeScript 6, Tailwind CSS 4, Motion, Lucide React, Supabase PostgreSQL, Vitest.

**Spec:** Context files at `context/architecture.md`, `context/database_schema.md`, and `context/tech_stack.md`.

## Global Constraints

- **Dual-App Side-by-Side Coexistence:** Admin app (`com.svi.infrasolutions`) and Employee app (`com.svi.infrasolutions.employee`) must be independently installable on the same Android device without package collisions.
- **Brand Standards:** Official SVI branding (`/logo.png`), sleek modern vector icons (Lucide React), luxury slate-950 and gold/blue palette. Zero cartoonish or low-quality assets.
- **Zero TypeScript Errors:** Strict typechecking (`tsc --noEmit`) must pass with 0 errors after every task.
- **Full Test Suite:** All Vitest unit tests must pass cleanly.
- **Offline Resilience:** Punch-in and punch-out actions must not fail catastrophically when network is unavailable; actions must be stored locally in an offline queue and synced automatically upon reconnection.

---

### Task 1: Android Multi-Flavor Configuration & Dual-App Build Scripts

**Files:**

- Modify: `android/app/build.gradle`
- Modify: `capacitor.config.ts`
- Modify: `package.json`
- Test: `__tests__/mobile/flavor-config.test.ts`

**Interfaces:**

- Consumes: `process.env.CAP_APP_TARGET` ('admin' | 'employee')
- Produces: Gradle Product Flavors `admin` (`com.svi.infrasolutions`, "SVI Admin") and `employee` (`com.svi.infrasolutions.employee`, "SVI Workspace"), plus npm scripts `cap:employee:build` and `cap:admin:build`.

- [ ] **Step 1: Write the failing test for flavor and target configurations**

Create `__tests__/mobile/flavor-config.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Android Multi-App Flavor Configuration', () => {
  it('should verify capacitor.config.ts supports both admin and employee targets', () => {
    const configPath = path.resolve(process.cwd(), 'capacitor.config.ts');
    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toContain("target === 'employee'");
    expect(content).toContain('com.svi.infrasolutions.employee');
    expect(content).toContain('com.svi.infrasolutions');
    expect(content).toContain('SVI Workspace');
    expect(content).toContain('SVI Admin');
  });

  it('should define productFlavors in android/app/build.gradle for admin and employee', () => {
    const gradlePath = path.resolve(process.cwd(), 'android/app/build.gradle');
    const content = fs.readFileSync(gradlePath, 'utf-8');
    expect(content).toContain('productFlavors');
    expect(content).toContain('com.svi.infrasolutions.employee');
    expect(content).toContain('com.svi.infrasolutions');
  });

  it('should define distinct npm scripts for employee and admin builds in package.json', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.scripts['cap:employee:sync']).toBeDefined();
    expect(pkg.scripts['cap:admin:sync']).toBeDefined();
    expect(pkg.scripts['cap:employee:build']).toBeDefined();
    expect(pkg.scripts['cap:admin:build']).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/mobile/flavor-config.test.ts`
Expected: FAIL due to missing productFlavors in `build.gradle` and missing build scripts in `package.json`.

- [ ] **Step 3: Update `android/app/build.gradle`, `capacitor.config.ts`, and `package.json`**

In `android/app/build.gradle`, configure `flavorDimensions` and `productFlavors`:

```groovy
    flavorDimensions "default"
    productFlavors {
        admin {
            dimension "default"
            applicationId "com.svi.infrasolutions"
            resValue "string", "app_name", "SVI Admin"
            resValue "string", "title_activity_main", "SVI Admin"
            resValue "string", "package_name", "com.svi.infrasolutions"
            resValue "string", "custom_url_scheme", "com.svi.infrasolutions"
        }
        employee {
            dimension "default"
            applicationId "com.svi.infrasolutions.employee"
            resValue "string", "app_name", "SVI Workspace"
            resValue "string", "title_activity_main", "SVI Workspace"
            resValue "string", "package_name", "com.svi.infrasolutions.employee"
            resValue "string", "custom_url_scheme", "com.svi.infrasolutions.employee"
        }
    }
```

In `package.json`, add the build scripts:

```json
"cap:employee:build": "cross-env CAP_APP_TARGET=employee npx cap sync android && cd android && gradlew assembleEmployeeRelease && cd ..",
"cap:admin:build": "cross-env CAP_APP_TARGET=admin npx cap sync android && cd android && gradlew assembleAdminRelease && cd ..",
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/mobile/flavor-config.test.ts`
Expected: PASS with 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add __tests__/mobile/flavor-config.test.ts android/app/build.gradle package.json
git commit -m "feat(mobile): configure android product flavors for dual admin and employee apps"
```

---

### Task 2: Offline Punch Queue & Auto-Sync Engine

**Files:**

- Create: `src/lib/attendance/offlinePunchQueue.ts`
- Modify: `src/components/employee/attendance/PunchTerminalWidget.tsx`
- Modify: `app/employee/attendance/page.tsx`
- Test: `__tests__/attendance/offline-punch-queue.test.ts`

**Interfaces:**

- Produces:

  ```ts
  export interface QueuedPunch {
    id: string;
    type: 'in' | 'out';
    timestamp: string;
    coords: { lat: number; lon: number };
    workSummary?: string;
    clientCount?: number;
    visitCount?: number;
    status: 'pending' | 'syncing' | 'failed';
    errorMessage?: string;
  }
  export const offlinePunchQueue: {
    enqueue(item: Omit<QueuedPunch, 'id' | 'status'>): QueuedPunch;
    getQueue(): QueuedPunch[];
    clear(): void;
    syncPendingPunches(): Promise<{ synced: number; failed: number }>;
  };
  ```

- [ ] **Step 1: Write the failing test for the offline punch queue**

Create `__tests__/attendance/offline-punch-queue.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { offlinePunchQueue } from '@/src/lib/attendance/offlinePunchQueue';

describe('Offline Attendance Punch Queue', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should enqueue punch actions with local timestamp and GPS coordinates', () => {
    const queued = offlinePunchQueue.enqueue({
      type: 'in',
      timestamp: '2026-08-27T09:15:00.000Z',
      coords: { lat: 28.5355, lon: 77.391 },
    });

    expect(queued.id).toBeDefined();
    expect(queued.status).toBe('pending');
    expect(offlinePunchQueue.getQueue().length).toBe(1);
    expect(offlinePunchQueue.getQueue()[0].coords.lat).toBe(28.5355);
  });

  it('should remove items upon successful sync', async () => {
    offlinePunchQueue.enqueue({
      type: 'in',
      timestamp: '2026-08-27T09:15:00.000Z',
      coords: { lat: 28.5355, lon: 77.391 },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Synced' }),
    });

    const result = await offlinePunchQueue.syncPendingPunches();
    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);
    expect(offlinePunchQueue.getQueue().length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/attendance/offline-punch-queue.test.ts`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/lib/attendance/offlinePunchQueue.ts`**

Implement the queue handling local persistence via `localStorage`, network error interception, and automatic retries when online.

- [ ] **Step 4: Integrate Queue with `PunchTerminalWidget.tsx` and `app/employee/attendance/page.tsx`**

Add online event listener and status badge showing pending offline punches. When `fetch` fails with network disconnect, enqueue the punch and show an offline confirmation toast.

- [ ] **Step 5: Run tests and typecheck**

Run: `npx vitest run __tests__/attendance/offline-punch-queue.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/attendance/offlinePunchQueue.ts src/components/employee/attendance/PunchTerminalWidget.tsx app/employee/attendance/page.tsx __tests__/attendance/offline-punch-queue.test.ts
git commit -m "feat(employee): add offline punch queue with automatic background sync"
```

---

### Task 3: Biometric Quick-Punch & Passkey Verification

**Files:**

- Create: `src/lib/auth/biometricAuth.ts`
- Modify: `src/components/employee/attendance/PunchTerminalWidget.tsx`
- Modify: `src/components/employee/profile/WorkspaceSettingsCard.tsx`
- Test: `__tests__/auth/biometric-auth.test.ts`

**Interfaces:**

- Produces:

  ```ts
  export const biometricAuth: {
    isAvailable(): Promise<boolean>;
    isRegistered(userId: string): boolean;
    register(userId: string, email: string): Promise<boolean>;
    verify(userId: string): Promise<boolean>;
  };
  ```

- [ ] **Step 1: Write the failing test for biometric helpers**

Create `__tests__/auth/biometric-auth.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { biometricAuth } from '@/src/lib/auth/biometricAuth';

describe('Biometric Passkey Authentication', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should detect when biometric credentials are not yet registered', () => {
    expect(biometricAuth.isRegistered('user-123')).toBe(false);
  });

  it('should return availability boolean depending on window.PublicKeyCredential', async () => {
    const available = await biometricAuth.isAvailable();
    expect(typeof available).toBe('boolean');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/auth/biometric-auth.test.ts`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/lib/auth/biometricAuth.ts`**

Use WebAuthn (`navigator.credentials.create` and `navigator.credentials.get`) with graceful fallback to secure local biometric verification.

- [ ] **Step 4: Add Biometric Toggle in `WorkspaceSettingsCard.tsx` and Fast-Punch button in `PunchTerminalWidget.tsx`**

Allow employee to enable "Fingerprint / Face ID Quick Punch" with a single tap in settings and on the punch terminal.

- [ ] **Step 5: Run tests and typecheck**

Run: `npx vitest run __tests__/auth/biometric-auth.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth/biometricAuth.ts src/components/employee/attendance/PunchTerminalWidget.tsx src/components/employee/profile/WorkspaceSettingsCard.tsx __tests__/auth/biometric-auth.test.ts
git commit -m "feat(employee): add biometric quick-punch and settings toggle"
```

---

### Task 4: On-Site Work Tracker Enhancements (GPS Site Visits & 1-Tap Lead Actions)

**Files:**

- Modify: `src/components/employee/work/SiteVisitsView.tsx`
- Modify: `src/components/employee/work/LeadsView.tsx`
- Modify: `src/components/employee/dashboard/DashboardSiteVisitsCard.tsx`
- Test: `__tests__/employee/site-visit-actions.test.ts`

**Interfaces:**

- Enhances:
  - `SiteVisitsView`: GPS "Check-in at Site" action that calculates distance from property location and records geo-verified site visit.
  - `LeadsView`: 1-tap `tel:` and `https://wa.me/` direct launch links for assigned client phone numbers.

- [ ] **Step 1: Write test for site visit and lead action helpers**

Create `__tests__/employee/site-visit-actions.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('Site Visit & Lead Action Helpers', () => {
  it('should format clean WhatsApp direct link without spaces or special characters', () => {
    const rawPhone = '+91 98765-43210';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello, I am contacting you from SVI Infra regarding your property inquiry.')}`;
    expect(cleanPhone).toBe('919876543210');
    expect(waLink).toContain('https://wa.me/919876543210');
  });

  it('should format telephone direct dial URI', () => {
    const rawPhone = '+91 98765 43210';
    const clean = rawPhone.replace(/[^\d+]/g, '');
    expect(`tel:${clean}`).toBe('tel:+919876543210');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run __tests__/employee/site-visit-actions.test.ts`
Expected: PASS.

- [ ] **Step 3: Update `SiteVisitsView.tsx`, `LeadsView.tsx`, and `DashboardSiteVisitsCard.tsx`**

Add direct call button, direct WhatsApp chat button, and "GPS Check-in at Site" button with distance calculation and completion timestamp.

- [ ] **Step 4: Run typecheck and full test suite**

Run: `npm run typecheck && npm test`
Expected: 0 typecheck errors and all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/employee/work/SiteVisitsView.tsx src/components/employee/work/LeadsView.tsx src/components/employee/dashboard/DashboardSiteVisitsCard.tsx __tests__/employee/site-visit-actions.test.ts
git commit -m "feat(employee): add 1-tap phone and whatsapp actions and on-site gps check-in"
```

---

### Task 5: Documentation, Context Sync & Full Pre-Push Verification

**Files:**

- Modify: `context/architecture.md`
- Modify: `context/overview.md`
- Modify: `context/tech_stack.md`

- [ ] **Step 1: Update context files to document the dual Android app architecture and employee features**
- [ ] **Step 2: Run full verification (`npm run typecheck` and `npm test`)**
- [ ] **Step 3: Commit and Push to GitHub**

```bash
git add context/architecture.md context/overview.md context/tech_stack.md
git commit -m "docs: sync dual-app android architecture and employee workspace capabilities"
git push origin main
```
