import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { getLocale, getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { getPathname } from "@/i18n/navigation"

export default async function Page() {
  const [t, locale] = await Promise.all([getTranslations("Home"), getLocale()])
  // Clerk redirects outside the router, so the URL needs its locale prefix
  const dashboardUrl = getPathname({ href: "/dashboard", locale })

  return (
    <div className="flex min-h-svh p-6">
      <header className="flex h-16 items-center justify-end gap-2 p-4">
        <Suspense>
          <Show when="signed-out">
            <SignInButton
              forceRedirectUrl={dashboardUrl}
              signUpForceRedirectUrl={dashboardUrl}
            >
              <Button variant="outline">{t("signIn")}</Button>
            </SignInButton>
            <SignUpButton
              forceRedirectUrl={dashboardUrl}
              signInForceRedirectUrl={dashboardUrl}
            >
              <Button>{t("signUp")}</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </Suspense>
      </header>
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("title")}</h1>
          <p>{t("intro")}</p>
          <p>{t("buttonAdded")}</p>
          <Button className="mt-2">{t("button")}</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {t.rich("darkModeHint", { kbd: (chunks) => <kbd>{chunks}</kbd> })}
        </div>
      </div>
    </div>
  )
}
