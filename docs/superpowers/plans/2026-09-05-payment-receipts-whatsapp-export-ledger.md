# Payment Receipts: WhatsApp Share, Excel Export & Customer Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Excel/CSV export, 1-tap WhatsApp sharing modal, client phone capture, and a persistent Ref ID/Plot customer ledger with agreed value and balance tracking to `/admin/payment-receipts`.

**Architecture:** A zero-migration, backwards-compatible design extending `SavedReceipt.form_data` with optional `clientPhone`, persisting agreed plot deal values via `portal_settings` (`receipt_deal_values`), and providing real-time client-side ledger grouping, RFC 4180 CSV generation, and sanitized WhatsApp URI generation.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Supabase PostgreSQL, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-05-payment-receipts-whatsapp-export-ledger-design.md`

## Global Constraints

- Never break backwards compatibility for the existing 41 payment receipt records.
- All CSV output must conform to RFC 4180 (escape commas, quotes, line breaks).
- Indian phone number sanitization must validate 10-digit formats (`^[6-9]\d{9}$`) and prepend country code `91` for `wa.me`.
- Ref IDs must be normalized (uppercase, strip hyphens and spaces) when indexing deal values so `PL-2076` and `PL2076` share the same ledger.
- Zero new SQL migrations required (leverage `portal_settings` for persistent deal values).
- All tests must pass with `vitest run` and `pnpm typecheck` must report 0 errors.

---

### Task 1: Core Types & CSV/Excel Export Utility (`receiptCsvExport.ts`)

**Files:**

- Modify: `src/components/admin/payment-receipts/ReceiptTypes.ts`
- Create: `src/lib/receipt/receiptCsvExport.ts`
- Test: `__tests__/receipt/receiptCsvExport.test.ts`

**Interfaces:**

- Produces:
  - `generateReceiptsCsv(receipts: SavedReceipt[]): string`
  - `downloadReceiptsCsv(receipts: SavedReceipt[], filename?: string): void`
  - `SavedReceipt.form_data.clientPhone?: string`

- [ ] **Step 1: Write the failing test for CSV generation**

Create `__tests__/receipt/receiptCsvExport.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateReceiptsCsv } from '@/src/lib/receipt/receiptCsvExport';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

describe('generateReceiptsCsv', () => {
  const mockReceipts: SavedReceipt[] = [
    {
      id: 'rec-1',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-06-12T10:00:00Z',
      form_data: {
        receiptNo: '2064',
        date: '2026-06-12',
        salutation: 'Mrs.',
        name: 'Rani Bhatnagar',
        refId: 'PL-2078',
        amount: '14578',
        amountWords: 'Fourteen Thousand Five Hundred Seventy Eight',
        paymentRef: 'UPI-12345',
        drawnOn: 'HDFC Bank, Civil Lines',
        plotNo: '42',
        plotSize: '1000',
        account: 'Savings',
        paymentMethod: 'UPI',
        clientPhone: '9876543210',
      },
    },
    {
      id: 'rec-2',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-06-15T10:00:00Z',
      form_data: {
        receiptNo: '2065',
        date: '2026-06-15',
        salutation: 'Mr.',
        name: 'Gupta & "Sons"',
        refId: 'SVI2051',
        amount: '25000',
        amountWords: 'Twenty Five Thousand',
        paymentRef: 'NEFT-888',
        drawnOn: 'SBI',
        plotNo: '10',
        plotSize: '',
        account: 'Current',
        paymentMethod: 'Bank Transfer',
      },
    },
  ];

  it('generates correct CSV headers and rows', () => {
    const csv = generateReceiptsCsv(mockReceipts);
    const lines = csv.split('\n');

    expect(lines[0]).toBe(
      'Receipt No,Ref ID,Date,Client Name,Phone,Amount (INR),Payment Method,Payment Ref / UTR,Bank / Drawn On,Plot No,Plot Size (Sq. Yds.),Account,Created At'
    );
    expect(lines[1]).toContain(
      '2064,PL-2078,2026-06-12,"Mrs. Rani Bhatnagar",9876543210,14578,UPI,UPI-12345,"HDFC Bank, Civil Lines",42,1000,Savings'
    );
  });

  it('escapes quotes, commas, and special characters per RFC 4180', () => {
    const csv = generateReceiptsCsv(mockReceipts);
    expect(csv).toContain('"Gupta & ""Sons"""');
    expect(csv).toContain('"HDFC Bank, Civil Lines"');
  });

  it('handles empty receipt list gracefully', () => {
    const csv = generateReceiptsCsv([]);
    expect(csv.trim()).toBe(
      'Receipt No,Ref ID,Date,Client Name,Phone,Amount (INR),Payment Method,Payment Ref / UTR,Bank / Drawn On,Plot No,Plot Size (Sq. Yds.),Account,Created At'
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/receipt/receiptCsvExport.test.ts`
Expected: FAIL with module `@/src/lib/receipt/receiptCsvExport` not found.

- [ ] **Step 3: Update `ReceiptTypes.ts` and implement `receiptCsvExport.ts`**

Update `src/components/admin/payment-receipts/ReceiptTypes.ts`:

```typescript
export interface SavedReceipt {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    receiptNo: string;
    date: string;
    salutation: string;
    name: string;
    refId: string;
    amount: string;
    amountWords: string;
    paymentRef: string;
    drawnOn: string;
    plotNo: string;
    plotSize: string;
    account: string;
    paymentMethod: string;
    clientPhone?: string;
  };
}
```

Create `src/lib/receipt/receiptCsvExport.ts`:

```typescript
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateReceiptsCsv(receipts: SavedReceipt[]): string {
  const headers = [
    'Receipt No',
    'Ref ID',
    'Date',
    'Client Name',
    'Phone',
    'Amount (INR)',
    'Payment Method',
    'Payment Ref / UTR',
    'Bank / Drawn On',
    'Plot No',
    'Plot Size (Sq. Yds.)',
    'Account',
    'Created At',
  ];

  const rows = receipts.map((r) => {
    const d = r.form_data || ({} as SavedReceipt['form_data']);
    const fullName = d.salutation ? `${d.salutation} ${d.name}`.trim() : d.name || '';
    return [
      escapeCsvCell(d.receiptNo),
      escapeCsvCell(d.refId),
      escapeCsvCell(d.date),
      escapeCsvCell(fullName),
      escapeCsvCell(d.clientPhone || ''),
      escapeCsvCell(parseFloat(d.amount || '0') || 0),
      escapeCsvCell(d.paymentMethod),
      escapeCsvCell(d.paymentRef || ''),
      escapeCsvCell(d.drawnOn || ''),
      escapeCsvCell(d.plotNo || ''),
      escapeCsvCell(d.plotSize || ''),
      escapeCsvCell(d.account || ''),
      escapeCsvCell(r.created_at || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadReceiptsCsv(receipts: SavedReceipt[], filename?: string): void {
  const csvContent = generateReceiptsCsv(receipts);
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `SVI_Payment_Receipts_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test __tests__/receipt/receiptCsvExport.test.ts`
Expected: PASS

---

### Task 2: WhatsApp Share Utility & Modal (`ReceiptWhatsAppModal.tsx`)

**Files:**

- Create: `src/lib/receipt/receiptWhatsApp.ts`
- Create: `src/components/admin/payment-receipts/ReceiptWhatsAppModal.tsx`
- Test: `__tests__/receipt/receiptWhatsApp.test.ts`
- Test: `__tests__/admin/payment-receipts/ReceiptWhatsAppModal.test.tsx`

**Interfaces:**

- Produces:
  - `cleanIndianPhoneNumber(phone: string): string`
  - `isValidIndianPhoneNumber(phone: string): boolean`
  - `buildReceiptWhatsAppMessage(receipt: SavedReceipt, siteUrl?: string): string`
  - `buildWhatsAppShareUrl(phone: string, message: string): string`
  - `<ReceiptWhatsAppModal receipt={receipt} onClose={() => void} />`

- [ ] **Step 1: Write tests for WhatsApp utility functions**

Create `__tests__/receipt/receiptWhatsApp.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  cleanIndianPhoneNumber,
  isValidIndianPhoneNumber,
  buildReceiptWhatsAppMessage,
  buildWhatsAppShareUrl,
} from '@/src/lib/receipt/receiptWhatsApp';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

describe('receiptWhatsApp utilities', () => {
  it('cleans and normalizes various Indian phone formats to 10 digits', () => {
    expect(cleanIndianPhoneNumber('+91 98765-43210')).toBe('9876543210');
    expect(cleanIndianPhoneNumber('09876543210')).toBe('9876543210');
    expect(cleanIndianPhoneNumber('919876543210')).toBe('9876543210');
    expect(cleanIndianPhoneNumber('9876543210')).toBe('9876543210');
  });

  it('validates 10-digit Indian mobile numbers starting with 6-9', () => {
    expect(isValidIndianPhoneNumber('9876543210')).toBe(true);
    expect(isValidIndianPhoneNumber('7300007643')).toBe(true);
    expect(isValidIndianPhoneNumber('1234567890')).toBe(false);
    expect(isValidIndianPhoneNumber('98765')).toBe(false);
  });

  it('builds professional WhatsApp message template', () => {
    const receipt: SavedReceipt = {
      id: 'rec-1',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-06-12T10:00:00Z',
      form_data: {
        receiptNo: '2064',
        date: '2026-06-12',
        salutation: 'Mr.',
        name: 'Piyush Sharma',
        refId: 'SVI2051',
        amount: '16042',
        amountWords: 'Sixteen Thousand Forty Two',
        paymentRef: 'UPI-999',
        drawnOn: 'HDFC',
        plotNo: '42',
        plotSize: '1000',
        account: 'Savings',
        paymentMethod: 'UPI',
      },
    };

    const msg = buildReceiptWhatsAppMessage(receipt, 'https://www.sviinfrasolutions.com');
    expect(msg).toContain('Dear Piyush Sharma');
    expect(msg).toContain('₹16,042');
    expect(msg).toContain('Plot 42');
    expect(msg).toContain('Ref ID: SVI2051');
    expect(msg).toContain('Receipt No: #2064');
    expect(msg).toContain('https://www.sviinfrasolutions.com');
  });

  it('builds wa.me URL with 91 prefix and URI encoded message', () => {
    const url = buildWhatsAppShareUrl('9876543210', 'Hello SVI');
    expect(url).toBe('https://wa.me/919876543210?text=Hello%20SVI');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/receipt/receiptWhatsApp.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/lib/receipt/receiptWhatsApp.ts`**

```typescript
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

export function cleanIndianPhoneNumber(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

export function isValidIndianPhoneNumber(phone: string): boolean {
  const cleaned = cleanIndianPhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function buildReceiptWhatsAppMessage(receipt: SavedReceipt, siteUrl = ''): string {
  const d = receipt.form_data || ({} as SavedReceipt['form_data']);
  const clientName = d.name
    ? d.salutation
      ? `${d.salutation} ${d.name}`
      : d.name
    : 'Valued Customer';
  const amountVal = parseFloat(d.amount || '0') || 0;
  const formattedAmount = amountVal.toLocaleString('en-IN');
  const plotInfo = d.plotNo
    ? `towards Plot ${d.plotNo}${d.plotSize ? ` (${d.plotSize} Sq. Yds.)` : ''}`
    : '';
  const refInfo = d.refId ? ` (Ref ID: ${d.refId})` : '';
  const baseUrl =
    siteUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.sviinfrasolutions.com');
  const receiptLink = `${baseUrl}/admin/payment-receipts`;

  return (
    `Dear ${clientName},\n\n` +
    `Greetings from *SVI Infra Solutions*.\n` +
    `We gratefully acknowledge receipt of your payment of *₹${formattedAmount}* ${plotInfo}${refInfo}.\n\n` +
    `📄 *Receipt Details:*\n` +
    `• *Receipt No:* #${d.receiptNo || 'N/A'}\n` +
    `• *Date:* ${d.date || 'N/A'}\n` +
    `• *Payment Mode:* ${d.paymentMethod || 'UPI'}` +
    (d.paymentRef ? ` (Ref: ${d.paymentRef})` : '') +
    `\n\n` +
    `For any assistance or queries regarding your booking, please feel free to reach out to us.\n\n` +
    `*SVI Infra Solutions Team*`
  );
}

export function buildWhatsAppShareUrl(phone: string, message: string): string {
  const cleanPhone = cleanIndianPhoneNumber(phone);
  const targetPhone = cleanPhone ? `91${cleanPhone}` : '';
  const encoded = encodeURIComponent(message);
  return targetPhone
    ? `https://wa.me/${targetPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}
```

- [ ] **Step 4: Create `ReceiptWhatsAppModal.tsx` component & component test**

Create `src/components/admin/payment-receipts/ReceiptWhatsAppModal.tsx`:
A modal dialog with:

- Client name & receipt number chip
- Input field with `+91` prefix for client phone
- Textarea preview of the message
- "Open WhatsApp Chat" button opening in `_blank`

Create `__tests__/admin/payment-receipts/ReceiptWhatsAppModal.test.tsx` verifying render, phone input change, and button click triggering `window.open`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test __tests__/receipt/receiptWhatsApp.test.ts __tests__/admin/payment-receipts/ReceiptWhatsAppModal.test.tsx`
Expected: PASS

---

### Task 3: Ref ID Normalization, Grouping & Ledger Engine (`receiptLedger.ts`)

**Files:**

- Create: `src/lib/receipt/receiptLedger.ts`
- Test: `__tests__/receipt/receiptLedger.test.ts`

**Interfaces:**

- Produces:
  - `normalizeRefId(refId?: string): string`
  - `groupReceiptsByRefId(receipts: SavedReceipt[], dealValuesMap?: Record<string, number>): CustomerLedgerSummary[]`
  - `calculateLedgerStatement(refId: string, receipts: SavedReceipt[], agreedDealValue?: number): CustomerLedgerDetail`

- [ ] **Step 1: Write test for ledger grouping and statement calculation**

Create `__tests__/receipt/receiptLedger.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  normalizeRefId,
  groupReceiptsByRefId,
  calculateLedgerStatement,
} from '@/src/lib/receipt/receiptLedger';
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

describe('receiptLedger engine', () => {
  const mockReceipts: SavedReceipt[] = [
    {
      id: '1',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-06-12T10:00:00Z',
      form_data: {
        receiptNo: '2064',
        date: '2026-06-12',
        salutation: 'Mr.',
        name: 'Piyush Sharma',
        refId: 'PL-2076',
        amount: '10000',
        amountWords: 'Ten Thousand',
        paymentRef: 'UPI1',
        drawnOn: 'HDFC',
        plotNo: '42',
        plotSize: '1000',
        account: 'Savings',
        paymentMethod: 'UPI',
      },
    },
    {
      id: '2',
      document_type: 'payment_receipt',
      status: 'active',
      created_at: '2026-07-12T10:00:00Z',
      form_data: {
        receiptNo: '2075',
        date: '2026-07-12',
        salutation: 'Mr.',
        name: 'Piyush Sharma',
        refId: 'PL2076', // same normalized id
        amount: '15000',
        amountWords: 'Fifteen Thousand',
        paymentRef: 'UPI2',
        drawnOn: 'HDFC',
        plotNo: '42',
        plotSize: '1000',
        account: 'Savings',
        paymentMethod: 'UPI',
      },
    },
  ];

  it('normalizes ref IDs by trimming, stripping hyphens, and uppercasing', () => {
    expect(normalizeRefId('PL-2076')).toBe('PL2076');
    expect(normalizeRefId(' pl 2076 ')).toBe('PL2076');
    expect(normalizeRefId('svi002050')).toBe('SVI002050');
  });

  it('groups receipts by normalized refId and aggregates total paid', () => {
    const summaries = groupReceiptsByRefId(mockReceipts, { PL2076: 50000 });
    expect(summaries.length).toBe(1);
    expect(summaries[0].normalizedRefId).toBe('PL2076');
    expect(summaries[0].totalPaid).toBe(25000);
    expect(summaries[0].receiptsCount).toBe(2);
    expect(summaries[0].agreedDealValue).toBe(50000);
    expect(summaries[0].balanceDue).toBe(25000);
    expect(summaries[0].percentCompleted).toBe(50);
  });

  it('calculates full ledger statement with receipts sorted chronologically', () => {
    const detail = calculateLedgerStatement('PL-2076', mockReceipts, 30000);
    expect(detail.receipts.length).toBe(2);
    expect(detail.totalPaid).toBe(25000);
    expect(detail.balanceDue).toBe(5000);
    expect(detail.percentCompleted).toBeCloseTo(83.33, 1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/receipt/receiptLedger.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/lib/receipt/receiptLedger.ts`**

```typescript
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

export interface CustomerLedgerSummary {
  normalizedRefId: string;
  displayRefId: string;
  clientName: string;
  plotNo: string;
  plotSize: string;
  receiptsCount: number;
  totalPaid: number;
  agreedDealValue: number;
  balanceDue: number;
  percentCompleted: number;
  lastPaymentDate: string;
}

export interface CustomerLedgerDetail {
  normalizedRefId: string;
  displayRefId: string;
  clientName: string;
  plotNo: string;
  plotSize: string;
  receipts: SavedReceipt[];
  totalPaid: number;
  agreedDealValue: number;
  balanceDue: number;
  percentCompleted: number;
}

export function normalizeRefId(refId?: string): string {
  if (!refId) return '';
  return refId.replace(/[\s\-_]/g, '').toUpperCase();
}

export function groupReceiptsByRefId(
  receipts: SavedReceipt[],
  dealValuesMap: Record<string, number> = {}
): CustomerLedgerSummary[] {
  const map: Record<
    string,
    {
      displayRefId: string;
      clientName: string;
      plotNo: string;
      plotSize: string;
      receipts: SavedReceipt[];
      totalPaid: number;
      lastDate: string;
    }
  > = {};

  receipts.forEach((r) => {
    const rawRef = (r.form_data?.refId || '').trim();
    if (!rawRef) return;
    const norm = normalizeRefId(rawRef);
    if (!map[norm]) {
      map[norm] = {
        displayRefId: rawRef,
        clientName: r.form_data?.name || 'N/A',
        plotNo: r.form_data?.plotNo || '',
        plotSize: r.form_data?.plotSize || '',
        receipts: [],
        totalPaid: 0,
        lastDate: r.form_data?.date || r.created_at || '',
      };
    }
    const amount = parseFloat(r.form_data?.amount || '0') || 0;
    map[norm].totalPaid += amount;
    map[norm].receipts.push(r);
    const currDate = r.form_data?.date || r.created_at || '';
    if (currDate > map[norm].lastDate) {
      map[norm].lastDate = currDate;
    }
  });

  return Object.entries(map).map(([norm, data]) => {
    const dealVal = dealValuesMap[norm] || 0;
    const balance = dealVal > 0 ? Math.max(0, dealVal - data.totalPaid) : 0;
    const pct = dealVal > 0 ? Math.min(100, Math.round((data.totalPaid / dealVal) * 100)) : 0;

    return {
      normalizedRefId: norm,
      displayRefId: data.displayRefId,
      clientName: data.clientName,
      plotNo: data.plotNo,
      plotSize: data.plotSize,
      receiptsCount: data.receipts.length,
      totalPaid: data.totalPaid,
      agreedDealValue: dealVal,
      balanceDue: balance,
      percentCompleted: pct,
      lastPaymentDate: data.lastDate,
    };
  });
}

export function calculateLedgerStatement(
  refId: string,
  receipts: SavedReceipt[],
  agreedDealValue = 0
): CustomerLedgerDetail {
  const norm = normalizeRefId(refId);
  const matched = receipts
    .filter((r) => normalizeRefId(r.form_data?.refId) === norm)
    .sort((a, b) => {
      const dateA = new Date(a.form_data?.date || a.created_at).getTime();
      const dateB = new Date(b.form_data?.date || b.created_at).getTime();
      return dateA - dateB; // chronological
    });

  const totalPaid = matched.reduce(
    (sum, r) => sum + (parseFloat(r.form_data?.amount || '0') || 0),
    0
  );
  const balance = agreedDealValue > 0 ? Math.max(0, agreedDealValue - totalPaid) : 0;
  const pct =
    agreedDealValue > 0 ? Math.min(100, Math.round((totalPaid / agreedDealValue) * 100)) : 0;
  const primary = matched[0];

  return {
    normalizedRefId: norm,
    displayRefId: refId,
    clientName: primary?.form_data?.name || 'N/A',
    plotNo: primary?.form_data?.plotNo || '',
    plotSize: primary?.form_data?.plotSize || '',
    receipts: matched,
    totalPaid,
    agreedDealValue,
    balanceDue: balance,
    percentCompleted: pct,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test __tests__/receipt/receiptLedger.test.ts`
Expected: PASS

---

### Task 4: Single Customer Ledger Slide-Over Drawer (`ReceiptLedgerDrawer.tsx`)

**Files:**

- Create: `src/components/admin/payment-receipts/ReceiptLedgerDrawer.tsx`
- Test: `__tests__/admin/payment-receipts/ReceiptLedgerDrawer.test.tsx`

**Interfaces:**

- Produces:
  - `<ReceiptLedgerDrawer refId={string} allReceipts={SavedReceipt[]} dealValue={number} onSaveDealValue={(refId, val) => Promise<void>} onClose={() => void} onSelectReceipt={(r) => void} />`

- [ ] **Step 1: Write component test for `ReceiptLedgerDrawer`**

Create `__tests__/admin/payment-receipts/ReceiptLedgerDrawer.test.tsx`:
Test rendering summary stats, timeline table, updating agreed deal value input, and close button.

- [ ] **Step 2: Implement `ReceiptLedgerDrawer.tsx`**

Slide-over right drawer with backdrop, financial overview cards, deal value update form with save button, receipt timeline table with copy buttons, and export ledger statement action.

- [ ] **Step 3: Run test to verify it passes**

Run: `pnpm test __tests__/admin/payment-receipts/ReceiptLedgerDrawer.test.tsx`
Expected: PASS

---

### Task 5: Ledgers Master Overview Modal (`ReceiptLedgersModal.tsx`)

**Files:**

- Create: `src/components/admin/payment-receipts/ReceiptLedgersModal.tsx`
- Test: `__tests__/admin/payment-receipts/ReceiptLedgersModal.test.tsx`

**Interfaces:**

- Produces:
  - `<ReceiptLedgersModal receipts={SavedReceipt[]} dealValuesMap={Record<string, number>} onSelectLedger={(refId: string) => void} onClose={() => void} />`

- [ ] **Step 1: Write component test for `ReceiptLedgersModal`**

Create `__tests__/admin/payment-receipts/ReceiptLedgersModal.test.tsx`:
Verify rendering of all Ref IDs, search filtering by client name or Ref ID, and clicking row triggers `onSelectLedger`.

- [ ] **Step 2: Implement `ReceiptLedgersModal.tsx`**

Center modal with search filter, summary statistics (Total Accounts, Total Portfolio Value, Total Collected), and table listing each Ref ID, Client, Plot, Total Paid, Deal Value, and Balance.

- [ ] **Step 3: Run test to verify it passes**

Run: `pnpm test __tests__/admin/payment-receipts/ReceiptLedgersModal.test.tsx`
Expected: PASS

---

### Task 6: Payment Receipt Creation Form Mobile Field (`PaymentReceiptForm.tsx`)

**Files:**

- Modify: `app/admin/payment-receipt/components/PaymentReceiptForm.tsx`
- Modify: `app/admin/payment-receipt/page.tsx`
- Test: `__tests__/admin/payment-receipt/PaymentReceiptForm.test.tsx`

**Interfaces:**

- Produces:
  - Optional `clientPhone` field in form state and UI.

- [ ] **Step 1: Write test for phone field in form**

Create `__tests__/admin/payment-receipt/PaymentReceiptForm.test.tsx` asserting that "Client Mobile / WhatsApp" input is rendered and triggers change events.

- [ ] **Step 2: Add `clientPhone` input to `PaymentReceiptForm.tsx` and initial state in `app/admin/payment-receipt/page.tsx`**

- [ ] **Step 3: Run test to verify it passes**

Run: `pnpm test __tests__/admin/payment-receipt/PaymentReceiptForm.test.tsx`
Expected: PASS

---

### Task 7: Integration in Table, Toolbar & Admin Page

**Files:**

- Modify: `src/components/admin/payment-receipts/ReceiptToolbar.tsx`
- Modify: `src/components/admin/payment-receipts/ReceiptsTable.tsx`
- Modify: `app/admin/payment-receipts/page.tsx`
- Test: `__tests__/admin/payment-receipts/ReceiptsIntegration.test.tsx`

**Interfaces:**

- Connects:
  - `ReceiptToolbar`: Add "Export CSV" and "Customer Ledgers" buttons.
  - `ReceiptsTable`: Add WhatsApp icon button in Actions column, Ref ID badge click-to-open drawer.
  - `app/admin/payment-receipts/page.tsx`: Manage deal values state with `portal_settings` API, selected WhatsApp receipt, selected ledger Ref ID, and ledger overview modal.

- [ ] **Step 1: Write integration tests for new toolbar and table buttons**

- [ ] **Step 2: Wire `ReceiptToolbar.tsx` with `onExportCsv` and `onOpenLedgers`**

- [ ] **Step 3: Wire `ReceiptsTable.tsx` with `onShareWhatsApp` and `onOpenLedger`**

- [ ] **Step 4: Update `app/admin/payment-receipts/page.tsx` to handle all modal states and portal settings persistence**

- [ ] **Step 5: Run all tests and typecheck**

Run: `pnpm typecheck && pnpm test`
Expected: 0 type errors, all tests PASS.
Run: `node .gitnexus/run.cjs detect-changes --scope all --repo .`
Expected: Clean changes.
