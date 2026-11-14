"use client"

import { useClerk, useOrganization, useOrganizationList } from "@clerk/nextjs"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { plansNavItem } from "@/components/layout/nav-items"
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
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

const AFTER_ORG_CHANGE_URL = "/dashboard"

function OrgAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string
  imageUrl?: string
  className?: string
}) {
  return (
    <Avatar className={className ?? "rounded-md after:rounded-md"}>
      <AvatarImage src={imageUrl} alt={name} className="rounded-md" />
      <AvatarFallback className="rounded-md">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

function OrgSwitcher() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { openOrganizationProfile, openCreateOrganization } = useClerk()
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const {
    userMemberships,
    setActive,
    isLoaded: isListLoaded,
  } = useOrganizationList({ userMemberships: { infinite: true } })

  if (!isOrgLoaded || !isListLoaded) {
    return (
      <div className="flex h-12 items-center gap-2 p-2 group-data-[collapsible=icon]:p-0">
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <Skeleton className="h-4 flex-1 group-data-[collapsible=icon]:hidden" />
      </div>
    )
  }

  const switchTo = async (organizationId: string) => {
    if (organizationId === organization?.id) return
    await setActive({ organization: organizationId })
    // Server components read the active org from auth(), so re-render them
    router.refresh()
  }

  const name = organization?.name ?? "Personal account"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <OrgAvatar name={name} imageUrl={organization?.imageUrl} />
            <span className="flex-1 truncate font-medium">{name}</span>
            <ChevronsUpDownIcon className="ml-auto text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              {userMemberships.data?.map(({ organization: org }) => (
                <DropdownMenuItem key={org.id} onClick={() => switchTo(org.id)}>
                  <OrgAvatar
                    name={org.name}
                    imageUrl={org.imageUrl}
                    className="size-6 rounded-sm after:rounded-sm"
                  />
                  <span className="flex-1 truncate">{org.name}</span>
                  {org.id === organization?.id && <CheckIcon />}
                </DropdownMenuItem>
              ))}
              {userMemberships.hasNextPage && (
                <DropdownMenuItem
                  closeOnClick={false}
                  onClick={() => userMemberships.fetchNext()}
                  className="text-muted-foreground"
                >
                  Load more
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {organization && (
              <>
                <DropdownMenuItem onClick={() => router.push(plansNavItem.url)}>
                  <plansNavItem.icon />
                  {plansNavItem.title}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    openOrganizationProfile({
                      afterLeaveOrganizationUrl: AFTER_ORG_CHANGE_URL,
                    })
                  }
                >
                  <SettingsIcon />
                  Manage organization
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={() =>
                openCreateOrganization({
                  afterCreateOrganizationUrl: AFTER_ORG_CHANGE_URL,
                })
              }
            >
              <PlusIcon />
              Create organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export { OrgSwitcher }
