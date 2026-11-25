"use client"

import { PlusIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

// Caller variables the API accepts in a message (src/vapi/caller-greeting.ts)
export const CALLER_VARIABLES = [
  "customerFirstName",
  "customerLastName",
  "customerSalutation",
  "customerCompanyName",
] as const

type CallerVariable = (typeof CALLER_VARIABLES)[number]

// Puts {{name}} at the cursor of `textarea`, or at the end when it isn't
// focused
export function insertVariable(
  textarea: HTMLTextAreaElement | null,
  text: string,
  name: CallerVariable,
  onChange: (text: string) => void
) {
  const token = `{{${name}}}`
  const focused = textarea !== null && document.activeElement === textarea
  const start = focused ? textarea.selectionStart : text.length
  const end = focused ? textarea.selectionEnd : text.length
  onChange(text.slice(0, start) + token + text.slice(end))
  // After React has put the new value in, so the caret lands after the token
  requestAnimationFrame(() => {
    textarea?.focus()
    textarea?.setSelectionRange(start + token.length, start + token.length)
  })
}

export function VariableChips({
  onInsert,
}: {
  onInsert: (name: CallerVariable) => void
}) {
  const t = useTranslations("Assistants.form.variables")
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{t("insert")}</span>
      {CALLER_VARIABLES.map((name) => (
        <Button
          key={name}
          type="button"
          variant="outline"
          size="xs"
          // Keeps the caret where it is in the textarea
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onInsert(name)}
        >
          <PlusIcon />
          {t(name)}
        </Button>
      ))}
    </div>
  )
}
