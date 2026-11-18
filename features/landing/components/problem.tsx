import { useTranslations } from "next-intl"

import { CountUp } from "@/features/landing/components/count-up"
import { PainList } from "@/features/landing/components/pain-list"
import { Reveal } from "@/features/landing/components/reveal"
import { STATS } from "@/features/landing/constants"

function Problem() {
  const t = useTranslations("Landing.problem")

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="flex flex-col gap-5 lg:sticky lg:top-28">
          <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
            {t.rich("title", {
              mark: (chunks) => <span className="text-brand">{chunks}</span>,
            })}
          </h2>
          <p className="font-display text-7xl leading-none tracking-tight sm:text-8xl">
            <CountUp value={STATS.workingHoursShare} format="percent" />
          </p>
          <p className="max-w-md text-lg text-pretty">{t("stat")}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("statSource")}
          </p>
        </Reveal>

        <PainList />
      </div>
    </section>
  )
}

export { Problem }
