import { BriefcaseIcon, HardHatIcon, MoonIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card } from "@/components/ui/card"
import { CountUp } from "@/features/landing/components/count-up"
import { Reveal } from "@/features/landing/components/reveal"
import { STATS } from "@/features/landing/constants"

const PAINS = [
  { key: "onSite", icon: HardHatIcon },
  { key: "withClient", icon: BriefcaseIcon },
  { key: "afterHours", icon: MoonIcon },
] as const

function Problem() {
  const t = useTranslations("Landing.problem")

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="flex flex-col gap-5">
          <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h2>
          <p className="font-display text-7xl leading-none tracking-tight text-brand sm:text-8xl">
            <CountUp value={STATS.workingHoursShare} format="percent" />
          </p>
          <p className="max-w-md text-lg text-pretty">{t("stat")}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("statSource")}
          </p>
        </Reveal>

        <div className="flex flex-col gap-4">
          {PAINS.map(({ key, icon: Icon }, i) => (
            <Reveal key={key} delay={i * 0.08}>
              <Card className="flex-row items-start gap-4 px-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium">{t(`pains.${key}.title`)}</h3>
                  <p className="text-muted-foreground">
                    {t(`pains.${key}.text`)}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export { Problem }
