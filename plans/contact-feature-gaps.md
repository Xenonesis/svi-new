# Contact Feature Gaps — Email Compose "To" Field

**Status: ✅ 15/15 gaps implemented. Plan complete.**

---

## ✅ Completed Implementations

### Category A: Bugs Fixed (all 7)

| #      | Gap                           | Fix                                                                                     |
| ------ | ----------------------------- | --------------------------------------------------------------------------------------- |
| **A1** | Draft names lost              | Structured `DraftRecipientData` array stored alongside CSV string; names/types restored |
| **A2** | Forward loses To field        | Changed `setTo('')` → `setTo(forwardData.originalTo?.join(', ') \|\| '')`               |
| **A3** | CC/BCC no contact picker      | CC/BCC RecipientInput + target-aware ContactPicker                                      |
| **A4** | No server-side search         | 300ms debounce → `?search=` API call                                                    |
| **A5** | Redundant caching             | Removed duplicate `fetchContacts`/`contactsCache`                                       |
| **A6** | No duplicate feedback         | `toast.info()` on duplicate email                                                       |
| **A7** | Invalid emails silently added | Blocked at input with inline error; paste skips invalids                                |

### Category B: Design Doc Items (both done)

| #      | Feature                | Implementation                                             |
| ------ | ---------------------- | ---------------------------------------------------------- |
| **B1** | CC always visible      | `showCcField` default changed to `true`                    |
| **B2** | Copy Recipients button | Copy icon in header copies `To:`/`CC:`/`BCC:` to clipboard |

### Category C: New Features (all 8 done)

| #      | Feature                             | Implementation                                                                      |
| ------ | ----------------------------------- | ----------------------------------------------------------------------------------- |
| **C1** | Autocomplete/typeahead              | Debounced inline dropdown while typing; keyboard nav; click-to-add with name/role   |
| **C2** | Recent / Most Used contacts         | localStorage tracking + "Recent" section in ContactPicker                           |
| **C3** | Contact groups / distribution lists | DB migration + API (CRUD + members) + Groups dialog in ContactPicker with "Add All" |
| **C4** | Drag-and-drop reordering            | Native HTML5 drag-and-drop on recipient chips                                       |
| **C5** | Remove All button                   | "Clear All" when >1 recipient                                                       |
| **C6** | Ctrl+K shortcut                     | Opens ContactPicker                                                                 |
| **C7** | Contact detail tooltip              | Native tooltip + Info icon for `real_email`                                         |
| **C8** | Recipient count badge               | Shows in header                                                                     |

---

## Files Touched (16 files)

### Components

- `RecipientInput.tsx` — autocomplete, drag-drop, validation, paste, clear all, duplicate toast
- `ComposeFields.tsx` — CC always visible, CC/BCC contact picker
- `ContactPicker.tsx` — server-side search, recent contacts section, Groups button, tooltip
- `ContactGroupsDialog.tsx` — **NEW** manage groups + add members as recipients
- `ComposeTab.tsx` — forward prefill fix, CC/BCC state, Ctrl+K, copy button, count badge, recent tracking

### Hooks

- `useEmailDraft.ts` — structured recipient save/restore
- `useEmailPrefill.ts` — forward fix, draft prefill structured restore

### Core

- `types.ts` — `DraftRecipientData`, `ContactGroup`, `ContactGroupMember`
- `helpers.ts` — JSON encode/decode for structured draft data

### API

- `app/api/admin/contact-groups/route.ts` — GET list, POST create
- `app/api/admin/contact-groups/[id]/route.ts` — DELETE, PATCH
- `app/api/admin/contact-groups/[id]/members/route.ts` — GET, POST, DELETE members

### DB

- `supabase/migrations/20260602010000_create_contact_groups.sql` — `contact_groups` + `contact_group_members` tables

### Utils

- `recentContacts.ts` — **NEW** localStorage recent contact tracking

**Plan complete. 15/15 gaps implemented.**
