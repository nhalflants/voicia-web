import { BUSINESS_TIME_ZONE } from "@/features/calls/constants"

// The label is left to the component, which knows the language
export type DaySection<T> = {
  // The Belgian date, "2026-11-17", or "not-connected"
  key: string
  calls: T[]
} & (
  | { connected: false }
  | { connected: true; date: Date; daysAgo: number; sameYear: boolean }
)

const NOT_CONNECTED = "not-connected"

// en-CA formats as "2026-11-17"
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

function dayKey(date: Date) {
  return dayKeyFormat.format(date)
}

// Whole calendar days between two keys; counting on UTC dates keeps daylight
// saving changes from shortening or stretching a day
function daysBetween(fromKey: string, toKey: string) {
  const toUtc = (key: string) => {
    const [year, month, day] = key.split("-").map(Number)
    return Date.UTC(year, month - 1, day)
  }
  return Math.round((toUtc(toKey) - toUtc(fromKey)) / 86_400_000)
}

// Noon UTC on that date falls on the same date in Belgium, so formatting it
// in Belgian time shows the right day
function dayDate(key: string) {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12))
}

// Splits an already sorted list into its Belgian days, newest first as given.
// Calls that never connected have no start time; the sort puts them last and
// they get their own section
export function groupCallsByDay<T extends { startedAt: string | null }>(
  calls: T[],
  now: Date
): DaySection<T>[] {
  const todayKey = dayKey(now)
  const sections: DaySection<T>[] = []

  for (const call of calls) {
    const key = call.startedAt
      ? dayKey(new Date(call.startedAt))
      : NOT_CONNECTED
    let section = sections.at(-1)
    if (section?.key !== key) {
      section =
        key === NOT_CONNECTED
          ? { key, calls: [], connected: false }
          : {
              key,
              calls: [],
              connected: true,
              date: dayDate(key),
              daysAgo: daysBetween(key, todayKey),
              sameYear: key.slice(0, 4) === todayKey.slice(0, 4),
            }
      sections.push(section)
    }
    section.calls.push(call)
  }

  return sections
}
