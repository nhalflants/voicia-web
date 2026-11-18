import { SignIn } from "@clerk/nextjs"
import { getLocale } from "next-intl/server"

import { getPathname } from "@/i18n/navigation"

export default async function SignInPage() {
  const locale = await getLocale()
  // Clerk redirects outside the router, so the URL needs its locale prefix
  const dashboardUrl = getPathname({ href: "/dashboard", locale })

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        fallbackRedirectUrl={dashboardUrl}
        signUpFallbackRedirectUrl={dashboardUrl}
      />
    </div>
  )
}
