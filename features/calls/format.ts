import { BUSINESS_TIME_ZONE } from "@/features/calls/constants"

// "2:47"; also used for the player's position, so fractions are dropped
export function formatDuration(seconds: number) {
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`
}

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: BUSINESS_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

// "14:05", in Belgian time so it agrees with the day section it sits under
export function formatCallTime(iso: string) {
  return timeFormat.format(new Date(iso))
}
