"use client"

import { motion } from "motion/react"
import { PhoneIcon, PhoneMissedIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Row {
  name: string
  number: string
  time: string
  duration: string
  summary?: string
  missed?: string
  category: string
  status: string
  assignee: string
}

// Category colours from the dashboard's palette; null means no category
const CATEGORY_COLORS = ["#f59e0b", null, "#10b981"]
const STATUS_DOTS = ["bg-blue-500", "bg-blue-500", "bg-amber-500"]

// The calls page as the dashboard shows it, with sample data. The newest
// call (Julien's, from the other tabs) slides in at the top
function CallsListMock() {
  const t = useTranslations("Landing.product.mocks")
  const rows = t.raw("rows") as Row[]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4 border-b text-sm">
        <span className="-mb-px border-b-2 border-foreground pb-2 font-medium">
          {t("tabsOpen")}
        </span>
        <span className="pb-2 text-muted-foreground">{t("tabsClosed")}</span>
        <span className="pb-2 text-muted-foreground">{t("tabsAll")}</span>
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t("today")}
      </p>
      <ul className="flex flex-col divide-y">
        {rows.map((row, i) => {
          const color = CATEGORY_COLORS[i]
          return (
            <motion.li
              key={row.number}
              initial={i === 0 ? { opacity: 0, y: -12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className={cn(
                "flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0",
                i === 0 && "-mx-2 rounded-lg bg-brand-soft/40 px-2 first:pt-3"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-sm">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3">
                  <span className="font-medium">{row.name}</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground tabular-nums">
                    <PhoneIcon className="size-3.5" />
                    {row.number}
                  </span>
                </div>
                <span className="text-muted-foreground tabular-nums">
                  {row.time} · {row.duration}
                </span>
              </div>
              {row.missed ? (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <PhoneMissedIcon className="size-3" />
                  {row.missed}
                </Badge>
              ) : (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {row.summary}
                </p>
              )}
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "gap-1.5 font-normal",
                    color ? "text-foreground" : "text-muted-foreground"
                  )}
                  style={
                    color
                      ? {
                          backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                        }
                      : undefined
                  }
                >
                  {color && (
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  {row.category}
                </Badge>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn("size-1.5 rounded-full", STATUS_DOTS[i])}
                    />
                    {row.status}
                  </span>
                  {row.assignee && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                      {row.assignee}
                    </span>
                  )}
                </div>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

export { CallsListMock }
