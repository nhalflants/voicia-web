import type { Metadata } from "next"
import { Familjen_Grotesk, Geist, Geist_Mono, Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { frFR } from "@clerk/localizations"
import { shadcn } from "@clerk/ui/themes"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { notFound } from "next/navigation"
import { locale as getLocaleParam } from "next/root-params"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { routing } from "@/i18n/routing"
import { Toaster } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Landing page headings only, as on the previous voicia.be
const fontDisplay = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

// Absolute URLs for canonical links and social images, in every route
export const metadata: Metadata = {
  metadataBase: new URL("https://www.voicia.be"),
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Static file paths skip the proxy and can land here as a "locale"
  const locale = await getLocaleParam()
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        fontDisplay.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ClerkProvider
          appearance={{ theme: shadcn }}
          // Clerk defaults to English
          localization={locale === "fr" ? frFR : undefined}
        >
          <NextIntlClientProvider>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
