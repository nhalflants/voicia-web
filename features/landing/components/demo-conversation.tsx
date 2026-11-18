"use client"

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react"
import { useTranslations } from "next-intl"

import { Card } from "@/components/ui/card"
import { BriefCard } from "@/features/landing/components/brief-card"
import { cn } from "@/lib/utils"

interface Turn {
  from: "assistant" | "caller"
  text: string
}

const TURN_MS = 1500
const BRIEF_MS = 5500

// The demo call playing out bubble by bubble, then the brief it produced
function DemoConversation() {
  const t = useTranslations("Landing.demo")
  const script = t.raw("script") as Turn[]
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: "-15%" })
  const reduceMotion = useReducedMotion()
  // 1..script.length bubbles shown, then script.length + 1 is the brief
  const [loopStep, setLoopStep] = useState(1)
  const briefStep = script.length + 1
  const step = reduceMotion ? script.length : loopStep

  useEffect(() => {
    if (!inView || reduceMotion) return
    const timer = setTimeout(
      () => setLoopStep((s) => (s >= briefStep ? 1 : s + 1)),
      loopStep === briefStep ? BRIEF_MS : TURN_MS
    )
    return () => clearTimeout(timer)
  }, [loopStep, briefStep, inView, reduceMotion])

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative min-h-[440px] w-full max-w-md"
    >
      <AnimatePresence mode="wait" initial={false}>
        {step < briefStep ? (
          <motion.div
            key="call"
            exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
          >
            <Card size="sm" className="gap-3 px-4 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium tracking-wide uppercase">
                  <span className="size-1.5 animate-pulse rounded-full bg-brand" />
                  {t("live")}
                </span>
                <span className="tabular-nums">{t("brief.callerNumber")}</span>
              </div>
              <div className="flex flex-col gap-2 text-sm leading-snug">
                <AnimatePresence initial={false}>
                  {script.slice(0, step).map((turn, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2",
                        turn.from === "caller"
                          ? "self-end rounded-br-md bg-foreground text-background"
                          : "self-start rounded-bl-md bg-muted"
                      )}
                    >
                      {turn.text}
                    </motion.p>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="brief"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4 }}
          >
            <BriefCard
              className="max-w-md"
              content={{
                callerName: t("brief.callerName"),
                callerNumber: t("brief.callerNumber"),
                time: t("brief.time"),
                category: t("brief.category"),
                priority: t("brief.priority"),
                summary: t("brief.summary"),
                facts: {
                  place: t("brief.place"),
                  when: t("brief.when"),
                  topic: t("brief.topic"),
                },
                duration: t("brief.duration"),
                replay: t("brief.replay"),
                callBack: t("brief.callBack"),
                sentTo: t("brief.sentTo"),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { DemoConversation }
