export const SMS_LANGUAGES = ["fr", "nl", "en"] as const
export type SmsLanguage = (typeof SMS_LANGUAGES)[number]
// The SMS the assistant can text callers, per language
export type SmsTemplates = Partial<Record<SmsLanguage, string>>

export interface Assistant {
  id: string
  name: string
  firstMessage: string | null
  // Voicia turned SMS on and the assistant has a number to send from
  smsEnabled: boolean
  smsTemplates: SmsTemplates | null
}

// What the NestJS API accepts: only the changed fields, at least one.
// smsTemplates replaces all versions at once; null removes them
export type AssistantUpdate = Partial<{
  name: string
  firstMessage: string
  smsTemplates: SmsTemplates | null
}>
