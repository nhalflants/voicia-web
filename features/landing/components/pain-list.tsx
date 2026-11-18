"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "motion/react"
import { CheckIcon, PhoneMissedIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/features/landing/use-reduced-motion"

const PAINS = ["onSite", "consultation", "afterHours"] as const

// Each row's chip starts as the problem and turns into Voicia's answer
// shortly after the row scrolls into view, one row after another
const FLIP_DELAY_S = 0.6
const STAGGER_S = 0.35

function PainRow({
  painKey,
  index,
}: {
  painKey: (typeof PAINS)[number]
  index: number
}) {
  const t = useTranslations("Landing.problem.pains")
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduceMotion = useReducedMotion()
  const [flipped, setFlipped] = useState(false)
  const handled = flipped || reduceMotion

  useEffect(() => {
    if (!inView || reduceMotion) return
    const timer = setTimeout(
      () => setFlipped(true),
      (FLIP_DELAY_S + index * STAGGER_S) * 1000
    )
    return () => clearTimeout(timer)
  }, [inView, reduceMotion, index])

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex flex-wrap items-start gap-x-4 gap-y-3 border-b py-6 first:pt-0"
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center transition-colors duration-500",
          handled ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <CheckIcon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-medium">{t(`${painKey}.title`)}</h3>
        <p className="text-sm text-muted-foreground">{t(`${painKey}.text`)}</p>
      </div>
      {/* Under the text on phones. A fixed width on wider screens keeps the
          text column still when the chip changes */}
      <span className="relative flex h-6 basis-full justify-start pl-9 sm:min-w-40 sm:basis-auto sm:justify-end sm:pl-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={handled ? "after" : "before"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs whitespace-nowrap",
              handled ? "bg-muted text-foreground" : "bg-brand-soft text-brand"
            )}
          >
            {!handled && <PhoneMissedIcon className="size-3" />}
            {t(`${painKey}.${handled ? "after" : "before"}`)}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.li>
  )
}

// The three moments calls get missed, then the payoff row
function PainList() {
  const t = useTranslations("Landing.problem.pains")

  return (
    <ul className="flex flex-col">
      {PAINS.map((key, i) => (
        <PainRow key={key} painKey={key} index={i} />
      ))}
      <motion.li
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: PAINS.length * 0.08 }}
        className="mt-4 flex flex-wrap items-start gap-x-4 gap-y-3 rounded-2xl bg-muted/70 px-5 py-5"
      >
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center font-display text-sm text-muted-foreground">
          {PAINS.length + 1}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="font-medium">{t("yourWork.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("yourWork.text")}</p>
        </div>
        <span className="flex basis-full pl-9 sm:basis-auto sm:pl-0">
          <span className="inline-flex h-6 items-center rounded-full bg-foreground px-2.5 text-xs whitespace-nowrap text-background">
            {t("yourWork.after")}
          </span>
        </span>
      </motion.li>
    </ul>
  )
}

export { PainList }
