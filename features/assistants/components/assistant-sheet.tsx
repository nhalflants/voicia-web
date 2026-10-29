"use client"

import { useState, useTransition } from "react"
import { CircleAlertIcon } from "lucide-react"

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
import { updateAssistantAction } from "@/features/assistants/actions"
import {
  MAX_FIRST_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
} from "@/features/assistants/constants"
import type { Assistant, AssistantUpdate } from "@/features/assistants/types"

type FormError = { field?: "name" | "firstMessage"; message: string }

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
  const [name, setName] = useState(assistant.name)
  const [firstMessage, setFirstMessage] = useState(assistant.firstMessage ?? "")
  const [error, setError] = useState<FormError | null>(null)
  const [pending, startTransition] = useTransition()

  // Only changed fields are sent, so a rename alone never reaches Vapi
  const update: AssistantUpdate = {}
  if (name.trim() !== assistant.name) update.name = name.trim()
  if (firstMessage.trim() !== (assistant.firstMessage ?? "")) {
    update.firstMessage = firstMessage.trim()
  }
  const changed = Object.keys(update).length > 0

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!changed) return
    if (update.name === "") {
      setError({ field: "name", message: "Enter a name." })
      return
    }
    // A first message can be changed but not removed
    if (update.firstMessage === "") {
      setError({ field: "firstMessage", message: "Enter a first message." })
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updateAssistantAction(assistant.id, update)
      if (!result.ok) {
        setError({ field: result.field, message: result.message })
        return
      }
      toast.add({ type: "success", title: "Assistant saved" })
      onDone()
    })
  }

  const nameInvalid = error?.field === "name"
  const firstMessageInvalid = error?.field === "firstMessage"

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className="pr-12">
        <SheetTitle>Edit assistant</SheetTitle>
        <SheetDescription>Changes apply to the next call.</SheetDescription>
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
            <FieldLabel htmlFor="assistant-name">Name</FieldLabel>
            <Input
              id="assistant-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (nameInvalid) setError(null)
              }}
              placeholder="e.g. Front desk"
              maxLength={MAX_NAME_LENGTH}
              required
              aria-invalid={nameInvalid || undefined}
            />
            {nameInvalid ? (
              <FieldError>{error.message}</FieldError>
            ) : (
              <FieldDescription>
                Only shown in Voicia. Callers never hear it.
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={firstMessageInvalid || undefined}>
            <FieldLabel htmlFor="assistant-first-message">
              First message
            </FieldLabel>
            <Textarea
              id="assistant-first-message"
              value={firstMessage}
              onChange={(event) => {
                setFirstMessage(event.target.value)
                if (firstMessageInvalid) setError(null)
              }}
              placeholder="e.g. Hello, you've reached the Dupont practice. How can I help you?"
              rows={5}
              maxLength={MAX_FIRST_MESSAGE_LENGTH}
              aria-invalid={firstMessageInvalid || undefined}
            />
            {firstMessageInvalid ? (
              <FieldError>{error.message}</FieldError>
            ) : (
              <FieldDescription className="flex justify-between gap-4">
                <span>What callers hear when the assistant picks up.</span>
                <span className="shrink-0 tabular-nums">
                  {firstMessage.length}/{MAX_FIRST_MESSAGE_LENGTH}
                </span>
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>
      </div>

      <SheetFooter className="flex-row justify-end gap-2 border-t">
        <SheetClose render={<Button type="button" variant="outline" />}>
          Cancel
        </SheetClose>
        <Button type="submit" disabled={!changed || pending}>
          {pending && <Spinner />}
          Save changes
        </Button>
      </SheetFooter>
    </form>
  )
}

export { AssistantSheet }
