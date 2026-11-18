"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import {
  BellRingIcon,
  FileTextIcon,
  ListFilterIcon,
  PhoneIncomingIcon,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BriefCard } from "@/features/landing/components/brief-card"
import { AlertsMock } from "@/features/landing/components/mocks/alerts-mock"
import { AnswersVisual } from "@/features/landing/components/mocks/answers-visual"
import { AppFrame } from "@/features/landing/components/mocks/app-frame"
import { CallsListMock } from "@/features/landing/components/mocks/calls-list-mock"
import { useReducedMotion } from "@/features/landing/use-reduced-motion"

type TabKey = "answers" | "brief" | "sorts" | "alerts"

const TABS: { key: TabKey; icon: LucideIcon }[] = [
  { key: "answers", icon: PhoneIncomingIcon },
  { key: "brief", icon: FileTextIcon },
  { key: "sorts", icon: ListFilterIcon },
  { key: "alerts", icon: BellRingIcon },
]

const AUTO_ADVANCE_MS = 6000

function BriefMock() {
  const t = useTranslations("Landing.product.mocks")
  return (
    <BriefCard
      className="mx-auto shadow-xl shadow-black/5"
      content={{
        callerName: t("answers.callerName"),
        callerNumber: t("answers.callerNumber"),
        time: t("answers.time"),
        category: t("answers.category"),
        priority: t("answers.priority"),
        summary: t("answers.summary"),
        facts: {
          place: t("answers.place"),
          when: t("answers.when"),
          topic: t("answers.topic"),
        },
        duration: t("answers.duration"),
        replay: t("answers.replay"),
        callBack: t("answers.callBack"),
        sentTo: t("answers.sentTo"),
      }}
    />
  )
}

const MOCKS: Record<TabKey, React.ComponentType> = {
  answers: AnswersVisual,
  brief: BriefMock,
  sorts: CallsListMock,
  alerts: AlertsMock,
}

// What Voicia does, one tab per step, each with a mock of the dashboard
function ProductTabs() {
  const t = useTranslations("Landing.product.tabs")
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: "-20%" })
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState<TabKey>("answers")
  // Once the visitor picks a tab, the tabs stop changing on their own
  const [picked, setPicked] = useState(false)
  const tabsRowRef = useRef<HTMLDivElement>(null)

  // Keeps the active tab visible in the row when it scrolls on phones,
  // without moving the page
  useEffect(() => {
    const row = tabsRowRef.current
    const tab = row?.querySelector<HTMLElement>("[aria-selected=true]")
    if (!row || !tab) return
    row.scrollTo({
      left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }, [active, reduceMotion])

  useEffect(() => {
    if (!inView || picked || reduceMotion) return
    // On phones each tab has its own height, so changing on its own would
    // move the page under the reader's thumb
    if (!window.matchMedia("(min-width: 640px)").matches) return
    const timer = setTimeout(() => {
      const next =
        TABS[(TABS.findIndex((tab) => tab.key === active) + 1) % TABS.length]
      setActive(next.key)
    }, AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [active, inView, picked, reduceMotion])

  return (
    <div ref={ref}>
      <Tabs
        value={active}
        onValueChange={(value) => {
          setActive(value as TabKey)
          setPicked(true)
        }}
        className="items-center gap-10"
      >
        {/* Scrolls inside itself on narrow screens rather than the page */}
        <div
          ref={tabsRowRef}
          className="relative -mx-4 max-w-[calc(100%+2rem)] overflow-x-auto px-4 pb-1 sm:mx-0 sm:max-w-full sm:px-0"
        >
          <TabsList className="h-auto gap-1 rounded-full border border-foreground/[0.06] bg-background p-1 group-data-horizontal/tabs:h-auto">
            {TABS.map(({ key, icon: Icon }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="relative isolate h-8 flex-none gap-2 rounded-full border-none px-3.5 text-[13px] text-muted-foreground hover:text-foreground data-active:bg-transparent data-active:text-foreground data-active:shadow-none dark:data-active:bg-transparent [&_svg]:size-3.5 [&_svg]:opacity-40 [&_svg]:transition-opacity data-active:[&_svg]:opacity-100"
              >
                {active === key && (
                  <motion.span
                    layoutId="product-tab"
                    className="absolute inset-0 -z-10 rounded-full bg-muted"
                    transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  />
                )}
                <Icon />
                {t(`${key}.label`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS.map(({ key }) => {
          const Mock = MOCKS[key]
          return (
            <TabsContent
              key={key}
              value={key}
              className="grid w-full items-center gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-3 text-center lg:text-left"
              >
                <h3 className="font-display text-2xl tracking-tight text-balance sm:text-3xl">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-base text-pretty text-muted-foreground">
                  {t(`${key}.text`)}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={
                  key === "answers"
                    ? undefined
                    : "landing-glow relative flex items-center justify-center rounded-3xl p-4 sm:aspect-[4/3] sm:p-10"
                }
              >
                {key === "answers" ? (
                  // Brings its own photo and frame
                  <Mock />
                ) : (
                  <>
                    <div className="landing-dots pointer-events-none absolute inset-0" />
                    {key === "brief" ? (
                      // Already a card
                      <div className="relative w-full max-w-sm">
                        <Mock />
                      </div>
                    ) : (
                      <AppFrame className="relative max-w-lg">
                        <Mock />
                      </AppFrame>
                    )}
                  </>
                )}
              </motion.div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

export { ProductTabs }
