import type { Metadata } from "next"
import { hasLocale } from "next-intl"

import { LegalPage } from "@/features/legal/components/legal-page"
import { PRIVACY } from "@/features/legal/content/privacy"
import { legalMetadata } from "@/features/legal/metadata"
import { routing } from "@/i18n/routing"

const PATH = "/privacy-policy"

async function resolveLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = await resolveLocale(params)
  return legalMetadata(locale, PATH, PRIVACY[locale])
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = await resolveLocale(params)
  return <LegalPage locale={locale} path={PATH} document={PRIVACY[locale]} />
}
