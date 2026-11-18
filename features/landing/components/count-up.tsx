"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"
import { useFormatter } from "next-intl"

// A number that counts up from 0 the first time it scrolls into view. The
// final value is always in the page for screen readers and search engines
function CountUp({
  value,
  format = "integer",
  suffix = "",
}: {
  value: number
  format?: "integer" | "percent"
  suffix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduceMotion = useReducedMotion()
  const formatter = useFormatter()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!inView || reduceMotion) return
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: setCurrent,
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value])

  const text = (n: number) =>
    (format === "percent"
      ? formatter.number(n, { style: "percent", maximumFractionDigits: 0 })
      : formatter.number(Math.round(n))) + suffix

  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{text(value)}</span>
      <span aria-hidden>{text(reduceMotion ? value : current)}</span>
    </span>
  )
}

export { CountUp }
