"use client"

import { useTranslations } from "next-intl"

import { settingsNavItems } from "@/components/layout/nav-items"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, usePathname } from "@/i18n/navigation"

function NavSettings() {
  const t = useTranslations("Nav")
  // Without the locale prefix, so it compares with the item URLs
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm text-muted-foreground">
        {t("settings")}
      </SidebarGroupLabel>
      <SidebarMenu>
        {settingsNavItems.map((item) => (
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

export { NavSettings }
