import type { useUser } from "@clerk/nextjs"

// The signed-in user as the Clerk hooks return it
export type ClerkUser = NonNullable<ReturnType<typeof useUser>["user"]>
