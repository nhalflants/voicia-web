# Calls Day Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group the calls list into per-day sections with pinned headers and a trailing "Not connected" section.

**Architecture:** A pure grouping helper splits the already-sorted `CallListItem[]` into consecutive day groups keyed by the Brussels date; `CallsList` renders one `<section>` per group. Dates are formatted with `Intl.DateTimeFormat` in `BUSINESS_TIME_ZONE`.

**Tech Stack:** Next.js client component, `Intl.DateTimeFormat`, Tailwind.

**Spec:** `docs/superpowers/specs/2026-11-17-calls-day-sections-design.md`

## Global Constraints

- Time zone: `BUSINESS_TIME_ZONE` ("Europe/Brussels") from `features/calls/constants.ts`.
- Labels: "Today", "Yesterday", "{Weekday} {d} {Mon}" for 2–6 days ago, "{d} {Mon}" older in the current year, "{d} {Mon} {yyyy}" for other years, "Not connected" for calls with no `startedAt`.
- No change to the query, the sort or previous/next navigation.
- No test runner in the web app: helpers are checked with a `tsx` script in the scratchpad; UI by typecheck, lint and the user's browser check.

## Review Focus

1. **Midnight in Brussels while the browser is elsewhere** — a call at 23:30 UTC on 16 Nov is 00:30 on 17 Nov in Brussels and belongs under the 17th, with its row time showing 00:30.
2. **Daylight-saving days** — day differences must count calendar days, not 24h blocks (the last Sunday of March and October).
3. **Year boundary** — a call from 28 Dec 2025 shows "28 Dec 2025"; "Yesterday" on 1 Jan is 31 Dec.
4. **Only connected calls, or only unconnected** — no empty sections; "Not connected" appears only when such calls exist.
5. **Server/browser render around midnight** — the labels may differ for a moment; this must not break hydration.

---

### Task 1: Day grouping and labels

**Files:**
- Create: `features/calls/day-sections.ts`
- Modify: `features/calls/format.ts`

**Interfaces:**
- Produces:
  - `formatCallTime(iso: string): string` in `format.ts` — "14:05", 24h, Brussels.
  - `groupCallsByDay<T extends { startedAt: string | null }>(calls: T[], now: Date): { key: string; label: string; calls: T[] }[]` in `day-sections.ts` — consecutive groups in input order; key is the Brussels date "YYYY-MM-DD" or `"not-connected"`.

- [ ] **Step 1: Write the check script** in the scratchpad (`day-sections-check.ts`) with `now = 2026-11-17T10:00:00Z` and assertions:
  - `2026-11-17T08:00Z` → "Today"; `2026-11-16T23:30Z` → "Today" (00:30 Brussels) and `formatCallTime` → "00:30"
  - `2026-11-16T12:00Z` → "Yesterday"; `2026-11-15T12:00Z` → "Sunday 15 Nov"; `2026-11-11T12:00Z` → "Wednesday 11 Nov"; `2026-11-10T12:00Z` → "10 Nov"
  - `2025-12-28T12:00Z` → "28 Dec 2025"; with `now = 2026-01-01T10:00Z`, `2025-12-31T12:00Z` → "Yesterday"
  - DST: with `now = 2026-03-30T10:00Z`, `2026-03-29T12:00Z` → "Yesterday" and `2026-03-28T12:00Z` → "Saturday 28 Mar"
  - `[today, today, yesterday, null]` → 3 groups with keys `[todayKey, yesterdayKey, "not-connected"]`, sizes `[2, 1, 1]`; all-null input → one "Not connected" group; empty input → `[]`

- [ ] **Step 2: Run it, expect failure** — `node_modules/.bin/tsx <script>`; Expected: module not found.

- [ ] **Step 3: Implement** — Brussels date parts via `Intl.DateTimeFormat("en-CA", { timeZone, year, month, day })`; day difference from `Date.UTC` of both dates' parts (calendar days, DST-safe); labels via `Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long", day: "numeric", month: "short" })`, adding `year` for other years.

- [ ] **Step 4: Run it, expect PASS.** Then `npm run typecheck`.

- [ ] **Step 5: Commit** — `feat: group calls by Brussels day`

### Task 2: Sections in the calls list

**Files:**
- Modify: `features/calls/components/calls-list.tsx`

**Interfaces:**
- Consumes: `groupCallsByDay`, `formatCallTime` (Task 1).

- [ ] **Step 1: Render sections** — replace the single `<ul>` with one `<section aria-labelledby>` per group: an `<h2>` (small, uppercase, muted, `sticky top-0 z-10 bg-background py-2`, `suppressHydrationWarning`) and the group's `<ul>` of `CallItem`s. `now` is `new Date()` at render.
- [ ] **Step 2: Row time** — `CallItem` shows `formatCallTime(call.startedAt)` instead of `format(..., "d MMM, HH:mm")`; drop the `date-fns` import if unused.
- [ ] **Step 3: Verify** — `npm run typecheck && npx eslint features/calls` pass. Browser check by the user: sections and labels, sticky headers while scrolling, "Not connected" only when present, previous/next still walk the whole list across sections.
- [ ] **Step 4: Commit** — `feat: show calls in day sections`
