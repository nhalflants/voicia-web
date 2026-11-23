import { SidebarTrigger } from "@/components/ui/sidebar"

// Rendered by each page inside its own container, so it inherits the page's width
function DashboardHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start gap-x-4 gap-y-3">
      <div className="flex min-w-0 flex-1 basis-64 items-start gap-2">
        {/* The sidebar is an off-canvas sheet on mobile, so it needs a trigger here */}
        <SidebarTrigger className="md:hidden" />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {/* Wraps under the text on narrow screens */}
      {action && (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      )}
    </header>
  )
}

export { DashboardHeader }
