import type { Metadata } from "next"
import { hasLocale } from "next-intl"

import { LegalPage } from "@/features/legal/components/legal-page"
import { TERMS } from "@/features/legal/content/terms"
import { legalMetadata } from "@/features/legal/metadata"
import { routing } from "@/i18n/routing"

const PATH = "/terms"

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
  return legalMetadata(locale, PATH, TERMS[locale])
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = await resolveLocale(params)
  return <LegalPage locale={locale} path={PATH} document={TERMS[locale]} />
}
