import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { BookCallButton } from "@/features/landing/components/book-call-button"
import { HeroCall } from "@/features/landing/components/hero-call"
import { HeroPill } from "@/features/landing/components/hero-pill"
import { Link } from "@/i18n/navigation"

function Hero() {
  const t = useTranslations("Landing")

  return (
    <section className="px-4 pt-12 pb-16 sm:px-6 sm:pt-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <div className="landing-intro">
          <HeroPill />
        </div>
        <h1
          className="landing-intro font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-6xl"
          style={{ animationDelay: "0.18s" }}
        >
          {t("hero.title")}
        </h1>
        <p
          className="landing-intro max-w-2xl text-lg text-pretty text-muted-foreground"
          style={{ animationDelay: "0.4s" }}
        >
          {t("hero.subtitle")}
        </p>
        <div
          className="landing-intro flex flex-wrap justify-center gap-3"
          style={{ animationDelay: "0.5s" }}
        >
          <BookCallButton className="h-11 rounded-full px-5" />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="h-11 rounded-full px-5"
            render={<Link href="/sign-up" />}
          >
            {t("cta.signUp")}
          </Button>
        </div>
      </div>

      <div className="landing-glow relative mx-auto mt-14 max-w-6xl overflow-hidden rounded-3xl px-4">
        <div className="landing-dots pointer-events-none absolute inset-0" />
        <HeroCall />
      </div>
    </section>
  )
}

export { Hero }
