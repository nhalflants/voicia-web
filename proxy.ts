import { clerkMiddleware } from "@clerk/nextjs/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

// Matched only so Clerk runs on them; they aren't localized pages
const nonLocalizedRoute = /^\/(api|trpc|__clerk)(\/|$)/

export default clerkMiddleware(async (auth, req) => {
  if (nonLocalizedRoute.test(req.nextUrl.pathname)) return
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
