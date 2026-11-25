"use client"

import { useState, useTransition } from "react"
import { CircleAlertIcon, MailIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  type AssistantField,
  updateAssistantAction,
} from "@/features/assistants/actions"
import {
  SmsTemplatesFields,
  firstSmsLanguage,
  smsDrafts,
  smsTooLong,
  toSmsTemplates,
} from "@/features/assistants/components/sms-templates-fields"
import {
  CONTACT_EMAIL,
  MAX_FIRST_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
} from "@/features/assistants/constants"
import type {
  Assistant,
  AssistantUpdate,
  SmsLanguage,
} from "@/features/assistants/types"
import { useLeaveGuard } from "@/hooks/use-leave-guard"

type FormError = { field?: AssistantField; message: string }

function AssistantForm({
  assistant,
  canManage,
}: {
  assistant: Assistant
  // Others see the same page, read-only
  canManage: boolean
}) {
  const t = useTranslations("Assistants.form")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const [name, setName] = useState(assistant.name)
  const [firstMessage, setFirstMessage] = useState(assistant.firstMessage ?? "")
  const [sms, setSms] = useState(() => smsDrafts(assistant.smsTemplates))
  const [smsLanguage, setSmsLanguage] = useState(() => firstSmsLanguage(sms))
  const [error, setError] = useState<FormError | null>(null)
  const [pending, startTransition] = useTransition()

  // Only changed fields are sent, so a rename alone never reaches Vapi
  const update: AssistantUpdate = {}
  if (name.trim() !== assistant.name) update.name = name.trim()
  if (firstMessage.trim() !== (assistant.firstMessage ?? "")) {
    update.firstMessage = firstMessage.trim()
  }
  // The API replaces all versions at once, so any change sends them all
  const smsTemplates = toSmsTemplates(sms)
  if (
    assistant.smsEnabled &&
    JSON.stringify(smsTemplates) !==
      JSON.stringify(toSmsTemplates(smsDrafts(assistant.smsTemplates)))
  ) {
    update.smsTemplates = smsTemplates
  }
  const changed = canManage && Object.keys(update).length > 0
  const smsInvalid = assistant.smsEnabled && smsTooLong(sms)

  const leaveGuard = useLeaveGuard(changed)

  const discard = () => {
    setName(assistant.name)
    setFirstMessage(assistant.firstMessage ?? "")
    setSms(smsDrafts(assistant.smsTemplates))
    setError(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!changed || smsInvalid || pending) return
    if (update.name === "") {
      setError({ field: "name", message: t("errors.nameRequired") })
      return
    }
    // A first message can be changed but not removed
    if (update.firstMessage === "") {
      setError({
        field: "firstMessage",
        message: t("errors.firstMessageRequired"),
      })
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updateAssistantAction(assistant.id, update, locale)
      if (!result.ok) {
        setError({ field: result.field, message: result.message })
        // Opens the language the API refused, which may not be the one shown
        if (result.field?.startsWith("sms.")) {
          setSmsLanguage(result.field.slice(4) as SmsLanguage)
        }
        return
      }
      // The page refreshes and the form starts again from the saved values
      toast.add({ type: "success", title: t("saved") })
    })
  }

  const nameInvalid = error?.field === "name"
  const firstMessageInvalid = error?.field === "firstMessage"
  const smsErrors: Partial<Record<SmsLanguage, string>> = {}
  if (error?.field?.startsWith("sms.")) {
    smsErrors[error.field.slice(4) as SmsLanguage] = error.message
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("general.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={nameInvalid || undefined}>
              <FieldLabel htmlFor="assistant-name">{t("name")}</FieldLabel>
              <Input
                id="assistant-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (nameInvalid) setError(null)
                }}
                placeholder={t("namePlaceholder")}
                maxLength={MAX_NAME_LENGTH}
                required
                readOnly={!canManage}
                aria-invalid={nameInvalid || undefined}
              />
              {nameInvalid && <FieldError>{error.message}</FieldError>}
            </Field>

            <Field data-invalid={firstMessageInvalid || undefined}>
              <FieldLabel htmlFor="assistant-first-message">
                {t("firstMessage")}
              </FieldLabel>
              <Textarea
                id="assistant-first-message"
                value={firstMessage}
                onChange={(event) => {
                  setFirstMessage(event.target.value)
                  if (firstMessageInvalid) setError(null)
                }}
                placeholder={t("firstMessagePlaceholder")}
                rows={4}
                maxLength={MAX_FIRST_MESSAGE_LENGTH}
                readOnly={!canManage}
                aria-invalid={firstMessageInvalid || undefined}
              />
              {firstMessageInvalid ? (
                <FieldError>{error.message}</FieldError>
              ) : (
                <FieldDescription className="flex justify-between gap-4">
                  <span>{t("firstMessageHint")}</span>
                  {canManage && (
                    <span className="shrink-0 tabular-nums">
                      {firstMessage.length}/{MAX_FIRST_MESSAGE_LENGTH}
                    </span>
                  )}
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {assistant.smsEnabled ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("sms.title")}</CardTitle>
            <CardDescription>{t("sms.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <SmsTemplatesFields
              drafts={sms}
              onChange={(language, value) => {
                setSms((drafts) => ({ ...drafts, [language]: value }))
                if (error?.field === `sms.${language}`) setError(null)
              }}
              errors={smsErrors}
              language={smsLanguage}
              onLanguageChange={setSmsLanguage}
              readOnly={!canManage}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/50 shadow-none">
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              {t("sms.title")}
            </CardTitle>
            <CardDescription>{t("sms.off.description")}</CardDescription>
            <CardAction>
              <Badge variant="outline">{t("sms.off.badge")}</Badge>
            </CardAction>
          </CardHeader>
          {canManage && (
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                nativeButton={false}
                render={<a href={`mailto:${CONTACT_EMAIL}`} />}
              >
                <MailIcon />
                {t("sms.off.contact")}
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {changed && (
        // Sticks to the bottom of the screen while there is something to save
        <div className="sticky bottom-4 z-10 animate-in duration-200 fade-in slide-in-from-bottom-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-popover p-2 pl-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10">
            {error && !error.field ? (
              <p
                role="alert"
                className="flex min-w-0 flex-1 basis-48 items-center gap-2 text-destructive"
              >
                <CircleAlertIcon className="size-4 shrink-0" />
                {error.message}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full bg-amber-500" />
                {t("unsaved")}
              </p>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={discard}
                disabled={pending}
              >
                {t("discard")}
              </Button>
              <Button type="submit" disabled={smsInvalid || pending}>
                {pending && <Spinner />}
                {tCommon("saveChanges")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={leaveGuard.pendingHref !== null}
        onOpenChange={(open) => {
          if (!open) leaveGuard.stay()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("leave.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("leave.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("leave.stay")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={leaveGuard.leave}>
              {t("leave.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}

export { AssistantForm }
