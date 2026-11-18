import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"

import { routing } from "@/i18n/routing"

import { Audiences } from "@/features/landing/components/audiences"
import { DemoLine } from "@/features/landing/components/demo-line"
import { Faq } from "@/features/landing/components/faq"
import { FinalCta } from "@/features/landing/components/final-cta"
import { Hero } from "@/features/landing/components/hero"
import { Integrations } from "@/features/landing/components/integrations"
import { LandingFooter } from "@/features/landing/components/landing-footer"
import { LandingMotion } from "@/features/landing/components/landing-motion"
import { LandingNav } from "@/features/landing/components/landing-nav"
import { Numbers } from "@/features/landing/components/numbers"
import { Pricing } from "@/features/landing/components/pricing"
import { Problem } from "@/features/landing/components/problem"
import { Product } from "@/features/landing/components/product"

const SITE_URL = "https://www.voicia.be"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: param } = await params
  const locale = hasLocale(routing.locales, param)
    ? param
    : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "Landing.meta" })

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", fr: "/fr", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      url: `/${locale}`,
      siteName: "Voicia",
      title: t("title"),
      description: t("description"),
      locale: locale === "fr" ? "fr_BE" : "en_BE",
    },
  }
}

export default function Page() {
  return (
    <LandingMotion>
      <LandingNav />
      <main>
        <Hero />
        <Problem />
        <Product />
        <Numbers />
        <Audiences />
        <DemoLine />
        <Integrations />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </LandingMotion>
  )
}
