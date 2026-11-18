import Image from "next/image"

import { NavMain } from "@/components/layout/nav-main"
import { NavSettings } from "@/components/layout/nav-settings"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { OrgSwitcher } from "@/features/org/components/org-switcher"
import { UserButton } from "@/features/org/components/user-button"
import { Link } from "@/i18n/navigation"

async function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* Collapsed to icons, the switcher and trigger no longer fit side by side, so they stack */}
      <SidebarHeader className="flex-row items-center gap-1 group-data-[collapsible=icon]:flex-col">
        <div className="min-w-0 flex-1">
          <OrgSwitcher />
        </div>
        {/* <SidebarTrigger className="shrink-0" /> */}
      </SidebarHeader>
      {/* <SidebarHeader className="flex-row items-center justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
        <Link
          href="/"
          className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:hidden"
        >
          <Image
            src="/voicia-logo.svg"
            alt="Voicia"
            width={20}
            height={20}
            className="size-5"
          />
          <span className="text-base">Voicia</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader> */}

      <SidebarContent>
        <NavMain />
        <NavSettings />
      </SidebarContent>

      <SidebarFooter>
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar }
