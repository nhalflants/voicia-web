"use client"

import { Fragment } from "react"
import { format } from "date-fns"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhoneIcon,
  RotateCcwIcon,
  UserRoundPlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import type { CallCategory } from "@/features/call-categories/types"
import { CallAssigneeMenu } from "@/features/calls/components/call-assignee-menu"
import { CallCategoryMenu } from "@/features/calls/components/call-category-menu"
import { CallHistory } from "@/features/calls/components/call-history"
import { CallRecordingPlayer } from "@/features/calls/components/call-recording-player"
import { CallStatusMenu } from "@/features/calls/components/call-status-menu"
import { CallTranscript } from "@/features/calls/components/call-transcript"
import { ENDED_REASONS } from "@/features/calls/constants"
import { formatDuration } from "@/features/calls/format"
import type { CallDetail, CallListItem } from "@/features/calls/types"
import { useCallUpdate } from "@/features/calls/use-call-update"
import type { OrganizationMember } from "@/features/org/types"

interface PanelProps {
  members: OrganizationMember[]
  membersById: Map<string, OrganizationMember>
  categories: CallCategory[]
  currentUserId: string
  // Opens another call in the panel, from "Other calls from this number"
  onSelectCall: (call: CallListItem) => void
}

function CallDetailSheet({
  open,
  call,
  detail,
  notFound,
  onClose,
  onPrevious,
  onNext,
  ...panelProps
}: {
  open: boolean
  // The list row, shown right away while the rest loads
  call: CallListItem | null
  detail: CallDetail | null
  notFound: boolean
  onClose: () => void
  // Undefined at either end of the list
  onPrevious?: () => void
  onNext?: () => void
} & PanelProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-xl">
        <div className="flex items-center gap-1 px-4 pt-4">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous call"
            disabled={!onPrevious}
            onClick={onPrevious}
          >
            <ChevronUpIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next call"
            disabled={!onNext}
            onClick={onNext}
          >
            <ChevronDownIcon />
          </Button>
        </div>
        {notFound ? (
          <CallNotFound />
        ) : call ? (
          // Keyed so switching calls resets the player and pending changes
          <CallPanel
            key={call.id}
            call={call}
            detail={detail}
            {...panelProps}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function CallPanel({
  call: row,
  detail,
  members,
  membersById,
  categories,
  currentUserId,
  onSelectCall,
}: { call: CallListItem; detail: CallDetail | null } & PanelProps) {
  // The detail is fresher than the row once it has loaded
  const call = detail ?? row
  const { optimistic, pending, save, changeStatus } = useCallUpdate(
    call,
    currentUserId
  )

  const isOpen =
    optimistic.status === "new" || optimistic.status === "in_progress"
  const endedReason = detail?.endedReason
    ? ENDED_REASONS[detail.endedReason]
    : undefined
  const callerName = call.callerName || "Unknown caller"
  const meta = [
    call.customerNumber && <span>{call.customerNumber}</span>,
    call.startedAt && (
      // The server and the browser may sit in different time zones
      <time dateTime={call.startedAt} suppressHydrationWarning>
        {format(new Date(call.startedAt), "d MMM, HH:mm")}
      </time>
    ),
    call.durationSeconds != null && (
      <span>{formatDuration(call.durationSeconds)}</span>
    ),
  ].filter(Boolean)

  return (
    <>
      <SheetHeader
        aria-busy={pending}
        className="gap-3 border-b px-6 pt-2 pb-4"
      >
        <div className="flex flex-col gap-1">
          <SheetTitle className="text-xl">{callerName}</SheetTitle>
          <SheetDescription className="flex flex-wrap gap-x-2 tabular-nums">
            {meta.map((part, index) => (
              <Fragment key={index}>
                {index > 0 && <span aria-hidden>·</span>}
                {part}
              </Fragment>
            ))}
          </SheetDescription>
          {(detail?.assistantName || endedReason) && (
            <p className="text-sm text-muted-foreground">
              {[
                detail?.assistantName && `Answered by ${detail.assistantName}`,
                endedReason,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {isOpen && !optimistic.assigneeUserId ? (
            <Button onClick={() => save({ assigneeUserId: currentUserId })}>
              <UserRoundPlusIcon />
              Assign to me
            </Button>
          ) : isOpen ? (
            <Button onClick={() => save({ status: "done" })}>
              <CheckIcon />
              Mark as done
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() =>
                save({
                  status: optimistic.assigneeUserId ? "in_progress" : "new",
                })
              }
            >
              <RotateCcwIcon />
              Reopen
            </Button>
          )}
          {call.customerNumber && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href={`tel:${call.customerNumber}`} />}
            >
              <PhoneIcon />
              Call back
            </Button>
          )}
        </div>

        <div className="-mb-1.5 flex flex-wrap items-center gap-x-3.5">
          <CallStatusMenu status={optimistic.status} onChange={changeStatus} />
          <CallAssigneeMenu
            assigneeUserId={optimistic.assigneeUserId}
            members={members}
            membersById={membersById}
            currentUserId={currentUserId}
            onChange={(assigneeUserId) => save({ assigneeUserId })}
          />
          {categories.length > 0 && (
            <CallCategoryMenu
              categoryId={optimistic.categoryId}
              categories={categories}
              onChange={(categoryId) => save({ categoryId })}
            />
          )}
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
        <section className="flex flex-col gap-2">
          <h3 className="font-medium">Summary</h3>
          <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
            {call.summary || "No summary for this call."}
          </p>
        </section>

        {detail && (
          <CallHistory
            calls={detail.otherCalls}
            total={detail.otherCallsTotal}
            onSelect={onSelectCall}
          />
        )}

        <section className="flex flex-col gap-3">
          <h3 className="font-medium">Recording</h3>
          {!detail ? (
            <Skeleton className="h-13 w-full" />
          ) : detail.hasRecording ? (
            <CallRecordingPlayer
              callId={detail.id}
              durationSeconds={detail.durationSeconds}
            />
          ) : (
            <p className="text-muted-foreground">No recording for this call.</p>
          )}
        </section>

        {!detail ? (
          <section className="flex flex-col gap-3">
            <h3 className="font-medium">Transcript</h3>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-2/3 self-end" />
            <Skeleton className="h-10 w-3/4" />
          </section>
        ) : detail.transcript.length > 0 ? (
          <CallTranscript
            turns={detail.transcript}
            assistantName={detail.assistantName ?? "Assistant"}
            callerName={detail.callerName || "Caller"}
          />
        ) : (
          <section className="flex flex-col gap-2">
            <h3 className="font-medium">Transcript</h3>
            <p className="text-muted-foreground">
              {detail.isEmpty
                ? "The caller didn't say anything."
                : "No transcript for this call."}
            </p>
          </section>
        )}
      </div>
    </>
  )
}

function CallNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <SheetTitle className="sr-only">Call not found</SheetTitle>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Call not found</EmptyTitle>
          <EmptyDescription>
            It may have been deleted, or it belongs to another organization.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

export { CallDetailSheet }
