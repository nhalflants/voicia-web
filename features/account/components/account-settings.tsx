"use client"

import { useUser } from "@clerk/nextjs"

import { Skeleton } from "@/components/ui/skeleton"
import { CallReportsSection } from "@/features/account/components/call-reports-section"
import { ProfileSection } from "@/features/account/components/profile-section"
import { SecuritySection } from "@/features/account/components/security-section"

// Name, photo and sign-in details live in Clerk and are read live from it, so
// changes made in Clerk's modal show up here without a reload
function AccountSettings({ contactEmail }: { contactEmail: string | null }) {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }
  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <ProfileSection user={user} />
      <CallReportsSection user={user} contactEmail={contactEmail} />
      <SecuritySection user={user} />
    </div>
  )
}

export { AccountSettings }
