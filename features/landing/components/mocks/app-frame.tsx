import { cn } from "@/lib/utils"

// A browser-style window around a mock of the dashboard
function AppFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-full overflow-hidden rounded-xl bg-background text-left shadow-2xl ring-1 shadow-black/10 ring-foreground/10",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b px-4 py-3">
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

export { AppFrame }
