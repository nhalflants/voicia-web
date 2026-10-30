"use client"

import { usePathname } from "next/navigation"

import { mainNavItems, settingsNavItems } from "@/components/layout/nav-items"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserButton } from "@/features/org/components/user-button"
import { cn } from "@/lib/utils"

function DashboardHeader() {
  const pathname = usePathname()
  const title = [...mainNavItems, ...settingsNavItems].find((item) =>
    pathname.startsWith(item.url)
  )?.title

  return (
    <header
      className={cn(
        "mx-auto flex w-full items-center gap-2 px-4 pt-6 sm:px-6",
        pathname.startsWith("/dashboard/calls") ? "max-w-5xl" : "max-w-3xl"
      )}
    >
      {/* The sidebar is an off-canvas sheet on mobile, so it needs a trigger here */}
      <SidebarTrigger className="md:hidden" />
      {title && <h1 className="font-heading text-xl font-semibold">{title}</h1>}
      <div className="ml-auto flex items-center">
        <UserButton />
      </div>
    </header>
  )
}

export { DashboardHeader }
