"use client"

import { useOptimistic, useState, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { PhoneIcon, RepeatIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item"
import type { CallCategory } from "@/features/call-categories/types"
import { CallAssigneeMenu } from "@/features/calls/components/call-assignee-menu"
import { CallDetailSheet } from "@/features/calls/components/call-detail-sheet"
import { CallStatusMenu } from "@/features/calls/components/call-status-menu"
import { formatDuration } from "@/features/calls/format"
import type { CallDetail, CallListItem } from "@/features/calls/types"
import { useCallUpdate } from "@/features/calls/use-call-update"
import type { OrganizationMember } from "@/features/org/types"

type ItemProps = {
  members: OrganizationMember[]
  membersById: Map<string, OrganizationMember>
  currentUserId: string
}

function CallsList({
  calls,
  categories,
  selectedCallId,
  selectedCall,
  empty,
  ...itemProps
}: {
  calls: CallListItem[]
  categories: CallCategory[]
  // From ?call=, already validated; selectedCall is null when it doesn't exist
  selectedCallId: string | null
  selectedCall: CallDetail | null
  // Shown instead of the list; the panel still opens from a shared link
  empty: React.ReactNode
} & Omit<ItemProps, "membersById">) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  // Opens the panel right away with the row's data, before the detail loads
  const [openId, setOpenId] = useOptimistic(selectedCallId)
  const membersById = new Map(itemProps.members.map((m) => [m.userId, m]))

  // Keeps the filters, so closing the panel lands back on the same view
  const hrefFor = (id: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (id) params.set("call", id)
    else params.delete("call")
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  // Opening adds a history entry; moving between calls and closing don't, so
  // Back leaves the page instead of replaying every call looked at
  const select = (id: string | null, mode: "push" | "replace") => {
    startTransition(() => {
      setOpenId(id)
      router[mode](hrefFor(id), { scroll: false })
    })
  }

  const index = calls.findIndex((c) => c.id === openId)
  // A change can take the open call out of this view (e.g. marking it done
  // under Open); its old position still anchors previous and next
  const [position, setPosition] = useState<{ id: string; index: number }>()
  if (
    openId &&
    index !== -1 &&
    (position?.id !== openId || position.index !== index)
  ) {
    setPosition({ id: openId, index })
  }
  const anchor = position?.id === openId ? position : undefined
  const previous =
    index !== -1 ? calls[index - 1] : anchor && calls[anchor.index - 1]
  const next = index !== -1 ? calls[index + 1] : anchor && calls[anchor.index]

  // A call opened from the panel's history may not be in this view; its
  // history row shows it right away while the detail loads
  const [picked, setPicked] = useState<CallListItem | null>(null)
  const selectCall = (call: CallListItem) => {
    setPicked(call)
    select(call.id, "replace")
  }

  const detail = selectedCall?.id === openId ? selectedCall : null
  const row =
    calls.find((c) => c.id === openId) ??
    (picked?.id === openId ? picked : undefined)
  // Keeps the last call on screen while the panel slides out
  const [shown, setShown] = useState<{
    call: CallListItem
    detail: CallDetail | null
  }>()
  const call = detail ?? row
  if (call && (call !== shown?.call || detail !== shown.detail)) {
    setShown({ call, detail })
  }

  return (
    <>
      {calls.length === 0 ? (
        empty
      ) : (
        <ul className="flex flex-col">
          {calls.map((call) => (
            <CallItem
              key={call.id}
              call={call}
              href={hrefFor(call.id)}
              onOpen={() => select(call.id, "push")}
              membersById={membersById}
              {...itemProps}
            />
          ))}
        </ul>
      )}
      <CallDetailSheet
        open={openId !== null}
        call={shown?.call ?? null}
        detail={shown?.detail ?? null}
        // Only once the server has answered for this id
        notFound={openId !== null && openId === selectedCallId && !selectedCall}
        onClose={() => select(null, "replace")}
        onPrevious={previous && (() => select(previous.id, "replace"))}
        onNext={next && (() => select(next.id, "replace"))}
        onSelectCall={selectCall}
        membersById={membersById}
        categories={categories}
        {...itemProps}
      />
    </>
  )
}

function CallItem({
  call,
  href,
  onOpen,
  members,
  membersById,
  currentUserId,
}: { call: CallListItem; href: string; onOpen: () => void } & ItemProps) {
  const { optimistic, pending, save, changeStatus } = useCallUpdate(
    call,
    currentUserId
  )

  return (
    <Item
      variant="outline"
      render={<li />}
      aria-busy={pending}
      className="relative gap-1.5 rounded-none border-x-0 border-t-0 px-0 py-4.5 first:pt-0 last:border-b-0 last:pb-0 aria-busy:opacity-70"
    >
      <ItemHeader className="flex-wrap">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
          <ItemTitle>
            <Link
              href={href}
              scroll={false}
              // Covers the whole row; the phone link and menus sit above it
              className="outline-none after:absolute after:inset-0 hover:underline focus-visible:underline"
              onClick={(event) => {
                // Let cmd/ctrl-click open the call in a new tab
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return
                }
                event.preventDefault()
                onOpen()
              }}
            >
              {call.callerName || "Unknown caller"}
            </Link>
          </ItemTitle>
          {call.customerNumber && (
            <Button
              variant="link"
              size="sm"
              className="relative h-auto gap-1.5 px-0 font-normal tabular-nums"
              aria-label={`Call ${call.customerNumber}`}
              nativeButton={false}
              render={<a href={`tel:${call.customerNumber}`} />}
            >
              <PhoneIcon className="size-3.5 text-muted-foreground" />
              {call.customerNumber}
            </Button>
          )}
          {call.todayCallCount >= 2 && (
            // Quieter than the category badge; clicks fall through to the row
            <Badge
              variant="outline"
              className="gap-1 font-normal text-muted-foreground tabular-nums"
            >
              <RepeatIcon className="size-3" />
              {call.todayCallCount} calls today
            </Badge>
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
        <div className="relative -my-1.5 -mr-2.5 flex items-center gap-3.5">
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

export { CallsList }
