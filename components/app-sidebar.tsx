import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import Image from "next/image"
import Link from "next/link"

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
  const { orgId } = await auth()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
        <Link
          href="/"
          className="flex items-center gap-2 group-data-[collapsible=icon]:hidden"
        >
          <Image
            src="/logo.svg"
            alt="Playabl"
            width={40}
            height={48}
            className="size-5"
          />
          <span className="text-base">Estalytic</span>
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
        <div className="mb-1 flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <UserButton appearance={{ elements: { rootBox: "shrink-0" } }} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar }
