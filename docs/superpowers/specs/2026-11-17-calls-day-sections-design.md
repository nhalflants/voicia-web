# Calls list day sections — design

Date: 2026-11-17 · Status: approved · Builds on: `2026-11-17-caller-history-design.md`

## Why

The calls list is one long flat list. Teams can't see at a glance which calls
came in today and which are left over from earlier days, and the "N calls
today" badge has no visible "today" to anchor to.

## Decision

Split the list into one section per day, newest first, under a pinned header:

```
TODAY
  Marie Dupont  📞 +32 470…  ↻ 3 calls today       14:05 · 1:12
YESTERDAY
  …                                                 16:20 · 2:03
MONDAY 15 NOV
  …
12 NOV
  …
NOT CONNECTED
  …
```

- Labels: "Today", "Yesterday", then weekday + date for the rest of the last
  7 days ("Monday 15 Nov"), then the date ("12 Nov"); the year is added for
  other years ("28 Dec 2025").
- Days are Europe/Brussels days (`BUSINESS_TIME_ZONE`), the same as the badge.
- Rows show only the time ("14:05"), in Brussels time; the header carries the
  date. The detail panel and its history keep full dates.
- Headers stick to the top while scrolling.
- Empty days aren't shown.
- Calls with no start time (never connected) go in a last "Not connected"
  section, shown only when there are any. The existing sort already puts them
  last.
- No counts in headers: the list is capped at 100 rows, so the oldest
  section's count could be wrong.

## Approaches considered

1. **Per-day sections (chosen).** The day is the unit of work for a phone
   line and matches the per-day badge.
2. **Relative buckets: Today / Yesterday / This week / Older.** Rejected:
   "This week" is ambiguous (on Monday it equals Today), and a week bucket
   can hold hundreds of calls with no structure.

## Non-goals

- Header counts, changing the sort order, grouping the history panel.

## Constraints

- Client-only change: same query, same order, same previous/next navigation.
- Calls UI copy is hard-coded English.
