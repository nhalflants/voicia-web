import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserButton } from "@/features/org/components/user-button"

// Rendered by each page inside its own container, so it inherits the page's width
function DashboardHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center gap-2">
      {/* The sidebar is an off-canvas sheet on mobile, so it needs a trigger here */}
      <SidebarTrigger className="md:hidden" />
      <h1 className="font-heading text-xl font-semibold">{title}</h1>
      <div className="ml-auto flex items-center">
        <UserButton />
      </div>
    </header>
  )
}

export { DashboardHeader }
