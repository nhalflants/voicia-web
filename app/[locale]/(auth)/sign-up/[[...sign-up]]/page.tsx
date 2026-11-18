import { SignUp } from "@clerk/nextjs"
import { getLocale } from "next-intl/server"

import { getPathname } from "@/i18n/navigation"

export default async function SignUpPage() {
  const locale = await getLocale()
  // Clerk redirects outside the router, so the URL needs its locale prefix
  const dashboardUrl = getPathname({ href: "/dashboard", locale })

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        fallbackRedirectUrl={dashboardUrl}
        signInFallbackRedirectUrl={dashboardUrl}
      />
    </div>
  )
}
