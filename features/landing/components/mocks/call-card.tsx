"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "motion/react"
import { CheckIcon, PhoneIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card } from "@/components/ui/card"
import { useReducedMotion } from "@/features/landing/use-reduced-motion"
import { cn } from "@/lib/utils"

const FIELDS = ["name", "need", "town", "timing"] as const

// ringing → answering → one tick per field
const RING_MS = 1400
const FIELD_MS = 700
const LAST_STEP = FIELDS.length + 1

// The call as Voicia takes it: it rings, Voicia answers, and each piece of
// information it asks for is ticked off.
// Plays once each time the tab opens; decorative
function CallCard({ className }: { className?: string }) {
  const t = useTranslations("Landing.product.mocks")
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduceMotion = useReducedMotion()
  const [playStep, setPlayStep] = useState(0)
  const step = reduceMotion ? LAST_STEP : playStep

  useEffect(() => {
    if (!inView || reduceMotion || playStep >= LAST_STEP) return
    const timer = setTimeout(
      () => setPlayStep((s) => s + 1),
      playStep === 0 ? RING_MS : FIELD_MS
    )
    return () => clearTimeout(timer)
  }, [inView, reduceMotion, playStep])

  const ringing = step === 0
  const values: Record<(typeof FIELDS)[number], string> = {
    name: t("answers.callerName"),
    need: t("answers.need"),
    town: t("answers.place"),
    timing: t("answers.when"),
  }

  return (
    <div ref={ref} aria-hidden className={className}>
      <Card
        size="sm"
        className="w-full px-4 text-left shadow-2xl shadow-black/15"
      >
        <div className="flex items-center gap-3">
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            {ringing && (
              <motion.span
                className="absolute inset-0 rounded-full bg-brand/30"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 1.1, repeat: Infinity }}
              />
            )}
            <PhoneIcon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-medium">
              {ringing ? t("answers.incoming") : t("answers.answering")}
            </p>
            <p className="truncate text-xs text-muted-foreground tabular-nums">
              {t("answers.callerNumber")}
            </p>
          </div>
        </div>

        <ul className="flex flex-col divide-y text-sm">
          {FIELDS.map((field, i) => {
            const done = step >= i + 2
            return (
              <li key={field} className="flex items-center gap-3 py-2">
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                    done ? "bg-foreground text-background" : "bg-muted"
                  )}
                >
                  {done && <CheckIcon className="size-3" strokeWidth={3} />}
                </span>
                <span className="w-16 shrink-0 text-muted-foreground">
                  {t(`answers.fields.${field}`)}
                </span>
                <AnimatePresence initial={false}>
                  {done ? (
                    <motion.span
                      key="value"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="min-w-0 truncate font-medium"
                    >
                      {values[field]}
                    </motion.span>
                  ) : (
                    <span className="h-2 w-20 rounded-full bg-muted" />
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}

export { CallCard }
