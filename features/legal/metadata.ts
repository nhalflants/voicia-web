import type { Metadata } from "next"

import type { LegalDocument } from "@/features/legal/types"

// Same shape as the landing page metadata, for one legal route
export function legalMetadata(
  locale: string,
  path: string,
  document: LegalDocument
): Metadata {
  const title = `${document.title} · Voicia`
  return {
    title,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        en: `/en${path}`,
        fr: `/fr${path}`,
        "x-default": `/en${path}`,
      },
    },
    openGraph: {
      type: "website",
      url: `/${locale}${path}`,
      siteName: "Voicia",
      title,
      locale: locale === "fr" ? "fr_BE" : "en_BE",
    },
  }
}
