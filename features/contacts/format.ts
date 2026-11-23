import { parsePhoneNumberFromString } from "libphonenumber-js"

// « +32 470 12 34 56 » for reading; tel: links keep the E.164 value
export function formatPhoneNumber(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164
}
