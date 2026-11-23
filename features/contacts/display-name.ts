import type { ContactName } from "@/features/contacts/types"

// « First Last · Company », or whichever part exists; null when there is no
// name at all, so callers can fall back to the number
export function displayName(contact: ContactName): string | null {
  const person = [contact.firstName, contact.lastName].filter(Boolean).join(" ")
  return [person, contact.companyName].filter(Boolean).join(" · ") || null
}
