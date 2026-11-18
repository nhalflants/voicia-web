"use client"

import { useEffect, useState } from "react"
import { Show } from "@clerk/nextjs"
import { MenuIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { BookCallButton } from "@/features/landing/components/book-call-button"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { href: "#how", key: "howItWorks" },
  { href: "#pricing", key: "pricing" },
  { href: "#faq", key: "faq" },
] as const

function Logo() {
  return (
    <span className="flex items-center gap-2 font-display text-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/voicia-logo.svg" alt="" className="size-6" />
      Voicia
    </span>
  )
}

function AccountLink({ className }: { className?: string }) {
  const t = useTranslations("Landing.nav")
  return (
    <>
      <Show when="signed-out">
        <Button
          variant="ghost"
          nativeButton={false}
          className={className}
          render={<Link href="/sign-in" />}
        >
          {t("signIn")}
        </Button>
      </Show>
      <Show when="signed-in">
        <Button
          variant="ghost"
          nativeButton={false}
          className={className}
          render={<Link href="/dashboard" />}
        >
          {t("openDashboard")}
        </Button>
      </Show>
    </>
  )
}

function LandingNav() {
  const t = useTranslations("Landing.nav")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label={t("home")}>
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((section) => (
            <Button
              key={section.key}
              variant="ghost"
              nativeButton={false}
              render={<a href={section.href} />}
            >
              {t(section.key)}
            </Button>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <AccountLink />
          <BookCallButton size="default" className="rounded-full px-4" />
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("menu")}
              />
            }
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right" className="gap-2 p-6">
            <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
            <div className="mt-8 flex flex-col gap-1">
              {SECTIONS.map((section) => (
                <Button
                  key={section.key}
                  variant="ghost"
                  nativeButton={false}
                  className="justify-start"
                  render={<a href={section.href} />}
                >
                  {t(section.key)}
                </Button>
              ))}
              <AccountLink className="justify-start" />
            </div>
            <BookCallButton className="mt-4 w-full rounded-full" />
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}

export { LandingNav, Logo }
