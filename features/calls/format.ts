// "2:47"; also used for the player's position, so fractions are dropped
export function formatDuration(seconds: number) {
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`
}
