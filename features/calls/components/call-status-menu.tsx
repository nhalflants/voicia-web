"use client"

import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CALL_STATUSES } from "@/features/calls/constants"
import type { CallStatus } from "@/features/calls/types"

function CallStatusLabel({ status }: { status: CallStatus }) {
  const t = useTranslations("Calls.statuses")
  const { dotClassName } = CALL_STATUSES[status]
  return (
    <span className="flex items-center gap-2">
      <span className={cn("size-2 shrink-0 rounded-full", dotClassName)} />
      {t(status)}
    </span>
  )
}

function CallStatusMenu({
  status,
  onChange,
}: {
  status: CallStatus
  onChange: (status: CallStatus) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="-ml-2.5 font-normal" />
        }
      >
        <CallStatusLabel status={status} />
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={status}
            onValueChange={(value) => {
              if (value !== status) onChange(value as CallStatus)
            }}
          >
            {(Object.keys(CALL_STATUSES) as CallStatus[]).map((value) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <CallStatusLabel status={value} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { CallStatusLabel, CallStatusMenu }
