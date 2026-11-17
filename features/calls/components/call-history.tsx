"use client"

import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { CALL_STATUSES } from "@/features/calls/constants"
import type { CallHistoryItem } from "@/features/calls/types"
import { cn } from "@/lib/utils"

// Other calls from the open call's number, so the team sees what this caller
// already asked about and where each call stands
function CallHistory({
  calls,
  total,
  onSelect,
}: {
  calls: CallHistoryItem[]
  total: number
  onSelect: (call: CallHistoryItem) => void
}) {
  if (total === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-medium">Other calls from this number ({total})</h3>
      <ul className="-mx-2 flex flex-col">
        {calls.map((call) => {
          const { label, dotClassName } = CALL_STATUSES[call.status]
          return (
            <li key={call.id}>
              <button
                type="button"
                onClick={() => onSelect(call)}
                className="flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  title={label}
                  className={cn("size-2 shrink-0 rounded-full", dotClassName)}
                />
                <span className="sr-only">{label}</span>
                {call.startedAt && (
                  // The server and the browser may sit in different time zones
                  <time
                    dateTime={call.startedAt}
                    suppressHydrationWarning
                    className="shrink-0 text-muted-foreground tabular-nums"
                  >
                    {format(new Date(call.startedAt), "d MMM, HH:mm")}
                  </time>
                )}
                {call.isEmpty ? (
                  <Badge variant="secondary" className="font-normal">
                    Missed call
                  </Badge>
                ) : call.summary ? (
                  <span className="min-w-0 truncate">{call.summary}</span>
                ) : (
                  <span className="text-muted-foreground">No summary</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export { CallHistory }
