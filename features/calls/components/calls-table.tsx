"use client"

import { useOptimistic, useTransition } from "react"
import { format } from "date-fns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

type RowProps = {
  members: OrganizationMember[]
  membersById: Map<string, OrganizationMember>
  currentUserId: string
}

function CallsTable({
  calls,
  ...rowProps
}: { calls: CallListItem[] } & Omit<RowProps, "membersById">) {
  const membersById = new Map(rowProps.members.map((m) => [m.userId, m]))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Caller</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Received</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assignee</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call) => (
          <CallRow
            key={call.id}
            call={call}
            membersById={membersById}
            {...rowProps}
          />
        ))}
      </TableBody>
    </Table>
  )
}

function CallRow({
  call,
  members,
  membersById,
  currentUserId,
}: { call: CallListItem } & RowProps) {
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
    <TableRow aria-busy={pending} className="aria-busy:opacity-70">
      <TableCell className="max-w-80">
        <div className="font-medium">
          {call.callerName || call.customerNumber || "Unknown caller"}
        </div>
        {call.summary && (
          <div className="truncate text-muted-foreground" title={call.summary}>
            {call.summary}
          </div>
        )}
      </TableCell>
      <TableCell>
        {call.category ? (
          <span className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: call.category.color }}
            />
            {call.category.name}
          </span>
        ) : (
          <span className="text-muted-foreground">Uncategorized</span>
        )}
      </TableCell>
      <TableCell>
        {call.startedAt ? (
          // The server and the browser may sit in different time zones
          <time dateTime={call.startedAt} suppressHydrationWarning>
            {format(new Date(call.startedAt), "d MMM, HH:mm")}
          </time>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
        {call.durationSeconds != null && (
          <div className="text-muted-foreground">
            {formatDuration(call.durationSeconds)}
          </div>
        )}
      </TableCell>
      <TableCell>
        <CallStatusMenu
          status={optimistic.status}
          statusChangedAt={call.statusChangedAt}
          onChange={changeStatus}
        />
      </TableCell>
      <TableCell>
        <CallAssigneeMenu
          assigneeUserId={optimistic.assigneeUserId}
          members={members}
          membersById={membersById}
          currentUserId={currentUserId}
          onChange={(assigneeUserId) => save({ assigneeUserId })}
        />
      </TableCell>
    </TableRow>
  )
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
}

export { CallsTable }
