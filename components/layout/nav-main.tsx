"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { mainNavItems } from "@/components/layout/nav-items"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

function NavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {mainNavItems.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.url)}
              tooltip={item.title}
              render={<Link href={item.url} />}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export { NavMain }
