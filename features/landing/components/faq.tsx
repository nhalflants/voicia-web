import { useFormatter, useTranslations } from "next-intl"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PLANS } from "@/features/billing/constants"
import { BookCallButton } from "@/features/landing/components/book-call-button"
import { Reveal } from "@/features/landing/components/reveal"

const QUESTIONS = [
  "keepNumber",
  "setupTime",
  "replaceTeam",
  "extraMinutes",
] as const

function Faq() {
  const t = useTranslations("Landing.faq")
  const format = useFormatter()
  const euros = (amount: number) =>
    format.number(amount, { style: "currency", currency: "EUR" })
  const [first, second] = PLANS

  // Prices come from the plans, so the answer follows a price change
  const answer = (key: (typeof QUESTIONS)[number]) =>
    key === "extraMinutes"
      ? t("items.extraMinutes.a", {
          first: euros(first.extraMinutePrice),
          firstPlan: first.name,
          second: euros(second.extraMinutePrice),
          secondPlan: second.name,
        })
      : t(`items.${key}.a`)

  return (
    <section id="faq" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <Reveal className="flex flex-col items-start gap-4">
          <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
          <BookCallButton className="mt-2 h-[46px] rounded-full px-7 text-[15px]" />
        </Reveal>
        <Reveal delay={0.08}>
          <Accordion defaultValue={[QUESTIONS[0]]} className="gap-2">
            {QUESTIONS.map((key) => (
              <AccordionItem
                key={key}
                value={key}
                className="rounded-xl border-none px-4 transition-colors data-open:bg-muted"
              >
                <AccordionTrigger className="py-4 text-base hover:no-underline">
                  {t(`items.${key}.q`)}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground">
                  {answer(key)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}

export { Faq }
