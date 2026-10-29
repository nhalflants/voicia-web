import "server-only"

import { auth } from "@clerk/nextjs/server"

// Whether the signed-in user is an admin of their active organization. The
// NestJS API enforces this too; Server Functions check it as well because
// they can be called directly
export async function isOrganizationAdmin() {
  const { orgId, has } = await auth()
  return Boolean(orgId) && has({ role: "org:admin" })
}
