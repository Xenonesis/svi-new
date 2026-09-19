# Site-Wide Professional Vector Icon Audit & Remediation Spec

**Goal:** Eliminate all cartoonish emojis and unstyled symbols across the public website, admin portal, employee workspace, email templates, document exporters, and messaging templates, replacing them with professional Lucide React vector icons or luxury corporate typography in adherence to SVI Brand Standards.

## Brand Standards Reference

- **Visual & Brand Standards**: Never use low-quality, 3D cartoonish, emoji, clip-art, generic, or unprofessional logos/icons anywhere in the website, documents, emails, or UI.
- **Official Branding Only**: Always use official corporate branding assets (`/logo.png`) and clean, high-end vector icons (e.g. Lucide React icons) or sleek modern UI elements for interface graphics.

---

## Architecture & Subsystem Remediation

### 1. Public Website & Localization

- `messages/en.json` & `messages/hi.json`:
  - Replace cartoon waving hand `👋` in `leadCapture.followUp` with clean prompt text.
  - In `LeadCapture.tsx`: Add Lucide `<PhoneCall className="h-4 w-4 text-brand-gold" />` in header badge.
  - In localization strings: Replace raw unicode checkmarks (`✓`) with clean textual labels or paired vector icons.
- Contact / Registration / Grievance Automated Email Alerts:
  - In `src/actions/contact.ts`, `app/api/contact/route.ts`, `app/api/grievance/route.ts`, `app/api/registration/route.ts`:
  - Replace `✨ System Automated Notification` with clean gold badge `OFFICIAL SYSTEM NOTIFICATION`.

### 2. Admin Portal & Management Hubs

- **Email Center** (`src/components/admin/email/`):
  - `SentimentBadge.tsx`: Map sentiments (`positive`, `neutral`, `negative`, `urgent`) to Lucide `<Smile />`, `<MinusCircle />`, `<Frown />`, `<AlertCircle />` with emerald, slate, rose, and amber accent colors.
  - `AIComposePopover.tsx`: Replace `⚡ Auto-Suggest` with `<Sparkles />`, `⚡ Re-Fill` with `<RefreshCw />`, `⚡ Took {s}` with `<Clock />`.
  - `FloatingSelectionToolbar.tsx`: Replace `✨ AI Quick Actions` with `<Sparkles />`, `✏️ Edit Selected Text` with `<Edit3 />`.
  - `EmailBodyEditor.tsx`: Replace `⚡ Auto-Fill` with `<Wand2 />`.
- **Department & Workforce** (`src/components/admin/employees/`, `workforce/tabs/`):
  - `DepartmentRoleSelector.tsx`: Map department icons from `'💼'`, `'💻'`, `'📊'` to Lucide `<Briefcase />`, `<Laptop />`, `<BarChart3 />`.
  - `WorkforceLeadsTab.tsx`: Replace `Hot Prospects 🔥` with `<Flame className="h-3.5 w-3.5 text-red-500" /> Hot Prospects`; remove raw fire/lightning/snowflake from `<option>` tags.
- **Settings & Forms** (`src/components/admin/settings/`, `src/components/admin/bba/`, `src/components/admin/lottery/`):
  - `PropertiesTab.tsx`: Replace `📍` with `<MapPin />`, `⚠️` with `<AlertCircle />`.
  - `BBAForm.tsx`: Replace `⚠️ Warning:` with `<AlertTriangle className="h-3.5 w-3.5 text-amber-500 inline mr-1" />`.
  - `BbaPreviewContainer.tsx`: Replace `Ctrl + 🖱️ Scroll` with clean text `Ctrl + Scroll` + `<MousePointer className="h-3 w-3 inline" />`.
  - `ParticipantsTab.tsx` / `WinnerTab.tsx`: Replace `➕ Add New` with `<Plus />`, `⚡ Quick Select` with `<Zap />`.
- **Receipts & Allotments** (`ReceiptLedgerDrawer.tsx`, `PortalAllotmentTableRow.tsx`):
  - Replace raw `🎲 Draw` and `🎯 Direct Sell` text emojis with Lucide `<Shuffle className="h-3 w-3" />` and `<Target className="h-3 w-3" />`.

### 3. Employee Workspace

- `FollowUpReminderBanner.tsx`:
  - Replace `🔔 Follow-up Due` and `⚠️ Overdue Client Follow-up` with Lucide `<Bell />` and `<AlertTriangle />` vector icons.
- `GeofenceStatusCard.tsx`:
  - Replace `In Work Zone ✓` with `<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 inline mr-1" /> In Work Zone`.
- `TimesheetTable.tsx`:
  - Replace `On Time ✓` with `<Check className="h-3 w-3 text-emerald-500 inline mr-1" /> On Time`.

### 4. Email Templates & Transactional Automation

- `src/data/email-templates.json` & `src/lib/email-templates.ts`:
  - Strip raw emojis (`🏆`, `🏡`, `🎊`, `✨`, `🎉`, `🎫`, `🎰`, `🌟`, `🙏`) from email subject lines and HTML bodies.
  - Use high-contrast corporate typography and SVG headers with official gold styling.

### 5. Document & Export Generators

- `StatementPdfTemplate.tsx`:
  - Replace raw emoji strings `🎯 Direct Sell` / `🎲 Draw Allotment` with clean typographical badges: `Direct Sell` / `Draw Allotment`.
- `exportIvrLeads.ts`:
  - Replace Excel sheet values `Hot 🔥`, `Warm ⚡`, `Cold ❄️` with corporate labels `Hot`, `Warm`, `Cold`.

### 6. Notifications & WhatsApp Broadcasts

- `leadActivityStore.ts`:
  - Strip emojis `📌`, `🔔` from activity notification titles.
- `app/admin/layout.tsx`:
  - Clean `⚠️ Human Agent Handoff Needed!` toast to clean text message with native warning styling.
- `whatsappTemplates.ts`:
  - Refactor WhatsApp templates to use clean luxury real-estate formatting (bullet dots `•`, structured headers) without cartoonish emoji clusters (`🚗✨`, `🌟`, `📍`, `📄`, `📐`, `💳`).

---

## Verification & Acceptance Criteria

1. No raw emoji unicode code-points in UI buttons, titles, headers, dropdowns, or system alerts.
2. Every interactive or status-bearing element has an appropriate, accessible Lucide React icon.
3. TypeScript check `npm run typecheck` passes with 0 errors.
4. All existing tests in `__tests__/` pass without regressions.
