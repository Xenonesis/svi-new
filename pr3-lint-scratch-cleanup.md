# PR #3: Fix Lint in Scratch Scripts (`*.cjs`)

> **Stage 1.3 of the refactor roadmap.**
> **Time estimate:** 10 minutes.
> **Risk:** None (these are throwaway dev scripts, not part of the app runtime).

---

## Background

Running `npm run lint -- --quiet` currently shows **64 errors** in 6 files:

```
/home/xeno/Desktop/svi-new/fix.cjs
/home/xeno/Desktop/svi-new/scratch.cjs
/home/xeno/Desktop/svi-new/scratch/fetch_resend.cjs
/home/xeno/Desktop/svi-new/scratch/sync-emails.cjs
/home/xeno/Desktop/svi-new/scratch/test-emails.cjs
/home/xeno/Desktop/svi-new/scripts/convert-heic.js
```

The errors are all of 3 kinds:

| Error                                                                             | Reason                                            |
| --------------------------------------------------------------------------------- | ------------------------------------------------- |
| `A require() style import is forbidden` (`@typescript-eslint/no-require-imports`) | ESLint treats these as TS, but they're CommonJS   |
| `'require' is not defined` (`no-undef`)                                           | Same — ESM env assumed, but files use CJS         |
| `'process' / 'console' is not defined` (`no-undef`)                               | No `node` env declared                            |
| `'process' / 'console' is already defined as a built-in global` (`no-redeclare`)  | The other way round — they redeclared the globals |
| `Unnecessary escape character` (`no-useless-escape`)                              | One minor regex escape in `fix.cjs`               |

---

## Files & Their Purpose

| File                       | Purpose                                                        | Used in CI? |   Kept?    |
| -------------------------- | -------------------------------------------------------------- | :---------: | :--------: |
| `fix.cjs`                  | One-off legacy fix script                                      |     No      | **Delete** |
| `scratch.cjs`              | Throwaway dev scratch                                          |     No      | **Delete** |
| `scratch/fetch_resend.cjs` | Throwaway fetch test                                           |     No      | **Delete** |
| `scratch/sync-emails.cjs`  | Throwaway email sync test                                      |     No      | **Delete** |
| `scratch/test-emails.cjs`  | Throwaway email test                                           |     No      | **Delete** |
| `scripts/convert-heic.js`  | HEIC image conversion helper, called from admin PDF generation |  Possibly   |  **Fix**   |

The `scratch/` folder itself has no production purpose — `scratch.cjs` is just one-off exploration.

---

## Plan: 2-step cleanup

### Step 1 — Delete 5 throwaway files

```
rm fix.cjs
rm scratch.cjs
rm scratch/fetch_resend.cjs
rm scratch/sync-emails.cjs
rm scratch/test-emails.cjs
rmdir scratch      # only if empty after deletions
```

These files have no `import` or `require` chains pointing to them — they are standalone executables run manually. Safe to delete.

### Step 2 — Fix `scripts/convert-heic.js`

The file uses `process` and `console` as built-in Node globals. Add a `/* eslint-env node */` directive at the top of the file (same pattern we used in `src/lib/supabase/create-admin.ts` in the quick-wins PR).

Add line 1:

```js
/* eslint-env node */
```

This stops ESLint from complaining about `process`, `console`, `__dirname`, `require`, etc.

---

## Verification

- `npm run lint -- --quiet` should report **0 errors** (down from 64).
- `npm test` — must remain 89/89 passing.
- `git grep` for `scratch/` references — should be empty.
- `scripts/convert-heic.js` still runs the same way (no functional change).

---

## Files Touched

| File                       | Action                      |
| -------------------------- | --------------------------- |
| `fix.cjs`                  | Delete                      |
| `scratch.cjs`              | Delete                      |
| `scratch/fetch_resend.cjs` | Delete                      |
| `scratch/sync-emails.cjs`  | Delete                      |
| `scratch/test-emails.cjs`  | Delete                      |
| `scratch/`                 | Remove if empty             |
| `scripts/convert-heic.js`  | Add `/* eslint-env node */` |

**Net result: 64 lint errors → 0**, no functional change to the application.

---

## Out of Scope

- Migrating `scripts/convert-heic.js` to TypeScript
- Renaming it to `.mjs`
- Any cleanup of the actual scripts inside it (separate refactor)

---

## Follow-ups (future PRs)

- PR #4: Stage 2.1 — Replace `as any` casts in `app/api/admin/email/route.ts`
- PR #5: Stage 2.2 — Type `RepliesTab.tsx`
- PR #6: Stage 2.3 — Generic types in `lotteryRepository.ts`
