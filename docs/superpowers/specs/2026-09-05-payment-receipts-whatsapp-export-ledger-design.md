# Design Specification: Payment Receipts WhatsApp Share, Excel Export & Customer Ledger

**Date:** 2026-09-05  
**Topic:** Payment Receipts Enhancement — WhatsApp Share, CSV/Excel Export, and Plot/Ref ID Customer Ledger  
**Status:** Approved by Human Partner  
**Target Route:** `/admin/payment-receipts` & `/admin/payment-receipt`

---

## 1. Executive Summary & Goals

SVI Infra's admin portal provides payment receipt generation and listing across all real estate transactions. While individual receipts are generated and stored as JSON documents in Supabase, daily administrative and accounting operations require three high-impact enhancements:

1. **Financial Export**: Exporting receipt records into Excel/CSV for accountants, CA audits, and monthly bookkeeping.
2. **Direct Client Delivery**: 1-tap WhatsApp sharing modal to quickly send formal payment confirmations to buyers directly on WhatsApp (`wa.me`).
3. **Plot & Customer Ledgers**: Aggregating all milestone payments under each unique `Ref ID` / `Plot No`, tracking cumulative payments received, setting persistent agreed plot values, and displaying outstanding balances.

---

## 2. Architecture & Data Strategy

### 2.1 Storage & Backwards Compatibility (Zero-Migration Approach)

- **New Field in Receipts**:
  - Optional `clientPhone` (string) added to `form_data` in `PaymentReceiptForm` and typed in `ReceiptTypes.ts`.
  - Existing 41 receipts without phone numbers remain completely valid and render without errors.
- **Agreed Plot Values Storage**:
  - Persisted in Supabase `portal_settings` under the key `receipt_deal_values`.
  - Structure:
    ```json
    {
      "PL2076": {
        "dealValue": 1500000,
        "notes": "Agreed plot cost for Plot 42",
        "updatedAt": "2026-09-05T14:30:00Z"
      }
    }
    ```
  - Ref IDs are normalized (strip whitespace and hyphens, uppercase) when indexing into `receipt_deal_values` so that `PL-2076`, `pl2076`, and `PL2076` resolve to the identical ledger account.

---

## 3. Detailed Component Specifications

### 3.1 Excel / CSV Export Utility (`receiptCsvExport.ts`)

- **Location**: `src/lib/receipt/receiptCsvExport.ts`
- **Output**: Generates a standard RFC 4180 compliant CSV file and triggers a browser download titled `SVI_Payment_Receipts_YYYY-MM-DD.csv`.
- **Columns**:
  1. `Receipt No`
  2. `Ref ID`
  3. `Date`
  4. `Client Name`
  5. `Amount (INR)`
  6. `Payment Method`
  7. `Payment Ref / UTR`
  8. `Drawn On (Bank)`
  9. `Plot No`
  10. `Plot Size (Sq. Yds.)`
  11. `Account Type`
  12. `Created At`
- **Safety**: Proper quoting and comma escaping for text fields.

### 3.2 WhatsApp Quick Share Modal (`ReceiptWhatsAppModal.tsx`)

- **Location**: `src/components/admin/payment-receipts/ReceiptWhatsAppModal.tsx`
- **Trigger**: Click on the new WhatsApp action button on any receipt row in `ReceiptsTable`.
- **Fields**:
  - Pre-filled Phone Number (from `form_data.clientPhone` if available, or editable input).
  - Live formatted WhatsApp message preview.
- **Message Content**:
  ```text
  Dear [Client Name],

  Greetings from SVI Infra Solutions.
  We have received your payment of ₹[Amount] towards Plot [Plot No] (Ref ID: [Ref ID]).

  • Receipt No: [Receipt No]
  • Payment Mode: [Method]
  • Date: [Date]

  View or download your official receipt:
  [Receipt URL]

  For any queries, feel free to contact us.
  ```
- **Action**: Opens `https://wa.me/91[clean_phone]?text=[encoded_message]` in a new tab.

### 3.3 Ref ID Customer Ledger Drawer (`ReceiptLedgerDrawer.tsx`)

- **Location**: `src/components/admin/payment-receipts/ReceiptLedgerDrawer.tsx`
- **Trigger**:
  - Clicking the `Ref ID` badge directly in `ReceiptsTable`.
  - Clicking the "Customer Ledger" icon button in the row actions.
  - Selecting a customer from the Ledgers Overview Modal.
- **Drawer Elements**:
  - **Header**: Ref ID, Client Name, Plot No, Plot Size, Total Receipts Count.
  - **Summary Cards**:
    - **Total Paid So Far**: Sum of all receipt amounts under this Ref ID.
    - **Agreed Plot Value**: Editable input with "Save" button to set/update agreed deal cost.
    - **Balance Due**: `Agreed Plot Value - Total Paid` (colored in green if completed, amber/red if pending).
    - **Progress Bar**: `(Total Paid / Agreed Value) * 100%`.
  - **Payment Timeline Table**: Chronological table of all receipts under this Ref ID (Date, Receipt No with copy, Amount, Method, Bank/UTR).
  - **Quick Export**: Button to export this specific customer's ledger as CSV or print.

### 3.4 Ledgers Master Overview Modal (`ReceiptLedgersModal.tsx`)

- **Location**: `src/components/admin/payment-receipts/ReceiptLedgersModal.tsx`
- **Trigger**: "Customer Ledgers" button in `ReceiptToolbar`.
- **Features**:
  - Groups all receipts by normalized Ref ID.
  - Lists Ref ID, Client Name, Plot, Receipts Count, Total Received, Agreed Value, and Balance.
  - Search bar to filter by client or Ref ID.
  - Clicking any row opens the detailed `ReceiptLedgerDrawer`.

### 3.5 Toolbar Enhancements (`ReceiptToolbar.tsx`)

- Add `"Export CSV"` button with `Download` icon.
- Add `"Customer Ledgers"` button with `BookOpen` icon.

### 3.6 Receipt Form Enhancement (`PaymentReceiptForm.tsx`)

- Add optional field `"Client Phone / WhatsApp"` with validation for 10-digit Indian numbers.

---

## 4. Error Handling & Edge Cases

1. **Phone Number Formatting**: Handles inputs with `+91`, `0`, spaces, or hyphens gracefully. Validates before opening WhatsApp.
2. **Ref ID Normalization**: Normalizes keys (`PL-2076` vs `PL2076`) to prevent ledger fragmentation.
3. **Missing Legacy Fields**: Gracefully renders fallbacks (`—`, `N/A`, `₹0`) for older documents.
4. **CSV Escaping**: Properly escapes quotes, commas, and line breaks in names or bank notes.

---

## 5. Testing & Verification

1. **Unit Tests**:
   - `receiptCsvExport.test.ts`: Test CSV generation and escape rules.
   - `receiptWhatsApp.test.ts`: Test WhatsApp URL formatting and phone number cleaning.
   - `receiptLedger.test.ts`: Test ledger aggregation, balance computation, and normalization.
2. **Component Tests**:
   - Verify WhatsApp modal opens, edits phone, and formats URL.
   - Verify Ledger drawer shows correct totals and balance calculation.
3. **End-to-End Validation**:
   - Run `pnpm typecheck` and `pnpm test`.
   - Verify no regression in existing payment receipt flows.
