import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { bookingHref } from "@/features/landing/constants"

// The page's main action. Works in server and client components
function BookCallButton({
  size = "lg",
  variant = "default",
  className,
}: {
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline"
  className?: string
}) {
  const t = useTranslations("Landing.cta")
  const href = bookingHref()
  const external = href.startsWith("http")

  return (
    <Button
      size={size}
      variant={variant}
      nativeButton={false}
      className={className}
      render={
        <a
          href={href}
          {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        />
      }
    >
      {t("book")}
    </Button>
  )
}

export { BookCallButton }
