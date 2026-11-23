// Contacts per page in the list
export const CONTACTS_PAGE_SIZE = 50

// The contact page shows this many calls, and "Show older" adds as many again
export const CONTACT_CALLS_STEP = 10
export const CONTACT_CALLS_MAX = 200

// Mirror the contact_salutation and language enums. Labels are in the
// Contacts.salutations and Contacts.languages messages
export const SALUTATIONS = ["mr", "mrs"] as const
export const LANGUAGES = ["fr", "nl", "en"] as const
