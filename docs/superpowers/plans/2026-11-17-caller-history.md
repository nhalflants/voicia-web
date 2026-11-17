# Caller History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a repeat-caller badge on call rows and an "Other calls from this number" history in the call detail panel.

**Architecture:** One new index in the NestJS API's drizzle schema (the API owns migrations), pulled into the web app's generated schema. The web app's read-only repository adds a correlated `repeatCount` to every call query and loads other calls from the same number in `getCall`. Two UI changes: a badge in the list row and a new `CallHistory` section in the detail panel, whose rows open that call through the list's existing URL selection.

**Tech Stack:** Next.js (App Router, read `node_modules/next/dist/docs/` before touching Next APIs), Drizzle ORM 0.45 relational queries on Postgres (Neon), shadcn/Base UI components in `components/ui`, NestJS + drizzle-kit for the migration.

**Spec:** `docs/superpowers/specs/2026-11-17-caller-history-design.md`

## Global Constraints

- Calls match on exact `customer_number` within the same `organization_id`. No normalisation.
- Badge: shown when the call is the 2nd or later from the same number in the 24 hours up to and including its `started_at`. Label `"{ordinal} call in 24h"`, e.g. "2nd call in 24h".
- History: other calls only (exclude the open call), earlier and later, newest first (`started_at desc nulls last, created_at desc`), capped at **10**; heading `Other calls from this number ({total})`; section hidden when total is 0 or the call has no number.
- History row: status dot using `CALL_STATUSES[status].dotClassName`, date `format(date, "d MMM, HH:mm")`, one-line truncated summary, or a "Missed call" badge when `isEmpty`, or "No summary".
- The web app never writes to the database; schema changes live in `~/Documents/Projects/nestjs/voicia`.
- Calls UI copy is hard-coded English (no next-intl in `features/calls`).
- The web app has no test runner. Verification per task is `npm run typecheck`, `npm run lint`, SQL checks against the dev database (Neon MCP `run_sql`, read-only), and a browser check on `http://localhost:3001` (API on :3000).
- Work on a `feat/caller-history` branch in each repo. `lib/db/generated/*` already has uncommitted changes from an earlier pull; `db:pull` regenerates them, so commit the result together with the index.

## Review Focus

1. **Same number, different organization** — the same person calling two Voicia customers must never appear in the other's badge count or history. Checked in Task 2 Step 3.
2. **Withheld number (`customer_number` null)** — no badge, no history section, no history query. Checked in Task 2 Step 3 and Task 4 Step 4.
3. **Filtered list hides the earlier calls** — missed calls are Dismissed at ingest, so under the Open filter the earlier attempts aren't listed but must still count toward the badge. Checked in Task 3 Step 3.
4. **Later calls must not change an older call's badge** — the window is `(started_at - 24h, started_at]`; a call made after this one is not counted. Checked in Task 2 Step 3.
5. **Opening a history call that isn't in the filtered list** — the panel switches to it immediately (no flash of the previous call), previous/next are disabled, and closing returns to the same filtered list. Checked in Task 4 Step 4.

---

### Task 1: Index on organization + number (API) and schema pull (web)

**Files:**
- Modify: `~/Documents/Projects/nestjs/voicia/src/database/schema/index.ts` (the `calls` table's index list, after `calls_organization_id_status_started_at_idx`)
- Create: `~/Documents/Projects/nestjs/voicia/drizzle/0015_<generated-name>.sql` (generated)
- Modify: `lib/db/generated/schema.ts`, `lib/db/generated/relations.ts` (generated)

**Interfaces:**
- Produces: index `calls_organization_id_customer_number_started_at_idx` on `calls (organization_id, customer_number, started_at)` `WHERE customer_number IS NOT NULL`.

- [ ] **Step 1: Add the index to the API schema**

```ts
// Repeat-caller badge and per-number history in the calls panel
index('calls_organization_id_customer_number_started_at_idx')
  .on(table.organizationId, table.customerNumber, table.startedAt)
  .where(sql`${table.customerNumber} IS NOT NULL`),
```

- [ ] **Step 2: Generate the migration** — `cd ~/Documents/Projects/nestjs/voicia && npm run db:generate`. Expected: a new `drizzle/0015_*.sql` containing exactly one `CREATE INDEX "calls_organization_id_customer_number_started_at_idx" ... WHERE "calls"."customer_number" IS NOT NULL` and nothing else. If it contains anything else, stop and report.

- [ ] **Step 3: Apply it** — confirm with the user which database `DATABASE_URL_UNPOOLED` in `.env.local` points at, then `npm run db:migrate`. Expected: migration applied, no errors.

- [ ] **Step 4: Pull into the web app** — `cd ~/Documents/Projects/web-apps/voicia && npm run db:pull`. Expected: `lib/db/generated/schema.ts` lists the new index under `calls`; `npm run typecheck` passes.

- [ ] **Step 5: Commit both repos**

```bash
cd ~/Documents/Projects/nestjs/voicia && git add src/database/schema/index.ts drizzle && git commit -m "feat: index calls by organization and customer number"
cd ~/Documents/Projects/web-apps/voicia && git add lib/db/generated && git commit -m "chore: pull calls customer number index"
```

---

### Task 2: Repository — repeat count and other calls

**Files:**
- Modify: `features/calls/types.ts`
- Modify: `features/calls/constants.ts`
- Modify: `features/calls/repository.ts`

**Interfaces:**
- Consumes: the index from Task 1.
- Produces:
  - `CallListItem.repeatCount: number` — this call's position among calls from its number in the 24h up to its start (1 = first; 0 when there's no number or no start time).
  - `interface CallHistoryItem extends CallListItem { isEmpty: boolean }`
  - `CallDetail.otherCalls: CallHistoryItem[]` and `CallDetail.otherCallsTotal: number`
  - `CALL_HISTORY_LIMIT = 10` in `features/calls/constants.ts`

- [ ] **Step 1: Types and constant** — add the fields above. `CallDetail` keeps its own `isEmpty`.

- [ ] **Step 2: Implement in `repository.ts`**
  - A module-level `repeatCount` SQL fragment, added through `extras: { repeatCount }` to the `findMany` in `getCalls`, the `findFirst` in `getCall`, and the history query, so every `CallListItem` carries it:

    ```ts
    // The nth call from this number in the 24 hours up to this one. Later
    // calls aren't counted, so a call's badge never changes afterwards
    const repeatCount = sql<number>`(
      select count(*)::int from calls as prior
      where prior.organization_id = ${calls.organizationId}
        and prior.customer_number = ${calls.customerNumber}
        and prior.started_at > ${calls.startedAt} - interval '24 hours'
        and prior.started_at <= ${calls.startedAt}
    )`.as("repeat_count")
    ```
    Null number or start time makes the comparisons null, giving 0.
  - `getOtherCalls(organizationId: string, call: { id: string; customerNumber: string | null }): Promise<{ calls: CallHistoryItem[]; total: number }>` (not exported). Returns `{ calls: [], total: 0 }` without querying when `customerNumber` is null. Otherwise it runs in parallel: a `findMany` with `where organization_id = ? and customer_number = ? and id <> ?`, `columns: { ...listColumns, isEmpty: true }`, the category relation, `extras: { repeatCount }`, order `started_at desc nulls last, created_at desc`, `limit: CALL_HISTORY_LIMIT`; and `db.$count(calls, <same where>)`. Map `callCategory` to `category` and `isEmpty ?? false` the same way `getCall` does.
  - `getCall` calls `getOtherCalls` after loading the row and returns `otherCalls` and `otherCallsTotal`.

- [ ] **Step 3: Verify the SQL against the dev database** — log the SQL once (`db.query.calls.findMany(...).toSQL()`) and check that the outer `${calls.*}` references resolve to the outer query's table alias, not `prior`. Then run the same correlated count with Neon `run_sql` (read-only) on real data and check:
  - a number with several calls in a day: the oldest gets 1, the next 2, …, and a call more than 24h after the previous one resets to 1;
  - a row with `customer_number IS NULL` gets 0;
  - `select customer_number, count(distinct organization_id) from calls where customer_number is not null group by 1 having count(distinct organization_id) > 1` — if any exist, confirm the counts for those numbers only include their own organization's calls (if none exist, say so).

  Expected: all three hold. Then `npm run typecheck && npm run lint` pass.

- [ ] **Step 4: Commit**

```bash
git add features/calls/types.ts features/calls/constants.ts features/calls/repository.ts
git commit -m "feat: load repeat count and other calls from the same number"
```

---

### Task 3: Repeat-caller badge in the list

**Files:**
- Modify: `features/calls/format.ts`
- Modify: `features/calls/components/calls-list.tsx` (`CallItem`, next to the phone number button)

**Interfaces:**
- Consumes: `CallListItem.repeatCount` (Task 2).
- Produces: `formatOrdinal(n: number): string` in `features/calls/format.ts` — "1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "111th".

- [ ] **Step 1: Implement `formatOrdinal`** using English rules (11–13 → "th").

- [ ] **Step 2: Render the badge** in `CallItem` inside the title/number row when `call.repeatCount >= 2`: `<Badge variant="secondary">` with a lucide `RepeatIcon` (or `PhoneIncomingIcon`) at `size-3.5` and the text `` `${formatOrdinal(call.repeatCount)} call in 24h` ``. It sits under the row's full-cover link like the other text (no `relative`), so clicking it opens the call. Keep it visually quieter than the category badge (muted text, no colour tint).

- [ ] **Step 3: Verify in the browser** — `npm run dev`, open `/dashboard/calls` with a number that called several times within 24h. Expected: the first call has no badge, later ones show "2nd call in 24h", "3rd call in 24h". Under the default Open filter, a call whose earlier attempt was a missed (Dismissed) call still shows "2nd call in 24h". `npm run typecheck && npm run lint` pass.

- [ ] **Step 4: Commit**

```bash
git add features/calls/format.ts features/calls/components/calls-list.tsx
git commit -m "feat: show repeat-caller badge on calls"
```

---

### Task 4: "Other calls from this number" in the detail panel

**Files:**
- Create: `features/calls/components/call-history.tsx`
- Modify: `features/calls/components/call-detail-sheet.tsx` (`CallDetailSheet` props, `CallPanel` between the Summary and Recording sections)
- Modify: `features/calls/components/calls-list.tsx` (`CallsList`)

**Interfaces:**
- Consumes: `CallDetail.otherCalls`, `CallDetail.otherCallsTotal`, `CallHistoryItem` (Task 2); `CALL_STATUSES` (existing).
- Produces:
  - `CallHistory({ calls, total, onSelect }: { calls: CallHistoryItem[]; total: number; onSelect: (call: CallHistoryItem) => void })`
  - `CallDetailSheet` gains `onSelectCall: (call: CallListItem) => void`, passed down to `CallPanel`.

- [ ] **Step 1: Build `CallHistory`** — `<section>` with `<h3 className="font-medium">Other calls from this number ({total})</h3>` and a `<ul>`. Each row is a full-width `<button>` (hover background, focus ring) containing:
  - the status dot `<span className={cn("size-2 rounded-full", CALL_STATUSES[status].dotClassName)} />` with a `title` and an `sr-only` label of `CALL_STATUSES[status].label`;
  - `<time dateTime={startedAt} suppressHydrationWarning>` formatted `"d MMM, HH:mm"` (omit when `startedAt` is null), `tabular-nums`, muted;
  - then, in order of precedence: `isEmpty` → `<Badge variant="secondary">Missed call</Badge>`; `summary` → `<span className="truncate">` (single line, `min-w-0`); otherwise muted "No summary".

  Returns null when `total === 0`.

- [ ] **Step 2: Wire into the panel** — in `CallPanel`, render `<CallHistory calls={detail.otherCalls} total={detail.otherCallsTotal} onSelect={onSelectCall} />` between Summary and Recording, only once `detail` has loaded (no skeleton: the section appears when there's something to show). Thread `onSelectCall` through `CallDetailSheet` → `CallPanel`.

- [ ] **Step 3: Open the picked call in `CallsList`** — keep the picked history row so the panel can show it straight away even when it isn't in `calls`:
  - `const [picked, setPicked] = useState<CallListItem | null>(null)`
  - `row` becomes `calls.find((c) => c.id === openId) ?? (picked?.id === openId ? picked : undefined)`
  - `onSelectCall={(call) => { setPicked(call); select(call.id, "replace") }}`

  Previous/next need no change: a call outside the list has `index === -1` and no anchor, so both arrows are disabled.

- [ ] **Step 4: Verify in the browser**
  - A call whose number has other calls: the section lists them newest first, including calls made after this one, without the open call; the heading count matches; a missed call shows a grey dot and "Missed call"; a long summary stays on one line with an ellipsis.
  - Clicking a history row: the header switches to that call at once (no flash of the previous call), then the transcript loads; the URL `?call=` is replaced (Back leaves the page, it doesn't step through calls).
  - With the Open filter on, clicking a Done history call: the panel shows it, previous/next are disabled, and closing the panel returns to the Open list with the filter kept.
  - A call with a withheld number and a first-time caller: no section.
  - `npm run typecheck && npm run lint` pass.

- [ ] **Step 5: Commit**

```bash
git add features/calls/components/call-history.tsx features/calls/components/call-detail-sheet.tsx features/calls/components/calls-list.tsx
git commit -m "feat: show other calls from the same number in the call panel"
```
