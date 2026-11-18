import { PhoneMissedIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Shown instead of a summary when the caller said nothing
function MissedCallBadge({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" className={cn("gap-1 font-normal", className)}>
      <PhoneMissedIcon className="size-3" />
      Missed call
    </Badge>
  )
}

export { MissedCallBadge }
