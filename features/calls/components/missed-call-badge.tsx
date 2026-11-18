import { PhoneMissedIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Shown instead of a summary when the caller said nothing
function MissedCallBadge({ className }: { className?: string }) {
  const t = useTranslations("Calls")
  return (
    <Badge variant="secondary" className={cn("gap-1 font-normal", className)}>
      <PhoneMissedIcon className="size-3" />
      {t("missedCall")}
    </Badge>
  )
}

export { MissedCallBadge }
