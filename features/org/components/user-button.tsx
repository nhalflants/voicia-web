"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { EllipsisVerticalIcon, LogOutIcon, UserCogIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { getPathname } from "@/i18n/navigation"

function UserIdentity({
  name,
  email,
  imageUrl,
}: {
  name: string
  email: string
  imageUrl: string
}) {
  return (
    <>
      <Avatar>
        <AvatarImage src={imageUrl} alt={name || email} />
        <AvatarFallback>
          {(name || email).charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 text-left leading-tight">
        {name && <span className="truncate font-medium">{name}</span>}
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </div>
    </>
  )
}

function UserButton() {
  const t = useTranslations("User")
  const locale = useLocale()
  const { isMobile } = useSidebar()
  const { openUserProfile, signOut } = useClerk()
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex h-12 items-center gap-2 p-2 group-data-[collapsible=icon]:p-0">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="h-4 flex-1 group-data-[collapsible=icon]:hidden" />
      </div>
    )
  }

  if (!user) return null

  const identity = {
    name: user.fullName ?? user.username ?? "",
    email: user.primaryEmailAddress?.emailAddress ?? "",
    imageUrl: user.imageUrl,
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label={t("openMenu")}
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <UserIdentity {...identity} />
            <EllipsisVerticalIcon className="ml-auto text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 py-2 text-sm font-normal text-foreground">
                <UserIdentity {...identity} />
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => openUserProfile()}>
              <UserCogIcon />
              {t("manageAccount")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                signOut({ redirectUrl: getPathname({ href: "/", locale }) })
              }
            >
              <LogOutIcon />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export { UserButton }
