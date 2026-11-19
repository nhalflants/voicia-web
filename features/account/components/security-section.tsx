"use client"

import { useClerk } from "@clerk/nextjs"
import { ShieldCheckIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ClerkUser } from "@/features/account/types"

// Sign-in emails, password, two-step verification, sessions and account
// deletion stay in Clerk's own modal, which handles their verification steps
function SecuritySection({ user }: { user: ClerkUser }) {
  const t = useTranslations("Account.security")
  const { openUserProfile } = useClerk()
  const email = user.primaryEmailAddress?.emailAddress

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-between">
        {email && (
          <div className="grid min-w-0 gap-0.5">
            <span className="text-muted-foreground">{t("signInEmail")}</span>
            <span className="truncate font-medium">{email}</span>
          </div>
        )}
        <Button variant="outline" onClick={() => openUserProfile()}>
          <ShieldCheckIcon />
          {t("manage")}
        </Button>
      </CardContent>
    </Card>
  )
}

export { SecuritySection }
