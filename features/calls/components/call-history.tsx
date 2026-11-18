"use client"

import { useFormatter, useTranslations } from "next-intl"

import { MissedCallBadge } from "@/features/calls/components/missed-call-badge"
import { CALL_STATUSES } from "@/features/calls/constants"
import type { CallListItem } from "@/features/calls/types"
import { cn } from "@/lib/utils"

// Other calls from the open call's number, so the team sees what this caller
// already asked about and where each call stands
function CallHistory({
  calls,
  total,
  onSelect,
}: {
  calls: CallListItem[]
  total: number
  onSelect: (call: CallListItem) => void
}) {
  const t = useTranslations("Calls")
  const format = useFormatter()

  if (total === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-medium">{t("history.title", { total })}</h3>
      <ul className="-mx-2 flex flex-col">
        {calls.map((call) => {
          const { dotClassName } = CALL_STATUSES[call.status]
          const label = t(`statuses.${call.status}`)
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
                  // In the configured Belgian time zone, so the server and
                  // the browser agree
                  <time
                    dateTime={call.startedAt}
                    className="shrink-0 text-muted-foreground tabular-nums"
                  >
                    {format.dateTime(new Date(call.startedAt), "dayMonthTime")}
                  </time>
                )}
                {call.isEmpty ? (
                  <MissedCallBadge />
                ) : call.summary ? (
                  <span className="min-w-0 truncate">{call.summary}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {t("history.noSummary")}
                  </span>
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
