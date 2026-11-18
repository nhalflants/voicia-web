import { PhoneIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { CopyNumberButton } from "@/features/landing/components/copy-number-button"
import { DemoConversation } from "@/features/landing/components/demo-conversation"
import { Reveal } from "@/features/landing/components/reveal"
import { DEMO_PHONE_NUMBER } from "@/features/landing/constants"

// Hidden while there is no demo number
function DemoLine() {
  const t = useTranslations("Landing.demo")
  if (!DEMO_PHONE_NUMBER) return null

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="flex flex-col gap-5">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h2>
          <p className="max-w-md text-pretty text-muted-foreground">
            {t("text")}
          </p>
          <p className="font-display text-4xl tracking-tight tabular-nums select-all sm:text-5xl">
            {DEMO_PHONE_NUMBER}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              className="h-[46px] rounded-full px-6 text-[15px] has-data-[icon=inline-start]:pl-5"
              render={
                <a href={`tel:${DEMO_PHONE_NUMBER.replace(/\s/g, "")}`} />
              }
            >
              <PhoneIcon data-icon="inline-start" />
              {t("call")}
            </Button>
            <CopyNumberButton number={DEMO_PHONE_NUMBER} />
          </div>
        </Reveal>

        <div className="landing-glow relative flex justify-center rounded-3xl px-4 py-10 sm:px-10">
          <div className="landing-dots pointer-events-none absolute inset-0" />
          <DemoConversation />
        </div>
      </div>
    </section>
  )
}

export { DemoLine }
