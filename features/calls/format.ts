import type { CallListItem } from "@/features/calls/types"

// "2:47"; also used for the player's position, so fractions are dropped
export function formatDuration(seconds: number) {
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`
}

// The name to show for a call's caller: the contact's confirmed name first
export function callerDisplayName(
  call: Pick<CallListItem, "callerName" | "contact">
): string | null {
  return call.contact?.name ?? call.callerName
}
