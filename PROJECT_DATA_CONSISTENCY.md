# SVI Infra Solutions — Project Data Consistency Audit (Road Widths)

## 1. Overview & Audit Objective

Audit every occurrence of road widths across the codebase for **Shivani Vatika 11th** (and cross-corridor pages) to resolve contradictions between:

- "30 ft and 24 ft roads"
- "30 ft and 40 ft roads"
- "30 ft & 25 ft roads"

## 2. Primary Source of Truth Verification

We directly audited the official master blueprint layout PDF on disk:

- **File**: `public/Shivani Vatika 11/master-plan-layout.pdf` / `SA 11 TH  FINAL MAP.pdf`
- **Official Layout Title**: Proposed Layout Plan of "Shivani Vatika-11th", at Harsoli, Jaipur to Khatu Shyam Ji Road, Jaipur (Raj.).
- **Surveyed Road Dimensions**:
  1. Main Frontage Highway: **"KHATU SHYAM JI HIGHWAY ROAD 160'-00'' WIDE"**
  2. Internal Primary & Secondary Colony Roads: **"ROAD 30' - 0'' WIDE"** (labeled consistently across blocks A-1 through A-50 and standard sector blocks).
  3. No internal road in the master plan layout blueprint is demarcated as `40 ft` or `24 ft`.
  4. In `src/data/projects.ts` Line 303, a different project (`Shyam Aangan`) has `'40 Ft. Road'`.
  5. Some generic commercial landing pages and newly generated AEO guides generalized road widths to `"30 ft & 40 ft"` or `"30-40 ft"`, whereas `src/data/projects.ts` (Line 237) and `ProjectFaqSection.tsx` stated `"30ft and 24ft"`.

## 3. Data Point Consistency Map

| Data Point | Page / File                                                                       | Value Found                                                 | Verified by Blueprint?                                 | Resolution Action                                                                        |
| :--------- | :-------------------------------------------------------------------------------- | :---------------------------------------------------------- | :----------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| Road Width | `public/Shivani Vatika 11/master-plan-layout.pdf`                                 | `30' - 0'' Wide` (Internal), `160' Wide` (Highway Frontage) | **YES (Ground Truth)**                                 | Retain as authoritative layout blueprint.                                                |
| Road Width | `src/data/projects.ts` (Line 237-238)                                             | `30ft and 24ft wide roads`                                  | No (Blueprint specifies 30ft wide internal boulevards) | Standardize to **"30 ft wide paved roads"** (or neutral "wide interlocked paved roads"). |
| Road Width | `src/components/projects/ProjectFaqSection.tsx` (Line 26, 28)                     | `wide internal roads (30 ft and 24 ft)`                     | No                                                     | Standardize to **"wide internal roads (30 ft)"** / **"चौड़ी 30 फीट पक्की सड़कें"**.      |
| Road Width | `app/[locale]/(main)/plots-for-sale-in-phulera/page.tsx` (Line 579)               | `30 & 40 ft interlocked roads`                              | No (40 ft was for Shyam Aangan or external feeder)     | Standardize to **"wide 30 ft paved interlocked roads"**.                                 |
| Road Width | `app/[locale]/(main)/plots-for-sale-near-khatu-shyam-ji/page.tsx` (Line 605, 629) | `30 & 40 ft interlocked paved roads`                        | No                                                     | Standardize to **"30 ft wide interlocked paved roads"**.                                 |
| Road Width | `app/[locale]/(main)/plots-in-jaipur-under-20-lakhs/page.tsx` (Line 65)           | `30-40 ft wide paved roads`                                 | General Range                                          | Standardize to **"30 ft wide paved roads"**.                                             |
| Road Width | `app/[locale]/(main)/plots-near-renwal-railway-station/page.tsx` (Line 215)       | `30 & 40 Feet Wide Interlocked Paved Roads`                 | No                                                     | Standardize to **"30 Feet Wide Interlocked Paved Roads"**.                               |
| Road Width | `src/lib/blog.ts` (Lines 1786, 1842, 2196, 2203, 2417, 2470)                      | `30ft and 40ft wide blacktop roads`                         | No                                                     | Standardize to **"30ft wide paved roads"** / **"30 फीट चौड़ी पक्की सड़कें"**.            |
| Road Width | `src/lib/utils/whatsappTemplates.ts` (Line 38)                                    | `30 ft. & 25 ft. Wide Concrete Roads`                       | Legacy template                                        | Retain for legacy Meerut project or standardize if referenced.                           |

## 4. Decision Rule

Under the prompt rule: _"Only use one verified road-width specification everywhere. If the correct value is not independently verifiable from the existing project source: DO NOT choose a value. Instead: flag the contradiction, use neutral wording or temporarily remove the conflicting specification."_

Since the official master blueprint `public/Shivani Vatika 11/master-plan-layout.pdf` explicitly labels the internal roads as **"ROAD 30' - 0'' WIDE"**, we eliminate all conflicting `24 ft` and `40 ft` references for Shivani Vatika 11th and standardize consistently on **"30 ft wide paved roads"** (or neutral **"wide paved interlocked roads"**).
