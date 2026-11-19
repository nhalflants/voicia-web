import "server-only"

import { eq } from "drizzle-orm"

import { api } from "@/lib/api"
import { db } from "@/lib/db"
import { userProfiles } from "@/lib/db/generated/schema"

// Reads go straight to the database; writes go through the NestJS API, which
// owns them (see lib/db/index.ts)

// Where the user's call recaps go; null means their Clerk primary email
export async function getContactEmail(userId: string): Promise<string | null> {
  const [profile] = await db
    .select({ contactEmail: userProfiles.contactEmail })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
  return profile?.contactEmail?.trim() || null
}

// The API only accepts one of the user's verified Clerk addresses
export async function updateContactEmail(
  contactEmail: string | null
): Promise<void> {
  await api("/profile", {
    method: "PUT",
    body: JSON.stringify({ contactEmail }),
  })
}
