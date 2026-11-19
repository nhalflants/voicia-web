import {
  CalculatorIcon,
  CarIcon,
  HomeIcon,
  ScissorsIcon,
  StethoscopeIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Reveal } from "@/features/landing/components/reveal"

type AudienceKey =
  | "homeServices"
  | "automotive"
  | "realEstate"
  | "beauty"
  | "clinics"
  | "brokers"

// `image` is a path under public/; when set, the row shows the photo at its
// end on wider screens. See docs/landing-image-prompts.md
const AUDIENCES: { key: AudienceKey; icon: LucideIcon; image?: string }[] = [
  { key: "homeServices", icon: WrenchIcon },
  { key: "automotive", icon: CarIcon },
  { key: "realEstate", icon: HomeIcon },
  { key: "beauty", icon: ScissorsIcon },
  { key: "clinics", icon: StethoscopeIcon },
  { key: "brokers", icon: CalculatorIcon },
]

const EASE = [0.22, 1, 0.36, 1] as const

// The row watches the viewport and its children follow through variants:
// a line scaled to zero has no area, so it could never report itself in view
const RULE_VARIANTS = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: { duration: 0.9, ease: EASE } },
}

const CONTENT_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.1, ease: EASE },
  },
}

// A hairline that draws itself from the left when its row comes into view
function Rule({ className }: { className?: string }) {
  return (
    <motion.span
      aria-hidden
      className={cn("absolute inset-x-0 h-px origin-left bg-border", className)}
      variants={RULE_VARIANTS}
    />
  )
}

// Who Voicia is for, as an editorial index: one ruled row per trade
function Audiences() {
  const t = useTranslations("Landing.audiences")

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 sm:gap-16">
        <Reveal className="grid items-end gap-4 lg:grid-cols-2 lg:gap-20">
          <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h2>
          <p className="max-w-md text-[15px] text-pretty text-muted-foreground sm:text-base lg:justify-self-end">
            {t("subtitle")}
          </p>
        </Reveal>

        <ol>
          {AUDIENCES.map(({ key, icon: Icon, image }, i) => {
            const tags = t.raw(`items.${key}.tags`) as string[]

            return (
              <motion.li
                key={key}
                className="relative"
                initial="hidden"
                whileInView="shown"
                viewport={{ once: true, margin: "-60px" }}
              >
                <Rule className="top-0" />
                {i === AUDIENCES.length - 1 && <Rule className="bottom-0" />}
                <motion.div
                  variants={CONTENT_VARIANTS}
                  className={cn(
                    "grid gap-x-8 gap-y-4 py-8 sm:py-10",
                    "md:grid-cols-[3rem_minmax(0,5fr)_minmax(0,7fr)]",
                    image &&
                      "lg:grid-cols-[3rem_minmax(0,5fr)_minmax(0,5fr)_minmax(0,2fr)]"
                  )}
                >
                  <span className="text-sm text-muted-foreground tabular-nums md:pt-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex items-center gap-4 md:items-start">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <h3 className="font-display text-xl tracking-tight text-balance sm:text-2xl">
                      {t(`items.${key}.title`)}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3 md:pt-1.5">
                    <p className="text-[15px] text-pretty sm:text-base">
                      {t(`items.${key}.text`)}
                    </p>
                    <ul className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      {tags.map((tag) => (
                        <li
                          key={tag}
                          className="not-first:before:mr-2 not-first:before:content-['•']"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {image && (
                    // Decorative: the row's text carries the meaning
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      className="hidden aspect-[4/3] w-full rounded-xl object-cover lg:block"
                    />
                  )}
                </motion.div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export { Audiences }
