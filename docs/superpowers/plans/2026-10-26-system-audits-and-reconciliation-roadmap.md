# System Diagnostics, Data Reconciliation & Enhancement Roadmap

**Date**: 26 October 2026  
**Status**: Ready for Step-by-Step Execution  
**Project**: SVI Infra Solutions (`svi-new`)

---

## 🎯 Executive Overview

Yeh document system ke un critical issues, data mismatches, aur pending features ka trackable roadmap hai jinhe ek-ek karke systematically solve aur verify karna hai. Har phase ke andar exact database tables, affected client records, risks, aur validation checklist included hain.

---

## 📋 Master Execution Phases

```
[Phase 1: Financial Ledger & Receipts Sync] ──> [Phase 2: Missing Allotment Letters (17 Clients)]
                        │
                        ▼
[Phase 3: Historical IVR Audio Archival (45k calls)] ──> [Phase 4: Bulk Voice AI Triage Engine]
                        │
                        ▼
       [Phase 5: Git & Working Tree Production Cleanup]
```

---

## Phase 1: Financial Ledger vs Payment Receipts Reconciliation

### 🔴 Problem Statement

`allotments` table ke payment schedules (`payment_schedules`) aur `documents` table (`document_type = 'payment_receipt'`) ke darmiyan amount mismatches hain. Client receipts generate ho chuki hain par ledger me entry missing hai, ya ledger me paid marked hai par receipt document nahi bana hai.

### 🔍 Identified Discrepancies (8 Allotments)

| Plot / Unit            | Client Name          | Schedules Paid (₹) | Receipts Total (₹) | Difference (₹) | Root Cause & Action Required                                                                                       |
| ---------------------- | -------------------- | ------------------ | ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Plot 01**            | Abhilasha Varma      | ₹7,10,967          | ₹2,100             | **+₹7,08,867** | Purane payments ke formal receipt documents `documents` table me missing hain. Missing receipts create karni hain. |
| **Plot A-221 & A-222** | Shyam Mohan Sharma   | ₹3,35,000          | ₹5,52,500          | **-₹2,17,500** | Receipts ₹5.52L ki hain par `payment_schedules` me sirf ₹3.35L mark hain. Schedules update karke sync karna hai.   |
| **Plot A-181 & A-182** | Aditya Sharma        | ₹3,35,000          | ₹5,52,500          | **-₹2,17,500** | Same as above — receipts extra hain par schedules incomplete hain.                                                 |
| **Plot 36**            | Rishu Mishra         | ₹1,53,126          | ₹2,01,252          | **-₹48,126**   | 3 EMIs (₹16,042 x 3) receipts me hain par schedules me pending mark hain.                                          |
| **Plot 31**            | Kundan Kumar         | ₹2,75,628          | ₹2,89,920          | **-₹14,292**   | 1 EMI (₹14,292) receipt bana hai par schedule me unpaid hai.                                                       |
| **Plot A-41**          | Madhu Bala (SVI2236) | ₹80,100            | ₹79,000            | **+₹1,100**    | ₹1,100 registration fee thi jo `registrations` me hai par `documents` table me formal receipt nahi hai.            |
| **Plot 02**            | Unassigned / Record  | ₹2,100             | ₹0                 | **+₹2,100**    | Schedule paid hai par receipt document create nahi hua.                                                            |
| **Unassigned**         | Pending Lead         | ₹1,100             | ₹0                 | **+₹1,100**    | ₹1,100 schedule linked hai bina receipt document ke.                                                               |

### 🛠️ Action Items

- [x] **Shyam Mohan Sharma (Plot A-221 & A-222)**: Added Receipt #2132 (₹2,17,500) to `payment_schedules`. Schedules Total = Receipts Total = **₹5,52,500** (Delta: ₹0 ✅).
- [x] **Aditya Sharma (Plot A-181 & 182)**: Added Receipt #2133 (₹2,17,500) to `payment_schedules`. Schedules Total = Receipts Total = **₹5,52,500** (Delta: ₹0 ✅).
- [x] **Kundan Kumar (Plot 31)**: Added Receipt #2134 (₹14,292) to `payment_schedules`. Schedules Total = Receipts Total = **₹2,89,920** (Delta: ₹0 ✅).
- [x] **Rishu Mishra (Plot 36)**: Added Receipt #2111 (₹16,042 - EMI 4, UPI ref 627759662999) to `payment_schedules`.
- [x] **Madhu Bala (Plot A-41 / SVI2236)**: Created official Receipt #2112 (₹1,100) in `documents` table. Schedules Total = Receipts Total = **₹80,100** (Delta: ₹0 ✅).
- [x] **Abhilasha Varma (Plot 01)**: Created 5 missing official receipts (#2094, #2095, #2096, #2097, #2101) in `documents` table. Schedules Total = Receipts Total = **₹7,10,967** (Delta: ₹0 ✅).
- [x] **Rishi Ranjan (Plot 02 / SVI2207)**: Created official Receipt #2139 (₹2,100) in `documents` table. Schedules Total = Receipts Total = **₹2,100** (Delta: ₹0 ✅).
- [x] **SAIPRIYA (Unassigned / SVI2252)**: Created official Receipt #2137 (₹1,100) in `documents` table. Schedules Total = Receipts Total = **₹1,100** (Delta: ₹0 ✅).
- [x] **Sharmila (Unassigned / SVI2247)**: Created official Receipt #2138 (₹1,100) in `documents` table. Schedules Total = Receipts Total = **₹1,100** (Delta: ₹0 ✅).

---

## Phase 2: Missing Allotment Letters Batch Generation

### 🔴 Problem Statement

Total **23 active allotments** me se sirf **6 allotments** ke official Allotment Letters `documents` table me generated hain. Baki 17 clients ke portal par official single-page A4 allotment letter missing hai.

### 🔍 Target Clients (17 Pending Letters)

1. **Plot 31**: Kundan Kumar (Ticket / Ref No.)
2. **Plot Old 134,135 New 128,129**: Sarita Joshi & Shantanu Joshi
3. **Plot 33**: Client Record (Fetch from `registrations` / `allotments`)
4. **Plot 5**: Rani Bhatnagar
5. **Plot 02**: Client Record
6. **Plot 32**: Akshat Pardeshi
7. **Plot 35**: Piyush Sharma
8. **Plot 66**: Raj Arora
9. **Plot 6**: Sunil Bhatnagar
10. **Plot 126+127+**: Nandini Kapoor
11. **Plot 65**: Ashok Kumar
12. **Plot 149**: Shiv Bhagwan
13. **Plot 126**: Rohit
14. **Plot A-221 & A-222**: Shyam Mohan Sharma
15. **Plot A-181 & A-182**: Aditya Sharma
16. **Plot A-41**: Madhu Bala (Status: Generated ✅ verified)
17. **Plot Unassigned**: Secondary applicant

### 🛠️ Action Items

- [ ] Batch generation script banana jo `allotments`, `registrations`, aur verified `payment_schedules` se data pull kare.
- [ ] New single-page A4 luxury format (Booking Advance [RECEIVED] badge, auto-adapted terms, official seal removed, Director signature) ke sath `documents` table me insert karna.
- [ ] Ek-ek client ka 1-click PDF download verify karna taaki layout cut na ho.

---

## Phase 3: Historical IVR Audio Archival (Storage Migration)

### 🔴 Problem Statement

Database me total **45,553 calls** logged hain. Inme se answered calls ki audio files external IP (`http://49.50.77.194/...`) par hosted hain.

- **Risk**: External IP kabhi bhi down ho sakti hai, ISP routing break ho sakti hai, ya logs expire ho sakte hain.

### 🛠️ Action Items

- [x] Supabase private bucket `call-recordings` ready hai.
- [x] Upgraded `deriveStoragePath()` in `syncRecordingToStorage.ts` and `archive_ivr_recordings.cjs` with deterministic timestamp extraction (`<YYYY>/<MM>/<customerPhone>_<cleanFilename>.wav`) to eliminate month-shift playback bugs.
- [x] Added `storage_path` persistence directly into `ivr_call_records.raw_payload.storage_path` and `archived_at` on upload.
- [x] Upgraded `/api/admin/leads/recording/route.ts` to check direct `storage_path` first for 100% instant CDN 307 redirects.
- [x] Implemented chunked pagination (`.range(from, to)`) in `archive_ivr_recordings.cjs` to bypass PostgREST 1,000-row limit.
- [x] Smoke test and batch run executed:
  - **Total Attempted**: 630 calls
  - **Successfully Uploaded**: 566 recordings (**564.36 MB** stored in Supabase private bucket)
  - **404 Expired on Telephony Server**: 64 recordings (confirms urgency of in-house archival)
- [ ] Run full background runner to archive remaining calls: `node scripts/archive_ivr_recordings.cjs --all --concurrency 4`.

---

## Phase 4: Bulk Voice AI Triage Engine (Groq Whisper + LLM)

### 🔴 Problem Statement

Out of **22,968 answered calls**, abhi sirf 5-10 test calls triage hui hain. Sales team ko malum nahi padta ki kis call me client ne kya objection diya ya customer ka intent level kya tha bina puri audio sune.

### 🛠️ Action Items

- [ ] High-Priority Filtering: Pehle wo calls triage karna jinki duration >= 30 seconds hai ya customer ne IVR me Key 1 press kiya hai (~4,000 to 6,000 prime leads).
- [ ] Groq Whisper (`whisper-large-v3-turbo`) transcription + LLM (`qwen/qwen3.8-27b`) structured extraction:
  - 1-sentence executive summary
  - Lead Intent Score (Cold / Warm / Hot)
  - Key objections (Budget, Distance, Registry doubts, Possession date)
  - Advisor Quality Scorecard (Grade A/B/C/D, Pitch Clarity, Coaching Tip)
  - 1-click WhatsApp Call Recap generator.
- [ ] Batch worker (`scripts/batch_ai_triage.cjs`) ko rate-limit safe intervals par run karna.

---

## Phase 5: Git & Production Working Tree Clean Up

### 🔴 Problem Statement

Working tree me 11 modified core files hain aur 40+ temporary analysis scripts bikhri hui hain.

### 🛠️ Action Items

- [ ] Core verified changes ko cleanly stage aur commit karna:
  - `AllotmentLetterPreview.tsx` (Single page A4 layout, Received badge, terms adapt)
  - `documentExporter.ts` (Exact 1:1 single page A4 PDF engine without slicing)
  - `emailValidation.ts` & Resend template sync updates
- [ ] Loose scripts ko reorganize karna (`scripts/archive/` me move karna ya throwaway scripts delete karna).
- [ ] Vitest aur TypeScript typecheck (`bun run typecheck`) ka clean pass report confirm karna.

---

## ✨ Feature: CRM Data Health & Missing Information Radar (Completed ✅)

### 🎯 Overview

Admin top navigation Bell icon me ek dedicated **"⚠️ Gaps"** radar integrate kiya gaya hai jo automatically live detect karta hai:

- **Missing Plot Number** (Status `Allotted` but unit `'Unassigned'` e.g. SAIPRIYA `SVI2252`, Sharmila `SVI2247`).
- **Missing Ticket ID / Ref No** (Allotment exists but ticket number is blank).
- **Missing Allotment Letter** (Plot allotted but official letter not yet generated in documents).
- **Missing Property Advisor** (No dedicated advisor assigned).

### 🚀 Functionality

- **Amber Badge on Bell**: Admin CRM ke kisi bhi page par ho, Bell icon par amber counter alert karta hai (e.g. `⚠️ 21`).
- **1-Click Direct Resolution**: Har missing item ke samne direct button hai (e.g. `Assign Plot No ➔` or `Generate Letter ➔`) jo seedha us section me le jata hai.
- **Instant Auto-Clear**: Jaise hi admin plot number ya ticket save karega, wo gap bina kisi manual mark-as-read ke turant radar se gayab ho jayega.

---

## 📌 Recommendation & Starting Point

**Step 1:** Pehle **Phase 1 (Financial Ledger vs Receipts Reconciliation)** se shuru karein, kyunki finance aur ledger accuracy company audit aur customer satisfaction ke liye sabse sensitive hai.
Uske turant baad **Phase 2 (Missing Allotment Letters)** complete karenge.
