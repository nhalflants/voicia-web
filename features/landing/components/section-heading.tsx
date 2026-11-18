import type { LucideIcon } from "lucide-react"

import { Reveal } from "@/features/landing/components/reveal"

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
}) {
  return (
    <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
      <Icon className="size-7 text-foreground" strokeWidth={1.5} />
      <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-pretty text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}

export { SectionHeading }
