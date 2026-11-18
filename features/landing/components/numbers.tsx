import { useFormatter, useTranslations } from "next-intl"

import { CountUp } from "@/features/landing/components/count-up"
import { Reveal } from "@/features/landing/components/reveal"
import { STATS } from "@/features/landing/constants"

const FIGURES = [
  { key: "callsAnswered", value: STATS.callsAnswered },
  { key: "hoursHandled", value: STATS.hoursHandled },
  { key: "afterHours", value: STATS.afterHours },
] as const

function Numbers() {
  const t = useTranslations("Landing.numbers")
  const format = useFormatter()
  const [year, month] = STATS.since.split("-").map(Number)
  const since = format.dateTime(new Date(year, month - 1, 1), {
    month: "long",
    year: "numeric",
  })

  return (
    <section className="px-4 sm:px-6">
      <Reveal className="mx-auto max-w-6xl rounded-3xl bg-muted/50 px-6 py-12 sm:px-12">
        <p className="text-center text-sm text-muted-foreground">
          {t("title", { since })}
        </p>
        <dl className="mt-8 grid gap-8 text-center sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
          {FIGURES.map(({ key, value }) => (
            <div key={key} className="flex flex-col gap-2 sm:px-6">
              <dt className="order-2 text-muted-foreground">{t(key)}</dt>
              <dd className="order-1 font-display text-5xl tracking-tight">
                <CountUp value={value} suffix="+" />
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}

export { Numbers }
