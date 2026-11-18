"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { PhoneForwardedIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const BARS = 28

// A call Voicia is taking right now, with a running timer and live transcript
function LiveCallMock() {
  const t = useTranslations("Landing.product.mocks")
  const reduceMotion = useReducedMotion()
  const [seconds, setSeconds] = useState(32)

  useEffect(() => {
    if (reduceMotion) return
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [reduceMotion])

  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Badge className="gap-1.5 bg-brand-soft font-medium text-brand">
            <span className="size-1.5 animate-pulse rounded-full bg-brand" />
            {t("live")} · <span className="tabular-nums">{time}</span>
          </Badge>
          <p className="mt-1 text-base font-medium tabular-nums">
            {t("liveNumber")}
          </p>
          <p className="text-xs text-muted-foreground">{t("liveTopic")}</p>
        </div>
        <Button size="sm" variant="outline" tabIndex={-1}>
          <PhoneForwardedIcon data-icon="inline-start" />
          {t("transfer")}
        </Button>
      </div>

      <div className="flex h-12 items-center gap-1 rounded-lg bg-muted/60 px-3">
        {Array.from({ length: BARS }, (_, i) => (
          <motion.span
            key={i}
            className="w-1 flex-1 rounded-full bg-foreground/70"
            initial={{ height: "20%" }}
            animate={
              reduceMotion
                ? { height: "40%" }
                : { height: ["20%", `${30 + ((i * 37) % 60)}%`, "20%"] }
            }
            transition={{
              duration: 0.9 + (i % 5) * 0.15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 7) * 0.08,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("transcript")}
        </p>
        <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-foreground px-3 py-2 text-background">
          {t("line1")}
        </p>
        <p className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-muted px-3 py-2">
          {t("line2")}
        </p>
      </div>
    </div>
  )
}

export { LiveCallMock }
