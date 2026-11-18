"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"
import { PhoneIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { BriefCard } from "@/features/landing/components/brief-card"
import { PhoneFrame } from "@/features/landing/components/phone-frame"
import { cn } from "@/lib/utils"

// ringing → greeting → caller → assistant → brief, then again
const STAGE_DURATIONS = [1800, 1600, 2000, 2000, 4200]
const LAST_STAGE = STAGE_DURATIONS.length - 1

const bubble = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
}

function HeroCall() {
  const t = useTranslations("Landing.hero.call")
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: "-10%" })
  const reduceMotion = useReducedMotion()
  const [loopStage, setLoopStage] = useState(0)
  // With reduced motion the finished call is shown at rest
  const stage = reduceMotion ? LAST_STAGE : loopStage

  useEffect(() => {
    if (!inView || reduceMotion) return
    const timer = setTimeout(
      () => setLoopStage((s) => (s + 1) % STAGE_DURATIONS.length),
      STAGE_DURATIONS[loopStage]
    )
    return () => clearTimeout(timer)
  }, [loopStage, inView, reduceMotion])

  const ringing = stage === 0
  const ended = stage === LAST_STAGE

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative flex flex-col items-center gap-6 md:block md:h-[620px]"
    >
      <PhoneFrame className="md:absolute md:top-10 md:left-[calc(50%-250px)]">
        {/* Call header */}
        <div className="flex flex-col items-center gap-2 px-4 pt-12 pb-4 text-center">
          <div className="relative flex size-14 items-center justify-center rounded-full bg-background shadow-sm">
            {ringing && (
              <motion.span
                className="absolute inset-0 rounded-full bg-brand/30"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
            <PhoneIcon
              className={cn("size-6", ringing ? "text-brand" : "text-foreground")}
            />
          </div>
          <p className="text-sm font-medium">{t("callerNumber")}</p>
          <p
            className={cn(
              "text-xs",
              ringing ? "text-brand" : "text-muted-foreground"
            )}
          >
            {ringing
              ? t("incoming")
              : ended
                ? t("ended", { duration: "0:48" })
                : t("answering")}
          </p>
        </div>

        {/* Conversation */}
        <div className="flex flex-1 flex-col gap-2 px-3 text-[13px] leading-snug">
          <AnimatePresence>
            {stage >= 1 && (
              <motion.p
                key="greeting"
                {...bubble}
                className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-background px-3 py-2 shadow-xs"
              >
                {t("greeting")}
              </motion.p>
            )}
            {stage >= 2 && (
              <motion.p
                key="caller"
                {...bubble}
                className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-foreground px-3 py-2 text-background"
              >
                {t("caller")}
              </motion.p>
            )}
            {stage >= 3 && (
              <motion.p
                key="assistant"
                {...bubble}
                className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-background px-3 py-2 shadow-xs"
              >
                {t("assistant")}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </PhoneFrame>

      {/* The brief slides out beside the phone */}
      {/* Space is kept on phones so the page doesn't jump when it appears */}
      <div className="min-h-[300px] w-full max-w-sm md:absolute md:min-h-0 md:top-44 md:left-[calc(50%+40px)] md:w-[360px]">
        <AnimatePresence>
          {ended && (
            <motion.div
              key="brief"
              initial={{ opacity: 0, x: -24, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <BriefCard
                content={{
                  label: t("briefLabel"),
                  callerName: t("callerName"),
                  callerNumber: t("callerNumber"),
                  answeredBy: t("answeredBy"),
                  category: t("category"),
                  summary: t("summary"),
                  callBack: t("callBack"),
                  assignToMe: t("assignToMe"),
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export { HeroCall }
