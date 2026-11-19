"use client"

import { useId, useState, useTransition } from "react"
import { MailWarningIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { updateContactEmailAction } from "@/features/account/actions"
import type { ClerkUser } from "@/features/account/types"

interface EmailOption {
  email: string
  primary: boolean
  // Saved before addresses had to be verified in Clerk, e.g. carried over
  // from the previous app. Still used for recaps, but can't be picked again
  unverified: boolean
}

function sameEmail(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase()
}

function CallReportsSection({
  user,
  contactEmail,
}: {
  user: ClerkUser
  // null means recaps go to the Clerk primary email
  contactEmail: string | null
}) {
  const t = useTranslations("Account.reports")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const id = useId()
  const [pending, startTransition] = useTransition()

  const primary = user.primaryEmailAddress?.emailAddress ?? null
  const options: EmailOption[] = user.emailAddresses
    .filter((address) => address.verification.status === "verified")
    .map((address) => ({
      email: address.emailAddress,
      primary: address.id === user.primaryEmailAddressId,
      unverified: false,
    }))
  if (contactEmail && !options.some((o) => sameEmail(o.email, contactEmail))) {
    options.push({ email: contactEmail, primary: false, unverified: true })
  }

  // Where recaps go today, as the API resolves it
  const current = contactEmail ?? primary
  const [selected, setSelected] = useState(current)
  const changed =
    selected !== null && (current === null || !sameEmail(selected, current))

  const handleSave = () => {
    if (!changed || !selected) return
    startTransition(async () => {
      const result = await updateContactEmailAction(selected, locale)
      if (!result.ok) {
        toast.add({
          type: "error",
          title: t("errors.save"),
          description: result.message,
        })
        return
      }
      toast.add({ type: "success", title: t("saved") })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {options.length === 0 ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <MailWarningIcon className="size-4 shrink-0" />
            {t("noEmail")}
          </p>
        ) : (
          <RadioGroup
            value={selected}
            onValueChange={(value) => setSelected(value as string)}
            aria-label={t("title")}
          >
            {options.map((option) => {
              const optionId = `${id}-${option.email}`
              return (
                <FieldLabel key={option.email} htmlFor={optionId}>
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      id={optionId}
                      value={option.email}
                      disabled={option.unverified}
                    />
                    <FieldContent className="min-w-0">
                      <FieldTitle className="w-full min-w-0 flex-wrap">
                        <span className="truncate">{option.email}</span>
                        {option.primary && (
                          <Badge variant="secondary">{t("signInEmail")}</Badge>
                        )}
                      </FieldTitle>
                      {option.unverified && (
                        <FieldDescription>{t("unverified")}</FieldDescription>
                      )}
                    </FieldContent>
                  </Field>
                </FieldLabel>
              )
            })}
          </RadioGroup>
        )}
        <p className="text-muted-foreground">{t("addAnother")}</p>
      </CardContent>

      <CardFooter className="justify-end border-t">
        <Button onClick={handleSave} disabled={!changed || pending}>
          {pending && <Spinner />}
          {tCommon("saveChanges")}
        </Button>
      </CardFooter>
    </Card>
  )
}

export { CallReportsSection }
