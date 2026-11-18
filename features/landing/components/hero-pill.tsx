"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  FileTextIcon,
  PhoneIncomingIcon,
  TagsIcon,
  TargetIcon,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useReducedMotion } from "@/features/landing/use-reduced-motion"

const PILLS: {
  key: "answers" | "qualifies" | "sorts" | "summary"
  icon: LucideIcon
}[] = [
  { key: "answers", icon: PhoneIncomingIcon },
  { key: "qualifies", icon: TargetIcon },
  { key: "sorts", icon: TagsIcon },
  { key: "summary", icon: FileTextIcon },
]

const INTERVAL_MS = 3000

// A small chip above the headline that cycles through what Voicia does
function HeroPill() {
  const t = useTranslations("Landing.hero.pills")
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % PILLS.length),
      INTERVAL_MS
    )
    return () => clearInterval(timer)
  }, [reduceMotion])

  const { key, icon: Icon } = PILLS[index]

  return (
    // Fixed height so the headline doesn't move as the text changes
    <div className="flex h-8 items-center" aria-live="off">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 rounded-[14px] bg-background px-2.5 py-1.5 text-[13px] whitespace-nowrap text-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_3px_rgb(0_0_0/0.03),0_2px_8px_rgb(0_0_0/0.02)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]"
        >
          <Icon className="size-3.5 text-brand" />
          {t(key)}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export { HeroPill }
