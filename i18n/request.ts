import * as rootParams from "next/root-params"
import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import { hasLocale, type Formats } from "next-intl"

import { BUSINESS_TIME_ZONE } from "@/features/calls/constants"
import { routing } from "./routing"

// 24-hour clock in both languages, as Belgian teams expect
export const formats = {
  dateTime: {
    // "14:05"
    time: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
    // "17 nov., 14:05" / "Nov 17, 14:05"
    dayMonthTime: {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    },
    // "17 novembre 2026" / "November 17, 2026"
    long: { day: "numeric", month: "long", year: "numeric" },
  },
} satisfies Formats

export default getRequestConfig(async ({ locale }) => {
  // Server Actions pass the locale explicitly: next/root-params doesn't work there
  if (!locale) {
    const paramValue = await rootParams.locale()
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue
    } else {
      notFound()
    }
  }

  return {
    locale,
    // Set once so server and client render the same times
    timeZone: BUSINESS_TIME_ZONE,
    formats,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
