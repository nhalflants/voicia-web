"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { LogOutIcon, UserCogIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

function UserButton() {
  const { openUserProfile, signOut } = useClerk()
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return <Skeleton className="size-8 rounded-full" />
  }

  if (!user) return null

  const name = user.fullName ?? user.username ?? ""
  const email = user.primaryEmailAddress?.emailAddress ?? ""
  const initials = (name || email).charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Open user menu"
          />
        }
      >
        <Avatar>
          <AvatarImage src={user.imageUrl} alt={name || email} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto min-w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 py-2 text-sm font-normal text-foreground">
            <Avatar>
              <AvatarImage src={user.imageUrl} alt={name || email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 leading-tight">
              {name && <span className="truncate font-medium">{name}</span>}
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => openUserProfile()}>
          <UserCogIcon />
          Manage account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserButton }
