"use client"

import { useTranslations } from "next-intl"

import { mainNavItems } from "@/components/layout/nav-items"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, usePathname } from "@/i18n/navigation"

function NavMain() {
  const t = useTranslations("Nav")
  // Without the locale prefix, so it compares with the item URLs
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {mainNavItems.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.url)}
              tooltip={t(item.key)}
              render={<Link href={item.url} />}
            >
              <item.icon />
              <span>{t(item.key)}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export { NavMain }
