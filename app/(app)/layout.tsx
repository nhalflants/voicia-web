import { cookies } from "next/headers"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserButton } from "@/components/user-button"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          {/* The sidebar is an off-canvas sheet on mobile, so it needs a trigger here */}
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto flex items-center">
            <UserButton />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
