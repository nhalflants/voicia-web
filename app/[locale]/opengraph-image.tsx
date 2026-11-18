import { ImageResponse } from "next/og"
import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"

import { routing } from "@/i18n/routing"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// The logo's waveform bars, as heights out of 24
const BARS = [6, 14, 24, 11, 16]

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: param } = await params
  const locale = hasLocale(routing.locales, param)
    ? param
    : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "Landing.meta" })
  return [{ id: "default", alt: t("ogAlt"), size, contentType }]
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: param } = await params
  const locale = hasLocale(routing.locales, param)
    ? param
    : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "Landing.hero" })

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background:
          "radial-gradient(70% 80% at 80% 100%, #ffd9cf 0%, rgba(255, 217, 207, 0) 70%), radial-gradient(50% 60% at 10% 10%, #ffeedd 0%, rgba(255, 238, 221, 0) 70%), #ffffff",
        color: "#0b0d10",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {BARS.map((height, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: height * 2.4,
                borderRadius: 5,
                background: "#ff5a5f",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 44, fontWeight: 500 }}>Voicia</div>
      </div>
      <div
        style={{
          fontSize: 76,
          lineHeight: 1.05,
          letterSpacing: -2,
          maxWidth: 980,
        }}
      >
        {t("title")}
      </div>
      <div style={{ fontSize: 30, color: "rgba(11, 13, 16, 0.55)" }}>
        voicia.be
      </div>
    </div>,
    size
  )
}
