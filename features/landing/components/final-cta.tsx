import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { BookCallButton } from "@/features/landing/components/book-call-button"
import { Reveal } from "@/features/landing/components/reveal"
import { Link } from "@/i18n/navigation"

function FinalCta() {
  const t = useTranslations("Landing")

  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <Reveal className="landing-glow relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-20 text-center">
        <div className="landing-dots pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="font-display text-3xl tracking-tight text-balance sm:text-5xl">
            {t("finalCta.title")}
          </h2>
          <p className="max-w-[480px] text-pretty text-foreground/60">
            {t("finalCta.text")}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <BookCallButton className="h-[46px] rounded-full px-7 text-[15px]" />
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-[46px] rounded-full px-7 text-[15px]"
              render={<Link href="/sign-up" />}
            >
              {t("cta.signUp")}
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export { FinalCta }
