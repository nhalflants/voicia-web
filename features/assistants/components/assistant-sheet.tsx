"use client"

import { useState, useTransition } from "react"
import { CircleAlertIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  type AssistantField,
  updateAssistantAction,
} from "@/features/assistants/actions"
import {
  SmsTemplatesFields,
  smsDrafts,
  smsTooLong,
  toSmsTemplates,
} from "@/features/assistants/components/sms-templates-fields"
import {
  MAX_FIRST_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
} from "@/features/assistants/constants"
import type {
  Assistant,
  AssistantUpdate,
  SmsLanguage,
} from "@/features/assistants/types"

type FormError = { field?: AssistantField; message: string }

interface AssistantFormProps {
  assistant: Assistant
  onDone: () => void
}

function AssistantSheet({
  open,
  onOpenChange,
  formKey,
  assistant,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Changes on every open, so the form starts from the assistant's saved values
  formKey: number
  assistant: Assistant | null
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
        {assistant && (
          <AssistantForm
            key={formKey}
            assistant={assistant}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function AssistantForm({ assistant, onDone }: AssistantFormProps) {
  const t = useTranslations("Assistants.form")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const [name, setName] = useState(assistant.name)
  const [firstMessage, setFirstMessage] = useState(assistant.firstMessage ?? "")
  const [sms, setSms] = useState(() => smsDrafts(assistant.smsTemplates))
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
  const changed = Object.keys(update).length > 0
  const smsInvalid = assistant.smsEnabled && smsTooLong(sms)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!changed || smsInvalid) return
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
        return
      }
      toast.add({ type: "success", title: t("saved") })
      onDone()
    })
  }

  const nameInvalid = error?.field === "name"
  const firstMessageInvalid = error?.field === "firstMessage"
  const smsErrors: Partial<Record<SmsLanguage, string>> = {}
  if (error?.field?.startsWith("sms.")) {
    smsErrors[error.field.slice(4) as SmsLanguage] = error.message
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className="pr-12">
        <SheetTitle>{t("title")}</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-4">
        <FieldGroup className="gap-6">
          {error && !error.field && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

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
              rows={5}
              maxLength={MAX_FIRST_MESSAGE_LENGTH}
              aria-invalid={firstMessageInvalid || undefined}
            />
            {firstMessageInvalid ? (
              <FieldError>{error.message}</FieldError>
            ) : (
              <FieldDescription className="flex justify-between gap-4">
                <span>{t("firstMessageHint")}</span>
                <span className="shrink-0 tabular-nums">
                  {firstMessage.length}/{MAX_FIRST_MESSAGE_LENGTH}
                </span>
              </FieldDescription>
            )}
          </Field>

          {assistant.smsEnabled && (
            <SmsTemplatesFields
              drafts={sms}
              onChange={(language, value) => {
                setSms((drafts) => ({ ...drafts, [language]: value }))
                if (error?.field === `sms.${language}`) setError(null)
              }}
              errors={smsErrors}
            />
          )}
        </FieldGroup>
      </div>

      <SheetFooter className="flex-row justify-end gap-2 border-t">
        <SheetClose render={<Button type="button" variant="outline" />}>
          {tCommon("cancel")}
        </SheetClose>
        <Button type="submit" disabled={!changed || smsInvalid || pending}>
          {pending && <Spinner />}
          {tCommon("saveChanges")}
        </Button>
      </SheetFooter>
    </form>
  )
}

export { AssistantSheet }
