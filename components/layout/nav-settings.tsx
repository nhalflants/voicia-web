"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TagsIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Call categories",
    url: "/settings/call-categories",
    icon: TagsIcon,
  },
]

function NavSettings() {
  const pathname = usePathname()

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupLabel className="text-sm text-muted-foreground">
        Settings
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
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

export { NavSettings }
