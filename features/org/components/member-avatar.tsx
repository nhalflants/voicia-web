import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { OrganizationMember } from "@/features/org/types"

function MemberAvatar({
  member,
  size,
}: {
  member: OrganizationMember
  size?: "default" | "sm" | "lg"
}) {
  return (
    <Avatar size={size}>
      <AvatarImage src={member.imageUrl} alt="" />
      <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export { MemberAvatar }
