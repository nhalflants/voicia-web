"use client"

import { motion } from "motion/react"
import {
  CalendarClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PlayIcon,
  WrenchIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface BriefCardContent {
  callerName: string
  callerNumber: string
  time: string
  category: string
  priority: string
  summary: string
  facts: { place: string; when: string; topic: string }
  duration: string
  replay: string
  callBack: string
  sentTo: string
}

// Bar heights of the recording's waveform, as a share of the full height
const WAVEFORM = [
  0.35, 0.6, 0.45, 0.8, 0.55, 0.9, 0.4, 0.7, 0.5, 0.85, 0.3, 0.65, 0.75, 0.45,
  0.6, 0.95, 0.5, 0.7, 0.35, 0.55, 0.8, 0.4, 0.65, 0.3,
]

// Parts of the brief appear one after another, as if Voicia were writing it
const list = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const part = {
  hidden: { opacity: 0, y: 6 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// The call brief as the dashboard shows it, with sample data.
// Decorative: its buttons don't do anything
function BriefCard({
  content,
  className,
}: {
  content: BriefCardContent
  className?: string
}) {
  const facts = [
    { icon: MapPinIcon, label: content.facts.place },
    { icon: CalendarClockIcon, label: content.facts.when },
    { icon: WrenchIcon, label: content.facts.topic },
  ]

  return (
    <Card
      aria-hidden
      size="sm"
      className={cn(
        "w-full max-w-sm px-4 text-left shadow-xl shadow-black/5",
        className
      )}
    >
      <motion.div
        variants={list}
        initial="hidden"
        animate="shown"
        className="flex flex-col gap-3"
      >
        {/* Caller and the one action that matters */}
        <motion.div variants={part} className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-base font-medium">
              {content.callerName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {content.callerNumber} · {content.time}
            </p>
          </div>
          <Button size="sm" tabIndex={-1}>
            <PhoneIcon data-icon="inline-start" />
            {content.callBack}
          </Button>
        </motion.div>

        <motion.div variants={part} className="flex flex-wrap gap-1.5">
          <Badge className="bg-brand-soft font-medium text-brand">
            {content.priority}
          </Badge>
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className="size-1.5 rounded-full bg-amber-500" />
            {content.category}
          </Badge>
        </motion.div>

        <motion.p
          variants={part}
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {content.summary}
        </motion.p>

        {/* What Voicia pulled out of the conversation */}
        <motion.div variants={part} className="flex flex-wrap gap-1.5">
          {facts.map(({ icon: Icon, label }) => (
            <Badge
              key={label}
              variant="secondary"
              className="gap-1 font-normal"
            >
              <Icon />
              {label}
            </Badge>
          ))}
        </motion.div>

        {/* Recording */}
        <motion.div
          variants={part}
          className="flex items-center gap-2.5 rounded-lg bg-muted/60 p-1.5 pr-3"
        >
          <Button
            size="icon-sm"
            variant="outline"
            className="rounded-full"
            tabIndex={-1}
            aria-label={content.replay}
          >
            <PlayIcon className="fill-current" />
          </Button>
          <div className="flex h-6 flex-1 items-center gap-[3px]">
            {WAVEFORM.map((height, i) => (
              <span
                key={i}
                className={cn(
                  "w-[3px] rounded-full",
                  i < 7 ? "bg-foreground" : "bg-foreground/25"
                )}
                style={{ height: `${height * 100}%` }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {content.duration}
          </span>
        </motion.div>

        <motion.div variants={part} className="flex flex-col gap-3">
          <Separator />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MailIcon className="size-3.5" />
            {content.sentTo}
          </p>
        </motion.div>
      </motion.div>
    </Card>
  )
}

export { BriefCard }
