"use client"

import { UserRoundIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberAvatar } from "@/features/org/components/member-avatar"
import type { OrganizationMember } from "@/features/org/types"

// Radio values can't be null, so "no assignee" gets a key of its own
const UNASSIGNED = "unassigned"

function CallAssigneeMenu({
  assigneeUserId,
  members,
  membersById,
  currentUserId,
  onChange,
}: {
  assigneeUserId: string | null
  members: OrganizationMember[]
  membersById: Map<string, OrganizationMember>
  currentUserId: string
  onChange: (assigneeUserId: string | null) => void
}) {
  const assignee = assigneeUserId ? membersById.get(assigneeUserId) : undefined
  const value = assigneeUserId ?? UNASSIGNED

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2.5 max-w-48 font-normal"
          />
        }
      >
        {assignee ? (
          <>
            <MemberAvatar member={assignee} size="sm" />
            <span className="truncate">
              {assignee.userId === currentUserId ? "Me" : assignee.name}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-2 text-muted-foreground">
            <UserRoundIcon />
            {/* Assigned to someone who has since left the organization */}
            {assigneeUserId ? "Former member" : "Unassigned"}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => {
              if (next === value) return
              onChange(next === UNASSIGNED ? null : (next as string))
            }}
          >
            <DropdownMenuRadioItem value={UNASSIGNED}>
              <UserRoundIcon className="text-muted-foreground" />
              Unassigned
            </DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            {members.map((member) => (
              <DropdownMenuRadioItem key={member.userId} value={member.userId}>
                <MemberAvatar member={member} size="sm" />
                <span className="truncate">
                  {member.name}
                  {member.userId === currentUserId && (
                    <span className="text-muted-foreground"> (you)</span>
                  )}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { CallAssigneeMenu }
