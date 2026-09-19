# Professional Vector Icon System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all cartoonish emojis and unstyled symbols across the public website, admin portal, employee workspace, email templates, document exporters, and messaging templates, replacing them with professional Lucide React vector icons or luxury corporate typography in adherence to SVI Brand Standards.

**Architecture:** Systematic audit and replacement across 6 focused domains: Public Web & Localization, Admin Portal & Management Hubs, Employee Workspace, Email Templates, Document/Export Generators, and Notifications/WhatsApp Broadcasts. Each task replaces raw characters with typed Lucide React components or clean business typography.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, next-intl.

**Spec:** `docs/superpowers/specs/2026-09-19-professional-vector-icon-audit-design.md`

## Global Constraints

- **Zero Cartoonish Emojis**: Never use emojis in UI buttons, titles, headers, dropdowns, PDF templates, or system alerts.
- **Lucide React Icons**: Use official Lucide React vector icons with appropriate sizing and accessible colors matching existing theme classes (`text-brand-gold`, `text-emerald-500`, `text-slate-500`, etc.).
- **Strict TypeScript**: No `any`, clean imports, top-level `import type` for types.
- **Test Integrity**: Every task verifies that unit and component tests pass without regressions.

---

### Task 1: Public Website & Localization Strings

**Files:**

- Modify: `messages/en.json:219-225`
- Modify: `messages/hi.json:219-225`
- Modify: `src/components/home/LeadCapture.tsx:64-74`
- Modify: `src/actions/contact.ts:90-95`
- Modify: `app/api/contact/route.ts:94-98`
- Modify: `app/api/grievance/route.ts:137-142`
- Modify: `app/api/registration/route.ts:383-388`

**Interfaces:**

- Consumes: `useTranslations('leadCapture')`, Lucide `<PhoneCall />`
- Produces: Clean localization text without `👋`, luxury badge without `✨`

- [ ] **Step 1: Update localization files**
      Remove `👋` from `leadCapture.followUp` in `messages/en.json` and `messages/hi.json`.

- [ ] **Step 2: Update LeadCapture.tsx**
      Add Lucide `<PhoneCall className="h-4 w-4 text-brand-gold shrink-0 inline-block mr-2" />` to header.

- [ ] **Step 3: Update notification email badges**
      Replace `✨ System Automated Notification` with `OFFICIAL SYSTEM NOTIFICATION` in `src/actions/contact.ts`, `app/api/contact/route.ts`, `app/api/grievance/route.ts`, and `app/api/registration/route.ts`.

- [ ] **Step 4: Verify typecheck**
      Run: `npm run typecheck`

- [ ] **Step 5: Commit**

```bash
git add messages/ src/components/home/LeadCapture.tsx src/actions/contact.ts app/api/
git commit -m "feat(branding): replace public emojis with professional vector icons and badges"
```

---

### Task 2: Admin Portal Email Center Icons

**Files:**

- Modify: `src/components/admin/email/sections/SentimentBadge.tsx:28-55`
- Modify: `src/components/admin/email/compose/AIComposePopover.tsx:715-725,855-865,915-925`
- Modify: `src/components/admin/email/compose/FloatingSelectionToolbar.tsx:330-340,390-398`
- Modify: `src/components/admin/email/compose/EmailBodyEditor.tsx:225-235`

**Interfaces:**

- Consumes: Lucide `<Smile />`, `<MinusCircle />`, `<Frown />`, `<AlertCircle />`, `<Sparkles />`, `<RefreshCw />`, `<Clock />`, `<Wand2 />`, `<Edit3 />`
- Produces: Refined vector icons in sentiment badges and AI compose controls

- [ ] **Step 1: Refactor SentimentBadge.tsx**
      Replace emojis `'😊'`, `'😐'`, `'😟'`, `'⚡'` with `<Smile />`, `<MinusCircle />`, `<Frown />`, `<AlertCircle />`.

- [ ] **Step 2: Refactor AIComposePopover.tsx & FloatingSelectionToolbar.tsx**
      Replace raw `⚡` and `✨` / `✏️` with Lucide `<Sparkles />`, `<RefreshCw />`, `<Clock />`, `<Edit3 />`.

- [ ] **Step 3: Refactor EmailBodyEditor.tsx**
      Replace `⚡ Auto-Fill` with `<Wand2 className="h-3.5 w-3.5" /> Auto-Fill`.

- [ ] **Step 4: Verify tests & typecheck**
      Run: `npm run typecheck`

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/email/
git commit -m "feat(email): replace email center emojis with Lucide vector icons"
```

---

### Task 3: Admin Portal Department, Workforce, Settings & Forms

**Files:**

- Modify: `src/components/admin/employees/DepartmentRoleSelector.tsx:18-75`
- Modify: `src/components/admin/workforce/tabs/WorkforceLeadsTab.tsx:415-425,1270-1275`
- Modify: `src/components/admin/settings/PropertiesTab.tsx:485-495`
- Modify: `src/components/admin/bba/BBAForm.tsx:280-286`
- Modify: `src/components/admin/bba/BbaPreviewContainer.tsx:268-275`
- Modify: `src/components/admin/lottery/modals/EditCampaignTabs/ParticipantsTab.tsx:65-70`
- Modify: `src/components/admin/lottery/modals/EditCampaignTabs/WinnerTab.tsx:45-52`

**Interfaces:**

- Consumes: Lucide `<Briefcase />`, `<Code />`, `<BarChart3 />`, `<Flame />`, `<Zap />`, `<Snowflake />`, `<MapPin />`, `<AlertCircle />`, `<AlertTriangle />`, `<MousePointer />`, `<Plus />`

- [ ] **Step 1: DepartmentRoleSelector.tsx**
      Replace string emojis `'💼'`, `'💻'`, `'📊'` with Lucide component renderers.

- [ ] **Step 2: WorkforceLeadsTab.tsx**
      Replace `Hot Prospects 🔥` and `<option>` emojis with clean Lucide `<Flame />` header and clean option text (`Hot`, `Warm`, `Cold`).

- [ ] **Step 3: PropertiesTab.tsx & BBAForm.tsx**
      Replace `📍` and `⚠️` with `<MapPin />` and `<AlertTriangle />`.

- [ ] **Step 4: Lottery Tabs**
      Replace `➕ Add New` with `<Plus />` and `⚡ Quick Select` with `<Zap />`.

- [ ] **Step 5: Verify typecheck & tests**
      Run: `npm run typecheck`

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/employees/ src/components/admin/workforce/ src/components/admin/settings/ src/components/admin/bba/ src/components/admin/lottery/
git commit -m "feat(admin): replace department, settings, and form emojis with vector icons"
```

---

### Task 4: Receipts, Allotments, PDFs & Excel Exporters

**Files:**

- Modify: `src/components/admin/payment-receipts/ReceiptLedgerDrawer.tsx:580-590,768-775`
- Modify: `src/components/admin/payment-receipts/StatementPdfTemplate.tsx:175-180`
- Modify: `src/components/admin/portal-allotments/PortalAllotmentTableRow.tsx:130-140,344-352,434-442`
- Modify: `src/lib/leads/exportIvrLeads.ts:90-95`

**Interfaces:**

- Consumes: Lucide `<Shuffle />` (for Draw), `<Target />` (for Direct Sell)
- Produces: Professional badges in table rows, drawers, PDF generator, and clean text in Excel exports

- [ ] **Step 1: Update ReceiptLedgerDrawer.tsx & PortalAllotmentTableRow.tsx**
      Replace `🎲 Draw` and `🎯 Direct Sell` text emojis with `<Shuffle className="h-2.5 w-2.5" /> Draw` and `<Target className="h-2.5 w-2.5" /> Direct Sell`.

- [ ] **Step 2: Update StatementPdfTemplate.tsx**
      Remove raw emojis `🎯` and `🎲` from PDF template text, using clean typographical badges `Direct Sell` / `Draw Allotment`.

- [ ] **Step 3: Update exportIvrLeads.ts**
      Change `'Hot 🔥'`, `'Warm ⚡'`, `'Cold ❄️'` to clean business values `'Hot'`, `'Warm'`, `'Cold'`.

- [ ] **Step 4: Verify tests & typecheck**
      Run: `pnpm vitest run __tests__/admin/portal-allotments/`
      Run: `npm run typecheck`

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/payment-receipts/ src/components/admin/portal-allotments/ src/lib/leads/exportIvrLeads.ts
git commit -m "feat(exports): clean emojis from receipt drawer, statement PDF, and Excel exports"
```

---

### Task 5: Employee Workspace, Email Templates & Notifications

**Files:**

- Modify: `src/components/employee/work/FollowUpReminderBanner.tsx:66-72,126-134`
- Modify: `src/components/employee/attendance/GeofenceStatusCard.tsx:187-192`
- Modify: `src/components/admin/attendance/timesheet/TimesheetTable.tsx:307-312`
- Modify: `src/lib/leads/leadActivityStore.ts:188-193,237-243`
- Modify: `app/admin/layout.tsx:52-57`
- Modify: `src/data/email-templates.json`
- Modify: `src/lib/email-templates.ts:22-28,45-52,92-120,143-172`
- Modify: `src/lib/utils/whatsappTemplates.ts:33-70,88-102`

**Interfaces:**

- Consumes: Lucide `<Bell />`, `<AlertTriangle />`, `<CheckCircle2 />`, `<Check />`
- Produces: Clean professional headers and templates without cartoonish emojis

- [ ] **Step 1: Update FollowUpReminderBanner.tsx**
      Replace `🔔` and `⚠️` in reminder title & banner with Lucide vector icons `<Bell className="h-4 w-4 text-blue-500" />` and `<AlertTriangle className="h-4 w-4 text-amber-500" />`.

- [ ] **Step 2: Update GeofenceStatusCard.tsx & TimesheetTable.tsx**
      Replace unicode checkmarks (`✓`) with Lucide `<CheckCircle2 />` and `<Check />`.

- [ ] **Step 3: Clean system notifications & layout toast**
      In `leadActivityStore.ts` and `app/admin/layout.tsx`, strip `📌`, `🔔`, `⚠️` from notification titles.

- [ ] **Step 4: Clean email templates & WhatsApp templates**
      In `src/data/email-templates.json`, `src/lib/email-templates.ts`, and `src/lib/utils/whatsappTemplates.ts`, strip cartoonish emojis (`🏆`, `🏡`, `🎊`, `✨`, `🎉`, `🎫`, `🎰`, `🌟`, `🙏`, `🚗✨`, etc.) and replace with luxury real estate typography and clean bullet formatting.

- [ ] **Step 5: Full verification**
      Run: `npm run typecheck`
      Run: `pnpm vitest run`
      Run: `git status`

- [ ] **Step 6: Commit**

```bash
git add src/components/employee/ src/components/admin/attendance/ src/lib/ src/data/ app/admin/
git commit -m "feat(notifications): replace employee, email, and WhatsApp emojis with professional vector icons"
```
