import { CONTACT_EMAIL } from "@/features/assistants/constants"

export { CONTACT_EMAIL }

// Cal.com or Calendly link for "Book a setup call". Empty until the owner
// supplies it: the buttons then open an email instead
export const BOOKING_URL = ""

// Fake Belgian mobile number for now. Replace it with the real demo line, or
// empty it to hide the demo section, before going live
export const DEMO_PHONE_NUMBER = "+32 470 12 34 56"

// Read from the calls of the previous app on 18 Nov 2026, rounded down.
// Update by hand now and then
export const STATS = {
  // Month the figures start from, as YYYY-MM
  since: "2025-09",
  callsAnswered: 12000,
  briefsWritten: 7000,
  hoursHandled: 150,
  // Share of conversations on weekdays between 9:00 and 18:00
  workingHoursShare: 0.86,
  afterHours: 1000,
}

export function bookingHref(): string {
  return BOOKING_URL || `mailto:${CONTACT_EMAIL}`
}
