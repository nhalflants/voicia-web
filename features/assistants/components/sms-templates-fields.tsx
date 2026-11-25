"use client"

import { useTranslations } from "next-intl"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  nonGsmCharacters,
  normalizeTypography,
  templateLength,
} from "@/features/assistants/sms-text"
import {
  SMS_LANGUAGES,
  type SmsLanguage,
  type SmsTemplates,
} from "@/features/assistants/types"

// Caller variables the API accepts in a message (src/vapi/caller-greeting.ts)
const VARIABLES = [
  "customerFirstName",
  "customerLastName",
  "customerSalutation",
  "customerCompanyName",
]
  .map((name) => `{{${name}}}`)
  .join(", ")

export type SmsDrafts = Record<SmsLanguage, string>

export function smsDrafts(templates: SmsTemplates | null): SmsDrafts {
  return {
    fr: templates?.fr ?? "",
    nl: templates?.nl ?? "",
    en: templates?.en ?? "",
  }
}

// What the API would store: typography made plain, trimmed, empty versions
// left out, null when there is none
export function toSmsTemplates(drafts: SmsDrafts): SmsTemplates | null {
  const templates: SmsTemplates = {}
  for (const language of SMS_LANGUAGES) {
    const text = normalizeTypography(drafts[language]).trim()
    if (text) templates[language] = text
  }
  return Object.keys(templates).length > 0 ? templates : null
}

export function smsTooLong(drafts: SmsDrafts): boolean {
  return SMS_LANGUAGES.some((language) => {
    const { units, limit } = templateLength(
      normalizeTypography(drafts[language]).trim()
    )
    return units > limit
  })
}

export function SmsTemplatesFields({
  drafts,
  onChange,
  errors,
}: {
  drafts: SmsDrafts
  onChange: (language: SmsLanguage, value: string) => void
  // API errors by language
  errors: Partial<Record<SmsLanguage, string>>
}) {
  const t = useTranslations("Assistants.form.sms")

  return (
    <FieldSet>
      <FieldLegend>{t("title")}</FieldLegend>
      <FieldDescription>{t("description")}</FieldDescription>
      <FieldGroup className="gap-5">
        {SMS_LANGUAGES.map((language) => {
          const value = normalizeTypography(drafts[language]).trim()
          const { units, limit } = templateLength(value)
          const offenders = limit === 70 ? nonGsmCharacters(value) : []
          const tooLong = units > limit
          const apiError = errors[language]
          const invalid = tooLong || !!apiError
          const id = `assistant-sms-${language}`
          return (
            <Field key={language} data-invalid={invalid || undefined}>
              <FieldLabel htmlFor={id}>{t(`languages.${language}`)}</FieldLabel>
              <Textarea
                id={id}
                value={drafts[language]}
                onChange={(event) => onChange(language, event.target.value)}
                placeholder={t("placeholder")}
                rows={3}
                aria-invalid={invalid || undefined}
              />
              {apiError && <FieldError>{apiError}</FieldError>}
              {!apiError && tooLong && (
                <FieldError>{t("tooLong", { limit })}</FieldError>
              )}
              <FieldDescription className="flex justify-between gap-4">
                <span>
                  {offenders.length > 0
                    ? t("ucs2", { characters: offenders.join(" ") })
                    : value
                      ? t("oneSms")
                      : t("empty")}
                </span>
                {value && (
                  <span className="shrink-0 tabular-nums">
                    {units}/{limit}
                  </span>
                )}
              </FieldDescription>
            </Field>
          )
        })}
      </FieldGroup>
      <FieldDescription>{t("variables", { list: VARIABLES })}</FieldDescription>
    </FieldSet>
  )
}
