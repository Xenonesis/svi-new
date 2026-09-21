# HoverZoomImage Infinite Loading Preview Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the infinite "LOADING PREVIEW ..." bug in `HoverZoomImage` on project cards (including Shivani Vatika 11th on `/projects/current`), ensuring images load immediately and never get stuck in a loading state.

**Architecture:**

1. Attach a DOM `ref` to Next.js `<Image>` inside `HoverZoomImage` to detect cached/pre-completed images (`img.complete && img.naturalWidth > 0`) that do not fire React's synthetic `onLoad` event.
2. Add URL normalization (`decodeURI`) to prevent spurious state resets when paths alternate between encoded and decoded forms (e.g., `/Shivani Vatika 11/` vs `/Shivani%20Vatika%2011/`).
3. Add a watchdog timer (3.5s) to auto-settle the skeleton if the image is already painted or completed.
4. Remove unnecessary client-side loading delays in `CurrentProjectsContent.tsx`.

**Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Lucide React, Tailwind CSS.

**Spec:** User reported that the project card for Shivani Vatika 11th gets permanently stuck displaying the skeleton with "LOADING PREVIEW ..." and spinning loader.

## Global Constraints

- Strict TypeScript: No `any` or `as any`.
- Maintain Obsidian Slate (`#080b11`, `#0c121e`) and Warm Gold (`#d4af37`) luxury design palette.
- Do not remove responsive variants or blur placeholder features.
- All existing tests and production builds must pass cleanly.

---

### Task 1: Harden `HoverZoomImage.tsx` with Ref-based Complete Detection and Watchdog Timer

**Files:**

- Modify: `src/components/ui/HoverZoomImage.tsx:1-203`

**Interfaces:**

- Consumes: `HoverZoomImageProps` (`src`, `alt`, `className`, `imageClassName`, `priority`, `sizes`, `quality`, `showSkeleton`, `onLoad`, `onError`)
- Produces: Resilient image component that never hangs indefinitely on cached or fast-loading images.

- [ ] **Step 1: Inspect and update `src/components/ui/HoverZoomImage.tsx`**
  - Add `useRef<HTMLImageElement | null>(null)` attached to `<Image ref={imgRef}>`.
  - Add URL normalization check in `useEffect([src])` using `decodeURI` so `'/Shivani Vatika 11/gate.webp'` and `'/Shivani%20Vatika%2011/gate.webp'` are treated as identical and do not reset `isLoaded`.
  - In `useEffect([src])` and on mount, immediately check `imgRef.current?.complete && imgRef.current?.naturalWidth > 0`. If true, set `setIsLoaded(true)`.
  - Add a watchdog timeout (3.5s) in `useEffect` that checks `imgRef.current?.complete` or clears skeleton if image has rendered.
  - In `onLoad={(e)}`, extract `const img = e.currentTarget as HTMLImageElement;` and verify `img.naturalWidth > 0` before setting `setIsLoaded(true)`.

- [ ] **Step 2: Verify TypeScript and Diagnostics**
  - Run LSP diagnostics on `src/components/ui/HoverZoomImage.tsx` to verify zero errors.

- [ ] **Step 3: Commit**
  - `git add src/components/ui/HoverZoomImage.tsx`
  - `git commit -m "fix(ui): resolve infinite loading preview in HoverZoomImage"`

---

### Task 2: Optimize `CurrentProjectsContent.tsx` Data Flow

**Files:**

- Modify: `src/components/projects/CurrentProjectsContent.tsx:42-105`

**Interfaces:**

- Consumes: `initialProjects` from `CurrentProjectsPage`
- Produces: Immediate card display without waiting for redundant client-side API requests.

- [ ] **Step 1: Update initial loading state in `CurrentProjectsContent.tsx`**
  - If `initialProjects && initialProjects.length > 0`, initialize `isLoading` to `false` instead of `true`.
  - In `fetchImages()`, normalize incoming URLs before updating `projects` state to prevent unnecessary re-renders.

- [ ] **Step 2: Verify TypeScript and Diagnostics**
  - Run LSP diagnostics on `src/components/projects/CurrentProjectsContent.tsx`.

- [ ] **Step 3: Commit**
  - `git add src/components/projects/CurrentProjectsContent.tsx`
  - `git commit -m "fix(projects): prevent initial skeleton flicker when projects are pre-loaded"`

---

### Task 3: End-to-End Visual and Runtime Verification

**Files:**

- Test via browser evaluation on `http://localhost:3001/projects/current` and `http://localhost:3001/projects/completed`.

- [ ] **Step 1: Live Browser Inspection**
  - Open `http://localhost:3001/projects/current` in headless browser.
  - Inspect DOM state of `.hover-zoom-container`: verify `isLoaded` is `true`, `hasSkeleton` is `false`, and `img.complete` is `true`.
  - Capture screenshot of project cards to confirm Shivani Vatika 11th image renders crystal clear without "LOADING PREVIEW ...".

- [ ] **Step 2: Run Production Build**
  - Run `npm run build` to verify Next.js build passes with 0 errors.

- [ ] **Step 3: Commit and Push**
  - Commit all changes and push to `origin/main`.
