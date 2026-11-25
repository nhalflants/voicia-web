// How much of one SMS a message takes, for the live counter. Keep in sync
// with the API's src/sms/sms-text.ts, which checks the same rules on save:
// 160 GSM-7 units, or 70 characters as soon as one character is outside
// GSM-7. Each {{variable}} counts as 20

const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà"
const GSM7_EXTENSION = "\f^{}\\[~]|€"

export const VARIABLE_BUDGET = 20

const PLACEHOLDER = /\{\{\s*([^{}\s]+)\s*\}\}/g

export interface SmsLength {
  units: number
  limit: 160 | 70
}

const TYPOGRAPHY: [RegExp, string][] = [
  [/[‘’]/g, "'"],
  [/[“”«»]/g, '"'],
  [/[–—]/g, "-"],
  [/…/g, "..."],
  [/[  ]/g, " "],
]

export function normalizeTypography(text: string): string {
  return TYPOGRAPHY.reduce(
    (result, [pattern, plain]) => result.replace(pattern, plain),
    text
  )
}

function isGsm7Character(ch: string): boolean {
  return GSM7_BASIC.includes(ch) || GSM7_EXTENSION.includes(ch)
}

function smsLength(text: string): SmsLength {
  const characters = Array.from(text)
  if (!characters.every(isGsm7Character)) {
    return { units: text.length, limit: 70 }
  }
  const units = characters.reduce(
    (sum, ch) => sum + (GSM7_EXTENSION.includes(ch) ? 2 : 1),
    0
  )
  return { units, limit: 160 }
}

export function templateLength(template: string): SmsLength {
  const variables = [...template.matchAll(PLACEHOLDER)].length
  const { units, limit } = smsLength(template.replace(PLACEHOLDER, ""))
  return { units: units + variables * VARIABLE_BUDGET, limit }
}

// The characters that force the 70-character limit, each once, in order
export function nonGsmCharacters(text: string): string[] {
  return [
    ...new Set(
      Array.from(text.replace(PLACEHOLDER, "")).filter(
        (ch) => !isGsm7Character(ch)
      )
    ),
  ]
}
