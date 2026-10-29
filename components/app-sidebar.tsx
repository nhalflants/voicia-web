import Image from "next/image"
import Link from "next/link"

import { OrgSwitcher } from "@/components/org-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"

async function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
        <Link
          href="/"
          className="flex items-center gap-2 group-data-[collapsible=icon]:hidden"
        >
          <Image
            src="/logo.svg"
            alt="Voicia"
            width={40}
            height={48}
            className="size-5"
          />
          <span className="text-base">Voicia</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm text-muted-foreground">
            Projects
          </SidebarGroupLabel>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <OrgSwitcher />
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar }
