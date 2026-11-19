import { useLocale, useTranslations } from "next-intl"

import { Separator } from "@/components/ui/separator"
import { Logo } from "@/features/landing/components/landing-nav"
import { CONTACT_EMAIL } from "@/features/landing/constants"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const LANGUAGE_NAMES: Record<string, string> = { en: "English", fr: "Français" }

// path keeps the language links on the current page
function LandingFooter({ path = "/" }: { path?: string }) {
  const t = useTranslations("Landing.footer")
  const locale = useLocale()

  return (
    <footer className="px-4 pb-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Separator />
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">{t("contact")}</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">{t("language")}</p>
              {routing.locales.map((code) => (
                <Link
                  key={code}
                  href={path}
                  locale={code}
                  aria-current={code === locale ? "true" : undefined}
                  className={cn(
                    "hover:underline",
                    code === locale && "font-medium"
                  )}
                >
                  {LANGUAGE_NAMES[code]}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-foreground">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { LandingFooter }
