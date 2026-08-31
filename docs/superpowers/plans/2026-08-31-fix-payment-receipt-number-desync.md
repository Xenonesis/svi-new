# Fix Payment Receipt Number Desynchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the payment receipt number desynchronization bug where a created receipt shows number $N$ in `/admin/payment-receipts` records but jumps to $N+1$ (e.g. 2095 vs 2094) in the generator form and live preview.

**Architecture:**

1. Create a dedicated receipt numbering utility (`src/lib/receipt/receiptNumber.ts`) that robustly computes the next receipt number using the maximum existing sequential receipt number (`Math.max(2055, ...existingNumbers) + 1`) rather than brittle array length.
2. Decouple receipt list fetching (`fetchReceipts`) from active form state (`formData.receiptNo`) in `app/admin/payment-receipt/page.tsx`.
3. Freeze the active `formData.receiptNo` upon creation so the form, live preview, PDF, and image export strictly match the exact receipt number saved in the database.
4. Provide a clean "Create New Receipt" action to explicitly reset the form and allocate the next sequential receipt number for subsequent receipts.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Vitest, Supabase, Sonner toasts.

**Spec:** Fix receipt number desynchronization between generator preview and saved record table in `/admin/payment-receipts`.

---

## Global Constraints

- Never mutate active `formData.receiptNo` when refreshing background document lists.
- Base receipt number starts at 2056 (offset base 2055 + 1).
- Sequential receipt number calculation must handle deleted records, unordered records, and non-numeric inputs gracefully using `Math.max`.
- Document status transitions (`draft` -> `completed` on download) must not mutate receipt number or form state.
- All brand standards, logos (`/logo.png`), and styling must remain intact.

---

## Plan Structure

### Task 1: Create Receipt Number Utility with Unit Tests

**Files:**

- Create: `src/lib/receipt/receiptNumber.ts`
- Test: `__tests__/receipt/receiptNumber.test.ts`

**Interfaces:**

- `getNextReceiptNumber(receipts: Array<{ form_data?: { receiptNo?: string | number } }>): string`
- `isValidReceiptNumber(receiptNo: string | number): boolean`

- [ ] **Step 1: Write unit tests for receipt number calculation**

Create `__tests__/receipt/receiptNumber.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getNextReceiptNumber, isValidReceiptNumber } from '@/src/lib/receipt/receiptNumber';

describe('receiptNumber utility', () => {
  it('returns 2056 when no receipts exist', () => {
    expect(getNextReceiptNumber([])).toBe('2056');
  });

  it('calculates the next sequential receipt number from existing records', () => {
    const receipts = [
      { form_data: { receiptNo: '2056' } },
      { form_data: { receiptNo: '2057' } },
      { form_data: { receiptNo: '2093' } },
      { form_data: { receiptNo: '2094' } },
    ];
    expect(getNextReceiptNumber(receipts)).toBe('2095');
  });

  it('handles unordered receipt lists and calculates max + 1', () => {
    const receipts = [
      { form_data: { receiptNo: '2094' } },
      { form_data: { receiptNo: '2056' } },
      { form_data: { receiptNo: '2088' } },
    ];
    expect(getNextReceiptNumber(receipts)).toBe('2095');
  });

  it('handles gaps caused by deleted receipts without collisions', () => {
    // If receipts 2056 to 2094 exist, but 2080 was deleted (total 38 items),
    // next number should still be 2095 (not 2056 + 38 = 2094).
    const receipts = [{ form_data: { receiptNo: '2056' } }, { form_data: { receiptNo: '2094' } }];
    expect(getNextReceiptNumber(receipts)).toBe('2095');
  });

  it('ignores invalid, non-numeric, or missing receipt numbers', () => {
    const receipts = [
      { form_data: { receiptNo: '' } },
      { form_data: {} },
      { form_data: { receiptNo: 'invalid-string' } },
      { form_data: { receiptNo: '2060' } },
    ];
    expect(getNextReceiptNumber(receipts)).toBe('2061');
  });

  it('validates receipt number format', () => {
    expect(isValidReceiptNumber('2095')).toBe(true);
    expect(isValidReceiptNumber(2095)).toBe(true);
    expect(isValidReceiptNumber('')).toBe(false);
    expect(isValidReceiptNumber('abc')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/receipt/receiptNumber.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/receipt/receiptNumber.ts`**

Create `src/lib/receipt/receiptNumber.ts`:

```typescript
/**
 * Utility functions for generating and validating payment receipt numbers.
 * The baseline receipt number sequence begins at 2056.
 */

export const BASE_RECEIPT_NUMBER = 2056;

export interface ReceiptLike {
  form_data?: {
    receiptNo?: string | number | null;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

/**
 * Calculates the next sequential receipt number based on existing receipt documents.
 * Scans for the maximum valid numeric receipt number (minimum base 2055) and adds 1.
 */
export function getNextReceiptNumber(receipts?: ReceiptLike[] | null): string {
  if (!receipts || !Array.isArray(receipts) || receipts.length === 0) {
    return String(BASE_RECEIPT_NUMBER);
  }

  let maxNumber = BASE_RECEIPT_NUMBER - 1; // 2055

  for (const item of receipts) {
    const rawNo = item?.form_data?.receiptNo;
    if (rawNo !== undefined && rawNo !== null) {
      const parsed = parseInt(String(rawNo).trim(), 10);
      if (!Number.isNaN(parsed) && parsed > maxNumber) {
        maxNumber = parsed;
      }
    }
  }

  return String(maxNumber + 1);
}

/**
 * Validates if a given receipt number is a valid positive integer string/number.
 */
export function isValidReceiptNumber(receiptNo?: string | number | null): boolean {
  if (receiptNo === undefined || receiptNo === null) return false;
  const str = String(receiptNo).trim();
  if (!str) return false;
  const num = parseInt(str, 10);
  return !Number.isNaN(num) && num > 0 && String(num) === str;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/receipt/receiptNumber.test.ts`
Expected: PASS with 6 tests passing.

---

### Task 2: Refactor Payment Receipt Page State and Submission

**Files:**

- Modify: `app/admin/payment-receipt/page.tsx`
- Modify: `app/admin/payment-receipt/components/PaymentReceiptForm.tsx`
- Modify: `app/admin/payment-receipt/components/PaymentReceiptPreview.tsx`

**Key Changes:**

1. **Decouple Data Fetching from Active Form Mutation:**
   - In `fetchReceipts`: Fetch documents and update `receipts` state. Only set `formData.receiptNo` if `formData.receiptNo` is currently empty and the user has not started drafting or loaded a template.
2. **Prevent Post-Save Receipt Number Overwrites in `handleSubmit`:**
   - On submission, send `formData` with its current `receiptNo` (e.g. 2095).
   - Upon successful save, record `documentId = data.document.id`.
   - Update `receipts` state by prepending `data.document` to `receipts` list (without re-invoking `fetchReceipts()` or mutating `formData.receiptNo`).
   - Keep `formData.receiptNo` intact so live preview and download actions match the saved document.
   - Show `toast.success('Payment receipt generated successfully!')`.
3. **Template Loading (`loadFromRecord`):**
   - When loading from a template (`templateId`), pre-fill the form fields from the template, but allocate a fresh `nextReceiptNo` so new receipts do not reuse or overwrite the template's receipt number.
4. **Download PDF / Image Handling:**
   - Patch `/api/admin/documents/${documentId}` to `status: 'completed'` on download without calling `fetchReceipts()` or changing `formData`.
5. **Add "Create New Receipt" / "Reset Form" Action:**
   - Add a button allowing the admin to reset the form and allocate the next sequential receipt number cleanly when starting a new receipt.

- [ ] **Step 1: Update `app/admin/payment-receipt/page.tsx`**

Refactor `app/admin/payment-receipt/page.tsx` with clean state management, using `getNextReceiptNumber` and preventing post-save desynchronization.

- [ ] **Step 2: Update `PaymentReceiptForm.tsx` & `PaymentReceiptPreview.tsx` (if needed for New Receipt button / feedback)**

Add "Create Another Receipt" or "New Receipt" button when a receipt has been generated, ensuring smooth workflow for administrators.

- [ ] **Step 3: Run TypeScript Typecheck**

Run: `npm run typecheck`
Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Run Vitest Suite**

Run: `npx vitest run`
Expected: All tests pass.

---

### Task 3: End-to-End Verification & Sanity Testing

**Files:**

- Test: Verification against database records and form workflow.

- [ ] **Step 1: Test receipt number calculation against actual database records**
      Run test script against real DB data to ensure next receipt number calculated is 2095 (since 2094 is current max).

- [ ] **Step 2: Verify `/admin/payment-receipts` record consistency**
      Verify that newly generated receipts have matching receipt numbers in both the generator preview, exported PDFs, and the `/admin/payment-receipts` records table.

- [ ] **Step 3: Run GitNexus change analysis**
      Run `detect_changes` to verify no unintended execution flows or breaking changes were introduced.
