import { PhoneIcon, SparklesIcon, UserRoundPlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface BriefCardContent {
  label: string
  callerName: string
  callerNumber: string
  answeredBy: string
  category: string
  summary: string
  callBack: string
  assignToMe: string
}

// The call brief as the dashboard's detail panel shows it, with sample data.
// Decorative: its buttons don't do anything
function BriefCard({
  content,
  className,
}: {
  content: BriefCardContent
  className?: string
}) {
  return (
    <Card
      aria-hidden
      size="sm"
      className={cn(
        "w-full max-w-sm px-4 text-left shadow-xl shadow-black/5",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-brand">
        <SparklesIcon className="size-3.5" />
        {content.label}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-base font-medium">{content.callerName}</p>
        <p className="text-xs text-muted-foreground">
          {content.callerNumber} · {content.answeredBy}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" tabIndex={-1}>
          <PhoneIcon data-icon="inline-start" />
          {content.callBack}
        </Button>
        <Button size="sm" variant="outline" tabIndex={-1}>
          <UserRoundPlusIcon data-icon="inline-start" />
          {content.assignToMe}
        </Button>
      </div>
      <Badge variant="outline" className="gap-1.5 font-normal">
        <span className="size-1.5 rounded-full bg-brand" />
        {content.category}
      </Badge>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {content.summary}
      </p>
    </Card>
  )
}

export { BriefCard }
