import { ArrowLeftIcon } from "lucide-react"
import { getFormatter, getTranslations } from "next-intl/server"

import { LandingFooter } from "@/features/landing/components/landing-footer"
import { Logo } from "@/features/landing/components/landing-nav"
import { LEGAL_UPDATED_AT } from "@/features/legal/constants"
import type { LegalBlock, LegalDocument } from "@/features/legal/types"
import { Link } from "@/i18n/navigation"
import type { routing } from "@/i18n/routing"

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return <p>{block.text}</p>
    case "h3":
      return <h3 className="pt-2 font-medium text-foreground">{block.text}</h3>
    case "ul":
      return (
        <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-muted-foreground/60">
          {block.items.map((item) => (
            <li key={typeof item === "string" ? item : item.term}>
              {typeof item === "string" ? (
                item
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {item.term}
                  </span>{" "}
                  {item.text}
                </>
              )}
            </li>
          ))}
        </ul>
      )
  }
}

async function LegalPage({
  locale,
  path,
  document,
}: {
  locale: (typeof routing.locales)[number]
  // Route of this page, so the footer's language links stay on it
  path: string
  document: LegalDocument
}) {
  const t = await getTranslations({ locale, namespace: "Legal" })
  const format = await getFormatter({ locale })
  // Noon UTC so the day doesn't shift in any time zone
  const updatedAt = new Date(`${LEGAL_UPDATED_AT}T12:00:00Z`)

  return (
    <>
      <header className="border-b">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label={t("home")}>
            <Logo />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            {t("backHome")}
          </Link>
        </nav>
      </header>

      <main className="px-4 py-16 sm:px-6 sm:py-24">
        <article className="mx-auto flex max-w-2xl flex-col gap-12">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-4xl tracking-tight text-balance sm:text-5xl">
              {document.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("lastUpdated", {
                date: format.dateTime(updatedAt, "long"),
              })}
            </p>
            {document.intro && (
              <p className="pt-3 text-base leading-relaxed text-pretty text-muted-foreground">
                {document.intro}
              </p>
            )}
          </div>

          <ol className="flex flex-col gap-10">
            {document.sections.map((section, index) => (
              <li key={section.title} className="flex flex-col gap-3">
                <h2 className="font-display text-xl tracking-tight sm:text-2xl">
                  <span className="mr-2 text-muted-foreground tabular-nums">
                    {index + 1}.
                  </span>
                  {section.title}
                </h2>
                <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-pretty text-muted-foreground">
                  {section.blocks.map((block, blockIndex) => (
                    <Block key={blockIndex} block={block} />
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {document.footnote && (
            <p className="border-t pt-6 text-sm text-muted-foreground">
              {document.footnote}
            </p>
          )}
        </article>
      </main>

      <LandingFooter path={path} />
    </>
  )
}

export { LegalPage }
