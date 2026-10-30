"use client"

import { useOptimistic, useTransition } from "react"
import { format } from "date-fns"
import { PhoneIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item"
import { toast } from "@/components/ui/toast"
import { updateCallAction } from "@/features/calls/actions"
import { CallAssigneeMenu } from "@/features/calls/components/call-assignee-menu"
import { CallStatusMenu } from "@/features/calls/components/call-status-menu"
import type {
  CallListItem,
  CallStatus,
  CallUpdate,
} from "@/features/calls/types"
import type { OrganizationMember } from "@/features/org/types"

type ItemProps = {
  members: OrganizationMember[]
  membersById: Map<string, OrganizationMember>
  currentUserId: string
}

function CallsList({
  calls,
  ...itemProps
}: { calls: CallListItem[] } & Omit<ItemProps, "membersById">) {
  const membersById = new Map(itemProps.members.map((m) => [m.userId, m]))

  return (
    <ul className="flex flex-col">
      {calls.map((call) => (
        <CallItem
          key={call.id}
          call={call}
          membersById={membersById}
          {...itemProps}
        />
      ))}
    </ul>
  )
}

function CallItem({
  call,
  members,
  membersById,
  currentUserId,
}: { call: CallListItem } & ItemProps) {
  const [pending, startTransition] = useTransition()
  // Shows the change right away; the refresh after saving replaces it, and it
  // reverts on its own if the save fails
  const [optimistic, applyOptimistic] = useOptimistic(
    { status: call.status, assigneeUserId: call.assigneeUserId },
    (current, update: CallUpdate) => ({ ...current, ...update })
  )

  const save = (update: CallUpdate) => {
    startTransition(async () => {
      applyOptimistic(update)
      const result = await updateCallAction(call.id, update)
      if (!result.ok) {
        toast.add({
          type: "error",
          title: "Couldn't update the call",
          description: result.message,
        })
      }
    })
  }

  // Starting work on an unassigned call takes it, so the team sees who's on it
  const changeStatus = (status: CallStatus) =>
    save(
      status === "in_progress" && !optimistic.assigneeUserId
        ? { status, assigneeUserId: currentUserId }
        : { status }
    )

  return (
    <Item
      variant="outline"
      render={<li />}
      aria-busy={pending}
      className="gap-1.5 rounded-none border-x-0 border-t-0 px-0 py-4.5 first:pt-0 last:border-b-0 last:pb-0 aria-busy:opacity-70"
    >
      <ItemHeader className="flex-wrap">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
          <ItemTitle>{call.callerName || "Unknown caller"}</ItemTitle>
          {call.customerNumber && (
            <Button
              variant="link"
              size="sm"
              className="h-auto gap-1.5 px-0 font-normal tabular-nums"
              aria-label={`Call ${call.customerNumber}`}
              nativeButton={false}
              render={<a href={`tel:${call.customerNumber}`} />}
            >
              <PhoneIcon className="size-3.5 text-muted-foreground" />
              {call.customerNumber}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground tabular-nums">
          {call.startedAt && (
            // The server and the browser may sit in different time zones
            <time dateTime={call.startedAt} suppressHydrationWarning>
              {format(new Date(call.startedAt), "d MMM, HH:mm")}
            </time>
          )}
          {call.startedAt && call.durationSeconds != null && (
            <span aria-hidden>·</span>
          )}
          {call.durationSeconds != null && (
            <span>{formatDuration(call.durationSeconds)}</span>
          )}
        </div>
      </ItemHeader>
      {call.summary && (
        <ItemDescription
          title={call.summary}
          className="line-clamp-3 basis-full"
        >
          {call.summary}
        </ItemDescription>
      )}
      <ItemFooter className="mt-0.5 flex-wrap">
        {call.category ? (
          <Badge
            variant="secondary"
            className="max-w-full gap-1.5 px-2.5 py-3 font-normal text-foreground"
            style={{
              // Over transparent so the tint works in both themes
              backgroundColor: `color-mix(in srgb, ${call.category.color} 12%, transparent)`,
            }}
          >
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: call.category.color }}
            />
            <span className="truncate text-sm">{call.category.name}</span>
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-foreground/8 px-2.5 py-3 text-sm font-normal text-muted-foreground"
          >
            Uncategorized
          </Badge>
        )}
        <div className="-my-1.5 -mr-2.5 flex items-center gap-3.5">
          <CallStatusMenu status={optimistic.status} onChange={changeStatus} />
          <CallAssigneeMenu
            assigneeUserId={optimistic.assigneeUserId}
            members={members}
            membersById={membersById}
            currentUserId={currentUserId}
            onChange={(assigneeUserId) => save({ assigneeUserId })}
          />
        </div>
      </ItemFooter>
    </Item>
  )
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
}

export { CallsList }
