# Caller history — design

Date: 2026-11-17 · Status: approved

## Why

Customers get several calls a day from the same number: someone tries, hangs
up without leaving a message, and tries again; or calls back about something
else. Today every call is an unrelated row in the calls list, so the team has
to scroll and remember which numbers already called, and risks calling the
same person back twice while they work through calls one by one.

## Goals

- At a glance in the list: this number has been calling repeatedly.
- In the call's detail panel: what else this number has called about, and
  where each of those calls stands.

## Non-goals (for now)

- A warning / "someone is already on it" banner in the panel.
- Folding short or missed attempts into the next call.
- Filtering the calls list by number (`?number=`).
- A Contacts page, editable contact names or notes.
- Bulk actions ("mark all done").
- Tracking outbound callbacks (the "Call back" button stays a plain `tel:`
  link; the app can't see whether a callback happened).

## Anti-goals

- Hiding or merging calls: every call keeps its own row, status, assignee and
  category. A repeat call can be the same request or a new one, so the app
  must not decide that for the team.

## Approaches considered

1. **Separate calls, linked by number (chosen).** Keep the list as is; add a
   repeat-caller badge to rows and an "Other calls from this number" section
   to the detail panel. Small change, keeps filters and previous/next
   navigation, works whether repeats are the same request or not.
2. **One row per number.** Group open calls by number; assigning or closing
   acts on all of them. Rejected: repeats are sometimes separate requests,
   it loses per-call categories, and it reworks the list, filters and
   navigation.
3. **A separate Contacts page with per-number history.** Rejected for now: the
   need arises while triaging in the calls list, and a separate page only
   helps if someone thinks to go there. Revisit if customers ask for names,
   notes, or a list of callers; the history component can be reused there.

## Design

### Matching

Calls match on exact `customer_number` within the organization. Numbers come
from Vapi (`call.customer.number`, E.164), so no normalisation is needed.
Calls with no number (withheld) get no badge and no history section.

### List row: repeat-caller badge

- Shown on **today's** calls when their number called 2 or more times today.
  Label: "{total} calls today", the same on every one of those calls, so
  whichever the team opens first tells them the number called repeatedly.
  (Revised 2026-11-17: was "nth call in 24h"; a position hid the repeats on
  the first call, and the rolling window read as confusing.)
- "Today" starts at midnight Europe/Brussels (`BUSINESS_TIME_ZONE`). Voicia
  only serves Belgium for now, as the API's recap emails already assume; move
  it to the organization when that changes. Computed in the database, so the
  server's time zone doesn't matter.
- Calls from earlier days get no badge; the history panel covers them. The
  count on today's calls grows as the number calls again.
- Counted in the database across all statuses, so it stays right under any
  status / assignee / category filter. Calls with no `started_at` get no
  badge.
- Visually quiet (outline badge with a repeat icon), so it doesn't compete
  with the category badge.

```
Marie Dupont   📞 +32 470 12 34 56   ↻ 3 calls today     14:05 · 1m 12s
Wants to move her appointment to Thursday…
[Booking]                                   ● New    Unassigned
```

### Detail panel: "Other calls from this number"

- New section between Summary and Recording.
- Lists the **other** calls from this number (the open call is excluded; it is
  already the subject of the panel), both earlier and later ones, newest
  first, capped at **10**. The heading shows the total count of other calls,
  e.g. "Other calls from this number (14)", so the cap is visible.
- Hidden entirely when there are no other calls, or no number.
- Each row:
  - **Status dot**, using the existing `CALL_STATUSES` colours (blue New,
    amber In progress, green Done, grey Dismissed), with the status label
    available to screen readers and as a tooltip.
  - **Date and time**, in the same format as the list ("17 Nov, 14:05").
  - **Summary**, one line, truncated with an ellipsis; or a **"Missed call"**
    badge when `is_empty` is true (the caller said nothing). Empty calls are
    set to Dismissed at ingest, so these show a grey dot. When a call is
    neither empty nor summarised, show "No summary".
- Clicking a row opens that call in the panel (same URL update as moving
  between calls, no new history entry). It shows immediately from the
  history row's data while the detail loads, like opening from the list.
  If that call isn't in the current filtered list, the previous/next arrows
  are disabled, which is how a shared link already behaves.

```
Other calls from this number (3)
 ●  17 Nov, 14:05   Move appointment to Thursday…
 ●  17 Nov, 11:02   Asked about opening hours, wants a…
 ●  12 Nov, 10:15   [Missed call]
```

### Data

- **Index** (NestJS API owns the schema and migrations): `calls
  (organization_id, customer_number, started_at)`, partial `WHERE
  customer_number IS NOT NULL`. Serves both the badge count and the history.
  The web app regenerates `lib/db/generated` with `npm run db:pull`.
- **Badge**: a correlated count added to `getCalls`, returned as
  `todayCallCount` on `CallListItem` (0 for earlier days, or no number or start
  time).
- **History**: loaded in `getCall` (reads go straight to the database; no API
  change), returned on `CallDetail` as `otherCalls` (up to 10, with the list
  row's fields plus `isEmpty`) and `otherCallsTotal`, from a capped list
  query and a count run in parallel.

## Constraints

- Web app reads only; schema changes go through the NestJS API repo
  (`~/Documents/Projects/nestjs/voicia`, drizzle migrations).
- Calls UI strings are hard-coded English today; follow that.
- Keep the logic minimal.

## Left to the builder

- Exact badge styling and icon, within the existing `Badge` variants.
- Ordinal wording helper ("2nd", "3rd", "11th").
- How the history row's data is handed to `CallsList` for the instant open.
