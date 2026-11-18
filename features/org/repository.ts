import "server-only"

import { clerkClient } from "@clerk/nextjs/server"
import { inArray } from "drizzle-orm"
import { getLocale, getTranslations } from "next-intl/server"

import type { OrganizationMember } from "@/features/org/types"
import { db } from "@/lib/db"
import { userProfiles } from "@/lib/db/generated/schema"

// Resolves addresses the way the NestJS recap does (CallRecapService): the
// member's contact_email wins over their Clerk primary email, and banned users
// get nothing
export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  const clerk = await clerkClient()
  // One page is plenty for a single business, and the API caps recipients at 100
  const { data: memberships } =
    await clerk.organizations.getOrganizationMembershipList({
      organizationId,
      limit: 100,
    })
  const userIds = memberships.flatMap((m) =>
    m.publicUserData ? [m.publicUserData.userId] : []
  )
  if (userIds.length === 0) return []

  const [{ data: users }, profiles, t, locale] = await Promise.all([
    clerk.users.getUserList({ userId: userIds, limit: 100 }),
    db
      .select({
        userId: userProfiles.userId,
        contactEmail: userProfiles.contactEmail,
      })
      .from(userProfiles)
      .where(inArray(userProfiles.userId, userIds)),
    // Only called while rendering a page, where the locale is known
    getTranslations("Org"),
    getLocale(),
  ])
  const contactEmails = new Map(
    profiles.map((p) => [p.userId, p.contactEmail?.trim()])
  )

  return users
    .map((user) => {
      const email =
        contactEmails.get(user.id) ||
        user.primaryEmailAddress?.emailAddress ||
        null
      return {
        userId: user.id,
        name: user.fullName || user.username || email || t("unnamedMember"),
        imageUrl: user.imageUrl,
        email: user.banned ? null : email,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, locale))
}
