"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

// Whether the visitor asked their device for less motion. False on the server
// and during hydration, so the first client render matches the server HTML;
// it updates right after. motion's own useReducedMotion reads the setting
// before hydrating, which makes the two renders differ
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}

export { useReducedMotion }
