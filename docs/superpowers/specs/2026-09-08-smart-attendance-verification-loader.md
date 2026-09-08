# Smart Attendance Verification & Resilient Loading Experience

## Overview

Enhance the corporate `BrandedLoadingState` component and the Employee Attendance terminal with dynamic multi-step verification indicators, smooth morphing success transitions (gold orbital arc into an emerald green completed ring), and a 6-second timeout safeguard offering immediate retry and offline punch capabilities.

## Goals & Invariants

1. **Dynamic Step Transitions**: Progressively update the verification lifecycle (`locating` -> `geofencing` -> `syncing` -> `success`).
2. **Smooth Exit Morphing**: Morph the gold orbital spinner into an illuminated emerald green ring with checkmark badge upon successful verification before unmounting.
3. **Timeout Safeguard**: If GPS lock or network synchronization exceeds 6 seconds, gracefully transition to an actionable fallback UI offering `[Retry Location]` and `[Punch in Offline Mode]`.
4. **100% Backwards Compatibility**: Retain default simple message/subMessage behavior for other pages (payroll, profile, etc.) without regressions.

## Architecture & Components

### 1. `src/components/employee/BrandedLoadingState.tsx`

- Interface `VerificationStep`:
  ```ts
  export interface VerificationStep {
    id: string;
    label: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
  }
  ```
- Props added:
  - `steps?: VerificationStep[]`
  - `status?: 'loading' | 'success' | 'timeout' | 'error'`
  - `onRetry?: () => void`
  - `onOfflineFallback?: () => void`
- Animations:
  - Framer Motion orbital ring morphs stroke color and dash from partial arc (`95 215`) to full circle (`314 0`) with emerald stroke (`#10b981`).
  - Pulsing step dots tracking verification stages with smooth `AnimatePresence`.
  - Action buttons rendered if `status === 'timeout'` with clean SVI corporate buttons.

### 2. `src/components/employee/attendance/useEmployeeAttendanceTerminal.ts`

- State:
  - `verificationStage`: `'locating' | 'geofencing' | 'syncing' | 'ready' | 'timeout'`
  - 6s timeout safeguard that marks `verificationStage = 'timeout'` if location request or API sync takes > 6s.
  - Exposes `retryVerification()` and `enableOfflineMode()`.

### 3. `app/employee/attendance/page.tsx`

- Passes active verification steps and fallback actions to `BrandedLoadingState`.

## Verification Plan

1. `npm run typecheck` (`tsc --noEmit`) -> 0 errors.
2. Unit tests in `__tests__/ui/mobile-components.test.ts`.
3. Browser tab visual smoke testing on desktop and mobile viewports.
