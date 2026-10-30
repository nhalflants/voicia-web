"use client"

import { formatDistanceToNow } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CALL_STATUSES } from "@/features/calls/constants"
import type { CallStatus } from "@/features/calls/types"

function CallStatusLabel({ status }: { status: CallStatus }) {
  const { label, dotClassName } = CALL_STATUSES[status]
  return (
    <span className="flex items-center gap-2">
      <span className={cn("size-2 shrink-0 rounded-full", dotClassName)} />
      {label}
    </span>
  )
}

function CallStatusMenu({
  status,
  statusChangedAt,
  onChange,
}: {
  status: CallStatus
  statusChangedAt: string | null
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
          {statusChangedAt && (
            // Only rendered on the client once opened, so "ago" can't mismatch
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Changed{" "}
              {formatDistanceToNow(new Date(statusChangedAt), {
                addSuffix: true,
              })}
            </DropdownMenuLabel>
          )}
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
