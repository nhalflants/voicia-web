import { UsersIcon } from "lucide-react"

import { AvatarGroup } from "@/components/ui/avatar"
import { MemberAvatar } from "@/features/org/components/member-avatar"
import type { OrganizationMember } from "@/features/org/types"

// Recipients who left the organization are hidden: a Clerk webhook removes
// them shortly, and the recap already skips them
function RecipientSummary({
  userIds,
  membersById,
}: {
  userIds: string[]
  membersById: Map<string, OrganizationMember>
}) {
  const recipients = userIds.flatMap((id) => membersById.get(id) ?? [])

  if (recipients.length === 0) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <UsersIcon className="size-4" />
        Everyone
      </span>
    )
  }

  const [first, ...others] = recipients
  const label =
    others.length === 0
      ? first.name
      : others.length === 1
        ? `${first.name} and ${others[0].name}`
        : `${first.name} and ${others.length} others`

  return (
    <span className="flex min-w-0 items-center gap-2 text-sm">
      <AvatarGroup>
        {recipients.slice(0, 3).map((member) => (
          <MemberAvatar key={member.userId} member={member} size="sm" />
        ))}
      </AvatarGroup>
      <span
        className="max-w-48 truncate"
        title={recipients.map((m) => m.name).join(", ")}
      >
        {label}
      </span>
    </span>
  )
}

export { RecipientSummary }
