import { hasLocale, type Locale } from "next-intl"

import { routing } from "./routing"

// next/root-params doesn't work in Server Actions, so the client passes its
// locale. Actions can be called with any argument, so it's checked here
export function actionLocale(value: string): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale
}
