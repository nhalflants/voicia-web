import { CheckIcon, TagIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PLANS } from "@/features/billing/constants"
import { BookCallButton } from "@/features/landing/components/book-call-button"
import { Reveal } from "@/features/landing/components/reveal"
import { SectionHeading } from "@/features/landing/components/section-heading"

function Pricing() {
  const t = useTranslations("Landing.pricing")
  const format = useFormatter()
  const features = t.raw("features") as string[]
  const euros = (amount: number) =>
    format.number(amount, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    })

  return (
    <section id="pricing" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <SectionHeading
          icon={TagIcon}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08}>
              <Card className="h-full gap-5 px-6">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">{plan.name}</h3>
                  <p className="flex items-baseline gap-1.5">
                    <span className="font-display text-5xl tracking-tight">
                      {euros(plan.monthlyPrice)}
                    </span>
                    <span className="text-muted-foreground">
                      {t("perMonth")}
                    </span>
                  </p>
                  <p>
                    {t("includedMinutes", { minutes: plan.includedMinutes })}
                  </p>
                  <p className="text-muted-foreground">
                    {t("extraMinute", { price: euros(plan.extraMinutePrice) })}
                  </p>
                </div>
                <Separator />
                <ul className="flex flex-1 flex-col gap-2.5">
                  {[t("setupIncluded"), ...features].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <BookCallButton className="h-[46px] w-full rounded-full text-[15px]" />
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export { Pricing }
