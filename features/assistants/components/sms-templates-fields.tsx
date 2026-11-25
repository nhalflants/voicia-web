"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"

import { Field, FieldDescription, FieldError } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  VariableChips,
  insertVariable,
} from "@/features/assistants/components/variable-chips"
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
  return SMS_LANGUAGES.some((language) => smsLength(drafts[language]).tooLong)
}

function smsLength(draft: string) {
  const value = normalizeTypography(draft).trim()
  const { units, limit } = templateLength(value)
  return { value, units, limit, tooLong: units > limit }
}

// The language tab to open first: the first one with a message
export function firstSmsLanguage(drafts: SmsDrafts): SmsLanguage {
  return SMS_LANGUAGES.find((language) => drafts[language].trim()) ?? "fr"
}

// One message per language, one language shown at a time
export function SmsTemplatesFields({
  drafts,
  onChange,
  errors,
  language,
  onLanguageChange,
  readOnly,
}: {
  drafts: SmsDrafts
  onChange: (language: SmsLanguage, value: string) => void
  // API errors by language
  errors: Partial<Record<SmsLanguage, string>>
  language: SmsLanguage
  onLanguageChange: (language: SmsLanguage) => void
  readOnly?: boolean
}) {
  const t = useTranslations("Assistants.form.sms")
  // Only the open tab's textarea is mounted
  const textarea = useRef<HTMLTextAreaElement>(null)

  return (
    <Tabs
      value={language}
      onValueChange={(value) => onLanguageChange(value as SmsLanguage)}
      className="gap-3"
    >
      <TabsList aria-label={t("language")}>
        {SMS_LANGUAGES.map((tab) => {
          const invalid = smsLength(drafts[tab]).tooLong || !!errors[tab]
          const filled = drafts[tab].trim() !== ""
          return (
            <TabsTrigger key={tab} value={tab} className="px-3">
              {t(`languages.${tab}`)}
              {(invalid || filled) && (
                <span
                  aria-hidden
                  className={
                    invalid
                      ? "size-1.5 rounded-full bg-destructive"
                      : "size-1.5 rounded-full bg-primary"
                  }
                />
              )}
              {invalid && <span className="sr-only">{t("tabInvalid")}</span>}
              {!invalid && !filled && (
                <span className="sr-only">{t("tabEmpty")}</span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>

      {SMS_LANGUAGES.map((tab) => {
        const { value, units, limit, tooLong } = smsLength(drafts[tab])
        const offenders = limit === 70 ? nonGsmCharacters(value) : []
        const apiError = errors[tab]
        const invalid = tooLong || !!apiError
        return (
          <TabsContent key={tab} value={tab}>
            <Field data-invalid={invalid || undefined}>
              <Textarea
                ref={textarea}
                aria-label={t("messageIn", {
                  language: t(`languages.${tab}`),
                })}
                value={drafts[tab]}
                onChange={(event) => onChange(tab, event.target.value)}
                placeholder={t("placeholder")}
                rows={3}
                readOnly={readOnly}
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
              {!readOnly && (
                <>
                  <VariableChips
                    onInsert={(name) =>
                      insertVariable(
                        textarea.current,
                        drafts[tab],
                        name,
                        (text) => onChange(tab, text)
                      )
                    }
                  />
                  <FieldDescription className="text-xs">
                    {t("variablesHint")}
                  </FieldDescription>
                </>
              )}
            </Field>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
