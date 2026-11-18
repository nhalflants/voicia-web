import {
  CalendarDaysIcon,
  CalendarIcon,
  ContactIcon,
  MailIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  PlugIcon,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Reveal } from "@/features/landing/components/reveal"
import { SectionHeading } from "@/features/landing/components/section-heading"
import { cn } from "@/lib/utils"

type IntegrationKey =
  "email" | "googleCalendar" | "outlook" | "hubspot" | "whatsapp" | "imessage"

// Generic icons on purpose: no brand logos until an integration exists
const INTEGRATIONS: {
  key: IntegrationKey
  icon: LucideIcon
  available: boolean
}[] = [
  { key: "email", icon: MailIcon, available: true },
  { key: "googleCalendar", icon: CalendarIcon, available: false },
  { key: "outlook", icon: CalendarDaysIcon, available: false },
  { key: "hubspot", icon: ContactIcon, available: false },
  { key: "whatsapp", icon: MessageCircleIcon, available: false },
  { key: "imessage", icon: MessageSquareIcon, available: false },
]

function Integrations() {
  const t = useTranslations("Landing.integrations")

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <SectionHeading
          icon={PlugIcon}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <Reveal>
          <ul className="flex flex-wrap justify-center gap-3">
            {INTEGRATIONS.map(({ key, icon: Icon, available }) => (
              <li
                key={key}
                className={cn(
                  "flex items-center gap-2.5 rounded-full border bg-background py-2 pr-2 pl-4 text-sm",
                  !available && "text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
                <span
                  className={cn(available && "font-medium text-foreground")}
                >
                  {t(`items.${key}`)}
                </span>
                <Badge
                  variant={available ? "default" : "secondary"}
                  className={cn(
                    "font-normal",
                    available && "bg-brand-soft text-brand"
                  )}
                >
                  {available ? t("available") : t("soon")}
                </Badge>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

export { Integrations }
