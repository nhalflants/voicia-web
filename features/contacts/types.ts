import type { LANGUAGES, SALUTATIONS } from "@/features/contacts/constants"

export type Salutation = (typeof SALUTATIONS)[number]
export type ContactLanguage = (typeof LANGUAGES)[number]

export interface ContactName {
  firstName: string | null
  lastName: string | null
  companyName: string | null
}

export interface ContactListItem extends ContactName {
  id: string
  // Unconfirmed names are the model's suggestion, shown as such
  nameConfirmed: boolean
  primaryNumber: string | null
  callCount: number
  lastCallAt: string | null
}

export interface ContactPhoneNumber {
  id: string
  number: string
  isPrimary: boolean
}

export interface ContactDetail extends ContactName {
  id: string
  nameConfirmed: boolean
  salutation: Salutation | null
  email: string | null
  language: ContactLanguage | null
  source: "call" | "manual"
  // Primary first, then oldest first
  phoneNumbers: ContactPhoneNumber[]
  callCount: number
  lastCallAt: string | null
}

// The editable fields, as the API takes them; null clears a field
export interface ContactFields extends ContactName {
  salutation: Salutation | null
  email: string | null
  language: ContactLanguage | null
}

// What the API takes to create a contact: numbers as typed, first is primary
export interface ContactInput extends ContactFields {
  phoneNumbers: string[]
}

// What the API takes to change one; omitted fields stay as they are
export type ContactPatch = Partial<ContactFields> & { nameConfirmed?: true }
