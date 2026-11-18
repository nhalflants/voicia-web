import {
  BriefcaseIcon,
  HomeIcon,
  ScaleIcon,
  StethoscopeIcon,
  UsersIcon,
  UtensilsCrossedIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Card } from "@/components/ui/card"
import { Reveal } from "@/features/landing/components/reveal"
import { SectionHeading } from "@/features/landing/components/section-heading"

type AudienceKey =
  "trades" | "clinics" | "agencies" | "legal" | "hospitality" | "realEstate"

// `image` is a path under public/; when set, the card shows the photo
// above its text. See docs/landing-image-prompts.md
const AUDIENCES: { key: AudienceKey; icon: LucideIcon; image?: string }[] = [
  { key: "trades", icon: WrenchIcon },
  { key: "clinics", icon: StethoscopeIcon },
  { key: "agencies", icon: BriefcaseIcon },
  { key: "legal", icon: ScaleIcon },
  { key: "hospitality", icon: UtensilsCrossedIcon },
  { key: "realEstate", icon: HomeIcon },
]

function Audiences() {
  const t = useTranslations("Landing.audiences")

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <SectionHeading
          icon={UsersIcon}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map(({ key, icon: Icon, image }, i) => (
            <Reveal key={key} delay={(i % 3) * 0.08}>
              <Card className="h-full">
                {image && (
                  // The Card primitive rounds and bleeds a leading image
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                <div className="flex flex-col gap-3 px-6">
                  <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-medium">{t(`items.${key}.title`)}</h3>
                  <p className="text-muted-foreground">
                    {t(`items.${key}.text`)}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export { Audiences }
